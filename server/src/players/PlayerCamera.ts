import protocol from '@hytopia.com/server-protocol';
import ErrorHandler from '@/errors/ErrorHandler';
import EventRouter from '@/events/EventRouter';
import Serializer from '@/networking/Serializer';
import type Entity from '@/worlds/entities/Entity';
import type Player from '@/players/Player';
import type QuaternionLike from '@/shared/types/math/QuaternionLike';
import type Vector3Like from '@/shared/types/math/Vector3Like';

/**
 * The mode of the camera.
 *
 * **Category:** Players
 * @public
 */
export enum PlayerCameraMode {
  FIRST_PERSON = 0,
  THIRD_PERSON = 1,
  SPECTATOR = 2,
}

/**
 * The camera orientation state of a Player.
 *
 * **Category:** Players
 * @public
 */
export type PlayerCameraOrientation = { pitch: number, yaw: number };

/**
 * Event types a PlayerCamera can emit.
 *
 * See `PlayerCameraEventPayloads` for the payloads.
 *
 * **Category:** Events
 * @public
 */
export enum PlayerCameraEvent {
  FACE_ENTITY                        = 'PLAYER_CAMERA.FACE_ENTITY',
  FACE_POSITION                      = 'PLAYER_CAMERA.FACE_POSITION',
  SET_ATTACHED_TO_ENTITY             = 'PLAYER_CAMERA.SET_ATTACHED_TO_ENTITY',
  SET_ATTACHED_TO_POSITION           = 'PLAYER_CAMERA.SET_ATTACHED_TO_POSITION',
  SET_COLLIDES_WITH_BLOCKS           = 'PLAYER_CAMERA.SET_COLLIDES_WITH_BLOCKS',
  SET_FILM_OFFSET                    = 'PLAYER_CAMERA.SET_FILM_OFFSET',
  SET_FORWARD_OFFSET                 = 'PLAYER_CAMERA.SET_FORWARD_OFFSET',
  SET_FOV                            = 'PLAYER_CAMERA.SET_FOV',
  SET_MODE                           = 'PLAYER_CAMERA.SET_MODE',
  SET_OFFSET                         = 'PLAYER_CAMERA.SET_OFFSET',
  SET_SHOULDER_ANGLE                 = 'PLAYER_CAMERA.SET_SHOULDER_ANGLE',
  SET_TARGET_ENTITY                  = 'PLAYER_CAMERA.SET_TARGET_ENTITY',
  SET_TARGET_POSITION                = 'PLAYER_CAMERA.SET_TARGET_POSITION',
  SET_VIEW_MODEL                     = 'PLAYER_CAMERA.SET_VIEW_MODEL',
  SET_VIEW_MODEL_HIDDEN_NODES        = 'PLAYER_CAMERA.SET_VIEW_MODEL_HIDDEN_NODES',
  SET_VIEW_MODEL_PITCHES_WITH_CAMERA = 'PLAYER_CAMERA.SET_VIEW_MODEL_PITCHES_WITH_CAMERA',
  SET_VIEW_MODEL_SHOWN_NODES         = 'PLAYER_CAMERA.SET_VIEW_MODEL_SHOWN_NODES',
  SET_VIEW_MODEL_YAWS_WITH_CAMERA    = 'PLAYER_CAMERA.SET_VIEW_MODEL_YAWS_WITH_CAMERA',
  SET_ZOOM                           = 'PLAYER_CAMERA.SET_ZOOM',
}

/**
 * Event payloads for PlayerCamera emitted events.
 *
 * **Category:** Events
 * @public
 */
export interface PlayerCameraEventPayloads {
  /** Emitted when the camera faces an entity (one-time rotation). */
  [PlayerCameraEvent.FACE_ENTITY]:                        { playerCamera: PlayerCamera, entity: Entity }

  /** Emitted when the camera faces a position (one-time rotation). */
  [PlayerCameraEvent.FACE_POSITION]:                      { playerCamera: PlayerCamera, position: Vector3Like }

  /** Emitted when the camera attachment entity is set. */
  [PlayerCameraEvent.SET_ATTACHED_TO_ENTITY]:             { playerCamera: PlayerCamera, entity: Entity }

