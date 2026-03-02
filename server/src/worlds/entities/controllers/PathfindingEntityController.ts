import { Heap } from 'heap-js';
import ErrorHandler from '@/errors/ErrorHandler';
import SimpleEntityController, { SimpleEntityControllerOptions } from '@/worlds/entities/controllers/SimpleEntityController';
import type Entity from '@/worlds/entities/Entity';
import type Vector3Like from '@/shared/types/math/Vector3Like';

/**
 * Callback invoked when pathfinding aborts.
 *
 * **Category:** Controllers
 * @public
 */
export type PathfindAbortCallback = () => void;

/**
 * Callback invoked when pathfinding completes and the entity reaches the target.
 *
 * **Category:** Controllers
 * @public
 */
export type PathfindCompleteCallback = () => void;

/**
 * Options for `PathfindingEntityController.pathfind`.
 *
 * Use for: configuring a single pathfinding request.
 * Do NOT use for: per-tick recalculation; call `pathfind` sparingly.
 *
 * **Category:** Controllers
 * @public
 */
export type PathfindingOptions = {
  /** Whether to enable debug mode or not. When debug mode is enabled, the pathfinding algorithm will log debug information to the console. Defaults to false. */
  debug?: boolean;

  /** The maximum fall distance the entity can fall when considering a path. */
  maxFall?: number;

  /** The maximum height the entity will jump when considering a path. */
  maxJump?: number;

  /** The maximum number of open set iterations that can be processed before aborting pathfinding. Defaults to 200. */
  maxOpenSetIterations?: number;

  /** Callback called when the pathfinding algorithm aborts. */
  pathfindAbortCallback?: PathfindAbortCallback;

  /** Callback called when the entity associated with the PathfindingEntityController finishes pathfinding and is now at the target coordinate. */
  pathfindCompleteCallback?: PathfindCompleteCallback;

  /** The vertical penalty for the pathfinding algorithm. A higher value will prefer paths with less vertical movement. */
  verticalPenalty?: number;

  /** Callback called when the entity associated with the PathfindingEntityController finishes moving to a calculate waypoint of its current path. */
  waypointMoveCompleteCallback?: WaypointMoveCompleteCallback;

  /** Callback called when the entity associated with the PathfindingEntityController skips a waypoint because it took too long to reach. */
  waypointMoveSkippedCallback?: WaypointMoveSkippedCallback;

  /** The distance in blocks from the waypoint that the entity will stop moving and consider the waypoint reached. */
  waypointStoppingDistance?: number;

  /** The timeout in milliseconds for a waypoint to be considered reached. Defaults to 2000ms divided by the speed of the entity. */
  waypointTimeoutMs?: number;
}

/**
 * Callback invoked when the entity finishes moving to a waypoint.
 *
 * @param waypoint - The waypoint reached.
 * @param waypointIndex - The index of the waypoint reached.
 *
 * **Category:** Controllers
 * @public
 */
export type WaypointMoveCompleteCallback = (waypoint: Vector3Like, waypointIndex: number) => void;

/**
 * Callback invoked when a waypoint is skipped due to timeout.
 *
 * @param waypoint - The waypoint that was skipped.
 * @param waypointIndex - The index of the waypoint that was skipped.
 *
 * **Category:** Controllers
 * @public
 */
export type WaypointMoveSkippedCallback = (waypoint: Vector3Like, waypointIndex: number) => void;

/**
 * Options for creating a PathfindingEntityController instance.
 *
 * Use for: constructing a pathfinding controller with base movement settings.
 * Do NOT use for: per-path overrides; use `PathfindingOptions`.
 *
 * **Category:** Controllers
 * @public
 */
export interface PathfindingEntityControllerOptions extends SimpleEntityControllerOptions {
  // No options yet
}

