import { Vector2, Vector3, Vector3Like } from 'three';
import Chunk from './Chunk';
import { BatchId, ChunkId, LOD0_DISTANCE, LOD1_DISTANCE, LOD_REFRESH_INTERVAL, MAX_TOTAL_BLOCKS, MAX_TOTAL_FACES, OCCLUSION_UPDATE_INTERVAL, UNDERGROUND_Y_THRESHOLD } from './ChunkConstants';
import OcclusionCuller from './OcclusionCuller';
import ChunkRegistry from './ChunkRegistry';
import ChunkStats from './ChunkStats';
import { BlockId, WATER_SURFACE_Y_OFFSET } from '../blocks/BlockConstants';
import {
  RendererEventType,
  type RendererEventPayload,
} from '../core/Renderer';
import EventRouter from '../events/EventRouter';
import Game from '../Game';
import type { DeserializedBlock } from '../network/Deserializer';
import {
  NetworkManagerEventType,
  type NetworkManagerEventPayload,
} from '../network/NetworkManager';
import {
  type ChunkWorkerChunkBatchBuildMessage,
  type ChunkWorkerBlocksUpdateMessage,
  type ChunkWorkerChunkRemoveMessage,
  type ChunkWorkerChunkUpdateMessage,
  type WorkerEventPayload,
  WorkerEventType,
} from '../workers/ChunkWorkerConstants';

// Working variables
const fromVec2 = new Vector2();
const vec1 = new Vector3();
const vec2 = new Vector3();

export default class ChunkManager {
  private _game: Game;
  private _registry: ChunkRegistry = new ChunkRegistry();
  private _firstChunkBatchBuilt: boolean = false;
  private _batchLodLevel: Map<BatchId, number> = new Map();
  private _lodRefreshCounter: number = 0;
  private _occlusionCuller: OcclusionCuller;
  private _occlusionVisibleBatches: Set<BatchId> | null = null;
  private _occlusionCounter: number = 0;

  public constructor(game: Game) {
    this._game = game;
    this._occlusionCuller = new OcclusionCuller(this._registry, game.blockTypeManager);
    this._setupEventListeners();
  }

  public get game(): Game {
    return this._game;
  }

  private _setupEventListeners(): void {
    EventRouter.instance.on(
      NetworkManagerEventType.BlocksPacket,
      this._onBlocksPacket,
    );
    
    EventRouter.instance.on(
      NetworkManagerEventType.ChunksPacket,
      this._onChunksPacket,
    );

    EventRouter.instance.on(
      RendererEventType.Animate,
      this._onAnimate,
    );

    EventRouter.instance.on(
      WorkerEventType.ChunkBatchBuilt,
      this._onChunkBatchBuilt,
    );
  }

  private _onAnimate = (_payload: RendererEventPayload.IAnimate): void => {
    ChunkStats.reset();

    if (!this._game.settingsManager.qualityPerfTradeoff.viewDistance.enabled) {
      this._game.chunkMeshManager.addAllBatchMeshesToScene();
      return;
    }

    const viewDistance = this._game.renderer.viewDistance;
    const viewDistanceSquared = viewDistance * viewDistance;
    const cameraPos = this._game.camera.activeCamera.position;
    const cameraVec2 = fromVec2.set(cameraPos.x, cameraPos.z);
    const overFaceLimit = ChunkStats.totalFaceCount > MAX_TOTAL_FACES || ChunkStats.blockCount >= MAX_TOTAL_BLOCKS;

    if (overFaceLimit) {
      this._occlusionCounter++;
      if (this._occlusionVisibleBatches === null || this._occlusionCounter >= OCCLUSION_UPDATE_INTERVAL) {
        this._occlusionCounter = 0;
        this._occlusionVisibleBatches = this._occlusionCuller.computeVisibleBatches(cameraPos, viewDistanceSquared);
      }
    } else {
      this._occlusionVisibleBatches = null;
    }

    this._game.chunkMeshManager.applyBatchViewDistance(
      cameraVec2,
      viewDistanceSquared,
      overFaceLimit,
      this._occlusionVisibleBatches,
    );

    this._lodRefreshCounter++;
    if (this._lodRefreshCounter >= LOD_REFRESH_INTERVAL) {
      this._lodRefreshCounter = 0;
      this._refreshLodForNearbyBatches(cameraVec2);
    }
  }

  private _getLodLevelForDistance(distXZ: number): number {
    if (distXZ <= LOD0_DISTANCE) return 0;
    if (distXZ <= LOD1_DISTANCE) return 1;
    return 2;
  }

