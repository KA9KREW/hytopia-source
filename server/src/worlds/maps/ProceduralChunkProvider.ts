import Chunk from '@/worlds/blocks/Chunk';
import { generateChunk, type TerrainGeneratorOptions } from './TerrainGenerator';
import type { ChunkProvider } from './ChunkProvider';
import type Vector3Like from '@/shared/types/math/Vector3Like';

const CACHE_SIZE = 512;

interface CacheEntry {
  chunk: Chunk;
  lastAccess: number;
}

/**
 * Provides chunks by generating them procedurally from a seed.
 * Uses an LRU cache to avoid re-generating frequently accessed chunks.
 *
 * **Category:** Maps
 * @public
 */
export class ProceduralChunkProvider implements ChunkProvider {
  private _options: TerrainGeneratorOptions;
  private _cache = new Map<string, CacheEntry>();
  private _accessCounter = 0;

  public constructor(options: TerrainGeneratorOptions) {
    this._options = options;
  }

  public getChunk(origin: Vector3Like): Chunk | null {
    const key = `${origin.x},${origin.y},${origin.z}`;
    const existing = this._cache.get(key);
    if (existing) {
      existing.lastAccess = ++this._accessCounter;
      return existing.chunk;
    }

    const { blocks } = generateChunk(origin, this._options);
    const chunk = new Chunk(origin);
    chunk.loadBlocks(blocks);

    this._pruneCacheIfNeeded();
    this._cache.set(key, { chunk, lastAccess: ++this._accessCounter });
    return chunk;
  }

  private _pruneCacheIfNeeded(): void {
    if (this._cache.size < CACHE_SIZE) return;
    let minKey: string | null = null;
    let minAccess = Infinity;
    for (const [k, v] of this._cache) {
      if (v.lastAccess < minAccess) {
        minAccess = v.lastAccess;
        minKey = k;
      }
    }
    if (minKey) this._cache.delete(minKey);
  }
}