/**
 * A pathfinding entity controller built on top of `SimpleEntityController`.
 *
 * When to use: obstacle-aware movement to a target coordinate.
 * Do NOT use for: per-tick recalculation; pathfinding is synchronous and can be expensive.
 *
 * @remarks
 * Implements A* pathfinding. Call `PathfindingEntityController.pathfind` sparingly; it is intended to be
 * called once per destination in most cases.
 *
 * <h2>Coordinate System & Model Orientation</h2>
 *
 * HYTOPIA uses **-Z as forward**. Models must be authored with their front facing -Z.
 * The controller automatically calls `face()` to orient the entity's -Z axis toward each waypoint.
 *
 * **Category:** Controllers
 * @public
 */
export default class PathfindingEntityController extends SimpleEntityController {
  /** @internal */
  private _debug: boolean = false;

  /** @internal */
  private _entity: Entity | undefined;

  /** @internal */
  private _maxFall: number = 0;

  /** @internal */
  private _maxJump: number = 0;

  /** @internal */
  private _maxOpenSetIterations: number = 200;

  /** @internal */
  private _onPathfindAbort: PathfindAbortCallback | undefined;

  /** @internal */
  private _onPathfindComplete: PathfindCompleteCallback | undefined;

  /** @internal */
  private _onWaypointMoveComplete: WaypointMoveCompleteCallback | undefined;

  /** @internal */
  private _onWaypointMoveSkipped: WaypointMoveSkippedCallback | undefined;

  /** @internal */
  private _speed: number = 0;

  /** @internal */
  private _target: Vector3Like | undefined;

  /** @internal */
  private _verticalPenalty: number = 0;

  /** @internal */
  private _waypoints: Vector3Like[] = [];

  /** @internal */
  private _waypointNextIndex: number = 0;

  /** @internal */
  private _waypointStoppingDistance: number | undefined;

  /** @internal */
  private _waypointTimeoutMs: number = 2000;

  /**
   * @param options - Options for the controller.
   *
   * **Category:** Controllers
   */
  public constructor(options: PathfindingEntityControllerOptions = {}) {
    super(options);
  }

  /**
   * Whether to enable debug mode.
   *
   * @remarks
   * When enabled, pathfinding logs debug information to the console.
   *
   * **Category:** Controllers
   */
  public get debug(): boolean { return this._debug; }
  
  /**
   * The maximum fall distance the entity can fall.
   *
   * **Category:** Controllers
   */
  public get maxFall(): number { return this._maxFall; }

  /**
   * The maximum jump distance the entity can jump.
   *
   * **Category:** Controllers
   */
  public get maxJump(): number { return this._maxJump; }

  /**
   * The maximum open set iterations before aborting pathfinding.
   *
   * **Category:** Controllers
   */
  public get maxOpenSetIterations(): number { return this._maxOpenSetIterations; }

  /**
   * The speed used for path movement.
   *
   * **Category:** Controllers
   */
  public get speed(): number { return this._speed; }

  /**
   * The target coordinate being pathfound to.
   *
   * **Category:** Controllers
   */
  public get target(): Vector3Like | undefined { return this._target; }

  /**
   * The vertical penalty used during pathfinding.
   *
   * **Category:** Controllers
   */
  public get verticalPenalty(): number { return this._verticalPenalty; }

  /**
   * The current waypoints being followed.
   *
   * **Category:** Controllers
   */
  public get waypoints(): Vector3Like[] { return this._waypoints; }

  /**
   * The index of the next waypoint being approached.
   *
   * **Category:** Controllers
   */
  public get waypointNextIndex(): number { return this._waypointNextIndex; }

  /**
   * The timeout in milliseconds for a waypoint to be considered reached.
   *
   * **Category:** Controllers
   */
  public get waypointTimeoutMs(): number { return this._waypointTimeoutMs; }