  private _refreshLodForNearbyBatches(cameraVec2: Vector2): void {
    for (const batchId of this._registry.getBatchIds()) {
      const chunkIds = this._registry.getBatchChunkIds(batchId);
      if (chunkIds.length === 0) continue;
      const origin = Chunk.batchIdToBatchOrigin(batchId);
      const distXZ = cameraVec2.distanceTo(vec1.set(origin.x + 16, origin.z + 16));
      let wantedLod = this._getLodLevelForDistance(distXZ);
      if (origin.y + 16 < UNDERGROUND_Y_THRESHOLD) wantedLod = Math.min(2, wantedLod + 1);
      const currentLod = this._batchLodLevel.get(batchId) ?? 0;
      if (wantedLod !== currentLod) {
        this._batchLodLevel.set(batchId, wantedLod);
        const msg = {
          type: 'chunk_batch_build' as const,
          batchId,
          chunkIds,
          lodLevel: wantedLod,
        };
        this._game.chunkWorkerClient.postMessage(msg);
      }
    }
  }

  private _onBlocksPacket = (payload: NetworkManagerEventPayload.IBlocksPacket) => {
    const update: Record<ChunkId, { localCoordinate: Vector3Like, blockId: BlockId, blockRotationIndex?: number }[]> = {};

    payload.deserializedBlocks.forEach((deserializedBlock: DeserializedBlock) => {
      const { id: blockId, globalCoordinate, blockRotationIndex } = deserializedBlock;
      const chunkId = Chunk.globalCoordinateToChunkId(globalCoordinate);
      const chunk = this._registry.getChunk(chunkId);

      if (!chunk) {
        return;
      }

      const localCoordinate = Chunk.globalCoordinateToLocalCoordinate(globalCoordinate);
      this._registry.updateBlock(chunkId, localCoordinate, blockId, blockRotationIndex);

      if (update[chunkId] === undefined) {
        update[chunkId] = [];
      }
      update[chunkId].push({ localCoordinate, blockId, blockRotationIndex });
    });

    // Since chunks are also managed within the WebWorker, the information will be sent.
    // The worker will handle determining which batches need rebuilding based on block updates.
    const message: ChunkWorkerBlocksUpdateMessage = {
      type: 'blocks_update',
      update,
    };
    this._game.chunkWorkerClient.postMessage(message);
  }

  private _onChunksPacket = (payload: NetworkManagerEventPayload.IChunksPacket) => {
    const { deserializedChunks } = payload;
    const affectedBatches: Set<BatchId> = new Set();

    deserializedChunks.forEach(deserializedChunk => {
      const { removed, originCoordinate, blocks, blockRotations } = deserializedChunk;

      if (!originCoordinate) {
        return;
      }

      const chunkId = Chunk.originCoordinateToChunkId(originCoordinate);
      const batchId = Chunk.chunkIdToBatchId(chunkId);
      const chunk = this._registry.getChunk(chunkId);

      if (removed && chunk) {
        this._registry.deleteChunk(chunkId);

        const message: ChunkWorkerChunkRemoveMessage = {
          type: 'chunk_remove',
          chunkId,
        };
        this._game.chunkWorkerClient.postMessage(message);

        affectedBatches.add(batchId);
      }

      if (!removed && blocks) {
        this._registry.registerChunk(originCoordinate, blocks, blockRotations);

        // Since blocks are also managed on the main thread, they are not transferred.
        // However, if copying blocks becomes a performance or memory issue, this
        // approach may need to be reconsidered.
        const message: ChunkWorkerChunkUpdateMessage = {
          type: 'chunk_update',
          originCoordinate,
          blocks,
          blockRotations,
        };
        this._game.chunkWorkerClient.postMessage(message);

        affectedBatches.add(batchId);
      }
    });

    const basePosition = this._game.camera.gameCameraAttachedEntity?.position || this._game.camera.activeCamera.position;
    const cameraVec2 = fromVec2.set(basePosition.x, basePosition.z);
    
    const sortedBatches = Array.from(affectedBatches).sort((batchId1, batchId2) => {
      const origin1 = Chunk.batchIdToBatchOrigin(batchId1);
      const origin2 = Chunk.batchIdToBatchOrigin(batchId2);
      return vec1.copy(origin1).distanceToSquared(basePosition) - vec2.copy(origin2).distanceToSquared(basePosition);
    });

    sortedBatches.forEach(batchId => {
      const chunkIds = this._registry.getBatchChunkIds(batchId);
      
      if (chunkIds.length === 0) {
        this._game.chunkMeshManager.removeAllBatchMeshes(batchId);
        this._batchLodLevel.delete(batchId);
        return;
      }

      const origin = Chunk.batchIdToBatchOrigin(batchId);
      const distXZ = cameraVec2.distanceTo(vec1.set(origin.x + 16, origin.z + 16));
      const lodLevel = this._getLodLevelForDistance(distXZ);
      this._batchLodLevel.set(batchId, lodLevel);

      const message: ChunkWorkerChunkBatchBuildMessage = {
        type: 'chunk_batch_build',
        batchId,
        chunkIds,
        lodLevel,
      };
      this._game.chunkWorkerClient.postMessage(message);
    });
  }

