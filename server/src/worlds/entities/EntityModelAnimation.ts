import protocol from '@hytopia.com/server-protocol';
import Serializer from '@/networking/Serializer';
import type Entity from '@/worlds/entities/Entity';

/**
 * The options for creating an EntityModelAnimation instance.
 *
 * **Category:** Entities
 * @public
 */
export interface EntityModelAnimationOptions {
  /** The name of the entity model animation. */
  name: string;

  /** The entity that the entity model animation belongs to. */
  entity: Entity;

  /** The initial blend mode of the entity model animation. */
  blendMode?: EntityModelAnimationBlendMode;

  /** Whether the animation should clamp when finished, holding the last frame. */
  clampWhenFinished?: boolean;

  /** Whether the animation fades in when played or restarted. */
  fadesIn?: boolean;

  /** Whether the animation fades out when paused or stopped. */
  fadesOut?: boolean;

  /** The initial loop mode of the entity model animation. */
  loopMode?: EntityModelAnimationLoopMode;

  /** Whether the animation should start playing on construction. */
  play?: boolean;

  /** The initial playback rate of the entity model animation. */
  playbackRate?: number;

  /** The initial blend weight of the entity model animation. */
  weight?: number;
}

/**
 * The state of an entity model animation.
 *
 * **Category:** Entities
 * @public
 */
export enum EntityModelAnimationState {
  PLAYING = 0,
  PAUSED = 1,
  STOPPED = 2,
}

/**
 * The blend mode of an entity model animation.
 *
 * **Category:** Entities
 * @public
 */
export enum EntityModelAnimationBlendMode {
  ADDITIVE = 0,
  NORMAL = 1,
}

/**
 * The loop mode of an entity model animation.
 *
 * **Category:** Entities
 * @public
 */
export enum EntityModelAnimationLoopMode {
  ONCE = 0,
  LOOP = 1,
  PING_PONG = 2,
}

/**
 * Event types an EntityModelAnimation instance can emit.
 *
 * See `EntityModelAnimationEventPayloads` for the payloads.
 *
 * **Category:** Events
 * @public
 */
export enum EntityModelAnimationEvent {
  PAUSE                   = 'ENTITY_MODEL_ANIMATION.PAUSE',
  PLAY                    = 'ENTITY_MODEL_ANIMATION.PLAY',
  RESTART                 = 'ENTITY_MODEL_ANIMATION.RESTART',
  SET_BLEND_MODE          = 'ENTITY_MODEL_ANIMATION.SET_BLEND_MODE',
  SET_CLAMP_WHEN_FINISHED = 'ENTITY_MODEL_ANIMATION.SET_CLAMP_WHEN_FINISHED',
  SET_FADES_IN            = 'ENTITY_MODEL_ANIMATION.SET_FADES_IN',
  SET_FADES_OUT           = 'ENTITY_MODEL_ANIMATION.SET_FADES_OUT',
  SET_LOOP_MODE           = 'ENTITY_MODEL_ANIMATION.SET_LOOP_MODE',
  SET_PLAYBACK_RATE       = 'ENTITY_MODEL_ANIMATION.SET_PLAYBACK_RATE',
  SET_WEIGHT              = 'ENTITY_MODEL_ANIMATION.SET_WEIGHT',
  STOP                    = 'ENTITY_MODEL_ANIMATION.STOP',
}

/**
 * Event payloads for EntityModelAnimation emitted events.
 *
 * **Category:** Events
 * @public
 */
export interface EntityModelAnimationEventPayloads {
  /** Emitted when an entity model animation is paused. */
  [EntityModelAnimationEvent.PAUSE]: { entityModelAnimation: EntityModelAnimation };
  
  /** Emitted when an entity model animation is played. */
  [EntityModelAnimationEvent.PLAY]: { entityModelAnimation: EntityModelAnimation };
  
  /** Emitted when an entity model animation is restarted. */
  [EntityModelAnimationEvent.RESTART]: { entityModelAnimation: EntityModelAnimation };
  
  /** Emitted when the blend mode of an entity model animation is set. */
  [EntityModelAnimationEvent.SET_BLEND_MODE]: { entityModelAnimation: EntityModelAnimation, blendMode: EntityModelAnimationBlendMode };
  
