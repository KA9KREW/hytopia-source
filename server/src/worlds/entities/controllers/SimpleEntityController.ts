import BaseEntityController from '@/worlds/entities/controllers/BaseEntityController';
import type Entity from '@/worlds/entities/Entity';
import { EntityModelAnimationLoopMode } from '@/worlds/entities/EntityModelAnimation';
import type QuaternionLike from '@/shared/types/math/QuaternionLike';
import type Vector3Like from '@/shared/types/math/Vector3Like';

/** @internal */
export const DEFAULT_MOVE_STOPPING_DISTANCE_SQUARED = 0.316 ** 2; // 0.316 blocks from target to stop~

/**
 * Callback invoked as the entity rotates toward a target.
 *
 * @param currentRotation - The current rotation of the entity.
 * @param targetRotation - The target rotation of the entity.
 *
 * **Category:** Controllers
 * @public
 */
export type FaceCallback = (currentRotation: QuaternionLike, targetRotation: QuaternionLike) => void;

/**
 * Callback invoked when the entity finishes rotating to face a target.
 *
 * @param endRotation - The rotation of the entity after it has finished rotating.
 *
 * **Category:** Controllers
 * @public
 */
export type FaceCompleteCallback = (endRotation: QuaternionLike) => void;

/**
 * Options for `SimpleEntityController.face`.
 *
 * Use for: customizing a single `face()` call (callbacks, completion).
 * Do NOT use for: persistent defaults; use `SimpleEntityControllerOptions`.
 *
 * **Category:** Controllers
 * @public
 */
export type FaceOptions = {
  faceCallback?: FaceCallback;
  faceCompleteCallback?: FaceCompleteCallback;
}

/**
 * Callback invoked as the entity moves toward a target coordinate.
 *
 * @param currentPosition - The current position of the entity.
 * @param targetPosition - The target position of the entity.
 *
 * **Category:** Controllers
 * @public
 */
export type MoveCallback = (currentPosition: Vector3Like, targetPosition: Vector3Like) => void;

/**
 * Callback invoked when the entity reaches the target coordinate.
 *
 * @param endPosition - The position of the entity after it has finished moving.
 *
 * **Category:** Controllers
 * @public
 */
export type MoveCompleteCallback = (endPosition: Vector3Like) => void;

/**
 * Options for `SimpleEntityController.move`.
 *
 * Use for: customizing a single `move()` call.
 * Do NOT use for: persistent defaults; use `SimpleEntityControllerOptions`.
 *
 * **Category:** Controllers
 * @public
 */
export type MoveOptions = {
  /** Callback called each tick movement of the entity controller's entity. */
  moveCallback?: MoveCallback;

  /** Callback called when the entity controller's entity has finished moving. */
  moveCompleteCallback?: MoveCompleteCallback;

  /** Axes to ignore when moving the entity controller's entity. Also ignored for determining completion. */
  moveIgnoreAxes?: { x?: boolean, y?: boolean, z?: boolean };

  /** Whether to start the idle animations when the entity finishes moving. Defaults to true. */
  moveStartIdleAnimationsOnCompletion?: boolean;

  /** The distance from the target at which the entity will stop moving and consider movement complete. Defaults to 0.316~ blocks away from target. */
  moveStoppingDistance?: number;

  /** Whether to stop moving and consider movement complete when the entity is stuck, such as pushing into a block. Defaults to false. */
  moveCompletesWhenStuck?: boolean;
}

/**
 * Options for creating a SimpleEntityController instance.
 *
 * Use for: default movement/animation settings at construction time.
 * Do NOT use for: per-move overrides; use `MoveOptions`.
 *
 * **Category:** Controllers
 * @public
 */
export interface SimpleEntityControllerOptions {
  /** The animations to loop when the entity is idle. */
  idleLoopedAnimations?: string[];

  /** The speed at which to loop the idle animations. */
  idleLoopedAnimationsSpeed?: number;

  /** The animations to play when the entity jumps. */
  jumpOneshotAnimations?: string[];

  /** The animations to loop when the entity is moving. */
  moveLoopedAnimations?: string[];

