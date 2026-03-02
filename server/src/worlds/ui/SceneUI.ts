import protocol from '@hytopia.com/server-protocol';
import ErrorHandler from '@/errors/ErrorHandler';
import EventRouter from '@/events/EventRouter';
import Serializer from '@/networking/Serializer';
import type Entity from '@/worlds/entities/Entity';
import type Vector3Like from '@/shared/types/math/Vector3Like';
import type World from '@/worlds/World';

/**
 * Options for creating a SceneUI instance.
 *
 * Use for: configuring scene UI before `SceneUI.load`.
 * Do NOT use for: runtime updates after load; use `SceneUI.set*` methods.
 *
 * **Category:** UI
 * @public
 */
export interface SceneUIOptions {
  /** If set, SceneUI will follow the entity's position */
  attachedToEntity?: Entity;

  /** The offset of the SceneUI from the attached entity or position */
  offset?: Vector3Like;

  /** If set, SceneUI will be attached at this position */
  position?: Vector3Like;

  /** The state of the SceneUI */
  state?: object;

  /** The template ID to use for this SceneUI */
  templateId: string;

  /** The maximum view distance the SceneUI will be visible to the player */
  viewDistance?: number;
}

/**
 * Event types a SceneUI instance can emit.
 *
 * See `SceneUIEventPayloads` for the payloads.
 *
 * **Category:** Events
 * @public
 */
export enum SceneUIEvent {
  LOAD                   = 'SCENE_UI.LOAD',
  SET_ATTACHED_TO_ENTITY = 'SCENE_UI.SET_ATTACHED_TO_ENTITY',
  SET_OFFSET             = 'SCENE_UI.SET_OFFSET',
  SET_POSITION           = 'SCENE_UI.SET_POSITION',
  SET_STATE              = 'SCENE_UI.SET_STATE',
  SET_VIEW_DISTANCE      = 'SCENE_UI.SET_VIEW_DISTANCE',
  UNLOAD                 = 'SCENE_UI.UNLOAD',
}

/**
 * Event payloads for SceneUI emitted events.
 *
 * **Category:** Events
 * @public
 */
export interface SceneUIEventPayloads {
  /** Emitted when a SceneUI is loaded into the world. */
  [SceneUIEvent.LOAD]:                   { sceneUI: SceneUI }

  /** Emitted when a SceneUI is attached to an entity. */
  [SceneUIEvent.SET_ATTACHED_TO_ENTITY]: { sceneUI: SceneUI, entity: Entity }

  /** Emitted when the offset of a SceneUI is set. */
  [SceneUIEvent.SET_OFFSET]:             { sceneUI: SceneUI, offset: Vector3Like }

  /** Emitted when the position of a SceneUI is set. */
  [SceneUIEvent.SET_POSITION]:           { sceneUI: SceneUI, position: Vector3Like }

  /** Emitted when the state of a SceneUI is set. */
  [SceneUIEvent.SET_STATE]:              { sceneUI: SceneUI, state: object }

  /** Emitted when the view distance of a SceneUI is set. */
  [SceneUIEvent.SET_VIEW_DISTANCE]:      { sceneUI: SceneUI, viewDistance: number }

  /** Emitted when a SceneUI is unloaded from the world. */
  [SceneUIEvent.UNLOAD]:                 { sceneUI: SceneUI }
}

/**
 * UI rendered within the 3D space of a world's
 * game scene.
 * 
 * @remarks
 * SceneUI instances are created directly as instances.
 * They support a variety of configuration options through
 * the `SceneUIOptions` constructor argument.
 * 
 * <h2>Events</h2>
 * 
 * This class is an EventRouter, and instances of it emit
 * events with payloads listed under `SceneUIEventPayloads`
 * 
 * @example
 * ```typescript
 * const sceneUI = new SceneUI({
 *   templateId: 'player-health-bar',
 *   attachedToEntity: playerEntity,
 *   offset: { x: 0, y: 1, z: 0 },
 * });
 * ```
 * 
 * **Category:** UI
 * @public
 */
export default class SceneUI extends EventRouter implements protocol.Serializable {
  /** @internal */
  private _id: number | undefined;

  /** @internal */
  private _attachedToEntity: Entity | undefined;

  /** @internal */
  private _offset: Vector3Like | undefined;

  /** @internal */
  private _position: Vector3Like | undefined;

  /** @internal */
  private _state: object = {};

  /** @internal */
  private _templateId: string;

  /** @internal */
  private _viewDistance: number | undefined;

  /** @internal */
  private _world: World | undefined;

  /**
   * @param options - The options for the SceneUI instance.
   */
  public constructor(options: SceneUIOptions) {
    if (!!options.attachedToEntity === !!options.position) {
      ErrorHandler.fatalError('Either attachedToEntity or position must be set, but not both');
    }

    super();

    this._attachedToEntity = options.attachedToEntity;
    this._offset = options.offset;
    this._position = options.position;
    this._state = options.state ?? {};
    this._templateId = options.templateId;
    this._viewDistance = options.viewDistance;
  }