  /** Emitted when the clamp when finished setting of an entity model animation is set. */
  [EntityModelAnimationEvent.SET_CLAMP_WHEN_FINISHED]: { entityModelAnimation: EntityModelAnimation, clampWhenFinished: boolean };

  /** Emitted when the fade in behavior of an entity model animation is set. */
  [EntityModelAnimationEvent.SET_FADES_IN]: { entityModelAnimation: EntityModelAnimation, fadesIn: boolean };

  /** Emitted when the fade out behavior of an entity model animation is set. */
  [EntityModelAnimationEvent.SET_FADES_OUT]: { entityModelAnimation: EntityModelAnimation, fadesOut: boolean };
  
  /** Emitted when the loop mode of an entity model animation is set. */
  [EntityModelAnimationEvent.SET_LOOP_MODE]: { entityModelAnimation: EntityModelAnimation, loopMode: EntityModelAnimationLoopMode };

  /** Emitted when the playback rate of an entity model animation is set. */
  [EntityModelAnimationEvent.SET_PLAYBACK_RATE]: { entityModelAnimation: EntityModelAnimation, playbackRate: number };
  
  /** Emitted when the weight of an entity model animation is set. */
  [EntityModelAnimationEvent.SET_WEIGHT]: { entityModelAnimation: EntityModelAnimation, weight: number };
  
  /** Emitted when an entity model animation is stopped. */
  [EntityModelAnimationEvent.STOP]: { entityModelAnimation: EntityModelAnimation };
}

/**
 * Represents a single animation of the model used for an Entity.
 *
 * When to use: controlling individual animation playback, blending, and looping on model entities.
 * Do NOT use for: block entities (they have no model animations).
 *
 * @remarks
 * EntityModelAnimation instances are composed by an Entity and represent a single
 * animation clip from the entity's model. Events are emitted through the parent
 * Entity's event router and its world.
 *
 * <h2>Events</h2>
 *
 * Events emitted by this class are listed under `EntityModelAnimationEventPayloads`.
 * They are emitted via the parent entity's event router.
 *
 * @example
 * ```typescript
 * const walkAnimation = entity.getModelAnimation('walk');
 * walkAnimation.setLoopMode(EntityModelAnimationLoopMode.LOOP);
 * walkAnimation.play();
 * walkAnimation.setPlaybackRate(2);
 * ```
 *
 * **Category:** Entities
 * @public
 */
export default class EntityModelAnimation implements protocol.Serializable {
  /** @internal */
  private _name: string;

  /** @internal */
  private _blendMode: EntityModelAnimationBlendMode = EntityModelAnimationBlendMode.NORMAL;

  /** @internal */
  private _clampWhenFinished: boolean = false;

  /** @internal */
  private _entity: Entity;

  /** @internal */
  private _fadesIn: boolean = true;

  /** @internal */
  private _fadesOut: boolean = true;

  /** @internal */
  private _loopMode: EntityModelAnimationLoopMode = EntityModelAnimationLoopMode.ONCE;

  /** @internal */
  private _state: EntityModelAnimationState = EntityModelAnimationState.STOPPED;

  /** @internal */
  private _playbackRate: number = 1;

  /** @internal */
  private _weight: number = 1;

  /**
   * Creates a new EntityModelAnimation instance.
   *
   * @param options - The options for the entity model animation.
   *
   * **Category:** Entities
   */
  public constructor(options: EntityModelAnimationOptions) {
    this._name = options.name;
    this._entity = options.entity;

    this._blendMode = options.blendMode ?? this._blendMode;
    this._clampWhenFinished = options.clampWhenFinished ?? this._clampWhenFinished;
    this._fadesIn = options.fadesIn ?? this._fadesIn;
    this._fadesOut = options.fadesOut ?? this._fadesOut;
    this._loopMode = options.loopMode ?? this._loopMode;
    this._state = options.play ? EntityModelAnimationState.PLAYING : this._state;
    this._playbackRate = options.playbackRate ?? this._playbackRate;
    this._weight = options.weight ?? this._weight;
  }