  /** The speed at which to loop the move animations. */
  moveLoopedAnimationsSpeed?: number;
}

/**
 * A simple entity controller with basic movement functions.
 *
 * When to use: straightforward movement and facing without pathfinding.
 * Do NOT use for: obstacle-aware movement; use `PathfindingEntityController`.
 *
 * @remarks
 * This class provides straight-line movement and yaw-only facing. It is compatible
 * with kinematic or dynamic rigid bodies.
 *
 * <h2>Coordinate System & Model Orientation</h2>
 *
 * HYTOPIA uses **-Z as forward**. Models must be authored with their front facing -Z.
 * When `face()` rotates an entity to look at a target, it orients the entity's -Z axis toward that target.
 * A yaw of 0 means facing -Z.
 *
 * @example
 * ```typescript
 * // Create a custom entity controller for myEntity, prior to spawning it.
 * myEntity.setController(new SimpleEntityController());
 *
 * // Spawn the entity in the world.
 * myEntity.spawn(world, { x: 53, y: 10, z: 23 });
 *
 * // Move the entity at a speed of 4 blocks
 * // per second to the coordinate (10, 1, 10).
 * // console.log when we reach the target.
 * myEntity.controller.move({ x: 10, y: 1, z: 10 }, 4, {
 *   moveCompleteCallback: endPosition => {
 *     console.log('Finished moving to', endPosition);
 *   },
 * });
 * ```
 *
 * **Category:** Controllers
 * @public
 */
export default class SimpleEntityController extends BaseEntityController {
  /** The speed at which to rotate to the target coordinate when facing. Can be altered while facing. */
  private faceSpeed: number = 0;
  
  /** The animations to loop when the entity is idle. */
  public idleLoopedAnimations: string[] = [];

  /** The speed at which to loop the idle animations. */
  public idleLoopedAnimationsSpeed: number | undefined;

  /** The animations to play when the entity jumps. */
  public jumpOneshotAnimations: string[] = [];
  
  /** The animations to loop when the entity is moving. */
  public moveLoopedAnimations: string[] = [];

  /** The speed at which to loop the move animations. */
  public moveLoopedAnimationsSpeed: number | undefined;

  /** The speed at which to move the entity. Can be altered while moving. */
  public moveSpeed: number = 0;

  /** @internal */
  private _faceTarget: Vector3Like | undefined;

  /** @internal */
  private _jumpHeight: number = 0;

  /** @internal */
  private _moveCompletesWhenStuck: boolean = false;

  /** @internal */
  private _moveIgnoreAxes: { x?: boolean, y?: boolean, z?: boolean } = {};

  /** @internal */
  private _moveStartMoveAnimations: boolean = false;

  /** @internal */
  private _moveStartIdleAnimationsOnCompletion: boolean = true;

  /** @internal */
  private _moveStoppingDistanceSquared: number = DEFAULT_MOVE_STOPPING_DISTANCE_SQUARED;

  /** @internal */
  private _moveStuckAccumulatorMs: number = 0;

  /** @internal */
  private _moveStuckLastPosition: Vector3Like | undefined;

  /** @internal */
  private _moveTarget: Vector3Like | undefined;

  /** @internal */
  private _onFace: FaceCallback | undefined;

  /** @internal */
  private _onFaceComplete: FaceCompleteCallback | undefined;

  /** @internal */
  private _onMove: MoveCallback | undefined;

  /** @internal */
  private _onMoveComplete: MoveCompleteCallback | undefined;

  /** @internal */
  private _stopFaceRequested: boolean = false;

  /** @internal */
  private _stopMoveRequested: boolean = false;

  /**
   * @param options - Options for the controller.
   *
   * **Category:** Controllers
   */
  public constructor(options: SimpleEntityControllerOptions = {}) {
    super();

    // Animations
    this.idleLoopedAnimations = options.idleLoopedAnimations ?? this.idleLoopedAnimations;
    this.idleLoopedAnimationsSpeed = options.idleLoopedAnimationsSpeed ?? this.idleLoopedAnimationsSpeed;
    this.jumpOneshotAnimations = options.jumpOneshotAnimations ?? this.jumpOneshotAnimations;
    this.moveLoopedAnimations = options.moveLoopedAnimations ?? this.moveLoopedAnimations;
    this.moveLoopedAnimationsSpeed = options.moveLoopedAnimationsSpeed ?? this.moveLoopedAnimationsSpeed;
  }

