import { BufferAttribute, BufferGeometry, Material, Mesh, MeshBasicMaterial, ShaderMaterial, Vector2, Vector3 } from 'three';
import Chunk from './Chunk';
import {
  BATCH_WORLD_SIZE,
  CHUNK_BUFFER_GEOMETRY_NUM_POSITION_COMPONENTS,
  CHUNK_BUFFER_GEOMETRY_NUM_NORMAL_COMPONENTS,
  CHUNK_BUFFER_GEOMETRY_NUM_UV_COMPONENTS,
  CHUNK_BUFFER_GEOMETRY_NUM_COLOR_COMPONENTS,
  CHUNK_BUFFER_GEOMETRY_NUM_LIGHT_LEVEL_COMPONENTS,
  CHUNK_BUFFER_GEOMETRY_NUM_FOAM_LEVEL_COMPONENTS,
  type BatchId,
} from './ChunkConstants';
import ChunkStats from './ChunkStats';
import type { BlocksBufferGeometryData } from '../blocks/BlockConstants';
import Game from '../Game';
import { updateAABB } from '../three/utils';

// Working variables
const toVec2 = new Vector2();
const batchCenterVec3 = new Vector3();

export default class ChunkMeshManager {
  private _game: Game;
  private _batchLiquidMeshes: Map<BatchId, Mesh<BufferGeometry, ShaderMaterial>> = new Map();
  private _batchOpaqueSolidMeshes: Map<BatchId, Mesh<BufferGeometry, MeshBasicMaterial>> = new Map();
  private _batchTransparentSolidMeshes: Map<BatchId, Mesh<BufferGeometry, MeshBasicMaterial>> = new Map();
  private _batchFoliageMeshes: Map<BatchId, Mesh<BufferGeometry, MeshBasicMaterial>> = new Map();
  // Track all batch IDs for efficient iteration
  private _batchIds: Set<BatchId> = new Set();
  private _solidMeshesInScene: Mesh<BufferGeometry, MeshBasicMaterial>[] = [];
  private _solidMeshesInSceneDirty: boolean = true;

  public constructor(game: Game) {
    this._game = game;
  }

  private _createOrUpdateMesh(id: BatchId, data: BlocksBufferGeometryData, cache: Map<BatchId, Mesh>, material: Material): Mesh {
    const { positions, normals, uvs, indices, colors, lightLevels, foamLevels, foamLevelsDiag } = data;

    let mesh = cache.get(id);
    const canUpdateInPlace = mesh?.geometry?.attributes && this._canUpdateGeometryInPlace(mesh.geometry, data);

    if (mesh && canUpdateInPlace) {
      this._updateGeometryInPlace(mesh.geometry as import('three').BufferGeometry, data);
      mesh.material = material;
    } else {
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(positions, CHUNK_BUFFER_GEOMETRY_NUM_POSITION_COMPONENTS));
      geometry.setAttribute('normal', new BufferAttribute(normals, CHUNK_BUFFER_GEOMETRY_NUM_NORMAL_COMPONENTS));
      geometry.setAttribute('uv', new BufferAttribute(uvs, CHUNK_BUFFER_GEOMETRY_NUM_UV_COMPONENTS));
      geometry.setAttribute('color', new BufferAttribute(colors, CHUNK_BUFFER_GEOMETRY_NUM_COLOR_COMPONENTS));
      if (lightLevels) geometry.setAttribute('lightLevel', new BufferAttribute(lightLevels, CHUNK_BUFFER_GEOMETRY_NUM_LIGHT_LEVEL_COMPONENTS));
      if (foamLevels) geometry.setAttribute('foamLevel', new BufferAttribute(foamLevels, CHUNK_BUFFER_GEOMETRY_NUM_FOAM_LEVEL_COMPONENTS));
      if (foamLevelsDiag) geometry.setAttribute('foamLevelDiag', new BufferAttribute(foamLevelsDiag, CHUNK_BUFFER_GEOMETRY_NUM_FOAM_LEVEL_COMPONENTS));
      geometry.setIndex(new BufferAttribute(indices, 1));
      geometry.computeBoundingSphere();

      if (mesh) {
        mesh.geometry.dispose();
        mesh.geometry = geometry;
      } else {
        mesh = new Mesh(geometry, material);
        mesh.name = `batch_${id}`;
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldAutoUpdate = false;
        cache.set(id, mesh);
        this._batchIds.add(id);
      }
      mesh.material = material;
    }