  /** Emitted when the camera attachment position is set. */
  [PlayerCameraEvent.SET_ATTACHED_TO_POSITION]:           { playerCamera: PlayerCamera, position: Vector3Like }

  /** Emitted when collides with blocks is set. */
  [PlayerCameraEvent.SET_COLLIDES_WITH_BLOCKS]:           { playerCamera: PlayerCamera, collidesWithBlocks: boolean }

  /** Emitted when the film offset of the camera is set. */
  [PlayerCameraEvent.SET_FILM_OFFSET]:                    { playerCamera: PlayerCamera, filmOffset: number }

  /** Emitted when the forward offset of the camera is set. */
  [PlayerCameraEvent.SET_FORWARD_OFFSET]:                 { playerCamera: PlayerCamera, forwardOffset: number }

  /** Emitted when the field of view of the camera is set. */
  [PlayerCameraEvent.SET_FOV]:                            { playerCamera: PlayerCamera, fov: number }

  /** Emitted when the mode of the camera is set. */
  [PlayerCameraEvent.SET_MODE]:                           { playerCamera: PlayerCamera, mode: PlayerCameraMode }

  /** Emitted when the offset of the camera is set. */
  [PlayerCameraEvent.SET_OFFSET]:                         { playerCamera: PlayerCamera, offset: Vector3Like }

  /** Emitted when the shoulder angle of the camera is set. */
  [PlayerCameraEvent.SET_SHOULDER_ANGLE]:                 { playerCamera: PlayerCamera, shoulderAngle: number }

  /** Emitted when the target entity of the camera is set. */
  [PlayerCameraEvent.SET_TARGET_ENTITY]:                  { playerCamera: PlayerCamera, entity: Entity | undefined }

  /** Emitted when the target position of the camera is set. */
  [PlayerCameraEvent.SET_TARGET_POSITION]:                { playerCamera: PlayerCamera, position: Vector3Like | undefined }

  /** Emitted when the view model is set. */
  [PlayerCameraEvent.SET_VIEW_MODEL]:                     { playerCamera: PlayerCamera, viewModelUri: string | undefined }

  /** Emitted when the nodes of the view model are set to be hidden. */
  [PlayerCameraEvent.SET_VIEW_MODEL_HIDDEN_NODES]:        { playerCamera: PlayerCamera, viewModelHiddenNodes: Set<string> }

  /** Emitted when view model pitches with camera is set. */
  [PlayerCameraEvent.SET_VIEW_MODEL_PITCHES_WITH_CAMERA]: { playerCamera: PlayerCamera, viewModelPitchesWithCamera: boolean }
  
  /** Emitted when the nodes of the view model are set to be shown. */
  [PlayerCameraEvent.SET_VIEW_MODEL_SHOWN_NODES]:         { playerCamera: PlayerCamera, viewModelShownNodes: Set<string> }

  /** Emitted when view model yaws with camera is set. */
  [PlayerCameraEvent.SET_VIEW_MODEL_YAWS_WITH_CAMERA]:    { playerCamera: PlayerCamera, viewModelYawsWithCamera: boolean }

  /** Emitted when the zoom of the camera is set. */
  [PlayerCameraEvent.SET_ZOOM]:                           { playerCamera: PlayerCamera, zoom: number }
}

/**
 * The camera for a Player.
 *
 * When to use: controlling a player's view, mode, and camera offsets.
 * Do NOT use for: moving the player or entities; use entity movement APIs.
 *
 * @remarks
 * Access via `Player.camera`. Most operations require the player to be in a world.
 *
 * <h2>Events</h2>
 *
 * This class is an EventRouter, and instances of it emit events with payloads listed under
 * `PlayerCameraEventPayloads`.
 *
 * @example
 * ```typescript
 * // Camera follows player, continuously looks at enemy
 * player.camera.setAttachedToEntity(playerEntity);
 * player.camera.setTargetEntity(enemyEntity);
 * 
 * // Camera at fixed position, continuously looks at player
 * player.camera.setAttachedToPosition({ x: 0, y: 10, z: 0 });
 * player.camera.setTargetEntity(playerEntity);
 * 
 * // Stop targeting, restore manual camera control
 * player.camera.setTargetEntity(undefined);
 * ```
 *
 * **Category:** Players
 * @public
 */
