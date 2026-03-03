import type Chunk from '@/worlds/blocks/Chunk';
import type Vector3Like from '@/shared/types/math/Vector3Like';

/**
 * Provides chunks on demand for procedural or persisted worlds.
 * When a chunk is requested and not in the lattice, the provider is consulted.
 *
 * **Category:** Maps
 * @public
 */
export interface ChunkProvider {
  /**
   * Get the chunk at the given origin (world coordinates, multiples of 16).
   * Return null to treat as empty/air (no chunk).
   */
  getChunk(origin: Vector3Like): Chunk | null | Promise<Chunk | null>;

  /** Mark chunk as modified (for persistence). Optional. */
  markDirty?(origin: Vector3Like): void;

  /** Flush dirty chunks to disk. Optional. */
  saveDirtyChunks?(): void | Promise<void>;

  /** Persist a chunk to disk (e.g. when unloading). Optional. */
  persistChunk?(chunk: Chunk): void;
}