  /**
   * Calculates a path and moves to the target if a path is found.
   *
   * Use for: one-shot navigation to a destination.
   * Do NOT use for: high-frequency replanning; it is synchronous.
   *
   * @remarks
   * **Synchronous return:** Path calculation happens synchronously. Returns `true` if a path was found,
   * `false` if no path exists or calculation was aborted.
   * 
   * **Auto-starts movement:** If a path is found, movement begins immediately using the inherited
   * `move()`, `face()`, and `jump()` methods from `SimpleEntityController`.
   * 
   * **Auto-facing (-Z forward):** Automatically calls `face()` for each waypoint, orienting the entity's
   * -Z axis toward the next waypoint. Models must be authored with their front facing -Z.
   * 
   * **A* algorithm:** Uses A* pathfinding with configurable `maxJump`, `maxFall`, and `verticalPenalty`.
   * Path calculation is capped by `maxOpenSetIterations` (default 200) to prevent blocking.
   * 
   * **Waypoint progression:** Entity moves through calculated waypoints sequentially. Each waypoint
   * has a timeout (`waypointTimeoutMs`) after which it's skipped if not reached.
   * 
   * @param target - The target coordinate to pathfind to.
   * @param speed - The speed of the entity (blocks per second).
   * @param options - The pathfinding options.
   * @returns True if a path was found, false otherwise.
   *
   * **Requires:** The controller must be attached to a spawned entity in a world.
   *
   * **Side effects:** Starts movement and facing if a path is found.
   *
   * **Category:** Controllers
   */
  public pathfind(target: Vector3Like, speed: number, options?: PathfindingOptions): boolean {
    this._target = target;
    this._speed = speed;
    this._debug = options?.debug ?? false;
    this._maxFall = options?.maxFall ? -Math.abs(options.maxFall) : 0; // negative fall distance
    this._maxJump = options?.maxJump ? Math.abs(options.maxJump) : 0;  // positive jump distance
    this._maxOpenSetIterations = options?.maxOpenSetIterations ?? 200;
    this._onPathfindAbort = options?.pathfindAbortCallback;
    this._onPathfindComplete = options?.pathfindCompleteCallback;
    this._onWaypointMoveComplete = options?.waypointMoveCompleteCallback;
    this._onWaypointMoveSkipped = options?.waypointMoveSkippedCallback;
    this._verticalPenalty = options?.verticalPenalty ?? 0;
    this._waypoints = [];
    this._waypointNextIndex = 0;
    this._waypointStoppingDistance = options?.waypointStoppingDistance;
    this._waypointTimeoutMs = options?.waypointTimeoutMs ?? 2000 / speed;
    
    if (!this._calculatePath()) {
      return false;
    }

    this._moveToNextWaypoint();

    return true;
  }

  /** @internal */
  public override attach(entity: Entity): void {
    super.attach(entity);
    this._entity = entity;
  }

  /** @internal */
  public override detach(entity: Entity): void {
    super.detach(entity);
    this._entity = undefined;
  }