  /**
   * Override of the `BaseEntityController.spawn` method. Starts
   * the set idle animations (if any) when the entity is spawned.
   * 
   * @remarks
   * **Auto-starts idle animations:** Calls `_startIdleAnimations()` which stops move/jump animations
   * and starts the configured `idleLoopedAnimations`.
   * 
   * @param entity - The entity that was spawned.
   *
   * **Category:** Controllers
   */
  public override spawn(entity: Entity): void {
    super.spawn(entity);

    this._startIdleAnimations(entity);
  }

  /**
   * Rotates the entity at a given speed to face a target coordinate.
   * 
   * Use for: turning an entity to look at a target without moving it.
   * Do NOT use for: pitch/roll orientation; this rotates yaw only.
   *
   * @remarks
   * **-Z forward:** Orients the entity so its **-Z axis** points toward the target.
   * Models must be authored with their front facing -Z for correct orientation.
   * 
   * **Replaces previous target:** If called while already facing, the previous target is discarded
   * and the entity starts facing the new target. There is no queue.
   * 
   * **Y-axis only:** Only rotates around the Y-axis (yaw). Does not pitch up/down to face targets
   * at different heights.
   * 
   * @param target - The target coordinate to face.
   * @param speed - The speed at which to rotate to the target coordinate (radians per second).
   * @param options - Additional options for the face operation, such as callbacks.
   *
   * **Category:** Controllers
   */
  public face(target: Vector3Like, speed: number, options?: FaceOptions): void {
    this._faceTarget = target;
    this.faceSpeed = speed;
    this._onFace = options?.faceCallback;
    this._onFaceComplete = options?.faceCompleteCallback;
  }

  /**
   * Applies an upwards impulse to the entity to simulate a jump, only supported
   * for entities with dynamic rigid body types.
   * 
   * Use for: a single jump impulse for dynamic entities.
   * Do NOT use for: kinematic entities; this has no effect.
   *
   * @remarks
   * **Deferred:** The impulse is applied on the next tick, not immediately.
   * 
   * **Dynamic only:** Has no effect on kinematic entities. Uses `entity.applyImpulse()`.
   * 
   * **Animations:** Starts `jumpOneshotAnimations` and stops idle/move animations when the jump occurs.
   * 
   * @param height - The height to jump to (in blocks).
   *
   * **Category:** Controllers
   */
  public jump(height: number): void {
    this._jumpHeight = height;
  }

  /**
   * Moves the entity at a given speed in a straight line to a target coordinate.
   * 
   * Use for: simple straight-line movement.
   * Do NOT use for: obstacle avoidance; use `PathfindingEntityController`.
   *
   * @remarks
   * **Position only:** This method only changes position, not rotation. Use `face()` simultaneously
   * to rotate the entity toward its movement direction (-Z forward).
   * 
   * **Replaces previous target:** If called while already moving, the previous target is discarded
   * and the entity starts moving to the new target. There is no queue.
   * 
   * **Straight line:** Moves directly toward target using `entity.setPosition()`. Does not pathfind
   * around obstacles.
   * 
   * **Animations:** Starts `moveLoopedAnimations` on the first tick of movement. When complete,
   * starts `idleLoopedAnimations` (unless `moveStartIdleAnimationsOnCompletion` is false).
   * 
   * @param target - The target coordinate to move to.
   * @param speed - The speed at which to move to the target coordinate (blocks per second).
   * @param options - Additional options for the move operation, such as callbacks.
   *
   * **Category:** Controllers
   */
  public move(target: Vector3Like, speed: number, options?: MoveOptions): void {
    this.moveSpeed = speed;
    this._moveCompletesWhenStuck = options?.moveCompletesWhenStuck ?? false;
    this._moveIgnoreAxes = options?.moveIgnoreAxes ?? {};
    this._moveStartIdleAnimationsOnCompletion = options?.moveStartIdleAnimationsOnCompletion ?? true;
    this._moveStartMoveAnimations = true;
    this._moveStoppingDistanceSquared = options?.moveStoppingDistance ? options.moveStoppingDistance ** 2 : DEFAULT_MOVE_STOPPING_DISTANCE_SQUARED;
    this._moveTarget = target;
    this._onMove = options?.moveCallback;
    this._onMoveComplete = options?.moveCompleteCallback;

    this._moveStuckAccumulatorMs = 0;
    this._moveStuckLastPosition = undefined;
  }

