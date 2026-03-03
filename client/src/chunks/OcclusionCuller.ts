import Chunk from './Chunk';
import type ChunkRegistry from './ChunkRegistry';
import type { BatchId } from './ChunkConstants';
import type BlockType from '../blocks/BlockType';
import type { Vector3Like } from 'three';

const NEIGHBORS = [
  { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 },
];

const BFS_MAX_NODES = 50000;

type BlockTypeResolver = { getBlockType: (id: number) => BlockType | undefined };

/**
 * Cave/occlusion culling: BFS from camera through air/liquid to find visible batches.
 * Batches behind solid terrain are not rendered.
 */
export default class OcclusionCuller {
  private _registry: ChunkRegistry;
  private _blockTypes: BlockTypeResolver;
  private _visibleBatches: Set<BatchId> = new Set();
  private _visitedKey = (x: number, y: number, z: number) => `${x},${y},${z}`;

  public constructor(registry: ChunkRegistry, blockTypes: BlockTypeResolver) {
    this._registry = registry;
    this._blockTypes = blockTypes;
  }

  public computeVisibleBatches(cameraPos: Vector3Like, viewDistanceSquared: number): Set<BatchId> {
    const startX = Math.floor(cameraPos.x);
    const startY = Math.floor(cameraPos.y);
    const startZ = Math.floor(cameraPos.z);

    this._visibleBatches.clear();
    const visited = new Set<string>();
    const queue: { x: number; y: number; z: number }[] = [{ x: startX, y: startY, z: startZ }];
    visited.add(this._visitedKey(startX, startY, startZ));

    let nodesProcessed = 0;

    while (queue.length > 0 && nodesProcessed < BFS_MAX_NODES) {
      const curr = queue.shift()!;
      nodesProcessed++;

      const chunkId = Chunk.globalCoordinateToChunkId(curr);
      const batchId = Chunk.chunkIdToBatchId(chunkId);
      this._visibleBatches.add(batchId);

      for (const d of NEIGHBORS) {
        const nx = curr.x + d.x;
        const ny = curr.y + d.y;
        const nz = curr.z + d.z;

        const key = this._visitedKey(nx, ny, nz);
        if (visited.has(key)) continue;

        const dx = nx - startX;
        const dz = nz - startZ;
        if (dx * dx + dz * dz > viewDistanceSquared) continue;

        if (!this._isPassable(nx, ny, nz)) continue;

        visited.add(key);
        queue.push({ x: nx, y: ny, z: nz });
      }
    }

    return this._visibleBatches;
  }

  private _isPassable(gx: number, gy: number, gz: number): boolean {
    const chunkId = Chunk.globalCoordinateToChunkId({ x: gx, y: gy, z: gz });
    const chunk = this._registry.getChunk(chunkId);
    if (!chunk) return false;

    const local = Chunk.globalCoordinateToLocalCoordinate({ x: gx, y: gy, z: gz });
    const blockId = chunk.getBlockType(local);
    if (blockId === 0) return true;

    const blockType = this._blockTypes.getBlockType(blockId);
    if (!blockType) return false;
    if (blockType.isLiquid) return true;
    if (blockType.transparencyRatio > 0.5) return true;

    return false;
  }

  public isBatchVisible(batchId: BatchId): boolean {
    return this._visibleBatches.has(batchId);
  }
}
