import RAPIER from '@dimforge/rapier3d-simd-compat';
import ErrorHandler from '@/errors/ErrorHandler';

/**
 * The default collision groups.
 *
 * @remarks
 * Collision groups determine which objects collide and generate events. Up to 15 groups
 * can be registered. Filtering uses pairwise bit masks:
 *
 * - The belongsTo groups (the 16 left-most bits of `self.0`)
 * - The collidesWith mask (the 16 right-most bits of `self.0`)
 *
 * An interaction is allowed between two filters `a` and `b` if:
 *
 * ```
 * ((a >> 16) & b) != 0 && ((b >> 16) & a) != 0
 * ```
 *
 * **Category:** Physics
 * @public
 */
export enum CollisionGroup {
  BLOCK = 1 << 0,
  ENTITY = 1 << 1,
  ENTITY_SENSOR = 1 << 2,
  ENVIRONMENT_ENTITY = 1 << 3,
  PLAYER = 1 << 4,
  GROUP_1 = 1 << 5,
  GROUP_2 = 1 << 6,
  GROUP_3 = 1 << 7,
  GROUP_4 = 1 << 8,
  GROUP_5 = 1 << 9,
  GROUP_6 = 1 << 10,
  GROUP_7 = 1 << 11,
  GROUP_8 = 1 << 12,
  GROUP_9 = 1 << 13,
  GROUP_10 = 1 << 14,
  GROUP_11 = 1 << 15,
  ALL = 0xFFFF
}

/**
 * A set of collision groups.
 *
 * **Category:** Physics
 * @public
 */
export type CollisionGroups = {
  belongsTo: CollisionGroup[];
  collidesWith: CollisionGroup[];
}

/**
 * A decoded set of collision groups represented as their string equivalents.
 *
 * **Category:** Physics
 * @public
 */
export type DecodedCollisionGroups = {
  belongsTo: string[];
  collidesWith: string[];
};

/**
 * A raw set of collision groups represented as a 32-bit number.
 *
 * **Category:** Physics
 * @public
 */
export type RawCollisionGroups = RAPIER.InteractionGroups;

/**
 * A helper class for building and decoding collision groups.
 *
 * When to use: creating custom collision filters for colliders and rigid bodies.
 * Do NOT use for: per-frame changes; collision group changes are usually infrequent.
 *
 * @remarks
 * Use the static methods directly to encode or decode collision group masks.
 *
 * **Category:** Physics
 * @public
 */
export default class CollisionGroupsBuilder {
  private static readonly BELONGS_TO_SHIFT = 16;
  private static readonly COLLIDES_WITH_MASK = 0xFFFF;

  /**
   * Builds a raw collision group mask from a set of collision groups.
   *
   * @param collisionGroups - The set of collision groups to build.
   * @returns A raw set of collision groups represented as a 32-bit number.
   *
   * **Category:** Physics
   */
  public static buildRawCollisionGroups(collisionGroups: CollisionGroups): RawCollisionGroups {
    return this.combineGroups(collisionGroups.belongsTo) << this.BELONGS_TO_SHIFT | 
           this.combineGroups(collisionGroups.collidesWith);
  }

  /**
   * Decodes a raw collision group mask into a set of collision groups.
   *
   * @param groups - The raw set of collision groups to decode.
   * @returns A set of collision groups.
   *
   * **Category:** Physics
   */
  public static decodeRawCollisionGroups(groups: RawCollisionGroups): CollisionGroups {
    return {
      belongsTo: this.bitsToGroups(groups >>> this.BELONGS_TO_SHIFT),
      collidesWith: this.bitsToGroups(groups & this.COLLIDES_WITH_MASK),
    };
  }

  /**
   * Decodes collision groups into their string equivalents.
   *
   * @param collisionGroups - The set of collision groups to decode.
   * @returns A set of collision groups represented as their string equivalents.
   *
   * **Category:** Physics
   */
  public static decodeCollisionGroups(collisionGroups: CollisionGroups): DecodedCollisionGroups {
    return {
      belongsTo: collisionGroups.belongsTo.map(collisionGroup => this.groupToName(collisionGroup)),
      collidesWith: collisionGroups.collidesWith.map(collisionGroup => this.groupToName(collisionGroup)),
    };
  }

  /**
   * Checks if the collision groups are the default collision groups.
   *
   * @param collisionGroups - The set of collision groups to check.
   * @returns Whether the collision groups are the default collision groups.
   *
   * **Category:** Physics
   */
  public static isDefaultCollisionGroups(collisionGroups: CollisionGroups): boolean {
    return collisionGroups.belongsTo.includes(CollisionGroup.ALL) &&
           collisionGroups.collidesWith.includes(CollisionGroup.ALL);
  }

  /**
   * Combines an array of collision groups into a raw set of collision groups.
   * @param groups - The array of collision groups to combine.
   * @returns A raw set of collision groups represented as a 32-bit number.
   */
  private static combineGroups(groups: CollisionGroup[]): RawCollisionGroups {
    return groups.reduce((acc, curr) => acc | curr, 0);
  }

  /** @internal */
  private static bitsToGroups(bits: number): CollisionGroup[] {
    if (bits as CollisionGroup === CollisionGroup.ALL) {
      return [ CollisionGroup.ALL ];
    }

    return Object.values(CollisionGroup)
      .filter(value => 
        typeof value === 'number' &&
        value !== CollisionGroup.ALL &&
        (bits & value) !== 0,
      ) as CollisionGroup[];
  }

  /** @internal */
  private static groupToName(group: CollisionGroup): string {
    const groupName = Object.entries(CollisionGroup).find(([ _, value ]) => value === group);

    if (!groupName) {
      ErrorHandler.fatalError(`CollisionGroupsBuilder.groupToName(): Unknown collision group: ${group}`);
    }

    return groupName[0];
  }
}