  /**
   * Stops the entity from attempting to face a target coordinate.
   * 
   * @remarks
   * **Deferred:** Takes effect on the next tick. The `faceCompleteCallback` will still be called.
   *
   * **Category:** Controllers
   */
  public stopFace(): void {
    this._stopFaceRequested = true;
  }

  /**
   * Stops the entity from continuing to move to its current target coordinate.
   * 
   * @remarks
   * **Deferred:** Takes effect on the next tick. The `moveCompleteCallback` will still be called
   * and idle animations will start (unless `moveStartIdleAnimationsOnCompletion` was false).
   *
   * **Category:** Controllers
   */
  public stopMove(): void {
    this._stopMoveRequested = true;
  }

  /** @internal */
  public tick(entity: Entity, deltaTimeMs: number): void {
    super.tick(entity, deltaTimeMs);

    if (!this._moveTarget && !this._faceTarget && !this._jumpHeight) {
      return;
    }

    if (this._moveStartMoveAnimations) {
      this._startMoveAnimations(entity);
      this._moveStartMoveAnimations = false;
    }

    const deltaTimeSeconds = deltaTimeMs / 1000;
    const currentPos = entity.position;

    // Handle jumping for dynamic rigid bodies
    if (entity.isDynamic && this._jumpHeight > 0) {
      // Using physics formula: v = sqrt(2gh) to get velocity needed to reach height
      const gravity = Math.abs(entity.world!.simulation.gravity.y);
      const initialVelocity = Math.sqrt(2 * gravity * this._jumpHeight);

      entity.applyImpulse({
        x: 0,
        y: initialVelocity * entity.mass,
        z: 0,
      });

      this._jumpHeight = 0;

      this._startJumpAnimations(entity);
    }

    if (this._moveTarget) {
      const direction = {
        x: this._moveIgnoreAxes.x ? 0 : this._moveTarget.x - currentPos.x,
        y: this._moveIgnoreAxes.y ? 0 : this._moveTarget.y - currentPos.y,
        z: this._moveIgnoreAxes.z ? 0 : this._moveTarget.z - currentPos.z,
      };

      const distanceSquared = direction.x * direction.x + 
                              direction.y * direction.y + 
                              direction.z * direction.z;

      // Check if stuck (if enabled)
      let isStuck = false;
      if (this._moveCompletesWhenStuck) {
        this._moveStuckAccumulatorMs += deltaTimeMs;
        
        if (this._moveStuckAccumulatorMs >= 500) {
          if (this._moveStuckLastPosition) {
            const dx = currentPos.x - this._moveStuckLastPosition.x;
            const dy = currentPos.y - this._moveStuckLastPosition.y;
            const dz = currentPos.z - this._moveStuckLastPosition.z;
            const actualDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            isStuck = actualDistance < this.moveSpeed * 0.1;
          }
          
          this._moveStuckLastPosition = currentPos;
          this._moveStuckAccumulatorMs = 0;
        }
      }

      if (distanceSquared > this._moveStoppingDistanceSquared && !this._stopMoveRequested && !isStuck) {
        const distance = Math.sqrt(distanceSquared);
        const maxMove = this.moveSpeed * deltaTimeSeconds;
        const moveDistance = Math.min(distance, maxMove);
        const moveScale = moveDistance / distance;
        const position = {
          x: currentPos.x + direction.x * moveScale,
          y: currentPos.y + direction.y * moveScale,
          z: currentPos.z + direction.z * moveScale,
        };

        entity.setPosition(position);

        if (this._onMove) {
          this._onMove(position, this._moveTarget);
        }
      } else {
        this._moveStuckAccumulatorMs = 0;
        this._moveStuckLastPosition = undefined;
        this._moveTarget = undefined;
        this._stopMoveRequested = false;

        if (this._moveStartIdleAnimationsOnCompletion) {
          this._startIdleAnimations(entity);
        }

        if (this._onMoveComplete) {
          const onMoveComplete = this._onMoveComplete;
          this._onMove = undefined;
          this._onMoveComplete = undefined;
          onMoveComplete(currentPos);
        }
      }
    }

    if (this._faceTarget) {
      const direction = {
        x: this._faceTarget.x - currentPos.x,
        z: this._faceTarget.z - currentPos.z,
      };

      // Calculate yaw angle to face target (-z facing)
      const targetYaw = Math.atan2(-direction.x, -direction.z);
      
      const currentRotation = entity.rotation;
      const currentYaw = Math.atan2(
        2 * (currentRotation.w * currentRotation.y), 
        1 - 2 * (currentRotation.y * currentRotation.y),
      );

      // Calculate shortest angle difference
      let angleDiff = targetYaw - currentYaw;
      
      // Normalize angle difference to [-π, π] range for shortest path
      while (angleDiff > Math.PI) {
        angleDiff -= 2 * Math.PI;
      }
      
      while (angleDiff < -Math.PI) {
        angleDiff += 2 * Math.PI;
      }

      if (Math.abs(angleDiff) > 0.01 && !this._stopFaceRequested) {
        // Smoothly rotate towards target using shortest path
        const maxRotation = this.faceSpeed * deltaTimeSeconds;
        const rotationAmount = Math.abs(angleDiff) < maxRotation ? angleDiff : Math.sign(angleDiff) * maxRotation;
        const newYaw = currentYaw + rotationAmount;
        const halfYaw = newYaw / 2;
        const rotation = {
          x: 0,
          y: Math.fround(Math.sin(halfYaw)),
          z: 0,
          w: Math.fround(Math.cos(halfYaw)),
        };

        entity.setRotation(rotation);

        if (this._onFace) {
          this._onFace(currentRotation, rotation);
        }
      } else {
        this._faceTarget = undefined;
        this._stopFaceRequested = false;

        if (this._onFaceComplete) {
          const onFaceComplete = this._onFaceComplete;
          this._onFace = undefined;
          this._onFaceComplete = undefined;
          onFaceComplete(entity.rotation);
        }
      }
    }
  }