  /**
   * The name of the entity model animation.
   *
   * @remarks
   * This is the name of the animation as defined in the model.
   *
   * **Category:** Entities
   */
  public get name(): string { return this._name; }

  /**
   * The blend mode of the entity model animation.
   *
   * **Category:** Entities
   */
  public get blendMode(): EntityModelAnimationBlendMode { return this._blendMode; }

  /**
   * Whether the animation should clamp when finished, holding the last frame.
   *
   * **Category:** Entities
   */
  public get clampWhenFinished(): boolean { return this._clampWhenFinished; }

  /**
   * The entity that the entity model animation belongs to.
   *
   * **Category:** Entities
   */
  public get entity(): Entity { return this._entity; }

  /**
   * Whether the animation fades in when played or restarted.
   *
   * **Category:** Entities
   */
  public get fadesIn(): boolean { return this._fadesIn; }

  /**
   * Whether the animation fades out when paused or stopped.
   *
   * **Category:** Entities
   */
  public get fadesOut(): boolean { return this._fadesOut; }

  /**
   * Whether the animation is currently playing.
   *
   * **Category:** Entities
   */
  public get isPlaying(): boolean { return this._state === EntityModelAnimationState.PLAYING; }

  /**
   * Whether the animation is currently paused.
   *
   * **Category:** Entities
   */
  public get isPaused(): boolean { return this._state === EntityModelAnimationState.PAUSED; }

  /**
   * Whether the animation is currently stopped.
   *
   * **Category:** Entities
   */
  public get isStopped(): boolean { return this._state === EntityModelAnimationState.STOPPED; }

  /**
   * The loop mode of the entity model animation.
   *
   * **Category:** Entities
   */
  public get loopMode(): EntityModelAnimationLoopMode { return this._loopMode; }

  /**
   * The playback rate of the entity model animation.
   *
   * **Category:** Entities
   */
  public get playbackRate(): number { return this._playbackRate; }

  /**
   * The weight of the entity model animation.
   *
   * **Category:** Entities
   */
  public get weight(): number { return this._weight; }

