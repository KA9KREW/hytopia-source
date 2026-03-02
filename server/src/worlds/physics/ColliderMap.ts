import RAPIER from '@dimforge/rapier3d-simd-compat';
import type BlockType from '@/worlds/blocks/BlockType';
import type Collider from '@/worlds/physics/Collider';
import type Entity from '@/worlds/entities/Entity';
import ErrorHandler from '@/errors/ErrorHandler';

/**
 * A callback function that is called when a collision occurs.
 *
 * @param other - The other object involved in the collision, a block or entity.
 * @param started - Whether the collision has started or ended.
 *
 * **Category:** Physics
 * @public
 */
export type CollisionCallback = ((other: BlockType | Entity, started: boolean) => void) |
                                ((other: BlockType | Entity, started: boolean, colliderHandleA: number, colliderHandleB: number) => void);

/** @internal */
export type CollisionObject = BlockType | Entity | CollisionCallback;

/**
 * Maps physics collider handles to block types, entities, or callbacks.
 *
 * When to use: internal physics bookkeeping for collision lookups.
 * Do NOT use for: gameplay logic; use `Simulation` or entity APIs.
 *
 * **Category:** Physics
 * @internal
 */
export default class ColliderMap {
  private _colliderHandleBlockTypeMap: Map<RAPIER.ColliderHandle, BlockType> = new Map();
  private _colliderHandleCollisionCallbackMap: Map<RAPIER.ColliderHandle, CollisionCallback> = new Map();
  private _colliderHandleEntityMap: Map<RAPIER.ColliderHandle, Entity> = new Map();
  
  private _cleanupBlockTypeColliderHandles: Set<RAPIER.ColliderHandle> = new Set();
  private _pendingCleanupBlockTypeColliderHandles: Set<RAPIER.ColliderHandle> = new Set();

  private _cleanupCollisionCallbackColliderHandles: Set<RAPIER.ColliderHandle> = new Set();
  private _pendingCleanupCollisionCallbackColliderHandles: Set<RAPIER.ColliderHandle> = new Set();
  
  private _cleanupEntityColliderHandles: Set<RAPIER.ColliderHandle> = new Set();
  private _pendingCleanupEntityColliderHandles: Set<RAPIER.ColliderHandle> = new Set();

  public getColliderBlockType(collider: Collider): BlockType | undefined {
    if (!this._requireSimulatedCollider(collider)) { return undefined; }

    return this._colliderHandleBlockTypeMap.get(collider.rawCollider!.handle);
  }

  public getColliderCollisionCallback(collider: Collider): CollisionCallback | undefined {
    if (!this._requireSimulatedCollider(collider)) { return undefined; }

    return this._colliderHandleCollisionCallbackMap.get(collider.rawCollider!.handle);
  }
  
  public getColliderEntity(collider: Collider): Entity | undefined {
    if (!this._requireSimulatedCollider(collider)) { return undefined; }

    return this._colliderHandleEntityMap.get(collider.rawCollider!.handle);
  }
  
  public getColliderHandleBlockType(colliderHandle: RAPIER.ColliderHandle): BlockType | undefined {
    return this._colliderHandleBlockTypeMap.get(colliderHandle);
  }
  public getColliderHandleCollisionCallback(colliderHandle: RAPIER.ColliderHandle): CollisionCallback | undefined {
    return this._colliderHandleCollisionCallbackMap.get(colliderHandle);
  }

  public getColliderHandleEntity(colliderHandle: RAPIER.ColliderHandle): Entity | undefined {
    return this._colliderHandleEntityMap.get(colliderHandle);
  }

  public removeColliderBlockType(collider: Collider) {
    if (!this._requireSimulatedCollider(collider)) { return; }
    this.removeColliderHandleBlockType(collider.rawCollider!.handle);
  }

  public removeColliderCollisionCallback(collider: Collider) {
    if (!this._requireSimulatedCollider(collider)) { return; }
    this.removeColliderHandleCollisionCallback(collider.rawCollider!.handle);
  }

  public removeColliderEntity(collider: Collider) {
    if (!this._requireSimulatedCollider(collider)) { return; }
    this.removeColliderHandleEntity(collider.rawCollider!.handle);
  }

  public removeColliderHandleBlockType(colliderHandle: RAPIER.ColliderHandle) {
    this._colliderHandleBlockTypeMap.delete(colliderHandle);
  }

  public removeColliderHandleCollisionCallback(colliderHandle: RAPIER.ColliderHandle) {
    this._colliderHandleCollisionCallbackMap.delete(colliderHandle);
  }

  public removeColliderHandleEntity(colliderHandle: RAPIER.ColliderHandle) {
    this._colliderHandleEntityMap.delete(colliderHandle);
  }

  public setColliderBlockType(collider: Collider, block: BlockType) {
    if (!this._requireSimulatedCollider(collider)) { return; }
    this.setColliderHandleBlockType(collider.rawCollider!.handle, block);
  }

  public setColliderCollisionCallback(collider: Collider, callback: CollisionCallback) {
    if (!this._requireSimulatedCollider(collider)) { return; }
    this.setColliderHandleCollisionCallback(collider.rawCollider!.handle, callback);
  }

