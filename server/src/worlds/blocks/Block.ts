import type BlockType from '@/worlds/blocks/BlockType';
import type Vector3Like from '@/shared/types/math/Vector3Like';

/**
 * All valid block rotations, named as `{face pointing up}_{Y rotation degrees}`.
 *
 * N prefix = negative axis (e.g. `NZ_90` = -Z face up, rotated 90° around global Y).
 *
 * **Category:** Blocks
 * @public
 */
export const BLOCK_ROTATIONS = {
  Y_0:    { enumIndex: 0,  matrix: [  1, 0, 0,   0, 1, 0,   0, 0, 1 ] },
  Y_90:   { enumIndex: 1,  matrix: [  0, 0,-1,   0, 1, 0,   1, 0, 0 ] },
  Y_180:  { enumIndex: 2,  matrix: [ -1, 0, 0,   0, 1, 0,   0, 0,-1 ] },
  Y_270:  { enumIndex: 3,  matrix: [  0, 0, 1,   0, 1, 0,  -1, 0, 0 ] },
  NY_0:   { enumIndex: 4,  matrix: [ -1, 0, 0,   0,-1, 0,   0, 0, 1 ] },
  NY_90:  { enumIndex: 5,  matrix: [  0, 0,-1,   0,-1, 0,  -1, 0, 0 ] },
  NY_180: { enumIndex: 6,  matrix: [  1, 0, 0,   0,-1, 0,   0, 0,-1 ] },
  NY_270: { enumIndex: 7,  matrix: [  0, 0, 1,   0,-1, 0,   1, 0, 0 ] },
  X_0:    { enumIndex: 8,  matrix: [  0,-1, 0,   1, 0, 0,   0, 0, 1 ] },
  X_90:   { enumIndex: 9,  matrix: [  0, 0,-1,   1, 0, 0,   0,-1, 0 ] },
  X_180:  { enumIndex: 10, matrix: [  0, 1, 0,   1, 0, 0,   0, 0,-1 ] },
  X_270:  { enumIndex: 11, matrix: [  0, 0, 1,   1, 0, 0,   0, 1, 0 ] },
  NX_0:   { enumIndex: 12, matrix: [  0, 1, 0,  -1, 0, 0,   0, 0, 1 ] },
  NX_90:  { enumIndex: 13, matrix: [  0, 0,-1,  -1, 0, 0,   0, 1, 0 ] },
  NX_180: { enumIndex: 14, matrix: [  0,-1, 0,  -1, 0, 0,   0, 0,-1 ] },
  NX_270: { enumIndex: 15, matrix: [  0, 0, 1,  -1, 0, 0,   0,-1, 0 ] },
  Z_0:    { enumIndex: 16, matrix: [  1, 0, 0,   0, 0, 1,   0,-1, 0 ] },
  Z_90:   { enumIndex: 17, matrix: [  0, 1, 0,   0, 0, 1,   1, 0, 0 ] },
  Z_180:  { enumIndex: 18, matrix: [ -1, 0, 0,   0, 0, 1,   0, 1, 0 ] },
  Z_270:  { enumIndex: 19, matrix: [  0,-1, 0,   0, 0, 1,  -1, 0, 0 ] },
  NZ_0:   { enumIndex: 20, matrix: [  1, 0, 0,   0, 0,-1,   0, 1, 0 ] },
  NZ_90:  { enumIndex: 21, matrix: [  0,-1, 0,   0, 0,-1,   1, 0, 0 ] },
  NZ_180: { enumIndex: 22, matrix: [ -1, 0, 0,   0, 0,-1,   0,-1, 0 ] },
  NZ_270: { enumIndex: 23, matrix: [  0, 1, 0,   0, 0,-1,  -1, 0, 0 ] },
} as const;

/**
 * A block rotation from `BLOCK_ROTATIONS`.
 *
 * **Category:** Blocks
 * @public
 */
export type BlockRotation = typeof BLOCK_ROTATIONS[keyof typeof BLOCK_ROTATIONS];

/**
 * A block placement in world coordinates.
 *
 * **Category:** Blocks
 * @public
 */
export interface BlockPlacement {
  globalCoordinate: Vector3Like;
  blockRotation?: BlockRotation;
};

/**
 * Represents a block in a world.
 *
 * When to use: reading block data from queries like raycasts or chunk lookups.
 * Do NOT use for: creating or placing blocks directly; use `ChunkLattice.setBlock`.
 *
 * @remarks
 * Instances are created internally and surfaced by API methods.
 * Block coordinates are **world coordinates** (global block grid), not local chunk coordinates.
 *
 * **Category:** Blocks
 * @public
 */
export default class Block {
  /**
   * The global coordinate of the block.
   *
   * **Category:** Blocks
   */
  public readonly globalCoordinate: Vector3Like;

  /**
   * The block type of the block.
   *
   * **Category:** Blocks
   */
  public readonly blockType: BlockType;

  /** @internal */
  public constructor(coordinate: Vector3Like, blockType: BlockType) {
    this.globalCoordinate = coordinate;
    this.blockType = blockType;
  }

  /** @internal */
  public static fromGlobalCoordinate(globalCoordinate: Vector3Like, blockType: BlockType): Block {
    return new Block(globalCoordinate, blockType);
  }

  /**
   * Gets the most adjacent neighbor global coordinate of this block
   * based on a relative hit point, typically from a raycast. 
   *
   * Use for: placing a new block on the face that was hit.
   *
   * @param hitPoint - The hit point on this block (global coordinates).
   * @returns The adjacent block coordinate in world space.
   *
   * **Category:** Blocks
   */
  public getNeighborGlobalCoordinateFromHitPoint(hitPoint: Vector3Like): Vector3Like {
    // Calculate offset from block center for each axis
    const offsets = {
      x: hitPoint.x - (this.globalCoordinate.x + 0.5),
      y: hitPoint.y - (this.globalCoordinate.y + 0.5),
      z: hitPoint.z - (this.globalCoordinate.z + 0.5),
    };

    // Find which axis had the largest offset from center
    let maxOffset = 'x';
    let maxValue = Math.abs(offsets.x);

    for (const [ axis, offset ] of Object.entries(offsets)) {
      if (Math.abs(offset) > maxValue) {
        maxOffset = axis;
        maxValue = Math.abs(offset);
      }
    }

    // Return coordinates offset by 1 in direction of
    // largest offset to get the hit relative neighbor coordinate
    return {
      x: this.globalCoordinate.x + (maxOffset === 'x' ? Math.sign(offsets.x) : 0),
      y: this.globalCoordinate.y + (maxOffset === 'y' ? Math.sign(offsets.y) : 0), 
      z: this.globalCoordinate.z + (maxOffset === 'z' ? Math.sign(offsets.z) : 0),
    };
  }
}