export default class PlayerCamera extends EventRouter implements protocol.Serializable {
  /**
   * The player that the camera belongs to.
   *
   * **Category:** Players
   */
  public readonly player: Player;

  /** @internal */
  private _attachedToEntity: Entity | undefined;

  /** @internal */
  private _attachedToPosition: Vector3Like | undefined;

  /** @internal */
  private _collidesWithBlocks: boolean = true;

  /** @internal */
  private _filmOffset: number = 0;

  /** @internal */
  private _forwardOffset: number = 0;

  /** @internal */
  private _fov: number = 75;

  /** @internal */
  private _mode: PlayerCameraMode = PlayerCameraMode.THIRD_PERSON;

  /** @internal */
  private _offset: Vector3Like = { x: 0, y: 0, z: 0 };

  /** @internal */
  private _orientation: PlayerCameraOrientation = { pitch: 0, yaw: 0 };

  /** @internal */
  private _shoulderAngle: number = 0;

  /** @internal */
  private _targetEntity: Entity | undefined;

  /** @internal */
  private _targetPosition: Vector3Like | undefined;

  /** @internal */
  private _viewModelUri: string | undefined;

  /** @internal */
  private _viewModelHiddenNodes: Set<string> = new Set();

  /** @internal */
  private _viewModelPitchesWithCamera: boolean = false;

  /** @internal */
  private _viewModelShownNodes: Set<string> = new Set();
  
  /** @internal */
  private _viewModelYawsWithCamera: boolean = false;

  /** @internal */
  private _zoom: number = 1;

  /** @internal */
  public constructor(player: Player) {
    super();

    this.player = player;
  }

  /**
   * The entity the camera is attached to.
   *
   * **Category:** Players
   */
  public get attachedToEntity(): Entity | undefined {
    return this._attachedToEntity;
  }

  /**
   * The position the camera is attached to.
   *
   * **Category:** Players
   */
  public get attachedToPosition(): Vector3Like | undefined {
    return this._attachedToPosition;
  }

  /**
   * Whether the camera collides with blocks instead of clipping through them.
   *
   * **Category:** Players
   */
  public get collidesWithBlocks(): boolean {
    return this._collidesWithBlocks;
  }

  /**
   * The facing direction vector of the camera based on its current orientation.
   *
   * **Category:** Players
   */
  public get facingDirection(): Vector3Like {
    return {
      x: -Math.sin(this._orientation.yaw) * Math.cos(this._orientation.pitch),
      y: Math.sin(this._orientation.pitch),
      z: -Math.cos(this._orientation.yaw) * Math.cos(this._orientation.pitch),
    };
  }

  /**
   * The quaternion representing the camera's facing direction.
   *
   * **Category:** Players
   */
  public get facingQuaternion(): QuaternionLike {
    const hp = this._orientation.pitch * 0.5;
    const hy = this._orientation.yaw * 0.5;
    const cp = Math.cos(hp), sp = Math.sin(hp);
    const cy = Math.cos(hy), sy = Math.sin(hy);
    
    return {
      x: sp * cy,
      y: cp * sy,
      z: -sp * sy,
      w: cp * cy,
    };
  }

  /**
   * The film offset of the camera.
   *
   * @remarks
   * Positive shifts right, negative shifts left.
   *
   * **Category:** Players
   */
  public get filmOffset(): number {
    return this._filmOffset;
  }

  /**
   * The forward offset of the camera (first-person mode only).
   *
   * @remarks
   * Positive shifts forward, negative shifts backward.
   *
   * **Category:** Players
   */
  public get forwardOffset(): number {
    return this._forwardOffset;
  }

  /**
   * The field of view of the camera.
   *
   * **Category:** Players
   */
  public get fov(): number {
    return this._fov;
  }

  /**
   * Model nodes that will not be rendered for this player.
   *
   * @remarks
   * Uses case-insensitive substring matching.
   *
   * **Category:** Players
   */
  public get modelHiddenNodes(): Set<string> {
    return this._viewModelHiddenNodes;
  }