  public setColliderEntity(collider: Collider, entity: Entity) {
    if (!this._requireSimulatedCollider(collider)) { return; }
    this.setColliderHandleEntity(collider.rawCollider!.handle, entity);
  }

  public setColliderHandleBlockType(colliderHandle: RAPIER.ColliderHandle, block: BlockType) {
    this._colliderHandleBlockTypeMap.set(colliderHandle, block);
    this._cleanupBlockTypeColliderHandles.delete(colliderHandle);
    this._pendingCleanupBlockTypeColliderHandles.delete(colliderHandle);
  }

  public setColliderHandleCollisionCallback(colliderHandle: RAPIER.ColliderHandle, callback: CollisionCallback) {
    this._colliderHandleCollisionCallbackMap.set(colliderHandle, callback);
    this._cleanupCollisionCallbackColliderHandles.delete(colliderHandle);
    this._pendingCleanupCollisionCallbackColliderHandles.delete(colliderHandle);
  }

  public setColliderHandleEntity(colliderHandle: RAPIER.ColliderHandle, entity: Entity) {
    this._colliderHandleEntityMap.set(colliderHandle, entity);
    this._cleanupEntityColliderHandles.delete(colliderHandle);
    this._pendingCleanupEntityColliderHandles.delete(colliderHandle);
  }

  public queueColliderHandleForCleanup(colliderHandle: RAPIER.ColliderHandle) {
    if (this._colliderHandleBlockTypeMap.has(colliderHandle)) {
      this._pendingCleanupBlockTypeColliderHandles.add(colliderHandle);
    }

    if (this._colliderHandleCollisionCallbackMap.has(colliderHandle)) {
      this._pendingCleanupCollisionCallbackColliderHandles.add(colliderHandle);
    }

    if (this._colliderHandleEntityMap.has(colliderHandle)) {
      this._pendingCleanupEntityColliderHandles.add(colliderHandle);
    }
  }

  public cleanup() {
    // Cleanup block type collider handles
    for (const colliderHandle of this._cleanupBlockTypeColliderHandles) {
      this._colliderHandleBlockTypeMap.delete(colliderHandle);
    }

    if (this._cleanupBlockTypeColliderHandles.size > 0) {
      this._cleanupBlockTypeColliderHandles.clear();
    }

    // Cleanup collision callback collider handles
    for (const colliderHandle of this._cleanupCollisionCallbackColliderHandles) {
      this._colliderHandleCollisionCallbackMap.delete(colliderHandle);
    }

    if (this._cleanupCollisionCallbackColliderHandles.size > 0) {
      this._cleanupCollisionCallbackColliderHandles.clear();
    }

    // Cleanup entity collider handles
    for (const colliderHandle of this._cleanupEntityColliderHandles) {
      this._colliderHandleEntityMap.delete(colliderHandle);
    }

    if (this._cleanupEntityColliderHandles.size > 0) {  
      this._cleanupEntityColliderHandles.clear();
    }

    // Move pending to cleanup next invokation of cleanup(), which will be the following tick.
    // We do next tick, to allow collision events that result in a removed collider, that
    // may remove another collider, to still process successfully the following tick.
    // Eg, bullet collision event with spider, spider despawns in response to that event
    // which is after current tick events drained, but when spider despawns it 
    // causes a sensor event that detects the despawn of the spider. Since the spider
    // despawned after the current tick events drained, the remove event processes next tick,
    // but if we removed the spider this tick it would be removed too soon
    // to process for the sensor in the next tick, so we process cleanup on the next tick of removals.

    // Move pending block type collider handles to cleanup
    for (const colliderHandle of this._pendingCleanupBlockTypeColliderHandles) {
      this._cleanupBlockTypeColliderHandles.add(colliderHandle);
    }

    if (this._pendingCleanupBlockTypeColliderHandles.size > 0) {
      this._pendingCleanupBlockTypeColliderHandles.clear();
    }

    // Move pending collision callback collider handles to cleanup
    for (const colliderHandle of this._pendingCleanupCollisionCallbackColliderHandles) {
      this._cleanupCollisionCallbackColliderHandles.add(colliderHandle);
    }

    if (this._pendingCleanupCollisionCallbackColliderHandles.size > 0) {
      this._pendingCleanupCollisionCallbackColliderHandles.clear();
    }

    // Move pending entity collider handles to cleanup
    for (const colliderHandle of this._pendingCleanupEntityColliderHandles) {
      this._cleanupEntityColliderHandles.add(colliderHandle);
    }

    if (this._pendingCleanupEntityColliderHandles.size > 0) {
      this._pendingCleanupEntityColliderHandles.clear();
    }
  }

  /*
   * Helpers
   */
  private _requireSimulatedCollider(collider: Collider): boolean {
    if (!collider.rawCollider) {
      ErrorHandler.error('ColliderMap._requireSimulatedCollider(): Collider is not in the simulation.');
    }

    return !!collider.rawCollider;
  }
}