  /** @internal */
  private _calculatePath(): boolean {
    if (!this._target || !this._entity?.world) {
      ErrorHandler.error('PathfindingEntityController._calculatePath: No target or world');

      return false;
    }

    const entityHeight = this._entity.height;

    const start = this._findGroundedStart();

    if (!start) {
      if (this._debug) {
        ErrorHandler.warning(`PathfindingEntityController._calculatePath: No valid grounded start found within maxFall distance, path search aborted. Start: ${this._coordinateToKey(this._target)}, Target: ${this._coordinateToKey(this._target)}`);
      }

      return false;
    }

    const end = {
      x: Math.floor(this._target.x),
      y: Math.floor(this._target.y),
      z: Math.floor(this._target.z),
    };

    // Quick check for direct path if target is close
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    const dz = Math.abs(end.z - start.z);
    const isClose = dx <= 2 && dy <= 2 && dz <= 2;

    if (isClose && !this._isNeighborCoordinateBlocked(start, end, this._entity.height)) {
      this._waypoints = [
        { x: start.x + 0.5, y: start.y + entityHeight / 2, z: start.z + 0.5 },
        { x: end.x + 0.5, y: end.y + entityHeight / 2, z: end.z + 0.5 },
      ];

      return true;
    }

    // Return if start is already at the end
    if (start.x === end.x && start.y === end.y && start.z === end.z) {
      this._waypoints = [ { x: start.x + 0.5, y: start.y + entityHeight / 2, z: start.z + 0.5 } ];

      return true;
    }

    // A* data structures using binary heap for open set
    const startKey = this._coordinateToKey(start);
    const cameFrom = new Map<string, Vector3Like>();
    const gScore = new Map<string, number>([ [ startKey, 0 ] ]);
    const fScore = new Map<string, number>([ [ startKey, this._pathfindingHeuristic(start, end) ] ]);
    const closedSet = new Set<string>();

    // Binary heap implementation for open set
    const openSet = new Heap<[string, Vector3Like]>((a, b) => {
      const aScore = fScore.get(a[0]) ?? Infinity;
      const bScore = fScore.get(b[0]) ?? Infinity;

      return aScore - bScore;
    });

    openSet.push([ startKey, start ]);

    // Pre-calculate neighbor offsets for pathfinding
    const horizontalOffsets: Vector3Like[] = [
      // Prioritize cardinal directions first
      { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: -1 }, { x: -1, y: 0, z: 0 },
      // Then diagonals
      { x: 1, y: 0, z: 1 }, { x: 1, y: 0, z: -1 },
      { x: -1, y: 0, z: 1 }, { x: -1, y: 0, z: -1 },
    ];

    // Sort vertical offsets by distance to target's y-level
    const verticalOffsets = [];
    for (let y = this._maxJump; y >= this._maxFall; y--) {
      if (y === 0) continue;
      const distanceToTargetY = Math.abs((start.y + y) - end.y);
      verticalOffsets.push({ y, distanceToTargetY });
    }
    verticalOffsets.sort((a, b) => a.distanceToTargetY - b.distanceToTargetY);

    const neighborOffsets: Vector3Like[] = [
      ...horizontalOffsets,
      ...verticalOffsets.flatMap(({ y }) => 
        horizontalOffsets.map(offset => ({ ...offset, y })),
      ),
    ];

    let openSetIterations = 0;
    const maxDistance = Math.abs(end.x - start.x) + Math.abs(end.y - start.y) + Math.abs(end.z - start.z);
    const iterationLimit = Math.min(this._maxOpenSetIterations, maxDistance * 20);

    while (!openSet.isEmpty() && openSetIterations < iterationLimit) {
      openSetIterations++;

      const [ currentKey, current ] = openSet.pop()!;

      // Check if we reached the end
      if (current.x === end.x && current.y === end.y && current.z === end.z) {
        const path = this._reconstructPath(cameFrom, current);
        this._waypoints = path.map(p => ({
          x: p.x + 0.5,
          y: p.y + entityHeight / 2,
          z: p.z + 0.5,
        }));

        if (this._debug) {
          console.log(`PathfindingEntityController._calculatePath: Path found after ${openSetIterations} open set iterations. Start: ${this._coordinateToKey(start)}, Target: ${this._coordinateToKey(this._target)}`);
        }

        return true;
      }

      closedSet.add(currentKey);
      const currGScore = gScore.get(currentKey)!;
      const xzOffsetFloorBlocked = new Map<string, boolean>();

      for (const offset of neighborOffsets) {
        const xzOffsetKey = `${offset.x},${offset.z}`;
        const requiresFalling = offset.y < 0;
        
        if (requiresFalling && xzOffsetFloorBlocked.has(xzOffsetKey)) {
          continue;
        }

        const neighbor = {
          x: current.x + offset.x,
          y: current.y + offset.y,
          z: current.z + offset.z,
        };

        // Early distance check
        const manhattanToEnd = Math.abs(end.x - neighbor.x) + Math.abs(end.y - neighbor.y) + Math.abs(end.z - neighbor.z);
        if (manhattanToEnd > maxDistance * 1.5) {
          continue;
        }

        const neighborKey = this._coordinateToKey(neighbor);
        
        if (closedSet.has(neighborKey)) {
          continue;
        }

        const blocked = this._isNeighborCoordinateBlocked(current, neighbor, this._entity.height);

        if (requiresFalling && blocked) {
          xzOffsetFloorBlocked.set(xzOffsetKey, true);
          continue;
        }

        if (blocked) {
          continue;
        }

        const dx = Math.abs(offset.x);
        const dy = Math.abs(offset.y);
        const dz = Math.abs(offset.z);
        const verticalPenalty = dy === 0 ? 0 : this._verticalPenalty;
        const distance = (Math.max(dx, dy, dz) === 1 && (dx + dy + dz) > 1 ? 1.4 : 1) + verticalPenalty;
        const tentativeGScore = currGScore + distance;

        const existingGScore = gScore.get(neighborKey) ?? Infinity;
        if (tentativeGScore >= existingGScore) {
          continue;
        }

        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        const f = tentativeGScore + this._pathfindingHeuristic(neighbor, end);
        fScore.set(neighborKey, f);
        openSet.push([ neighborKey, neighbor ]);
      }
    }

    if (openSetIterations >= iterationLimit) {
      this._onPathfindAbort?.();
      if (this._debug) {
        ErrorHandler.warning(`PathfindingEntityController._calculatePath: Maximum open set iterations reached (${iterationLimit}), path search aborted. Start: ${this._coordinateToKey(start)}, Target: ${this._coordinateToKey(this._target)}`);
      }
    } else if (this._debug) {
      ErrorHandler.warning(`PathfindingEntityController._calculatePath: No valid path found. Start: ${this._coordinateToKey(start)}, Target: ${this._coordinateToKey(this._target)}`);
    }
    
    this._target = undefined;
    this._waypoints = [];

    return false;
  }