  /**
   * Pauses the entity model animation, does nothing if already paused.
   *
   * **Side effects:** Emits `EntityModelAnimationEvent.PAUSE` when spawned.
   *
   * **Category:** Entities
   */
  public pause() { 
    if (this._state === EntityModelAnimationState.PAUSED) return;

    this._state = EntityModelAnimationState.PAUSED;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelAnimationEvent.PAUSE, {
        entityModelAnimation: this,
      });
    }
  }

  /**
   * Plays the entity model animation, does nothing if already playing.
   *
   * **Side effects:** Emits `EntityModelAnimationEvent.PLAY` when spawned.
   *
   * **Category:** Entities
   */
  public play() {
    if (this._state === EntityModelAnimationState.PLAYING) return;

    this._state = EntityModelAnimationState.PLAYING;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelAnimationEvent.PLAY, {
        entityModelAnimation: this,
      });
    }
  }

  /**
   * Restarts the entity model animation from the beginning.
   *
   * @remarks
   * Unlike `play()`, this always emits even if the animation is already playing,
   * allowing the animation to restart from the beginning.
   *
   * **Side effects:** Emits `EntityModelAnimationEvent.RESTART` when spawned.
   *
   * **Category:** Entities
   */
  public restart() {
    this._state = EntityModelAnimationState.PLAYING;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelAnimationEvent.RESTART, {
        entityModelAnimation: this,
      });
    }
  }

  /**
   * Sets the blend mode of the entity model animation.
   *
   * @param blendMode - The blend mode of the entity model animation.
   *
   * **Side effects:** Emits `EntityModelAnimationEvent.SET_BLEND_MODE` when spawned.
   *
   * **Category:** Entities
   */
  public setBlendMode(blendMode: EntityModelAnimationBlendMode) {
    if (this._blendMode === blendMode) return;

    this._blendMode = blendMode;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelAnimationEvent.SET_BLEND_MODE, {
        entityModelAnimation: this,
        blendMode,
      });
    }
  }

  /**
   * Sets whether the animation should clamp when finished, holding the last frame.
   *
   * @param clampWhenFinished - Whether to clamp when finished.
   *
   * **Side effects:** Emits `EntityModelAnimationEvent.SET_CLAMP_WHEN_FINISHED` when spawned.
   *
   * **Category:** Entities
   */
  public setClampWhenFinished(clampWhenFinished: boolean) {
    if (this._clampWhenFinished === clampWhenFinished) return;

    this._clampWhenFinished = clampWhenFinished;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelAnimationEvent.SET_CLAMP_WHEN_FINISHED, {
        entityModelAnimation: this,
        clampWhenFinished,
      });
    }
  }

  /**
   * Sets whether the animation fades in when played or restarted.
   *
   * @param fadesIn - Whether the animation should fade in when played or restarted.
   *
   * **Side effects:** Emits `EntityModelAnimationEvent.SET_FADES_IN` when spawned.
   *
   * **Category:** Entities
   */
  public setFadesIn(fadesIn: boolean) {
    if (this._fadesIn === fadesIn) return;

    this._fadesIn = fadesIn;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelAnimationEvent.SET_FADES_IN, {
        entityModelAnimation: this,
        fadesIn,
      });
    }
  }

  /**
   * Sets whether the animation fades out when paused or stopped.
   *
   * @param fadesOut - Whether the animation should fade out when paused or stopped.
   *
   * **Side effects:** Emits `EntityModelAnimationEvent.SET_FADES_OUT` when spawned.
   *
   * **Category:** Entities
   */
  public setFadesOut(fadesOut: boolean) {
    if (this._fadesOut === fadesOut) return;

    this._fadesOut = fadesOut;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelAnimationEvent.SET_FADES_OUT, {
        entityModelAnimation: this,
        fadesOut,
      });
    }
  }

  /**
   * Sets the loop mode of the entity model animation.
   *
   * @param loopMode - The loop mode of the entity model animation.
   *
   * **Side effects:** Emits `EntityModelAnimationEvent.SET_LOOP_MODE` when spawned.
   *
   * **Category:** Entities
   */
  public setLoopMode(loopMode: EntityModelAnimationLoopMode) {  
    if (this._loopMode === loopMode) return;

    this._loopMode = loopMode;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelAnimationEvent.SET_LOOP_MODE, {
        entityModelAnimation: this,
        loopMode,
      });
    }
  }

  /**
   * Sets the playback rate of the entity model animation.
   *
   * @remarks
   * A positive value plays the animation forward, a negative value plays it in reverse.
   * Defaults to 1.
   *
   * @param playbackRate - The playback rate of the entity model animation.
   *
   * **Side effects:** Emits `EntityModelAnimationEvent.SET_PLAYBACK_RATE` when spawned.
   *
   * **Category:** Entities
   */
  public setPlaybackRate(playbackRate: number) {
    if (this._playbackRate === playbackRate) return;

    this._playbackRate = playbackRate;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelAnimationEvent.SET_PLAYBACK_RATE, {
        entityModelAnimation: this,
        playbackRate,
      });
    }
  }

  /**
   * Sets the weight of the entity model animation for blending
   * with other playing animations.
   *
   * @param weight - The weight of the entity model animation.
   *
   * **Side effects:** Emits `EntityModelAnimationEvent.SET_WEIGHT` when spawned.
   *
   * **Category:** Entities
   */
  public setWeight(weight: number) {
    if (this._weight === weight) return;

    this._weight = weight;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelAnimationEvent.SET_WEIGHT, {
        entityModelAnimation: this,
        weight,
      });
    }
  }

  /**
   * Stops the entity model animation, does nothing if already stopped.
   *
   * **Side effects:** Emits `EntityModelAnimationEvent.STOP` when spawned.
   *
   * **Category:** Entities
   */
  public stop() {
    if (this._state === EntityModelAnimationState.STOPPED) return;

    this._state = EntityModelAnimationState.STOPPED;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelAnimationEvent.STOP, {
        entityModelAnimation: this,
      });
    }
  }

  /** @internal */
  public serialize(): protocol.ModelAnimationSchema {
    return Serializer.serializeEntityModelAnimation(this);
  }
}