  /** @internal */
  private _startIdleAnimations(entity: Entity): void {
    entity.stopModelAnimations(this.moveLoopedAnimations);
    entity.stopModelAnimations(this.jumpOneshotAnimations);

    for (const animationName of this.idleLoopedAnimations) {
      const animation = entity.getModelAnimation(animationName);
      if (!animation) continue;
      animation.setLoopMode(EntityModelAnimationLoopMode.LOOP);
      if (this.idleLoopedAnimationsSpeed !== undefined) {
        animation.setPlaybackRate(this.idleLoopedAnimationsSpeed);
      }
      animation.play();
    }
  }

  /** @internal */
  private _startJumpAnimations(entity: Entity): void {
    entity.stopModelAnimations(this.moveLoopedAnimations);
    entity.stopModelAnimations(this.idleLoopedAnimations);

    for (const animationName of this.jumpOneshotAnimations) {
      const animation = entity.getModelAnimation(animationName);
      if (!animation) continue;
      animation.setLoopMode(EntityModelAnimationLoopMode.ONCE);
      animation.restart();
    }
  }

  /** @internal */
  private _startMoveAnimations(entity: Entity): void {
    entity.stopModelAnimations(this.jumpOneshotAnimations);
    entity.stopModelAnimations(this.idleLoopedAnimations);

    for (const animationName of this.moveLoopedAnimations) {
      const animation = entity.getModelAnimation(animationName);
      if (!animation) continue;
      animation.setLoopMode(EntityModelAnimationLoopMode.LOOP);
      if (this.moveLoopedAnimationsSpeed !== undefined) {
        animation.setPlaybackRate(this.moveLoopedAnimationsSpeed);
      }
      animation.play();
    }
  }
}
