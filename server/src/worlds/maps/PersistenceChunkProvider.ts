import Chunk from '@/worlds/blocks/Chunk';
import { readChunk, writeChunk } from './RegionFileFormat';
import type { ChunkProvider } from './ChunkProvider';
import type Vector3Like from '@/shared/types/math/Vector3Like';

/**
 * Wraps an inner ChunkProvider and persists modified chunks to region files.
 * On getChunk: first checks region file; if not found, delegates to inner provider.
 * Modified chunks are written to disk when saveDirtyChunks is called.
 *
 * **Category:** Maps
 * @public
 */
export class PersistenceChunkProvider implements ChunkProvider {
  private _regionDir: string;
  private _inner: ChunkProvider;
  private _dirty = new Set<string>();

  public constructor(regionDir: string, inner: ChunkProvider) {
    this._regionDir = regionDir;
    this._inner = inner;
  }

  public getChunk(origin: Vector3Like): Chunk | null {
    const fromDisk = readChunk(this._regionDir, origin);
    if (fromDisk) return fromDisk;
    const fromInner = this._inner.getChunk(origin);
    return fromInner && typeof (fromInner as Promise<Chunk | null>).then === 'function' ? null : fromInner as Chunk | null;
  }

  public markDirty(origin: Vector3Like): void {
    this._dirty.add(`${origin.x},${origin.y},${origin.z}`);
  }

  /** Persist a single chunk. Called by ChunkLattice when unloading a dirty chunk. */
  public persistChunk(chunk: Chunk): void {
    writeChunk(this._regionDir, chunk);
    this._dirty.delete(`${chunk.originCoordinate.x},${chunk.originCoordinate.y},${chunk.originCoordinate.z}`);
  }
}