  /** @internal */
  private _reconstructPath(cameFrom: Map<string, Vector3Like>, current: Vector3Like): Vector3Like[] {
    const path: Vector3Like[] = [ current ];
    let curr = current;
    
    while (cameFrom.has(this._coordinateToKey(curr))) {
      curr = cameFrom.get(this._coordinateToKey(curr))!;
      path.unshift(curr);
    }

    return path;
  }

  /** @internal */
  private _coordinateToKey(coordinate: Vector3Like): string {
    return `${coordinate.x},${coordinate.y},${coordinate.z}`;
  }

  /** @internal */
  private _moveToNextWaypoint(): void {
    const currentWaypoint = this._waypointNextIndex > 0 ? this._waypoints[this._waypointNextIndex - 1] : undefined;
    const nextWaypoint = this._waypoints[this._waypointNextIndex];

    if (!nextWaypoint || !this._entity) {
      return;
    }

    // Jump if the next waypoint is higher than the current waypoint
    let jumpTimeout = 0;
    if (this._entity.isDynamic && currentWaypoint && nextWaypoint.y > currentWaypoint.y) {
      const height = nextWaypoint.y - currentWaypoint.y;
      const jumpHeight = Math.min(height, this._maxJump) + 0.75;
      this.jump(jumpHeight);

      const gravity = Math.abs(this._entity.world!.simulation.gravity.y);
      const initialVelocity = Math.sqrt(2 * gravity * jumpHeight);
      
      // Calculate horizontal distance to travel, accounting for entity being at center of block
      const currentCenterX = currentWaypoint.x + 0.5;
      const currentCenterZ = currentWaypoint.z + 0.5;
      const nextCenterX = nextWaypoint.x + 0.5;
      const nextCenterZ = nextWaypoint.z + 0.5;
      
      const dx = nextCenterX - currentCenterX;
      const dz = nextCenterZ - currentCenterZ;
      const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
      
      // Time to reach peak height = initialVelocity / gravity
      // Time to travel horizontal distance = horizontalDistance / speed
      // We want to start moving slightly before reaching peak height
      const timeToApex = initialVelocity / gravity;
      const timeToTravel = horizontalDistance / this._speed;
      const moveDelay = Math.min(timeToApex * 0.8, timeToTravel) * 1000; // Convert to ms
      jumpTimeout = moveDelay;
    }

    // Wait for jump to complete before moving to next waypoint
    setTimeout(() => {
      if (!this._entity) {
        return;
      }

      const lastMoveTime = Date.now();

      this.face(nextWaypoint, this._speed);
      this.move(nextWaypoint, this._speed, {
        moveCompletesWhenStuck: true,
        moveIgnoreAxes: { y: this._entity.isDynamic },
        moveStartIdleAnimationsOnCompletion: this._waypointNextIndex === this._waypoints.length - 1,
        moveStoppingDistance: this._waypointStoppingDistance,
        moveCallback: () => {
          if (Date.now() - lastMoveTime > this._waypointTimeoutMs && this._waypointNextIndex < this._waypoints.length - 1) {
            this._onWaypointMoveSkipped?.(nextWaypoint, this._waypointNextIndex);
            this._waypointNextIndex++;
            this._moveToNextWaypoint();
          }
        },
        moveCompleteCallback: () => {
          if (this._waypointNextIndex < this._waypoints.length - 1) {
            this._onWaypointMoveComplete?.(nextWaypoint, this._waypointNextIndex);
            this._waypointNextIndex++;
            this._moveToNextWaypoint();
          } else {
            this._onPathfindComplete?.();
          }
        },
      });
    }, jumpTimeout);
  }