  /**
   * Model nodes that will be rendered for this player, overriding hidden nodes.
   *
   * @remarks
   * Uses case-insensitive substring matching.
   *
   * **Category:** Players
   */
  public get modelShownNodes(): Set<string> {
    return this._viewModelShownNodes;
  }

  /**
   * The mode of the camera.
   *
   * **Category:** Players
   */
  public get mode(): PlayerCameraMode {
    return this._mode;
  }

  /**
   * The relative offset of the camera from its attachment target.
   *
   * **Category:** Players
   */
  public get offset(): Vector3Like {
    return this._offset;
  }

  /**
   * The current orientation of the camera.
   *
   * @remarks
   * Updated by client input; there is no public setter.
   *
   * **Category:** Players
   */
  public get orientation(): PlayerCameraOrientation {
    return this._orientation;
  }

  /**
   * The shoulder angle of the camera in degrees.
   *
   * **Category:** Players
   */
  public get shoulderAngle(): number {
    return this._shoulderAngle;
  }

  /**
   * The entity the camera continuously rotates to face.
   *
   * **Category:** Players
   */
  public get targetEntity(): Entity | undefined {
    return this._targetEntity;
  }

  /**
   * The position the camera continuously rotates to face.
   *
   * **Category:** Players
   */
  public get targetPosition(): Vector3Like | undefined {
    return this._targetPosition;
  }

  /**
   * The URI of the view model.
   *
   * @remarks
   * If not set, defaults to using attached entity's model uri.
   * If no entity is attached, returns `undefined`.
   *
   * **Category:** Players
   */
  public get viewModelUri(): string | undefined {
    return this._viewModelUri ?? this._attachedToEntity?.modelUri;
  }

  /**
   * Node substrings to hide on the view model (or attached entity's model).
   *
   * **Category:** Players
   */
  public get viewModelHiddenNodes(): Set<string> {
    return this._viewModelHiddenNodes;
  }

  /**
   * Whether the view model pitches up/down with the camera orientation.
   *
   * **Category:** Players
   */
  public get viewModelPitchesWithCamera(): boolean {
    return this._viewModelPitchesWithCamera;
  }

  /**
   * Node substrings to show on the view model (or attached entity's model).
   *
   * **Category:** Players
   */
  public get viewModelShownNodes(): Set<string> {
    return this._viewModelShownNodes;
  }
  
  /**
   * Whether the view model yaws left/right with the camera orientation.
   *
   * **Category:** Players
   */
  public get viewModelYawsWithCamera(): boolean {
    return this._viewModelYawsWithCamera;
  }

  /**
   * The zoom of the camera.
   *
   * **Category:** Players
   */
  public get zoom(): number {
    return this._zoom;
  }