  private _onChunkBatchBuilt = (payload: WorkerEventPayload.IChunkBatchBuilt): void => {
    const { batchId, chunkIds, liquidGeometry, opaqueSolidGeometry, transparentSolidGeometry, foliageGeometry, blockCount } = payload;

    // Verify at least one chunk in the batch still exists
    const validChunkIds = chunkIds.filter(chunkId => this._registry.getChunk(chunkId));
    
    if (validChunkIds.length === 0) {
      // All chunks in batch have been removed, clean up batch meshes
      this._game.chunkMeshManager.removeAllBatchMeshes(batchId);
      return;
    }

    if (!this._firstChunkBatchBuilt) {
      this._firstChunkBatchBuilt = true;
      performance.mark('ChunkManager:first-chunk-batch-built');
      performance.measure('ChunkManager:first-chunk-batch-built-time', 'NetworkManager:connected', 'ChunkManager:first-chunk-batch-built');
    }

    // Update batch meshes
    if (liquidGeometry) {
      this._game.chunkMeshManager.createOrUpdateBatchLiquidMesh(batchId, liquidGeometry);
    } else {
      this._game.chunkMeshManager.removeBatchLiquidMesh(batchId);
    }

    if (opaqueSolidGeometry) {
      this._game.chunkMeshManager.createOrUpdateBatchOpaqueSolidMesh(batchId, opaqueSolidGeometry);
    } else {
      this._game.chunkMeshManager.removeBatchOpaqueSolidMesh(batchId);
    }

    if (transparentSolidGeometry) {
      this._game.chunkMeshManager.createOrUpdateBatchTransparentSolidMesh(batchId, transparentSolidGeometry);
    } else {
      this._game.chunkMeshManager.removeBatchTransparentSolidMesh(batchId);
    }

    if (foliageGeometry) {
      this._game.chunkMeshManager.createOrUpdateBatchFoliageMesh(batchId, foliageGeometry);
    } else {
      this._game.chunkMeshManager.removeBatchFoliageMesh(batchId);
    }

    // Update batch metadata
    this._registry.updateBatchMetadata(batchId, {
      blockCount,
      opaqueFaceCount: (opaqueSolidGeometry?.indices.length || 0) / 3,
      transparentFaceCount: (transparentSolidGeometry?.indices.length || 0) / 3,
      liquidFaceCount: (liquidGeometry?.indices.length || 0) / 3,
    });
  };

  public getChunk(chunkId: ChunkId): Chunk | undefined {
    return this._registry.getChunk(chunkId);
  }

  public getChunkByGlobalCoordinate(globalCoordinate: Vector3Like): Chunk | undefined {
    return this.getChunk(Chunk.globalCoordinateToChunkId(globalCoordinate));
  }

  public inLiquidBlock(worldPosition: Vector3Like): boolean {
    const globalCoordinate = Chunk.worldPositionToGlobalCoordinate(worldPosition);
    const chunk = this.getChunkByGlobalCoordinate(globalCoordinate);

    if (!chunk) {
      return false;
    }

    const blockTypeId = chunk.getBlockType(Chunk.globalCoordinateToLocalCoordinate(globalCoordinate));

    if (blockTypeId === 0) {
      return false;
    }

    const blockType = this._game.blockTypeManager.getBlockType(blockTypeId)!;

    if (!blockType.isLiquid) {
      return false;
    }

    // The water surface is slightly below the edge of the local coordinate space,
    // so this needs to be taken into account. See BlockMaterial for more details.
    // TODO: For more accurate results, the water surface wave effect should also be considered.
    const globalCoordinateAbove = { ...globalCoordinate, y: globalCoordinate.y + 1 };
    const aboveBlockTypeId = chunk.getBlockType(Chunk.globalCoordinateToLocalCoordinate(globalCoordinateAbove));

    if (blockTypeId === aboveBlockTypeId) {
      return true;
    }

    const absWorldPositionY = Math.abs(worldPosition.y);
    return absWorldPositionY - Math.floor(absWorldPositionY) < 1.0 + WATER_SURFACE_Y_OFFSET;
  }
}