  /** @internal */
  private _pathfindingHeuristic(a: Vector3Like, b: Vector3Like) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
  }

  /** @internal */
  private _isNeighborCoordinateBlocked(currentCoordinate: Vector3Like, neighborCoordinate: Vector3Like, entityHeight: number) {
    if (!this._entity?.world) {
      return false;
    }
    
    const world = this._entity.world;
    const x = Math.floor(neighborCoordinate.x);
    const y = Math.floor(neighborCoordinate.y);
    const z = Math.floor(neighborCoordinate.z);
    const currentX = Math.floor(currentCoordinate.x);
    const currentZ = Math.floor(currentCoordinate.z);

    // Check for ground to walk on & prevent pathfinding by going up and walking on air
    if (!world.chunkLattice.hasBlock({ x, y: y - 1, z })) { 
      return true;
    }

    // Check for blocks that the entity would collide with based on its height
    for (let i = 0; i < entityHeight; i++) {
      if (world.chunkLattice.hasBlock({ x, y: y + i, z })) {
        return true;
      }
    }

    // Check diagonal movement
    if (x !== currentX && z !== currentZ) {
      // Check blocks perpendicular to movement direction & at entity height
      for (let i = 0; i < entityHeight; i++) {
        const hasBlockXAtHeight = world.chunkLattice.hasBlock({ x, y: y + i, z: currentZ });
        const hasBlockZAtHeight = world.chunkLattice.hasBlock({ x: currentX, y: y + i, z });
        if (hasBlockXAtHeight || hasBlockZAtHeight) {
          return true;
        }
      }
    }

    // No blockers!
    return false;
  }

  /** @internal */
  private _findGroundedStart(): Vector3Like | undefined {
    if (!this._entity?.world) {
      return;
    }

    const { x, y, z } = this._entity.position;
    const start = { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };

    for (let dy = 0; dy <= Math.abs(this._maxFall); dy++) {
      if (this._entity.world.chunkLattice.hasBlock({ ...start, y: start.y - dy - 1 })) {
        return { ...start, y: start.y - dy };
      }
    }

    return;
  }
}