  /** The unique identifier for the SceneUI. */
  public get id(): number | undefined { return this._id; }

  /** The entity to which the SceneUI is attached if explicitly set. */
  public get attachedToEntity(): Entity | undefined { return this._attachedToEntity; }

  /** Whether the SceneUI is loaded into the world. */
  public get isLoaded(): boolean { return this._id !== undefined; }

  /** The offset of the SceneUI from the attached entity or position. */
  public get offset(): Vector3Like | undefined { return this._offset; }

  /** The position of the SceneUI in the world if explicitly set. */
  public get position(): Vector3Like | undefined { return this._position; }

  /** The state of the SceneUI. */
  public get state(): Readonly<object> { return this._state; }

  /** The template ID of the SceneUI. */
  public get templateId(): string { return this._templateId; }

  /** The maximum view distance the SceneUI will be visible to the player. */
  public get viewDistance(): number | undefined { return this._viewDistance; }

  /** The world the SceneUI is loaded into. */
  public get world(): World | undefined { return this._world; }

  /**
   * Loads the SceneUI into the world.
   *
   * @remarks
   * **Requires spawned entity:** If attached to an entity, the entity must be spawned first.
   * 
   * @param world - The world to load the SceneUI into.
   */
  public load(world: World) {
    if (this.isLoaded) return;

    if (this._attachedToEntity && !this._attachedToEntity.isSpawned) {
      return ErrorHandler.error(`SceneUI.load(): Attached entity ${this._attachedToEntity.id} must be spawned before loading SceneUI!`);
    }

    this._id = world.sceneUIManager.registerSceneUI(this);
    this._world = world;

    this.emitWithWorld(world, SceneUIEvent.LOAD, { sceneUI: this });
  }

  /**
   * Sets the entity to which the SceneUI is attached, following its position.
   * 
   * @remarks
   * **Clears position:** Clears any set position (mutual exclusivity).
   * 
   * @param entity - The entity to attach the SceneUI to.
   */
  public setAttachedToEntity(entity: Entity) {
    if (!entity.isSpawned) {
      return ErrorHandler.error(`SceneUI.setAttachedToEntity(): Entity ${entity.id} is not spawned!`);
    }

    if (this._attachedToEntity === entity) { return; }

    this._attachedToEntity = entity;
    this._position = undefined;

    if (this.isLoaded) {
      this.emitWithWorld(this._world!, SceneUIEvent.SET_ATTACHED_TO_ENTITY, {
        sceneUI: this,
        entity,
      });
    }
  }

  /**
   * Sets the spatial offset of the SceneUI relative to the attached entity or position.
   * 
   * @param offset - The offset in the world.
   */
  public setOffset(offset: Vector3Like) {
    if (this._offset === offset) { return; }

    this._offset = offset;

    if (this.isLoaded) {
      this.emitWithWorld(this._world!, SceneUIEvent.SET_OFFSET, {
        sceneUI: this,
        offset,
      });
    }
  }

  /**
   * Sets the position of the SceneUI.
   * 
   * @remarks
   * **Detaches entity:** Detaches from any attached entity (mutual exclusivity).
   * 
   * @param position - The position in the world.
   */
  public setPosition(position: Vector3Like) {
    if (this._position === position) { return; }

    this._attachedToEntity = undefined;
    this._position = position;

    if (this.isLoaded) {
      this.emitWithWorld(this._world!, SceneUIEvent.SET_POSITION, {
        sceneUI: this,
        position,
      });
    }
  }

  /**
   * Sets the state of the SceneUI by performing a shallow merge with existing state.
   * 
   * @param state - The state to set.
   */
  public setState(state: object) {
    this._state = { ...this._state, ...state };

    if (this.isLoaded) {
      this.emitWithWorld(this._world!, SceneUIEvent.SET_STATE, {
        sceneUI: this,
        state: this._state,
      });
    }
  }

  /**
   * Sets the view distance of the SceneUI.
   * 
   * @param viewDistance - The view distance in the world.
   */
  public setViewDistance(viewDistance: number) {
    this._viewDistance = viewDistance;

    if (this.isLoaded) {
      this.emitWithWorld(this._world!, SceneUIEvent.SET_VIEW_DISTANCE, {
        sceneUI: this,
        viewDistance,
      });
    }
  }

  /**
   * Unloads the SceneUI from the world.
   */
  public unload() {
    if (!this.isLoaded || !this._world) return;

    this._world.sceneUIManager.unregisterSceneUI(this);

    this.emitWithWorld(this._world, SceneUIEvent.UNLOAD, { sceneUI: this });

    this._id = undefined;
    this._world = undefined;
  }

  /** @internal */
  public serialize(): protocol.SceneUISchema {
    return Serializer.serializeSceneUI(this);
  }
}