    updateAABB(mesh);
    return mesh;
  }

  private _canUpdateGeometryInPlace(geometry: import('three').BufferGeometry, data: BlocksBufferGeometryData): boolean {
    const pos = geometry.attributes.position;
    const idx = geometry.index;
    return !!pos && !!idx &&
      pos.array.length === data.positions.length &&
      idx.array.length === data.indices.length;
  }

  private _updateGeometryInPlace(geometry: import('three').BufferGeometry, data: BlocksBufferGeometryData): void {
    const { positions, normals, uvs, colors, indices, lightLevels, foamLevels, foamLevelsDiag } = data;
    (geometry.attributes.position as import('three').BufferAttribute).array.set(positions);
    (geometry.attributes.position as import('three').BufferAttribute).needsUpdate = true;
    (geometry.attributes.normal as import('three').BufferAttribute).array.set(normals);
    (geometry.attributes.normal as import('three').BufferAttribute).needsUpdate = true;
    (geometry.attributes.uv as import('three').BufferAttribute).array.set(uvs);
    (geometry.attributes.uv as import('three').BufferAttribute).needsUpdate = true;
    (geometry.attributes.color as import('three').BufferAttribute).array.set(colors);
    (geometry.attributes.color as import('three').BufferAttribute).needsUpdate = true;
    if (lightLevels && geometry.attributes.lightLevel) {
      (geometry.attributes.lightLevel as import('three').BufferAttribute).array.set(lightLevels);
      (geometry.attributes.lightLevel as import('three').BufferAttribute).needsUpdate = true;
    }
    if (foamLevels && geometry.attributes.foamLevel) {
      (geometry.attributes.foamLevel as import('three').BufferAttribute).array.set(foamLevels);
      (geometry.attributes.foamLevel as import('three').BufferAttribute).needsUpdate = true;
    }
    if (foamLevelsDiag && geometry.attributes.foamLevelDiag) {
      (geometry.attributes.foamLevelDiag as import('three').BufferAttribute).array.set(foamLevelsDiag);
      (geometry.attributes.foamLevelDiag as import('three').BufferAttribute).needsUpdate = true;
    }
    if (geometry.index) {
      (geometry.index as import('three').BufferAttribute).array.set(indices);
      (geometry.index as import('three').BufferAttribute).needsUpdate = true;
    }
    geometry.computeBoundingSphere();
  }

  private _removeMesh(id: BatchId, cache: Map<BatchId, Mesh>, isFoliage = false): void {
    const mesh = cache.get(id);
    if (mesh) {
      if (!isFoliage && mesh.parent) {
        this._solidMeshesInSceneDirty = true;
      }
      mesh.geometry.dispose();
      cache.delete(id);
      if (isFoliage) {
        this._game.renderer.removeFromFoliageScene(mesh);
      } else {
        this._game.renderer.removeFromScene(mesh);
      }
    }
  }

  private _setFoliageMeshInScene(mesh: Mesh, inScene: boolean): void {
    const isInScene = mesh.parent !== null;
    if (inScene && !isInScene) {
      this._game.renderer.addToFoliageScene(mesh);
    } else if (!inScene && isInScene) {
      this._game.renderer.removeFromFoliageScene(mesh);
    }
  }

  public createOrUpdateBatchLiquidMesh(batchId: BatchId, data: BlocksBufferGeometryData): void {
    this._createOrUpdateMesh(
      batchId,
      data,
      this._batchLiquidMeshes,
      this._game.blockMaterialManager.liquidMaterial,
    );
  }

  public createOrUpdateBatchOpaqueSolidMesh(batchId: BatchId, data: BlocksBufferGeometryData): void {
    this._createOrUpdateMesh(
      batchId,
      data,
      this._batchOpaqueSolidMeshes,
      !!data.lightLevels ? this._game.blockMaterialManager.opaqueMaterial : this._game.blockMaterialManager.opaqueNonLitMaterial,
    );
  }

  public createOrUpdateBatchTransparentSolidMesh(batchId: BatchId, data: BlocksBufferGeometryData): void {
    this._createOrUpdateMesh(
      batchId,
      data,
      this._batchTransparentSolidMeshes,
      !!data.lightLevels ? this._game.blockMaterialManager.transparentMaterial : this._game.blockMaterialManager.transparentNonLitMaterial,
    );
  }

  public createOrUpdateBatchFoliageMesh(batchId: BatchId, data: BlocksBufferGeometryData): void {
    this._createOrUpdateMesh(
      batchId,
      data,
      this._batchFoliageMeshes,
      !!data.lightLevels ? this._game.blockMaterialManager.opaqueMaterial : this._game.blockMaterialManager.opaqueNonLitMaterial,
    );
  }

  public removeBatchFoliageMesh(batchId: BatchId): void {
    this._removeMesh(batchId, this._batchFoliageMeshes, true);
    this._cleanupBatchId(batchId);
  }

  public removeBatchLiquidMesh(batchId: BatchId): void {
    this._removeMesh(batchId, this._batchLiquidMeshes);
    this._cleanupBatchId(batchId);
  }

  public removeBatchOpaqueSolidMesh(batchId: BatchId): void {
    this._removeMesh(batchId, this._batchOpaqueSolidMeshes);
    this._cleanupBatchId(batchId);
  }

  public removeBatchTransparentSolidMesh(batchId: BatchId): void {
    this._removeMesh(batchId, this._batchTransparentSolidMeshes);
    this._cleanupBatchId(batchId);
  }

  public removeAllBatchMeshes(batchId: BatchId): void {
    this._removeMesh(batchId, this._batchLiquidMeshes);
    this._removeMesh(batchId, this._batchOpaqueSolidMeshes);
    this._removeMesh(batchId, this._batchTransparentSolidMeshes);
    this._removeMesh(batchId, this._batchFoliageMeshes, true);
    this._batchIds.delete(batchId);
  }

  private _cleanupBatchId(batchId: BatchId): void {
    if (!this._batchLiquidMeshes.has(batchId) &&
        !this._batchOpaqueSolidMeshes.has(batchId) &&
        !this._batchTransparentSolidMeshes.has(batchId) &&
        !this._batchFoliageMeshes.has(batchId)) {
      this._batchIds.delete(batchId);
    }
  }

  public applyBatchViewDistance(
    fromVec2: Vector2,
    viewDistanceSquared: number,
    overFaceLimit?: boolean,
    occlusionVisibleBatches?: Set<string> | null,
  ): void {
    const effectiveViewDistSq = overFaceLimit ? viewDistanceSquared * 0.25 : viewDistanceSquared;
    const useOcclusion = overFaceLimit && occlusionVisibleBatches && occlusionVisibleBatches.size > 0;

    for (const batchId of this._batchIds) {
      const liquidMesh = this._batchLiquidMeshes.get(batchId);
      const opaqueSolidMesh = this._batchOpaqueSolidMeshes.get(batchId);
      const transparentSolidMesh = this._batchTransparentSolidMeshes.get(batchId);
      const foliageMesh = this._batchFoliageMeshes.get(batchId);

      if (!liquidMesh && !opaqueSolidMesh && !transparentSolidMesh && !foliageMesh) continue;

      const batchOrigin = Chunk.batchIdToBatchOrigin(batchId);
      const halfBatchSize = BATCH_WORLD_SIZE / 2;
      batchCenterVec3.set(
        batchOrigin.x + halfBatchSize,
        batchOrigin.y + halfBatchSize,
        batchOrigin.z + halfBatchSize,
      );
      const inRange = fromVec2.distanceToSquared(toVec2.set(batchCenterVec3.x, batchCenterVec3.z)) <= effectiveViewDistSq;
      const visible = useOcclusion ? inRange && occlusionVisibleBatches.has(batchId) : inRange;

      if (liquidMesh) this._setMeshInScene(liquidMesh, visible);
      if (opaqueSolidMesh) this._setMeshInScene(opaqueSolidMesh, visible);
      if (transparentSolidMesh) this._setMeshInScene(transparentSolidMesh, visible);
      if (foliageMesh) this._setFoliageMeshInScene(foliageMesh, visible);

      if (visible) ChunkStats.visibleCount++;
    }
  }

  private _setMeshInScene(mesh: Mesh, inScene: boolean): void {
    const isInScene = mesh.parent !== null;
    
    if (inScene && !isInScene) {
      this._game.renderer.addToScene(mesh);
      this._solidMeshesInSceneDirty = true;
    } else if (!inScene && isInScene) {
      this._game.renderer.removeFromScene(mesh);
      this._solidMeshesInSceneDirty = true;
    }
  }

  public get solidMeshesInScene(): Mesh<BufferGeometry, MeshBasicMaterial>[] {
    if (this._solidMeshesInSceneDirty) {
      this._solidMeshesInScene.length = 0;
      for (const mesh of this._batchOpaqueSolidMeshes.values()) {
        if (mesh.parent) {
          this._solidMeshesInScene.push(mesh);
        }
      }
      for (const mesh of this._batchTransparentSolidMeshes.values()) {
        if (mesh.parent) {
          this._solidMeshesInScene.push(mesh);
        }
      }
      this._solidMeshesInSceneDirty = false;
    }
    return this._solidMeshesInScene;
  }

  public get opaqueSolidMeshes(): IterableIterator<Mesh<BufferGeometry, MeshBasicMaterial>> {
    return this._batchOpaqueSolidMeshes.values();
  }

  public get transparentSolidMeshes(): IterableIterator<Mesh<BufferGeometry, MeshBasicMaterial>> {
    return this._batchTransparentSolidMeshes.values();
  }

  public addAllBatchMeshesToScene(): void {
    for (const batchId of this._batchIds) {
      const liquidMesh = this._batchLiquidMeshes.get(batchId);
      const opaqueSolidMesh = this._batchOpaqueSolidMeshes.get(batchId);
      const transparentSolidMesh = this._batchTransparentSolidMeshes.get(batchId);
      const foliageMesh = this._batchFoliageMeshes.get(batchId);

      if (!liquidMesh && !opaqueSolidMesh && !transparentSolidMesh && !foliageMesh) {
        continue;
      }

      if (liquidMesh) this._setMeshInScene(liquidMesh, true);
      if (opaqueSolidMesh) this._setMeshInScene(opaqueSolidMesh, true);
      if (transparentSolidMesh) this._setMeshInScene(transparentSolidMesh, true);
      if (foliageMesh) this._setFoliageMeshInScene(foliageMesh, true);

      ChunkStats.visibleCount++;
    }
  }
}