  /**
   * Makes the camera look at an entity once.
   *
   * Use for: one-off focus moments (e.g., cutscene beats).
   * Do NOT use for: continuous tracking; use `PlayerCamera.setTrackedEntity`.
   *
   * @param entity - The entity to look at.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.LOOK_AT_ENTITY`.
   *
   * **Category:** Players
   */
  public faceEntity(entity: Entity) {
    if (!this._requirePlayerWorld('faceEntity')) { return; }

    this._targetEntity = undefined;
    this._targetPosition = undefined;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.FACE_ENTITY, {
      playerCamera: this,
      entity,
    });
  }

  /**
   * Makes the camera look at a position once.
   *
   * Use for: one-off focus moments (e.g., points of interest).
   * Do NOT use for: continuous tracking; use `PlayerCamera.setTrackedPosition`.
   *
   * @param position - The position to look at.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.LOOK_AT_POSITION`.
   *
   * **Category:** Players
   */
  public facePosition(position: Vector3Like) {
    if (!this._requirePlayerWorld('facePosition')) { return; }

    this._targetEntity = undefined;
    this._targetPosition = undefined;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.FACE_POSITION, {
      playerCamera: this,
      position,
    });
  }

  /**
   * Resets the camera state on the server.
   *
   * Use for: clearing camera state on disconnect or reconnect.
   *
   * @remarks
   * Clears `attachedToEntity`, `attachedToPosition`, `orientation`, `trackedEntity`, and `trackedPosition`.
   * This does not emit a camera event; it only resets server-side state.
   *
   * **Category:** Players
   */
  public reset() {
    this._attachedToEntity = undefined;
    this._attachedToPosition = undefined;
    this._orientation = { pitch: 0, yaw: 0 };
    this._targetEntity = undefined;
    this._targetPosition = undefined;
  }

  /**
   * Attaches the camera to an entity.
   *
   * Use for: third-person follow cameras or entity-bound views.
   * Do NOT use for: tracking an entity without attachment; use `PlayerCamera.setTrackedEntity`.
   *
   * @param entity - The entity to attach the camera to (must be spawned).
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.SET_ATTACHED_TO_ENTITY`.
   *
   * **Category:** Players
   */
  public setAttachedToEntity(entity: Entity) {
    if (!this._requirePlayerWorld('setAttachedToEntity')) { return; }
    
    if (!entity.isSpawned) {
      return ErrorHandler.error(`PlayerCamera.setAttachedToEntity(): Entity ${entity.id} is not spawned!`);
    }

    if (this._targetEntity === entity) {
      return ErrorHandler.error(`PlayerCamera.setAttachedToEntity(): Entity ${entity.id} is already set as the target. Attachment and target cannot be the same!`);
    }

    this._attachedToEntity = entity;
    this._attachedToPosition = undefined;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_ATTACHED_TO_ENTITY, {
      playerCamera: this,
      entity,
    });
  }

  /**
   * Attaches the camera to a world position.
   *
   * Use for: fixed cameras or cinematic shots.
   * Do NOT use for: tracking a moving target; use `PlayerCamera.setTrackedPosition`.
   *
   * @param position - The position to attach the camera to.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.SET_ATTACHED_TO_POSITION`.
   *
   * **Category:** Players
   */
  public setAttachedToPosition(position: Vector3Like) {
    if (!this._requirePlayerWorld('setAttachedToPosition')) { return; }

    if (position && this._targetPosition?.x === position.x && this._targetPosition?.y === position.y && this._targetPosition?.z === position.z) {
      return ErrorHandler.error(`PlayerCamera.setAttachedToPosition(): Position ${position.x}, ${position.y}, ${position.z} is already set as the target. Attachment and target cannot be the same!`);
    }

    this._attachedToPosition = position;
    this._attachedToEntity = undefined;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_ATTACHED_TO_POSITION, {
      playerCamera: this,
      position,
    });
  }

  /**
   * Sets whether the camera collides with blocks instead of clipping through them.
   *
   * @param collidesWithBlocks - Whether the camera should collide with blocks.
   *
   * **Category:** Players
   */
  public setCollidesWithBlocks(collidesWithBlocks: boolean) {
    if (!this._requirePlayerWorld('setCollidesWithBlocks')) { return; }

    this._collidesWithBlocks = collidesWithBlocks;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_COLLIDES_WITH_BLOCKS, {
      playerCamera: this,
      collidesWithBlocks,
    });
  }

  /**
   * Sets the film offset of the camera. A positive value 
   * shifts the camera right, a negative value shifts it left.
   * @param filmOffset - The film offset to set.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.SET_FILM_OFFSET`.
   *
   * **Category:** Players
   */
  public setFilmOffset(filmOffset: number) {
    if (!this._requirePlayerWorld('setFilmOffset')) { return; }

    this._filmOffset = filmOffset;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_FILM_OFFSET, {
      playerCamera: this,
      filmOffset,
    });
  }

  /**
   * Sets the forward offset of the camera (first-person mode only).
   *
   * @remarks
   * Positive shifts forward, negative shifts backward.
   *
   * @param forwardOffset - The forward offset to set.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.SET_FORWARD_OFFSET`.
   *
   * **Category:** Players
   */
  public setForwardOffset(forwardOffset: number) {
    if (!this._requirePlayerWorld('setForwardOffset')) { return; }

    this._forwardOffset = forwardOffset;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_FORWARD_OFFSET, {
      playerCamera: this,
      forwardOffset,
    });
  }

  /**
   * Sets the field of view of the camera.
   *
   * @param fov - The field of view to set.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.SET_FOV`.
   *
   * **Category:** Players
   */
  public setFov(fov: number) {
    if (!this._requirePlayerWorld('setFov')) { return; }

    this._fov = fov;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_FOV, {
      playerCamera: this,
      fov,
    });
  }

  /**
   * Sets the mode of the camera.
   *
   * @param mode - The mode to set.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.SET_MODE`.
   *
   * **Category:** Players
   */
  public setMode(mode: PlayerCameraMode) {
    if (!this._requirePlayerWorld('setMode')) { return; }

    this._mode = mode;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_MODE, {
      playerCamera: this,
      mode,
    });
  }

  /**
   * Sets the relative offset of the camera from its attachment target.
   *
   * @param offset - The offset to set.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.SET_OFFSET`.
   *
   * **Category:** Players
   */
  public setOffset(offset: Vector3Like) {
    if (!this._requirePlayerWorld('setOffset')) { return; }

    this._offset = offset;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_OFFSET, {
      playerCamera: this,
      offset,
    });
  }

  /** @internal */
  public setOrientationPitch(pitch: number) {
    this._orientation.pitch = pitch;
  }

  /** @internal */
  public setOrientationYaw(yaw: number) {
    this._orientation.yaw = yaw;
  }

  /**
   * Sets the shoulder angle of the camera in degrees (third-person mode only).
   *
   * @remarks
   * Positive shifts right, negative shifts left.
   *
   * @param shoulderAngle - The shoulder angle to set in degrees.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.SET_SHOULDER_ANGLE`.
   *
   * **Category:** Players
   */
  public setShoulderAngle(shoulderAngle: number) {
    if (!this._requirePlayerWorld('setShoulderAngle')) { return; }

    this._shoulderAngle = shoulderAngle;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_SHOULDER_ANGLE, {
      playerCamera: this,
      shoulderAngle,
    });
  }
  
  /**
   * Sets the entity the camera will continuously look at.
   *
   * Use for: keeping the camera focused on a moving entity.
   *
   * @param entity - The entity to track, or undefined to stop tracking.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.SET_TRACKED_ENTITY`.
   *
   * **Category:** Players
   */
  public setTargetEntity(entity: Entity | undefined) {
    if (!this._requirePlayerWorld('setTargetEntity')) { return; }

    if (entity && this._attachedToEntity === entity) {
      return ErrorHandler.error(`PlayerCamera.setTargetEntity(): Entity ${entity.id} is already set as the attachment. Attachment and target cannot be the same!`);
    }

    this._targetEntity = entity;
    if (entity) {
      this._targetPosition = undefined;
    }

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_TARGET_ENTITY, {
      playerCamera: this,
      entity,
    });
  }

  /**
   * Sets the position the camera will continuously look at.
   *
   * Use for: fixed focal points in the scene.
   *
   * @param position - The position to track, or undefined to stop tracking.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.SET_TRACKED_POSITION`.
   *
   * **Category:** Players
   */
  public setTargetPosition(position: Vector3Like | undefined) {
    if (!this._requirePlayerWorld('setTargetPosition')) { return; }

    if (position && this._attachedToPosition?.x === position.x && this._attachedToPosition?.y === position.y && this._attachedToPosition?.z === position.z) {
      return ErrorHandler.error(`PlayerCamera.setTargetPosition(): Position ${position.x}, ${position.y}, ${position.z} is already set as the attachment. Attachment and target cannot be the same!`);
    }

    this._targetPosition = position;
    if (position) {
      this._targetEntity = undefined;
    }

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_TARGET_POSITION, {
      playerCamera: this,
      position,
    });
  }

  /**
   * Sets a view model for first-person rendering.
   *
   * @remarks
   * The view model is only visible to this camera's player and renders in place of
   * the attached entity's model (e.g., first-person arms/weapon).
   * Animations played on the attached entity automatically sync to
   * this model if animation names match.
   *
   * @param viewModelUri - The model URI, or `undefined` to clear.
   *
   * **Category:** Players
   */
  public setViewModel(viewModelUri: string | undefined) {
    if (!this._requirePlayerWorld('setViewModel')) { return; }

    if (!this._attachedToEntity) {
      return ErrorHandler.error('PlayerCamera.setViewModel(): Camera is not attached to an entity, cannot set view model! Use camera.setAttachedToEntity() first.');
    }

    this._viewModelUri = viewModelUri;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_VIEW_MODEL, {
      playerCamera: this,
      viewModelUri,
    });
  }

  /**
   * Hides nodes on the view model (or attached entity's model if no view model is set).
   *
   * @remarks
   * Only affects this camera's player. Uses case-insensitive substring matching.
   * Replaces the current set (not a merge).
   *
   * @param viewModelHiddenNodes - Node name substrings to hide.
   *
   * **Category:** Players
   */
  public setViewModelHiddenNodes(viewModelHiddenNodes: string[]) {
    if (!this._requirePlayerWorld('setViewModelHiddenNodes')) { return; }

    this._viewModelHiddenNodes = new Set(viewModelHiddenNodes.map(node => node.toLowerCase()));

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_VIEW_MODEL_HIDDEN_NODES, {
      playerCamera: this,
      viewModelHiddenNodes: this._viewModelHiddenNodes,
    });
  }

  /**
   * Sets whether the view model pitches up/down with the camera orientation.
   *
   * @remarks
   * Useful for first-person view models to tilt when looking up/down.
   *
   * @param viewModelPitchesWithCamera - Whether the view model should pitch with the camera.
   *
   * **Category:** Players
   */
  public setViewModelPitchesWithCamera(viewModelPitchesWithCamera: boolean) {
    if (!this._requirePlayerWorld('setViewModelPitchesWithCamera')) { return; }

    this._viewModelPitchesWithCamera = viewModelPitchesWithCamera;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_VIEW_MODEL_PITCHES_WITH_CAMERA, {
      playerCamera: this,
      viewModelPitchesWithCamera,
    });
  }

  /**
   * Shows nodes on the view model (or attached entity's model if no view model is set),
   * overriding hidden nodes.
   *
   * @remarks
   * Only affects this camera's player. Uses case-insensitive substring matching.
   * Replaces the current set (not a merge).
   *
   * @param viewModelShownNodes - Node name substrings to show.
   *
   * **Category:** Players
   */
  public setViewModelShownNodes(viewModelShownNodes: string[]) {
    if (!this._requirePlayerWorld('setViewModelShownNodes')) { return; }

    this._viewModelShownNodes = new Set(viewModelShownNodes.map(node => node.toLowerCase()));

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_VIEW_MODEL_SHOWN_NODES, {
      playerCamera: this,
      viewModelShownNodes: this._viewModelShownNodes,
    });
  }

  /**
   * Sets whether the view model yaws left/right with the camera orientation.
   *
   * @remarks
   * Useful for first-person view models to rotate when looking left/right.
   *
   * @param viewModelYawsWithCamera - Whether the view model should yaw with the camera.
   *
   * **Category:** Players
   */
  public setViewModelYawsWithCamera(viewModelYawsWithCamera: boolean) {
    if (!this._requirePlayerWorld('setViewModelYawsWithCamera')) { return; }

    this._viewModelYawsWithCamera = viewModelYawsWithCamera;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_VIEW_MODEL_YAWS_WITH_CAMERA, {
      playerCamera: this,
      viewModelYawsWithCamera,
    });
  }

  /**
   * Sets the zoom of the camera.
   *
   * @param zoom - The zoom to set, 0 to infinity.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerCameraEvent.SET_ZOOM`.
   *
   * **Category:** Players
   */
  public setZoom(zoom: number) {
    if (!this._requirePlayerWorld('setZoom')) { return; }

    this._zoom = zoom;

    this.emitWithWorld(this.player.world!, PlayerCameraEvent.SET_ZOOM, {
      playerCamera: this,
      zoom,
    });
  }

  /** @internal */
  public serialize(): protocol.CameraSchema {
    return Serializer.serializePlayerCamera(this);
  }

  /** @internal */
  private _requirePlayerWorld(methodName: string): boolean {
    if (!this.player.world) {
      ErrorHandler.error(`PlayerCamera._requirePlayerWorld(): Player ${this.player.id} is not in a world, invoked method: ${methodName}()`);
    }

    return !!this.player.world;
  }
}
