import protocol from '@hytopia.com/server-protocol';
import ErrorHandler from '@/errors/ErrorHandler';
import EventRouter from '@/events/EventRouter';
import Serializer from '@/networking/Serializer';
import type Entity from '@/worlds/entities/Entity';
import type RgbColor from '@/shared/types/RgbColor';
import type Vector3Like from '@/shared/types/math/Vector3Like';
import type World from '@/worlds/World';

/**
 * The orientation mode for particles.
 *
 * **Category:** Particles
 * @public
 */
export type ParticleEmitterOrientation = 'billboard' | 'billboardY' | 'fixed' | 'velocity';

/**
 * Options for creating a ParticleEmitter instance.
 *
 * Use for: configuring an emitter before calling `ParticleEmitter.spawn`.
 * Do NOT use for: runtime updates after spawn; use `ParticleEmitter.set*` methods.
 *
 * **Category:** Particles
 * @public
 */
export interface ParticleEmitterOptions {
  /** The URI or path to the texture to be used for the particles. */
  textureUri: string;

  /** The alpha test value, discards particle texture pixels with alpha opacity less than this value. Defaults to 0.5. */
  alphaTest?: number;

  /** If set, the ParticleEmitter will be attached to this entity. */
  attachedToEntity?: Entity;

  /** The name of the node of the attached entity (if the attached entity is a model entity) to attach the particle emitter to. */
  attachedToEntityNodeName?: string;

  /** The color of an emitted particle at the end of its lifetime. */
  colorEnd?: RgbColor;

  /** The color variance of an emitted particle at the end of its lifetime. */
  colorEndVariance?: RgbColor;

  /** The color intensity of an emitted particle at the end of its lifetime. Values greater than 1 create HDR/bloom effects. */
  colorIntensityEnd?: number;

  /** The color intensity variance of an emitted particle at the end of its lifetime. */
  colorIntensityEndVariance?: number;

  /** The color intensity of an emitted particle at the start of its lifetime. Values greater than 1 create HDR/bloom effects. */
  colorIntensityStart?: number;

  /** The color intensity variance of an emitted particle at the start of its lifetime. */
  colorIntensityStartVariance?: number;

  /** The color of an emitted particle at the start of its lifetime. */
  colorStart?: RgbColor;

  /** The color variance of an emitted particle at the start of its lifetime. */
  colorStartVariance?: RgbColor;

  /** The gravity vector for an emitted particle. */
  gravity?: Vector3Like;

  /** The lifetime of an emitted particle in seconds. */
  lifetime?: number;

  /** The lifetime variance of an emitted particle in seconds. */
  lifetimeVariance?: number;

  /** When enabled, emitted particles follow the emitter's world position. Cannot be changed after construction.*/
  lockToEmitter?: boolean;

  /** The maximum number of live particles. */
  maxParticles?: number;

  /** The offset of the particle emitter from the attached entity or position. */
  offset?: Vector3Like;

  /** The orientation mode of emitted particles. 'billboard' faces the camera, 'billboardY' faces the camera but keeps Y-axis upward, 'fixed' uses a fixed rotation. Defaults to 'billboard'. */
  orientation?: ParticleEmitterOrientation;

  /** The fixed rotation of emitted particles in degrees (x, y, z) when orientation is 'fixed'. Defaults to (0, 0, 0). */
  orientationFixedRotation?: Vector3Like;

  /** The opacity of an emitted particle at the end of its lifetime. */
  opacityEnd?: number;

  /** The opacity variance of an emitted particle at the end of its lifetime. */
  opacityEndVariance?: number;

  /** The opacity of an emitted particle at the start of its lifetime. */
  opacityStart?: number;

  /** The opacity variance of an emitted particle at the start of its lifetime. */
  opacityStartVariance?: number;

  /** The position of the particle emitter in the world if explicitly set. */
  position?: Vector3Like;

  /** The position variance of an emitted particle. */
  positionVariance?: Vector3Like;

  /** The rate per second at which particles are emitted. */
  rate?: number;

  /** The rate per second variance of the particle emission rate. */
  rateVariance?: number;

  /** The size at the end of an emitted particle's lifetime. */
  sizeEnd?: number;

  /** The size variance at the end of an emitted particle's lifetime. */
  sizeEndVariance?: number;

  /** The size at the start of an emitted particle's lifetime. */
  sizeStart?: number;

  /** The size variance at the start of an emitted particle's lifetime. */
  sizeStartVariance?: number;

  /** Whether an emitted particle is transparent, resulting in smoother transparency blending. */
  transparent?: boolean;

  /** The velocity of an emitted particle. */
  velocity?: Vector3Like;

  /** The velocity variance of an emitted particle. */
  velocityVariance?: Vector3Like;
}

/**
 * Event types a ParticleEmitter instance can emit.
 *
 * See `ParticleEmitterEventPayloads` for the payloads.
 *
 * **Category:** Events
 * @public
 */
export enum ParticleEmitterEvent {
  BURST                              = 'PARTICLE_EMITTER.BURST',
  DESPAWN                            = 'PARTICLE_EMITTER.DESPAWN',
  SET_ALPHA_TEST                     = 'PARTICLE_EMITTER.SET_ALPHA_TEST',
  SET_ATTACHED_TO_ENTITY             = 'PARTICLE_EMITTER.SET_ATTACHED_TO_ENTITY',
  SET_ATTACHED_TO_ENTITY_NODE_NAME   = 'PARTICLE_EMITTER.SET_ATTACHED_TO_ENTITY_NODE_NAME',
  SET_COLOR_END                      = 'PARTICLE_EMITTER.SET_COLOR_END',
  SET_COLOR_END_VARIANCE             = 'PARTICLE_EMITTER.SET_COLOR_END_VARIANCE',
  SET_COLOR_INTENSITY_END            = 'PARTICLE_EMITTER.SET_COLOR_INTENSITY_END',
  SET_COLOR_INTENSITY_END_VARIANCE   = 'PARTICLE_EMITTER.SET_COLOR_INTENSITY_END_VARIANCE',
  SET_COLOR_INTENSITY_START          = 'PARTICLE_EMITTER.SET_COLOR_INTENSITY_START',
  SET_COLOR_INTENSITY_START_VARIANCE = 'PARTICLE_EMITTER.SET_COLOR_INTENSITY_START_VARIANCE',
  SET_COLOR_START                    = 'PARTICLE_EMITTER.SET_COLOR_START',
  SET_COLOR_START_VARIANCE           = 'PARTICLE_EMITTER.SET_COLOR_START_VARIANCE',
  SET_GRAVITY                        = 'PARTICLE_EMITTER.SET_GRAVITY',
  SET_LIFETIME                       = 'PARTICLE_EMITTER.SET_LIFETIME',
  SET_LIFETIME_VARIANCE              = 'PARTICLE_EMITTER.SET_LIFETIME_VARIANCE',
  SET_MAX_PARTICLES                  = 'PARTICLE_EMITTER.SET_MAX_PARTICLES',
  SET_OFFSET                         = 'PARTICLE_EMITTER.SET_OFFSET',
  SET_ORIENTATION                    = 'PARTICLE_EMITTER.SET_ORIENTATION',
  SET_ORIENTATION_FIXED_ROTATION     = 'PARTICLE_EMITTER.SET_ORIENTATION_FIXED_ROTATION',
  SET_OPACITY_END                    = 'PARTICLE_EMITTER.SET_OPACITY_END',
  SET_OPACITY_END_VARIANCE           = 'PARTICLE_EMITTER.SET_OPACITY_END_VARIANCE',
  SET_OPACITY_START                  = 'PARTICLE_EMITTER.SET_OPACITY_START',
  SET_OPACITY_START_VARIANCE         = 'PARTICLE_EMITTER.SET_OPACITY_START_VARIANCE',
  SET_PAUSED                         = 'PARTICLE_EMITTER.SET_PAUSED',
  SET_POSITION                       = 'PARTICLE_EMITTER.SET_POSITION',
  SET_POSITION_VARIANCE              = 'PARTICLE_EMITTER.SET_POSITION_VARIANCE',
  SET_RATE                           = 'PARTICLE_EMITTER.SET_RATE',
  SET_RATE_VARIANCE                  = 'PARTICLE_EMITTER.SET_RATE_VARIANCE',
  SET_SIZE_END                       = 'PARTICLE_EMITTER.SET_SIZE_END',
  SET_SIZE_END_VARIANCE              = 'PARTICLE_EMITTER.SET_SIZE_END_VARIANCE',
  SET_SIZE_START                     = 'PARTICLE_EMITTER.SET_SIZE_START',
  SET_SIZE_START_VARIANCE            = 'PARTICLE_EMITTER.SET_SIZE_START_VARIANCE',
  SET_TEXTURE_URI                    = 'PARTICLE_EMITTER.SET_TEXTURE_URI',
  SET_TRANSPARENT                    = 'PARTICLE_EMITTER.SET_TRANSPARENT',
  SET_VELOCITY                       = 'PARTICLE_EMITTER.SET_VELOCITY',
  SET_VELOCITY_VARIANCE              = 'PARTICLE_EMITTER.SET_VELOCITY_VARIANCE',
  SPAWN                              = 'PARTICLE_EMITTER.SPAWN',
}

/**
 * Event payloads for ParticleEmitter emitted events.
 *
 * **Category:** Events
 * @public
 */
export interface ParticleEmitterEventPayloads {
  /** Emitted when a ParticleEmitter bursts the specified number of particles. */
  [ParticleEmitterEvent.BURST]:                            { particleEmitter: ParticleEmitter, count: number }

  /** Emitted when a ParticleEmitter is despawned. */
  [ParticleEmitterEvent.DESPAWN]:                          { particleEmitter: ParticleEmitter }

  /** Emitted when the alpha test value is set. */
  [ParticleEmitterEvent.SET_ALPHA_TEST]:                   { particleEmitter: ParticleEmitter, alphaTest: number }

  /** Emitted when the ParticleEmitter is attached to an entity. */
  [ParticleEmitterEvent.SET_ATTACHED_TO_ENTITY]:           { particleEmitter: ParticleEmitter, entity: Entity }

  /** Emitted when the name of the node of the attached entity the particle emitter is attached to is set. */
  [ParticleEmitterEvent.SET_ATTACHED_TO_ENTITY_NODE_NAME]: { particleEmitter: ParticleEmitter, attachedToEntityNodeName: string }

  /** Emitted when the color of an emitted particle at the end of its lifetime is set. */
  [ParticleEmitterEvent.SET_COLOR_END]:                    { particleEmitter: ParticleEmitter, colorEnd: RgbColor }

  /** Emitted when the color variance of an emitted particle at the end of its lifetime is set. */
  [ParticleEmitterEvent.SET_COLOR_END_VARIANCE]:           { particleEmitter: ParticleEmitter, colorEndVariance: RgbColor }

  /** Emitted when the color intensity of an emitted particle at the end of its lifetime is set. */
  [ParticleEmitterEvent.SET_COLOR_INTENSITY_END]:          { particleEmitter: ParticleEmitter, colorIntensityEnd: number }

  /** Emitted when the color intensity variance of an emitted particle at the end of its lifetime is set. */
  [ParticleEmitterEvent.SET_COLOR_INTENSITY_END_VARIANCE]: { particleEmitter: ParticleEmitter, colorIntensityEndVariance: number }

  /** Emitted when the color intensity of an emitted particle at the start of its lifetime is set. */
  [ParticleEmitterEvent.SET_COLOR_INTENSITY_START]:        { particleEmitter: ParticleEmitter, colorIntensityStart: number }

  /** Emitted when the color intensity variance of an emitted particle at the start of its lifetime is set. */
  [ParticleEmitterEvent.SET_COLOR_INTENSITY_START_VARIANCE]: { particleEmitter: ParticleEmitter, colorIntensityStartVariance: number }

  /** Emitted when the color of an emitted particle at the start of its lifetime is set. */
  [ParticleEmitterEvent.SET_COLOR_START]:                  { particleEmitter: ParticleEmitter, colorStart: RgbColor }

  /** Emitted when the color variance of an emitted particle at the start of its lifetime is set. */
  [ParticleEmitterEvent.SET_COLOR_START_VARIANCE]:         { particleEmitter: ParticleEmitter, colorStartVariance: RgbColor }

  /** Emitted when the gravity vector for an emitted particle is set. */
  [ParticleEmitterEvent.SET_GRAVITY]:                      { particleEmitter: ParticleEmitter, gravity: Vector3Like }

  /** Emitted when the lifetime of an emitted particle is set. */
  [ParticleEmitterEvent.SET_LIFETIME]:                     { particleEmitter: ParticleEmitter, lifetime: number }

  /** Emitted when the lifetime variance of an emitted particle is set. */
  [ParticleEmitterEvent.SET_LIFETIME_VARIANCE]:            { particleEmitter: ParticleEmitter, lifetimeVariance: number }

  /** Emitted when the maximum number of live particles is set. */
  [ParticleEmitterEvent.SET_MAX_PARTICLES]:                { particleEmitter: ParticleEmitter, maxParticles: number }

  /** Emitted when the offset of the particle emitter is set. */
  [ParticleEmitterEvent.SET_OFFSET]:                       { particleEmitter: ParticleEmitter, offset: Vector3Like }

  /** Emitted when the orientation mode of emitted particles is set. */
  [ParticleEmitterEvent.SET_ORIENTATION]:                  { particleEmitter: ParticleEmitter, orientation: ParticleEmitterOrientation }

  /** Emitted when the fixed rotation of emitted particles is set. */
  [ParticleEmitterEvent.SET_ORIENTATION_FIXED_ROTATION]:   { particleEmitter: ParticleEmitter, orientationFixedRotation: Vector3Like }

  /** Emitted when the opacity of an emitted particle at the end of its lifetime is set. */
  [ParticleEmitterEvent.SET_OPACITY_END]:                  { particleEmitter: ParticleEmitter, opacityEnd: number }

  /** Emitted when the opacity variance of an emitted particle at the end of its lifetime is set. */
  [ParticleEmitterEvent.SET_OPACITY_END_VARIANCE]:         { particleEmitter: ParticleEmitter, opacityEndVariance: number }

  /** Emitted when the opacity of an emitted particle at the start of its lifetime is set. */
  [ParticleEmitterEvent.SET_OPACITY_START]:                { particleEmitter: ParticleEmitter, opacityStart: number }

  /** Emitted when the opacity variance of an emitted particle at the start of its lifetime is set. */
  [ParticleEmitterEvent.SET_OPACITY_START_VARIANCE]:       { particleEmitter: ParticleEmitter, opacityStartVariance: number }

  /** Emitted when the paused state of an emitted particle is set. */
  [ParticleEmitterEvent.SET_PAUSED]:                       { particleEmitter: ParticleEmitter, paused: boolean }

  /** Emitted when the position of the particle emitter is set. */
  [ParticleEmitterEvent.SET_POSITION]:                     { particleEmitter: ParticleEmitter, position: Vector3Like }

  /** Emitted when the position variance of an emitted particle is set. */
  [ParticleEmitterEvent.SET_POSITION_VARIANCE]:            { particleEmitter: ParticleEmitter, positionVariance: Vector3Like }

  /** Emitted when the rate per second at which particles are emitted is set. */
  [ParticleEmitterEvent.SET_RATE]:                         { particleEmitter: ParticleEmitter, rate: number }

  /** Emitted when the rate per second variance of the particle emission rate is set. */
  [ParticleEmitterEvent.SET_RATE_VARIANCE]:                { particleEmitter: ParticleEmitter, rateVariance: number }

  /** Emitted when the size at the end of an emitted particle's lifetime is set. */
  [ParticleEmitterEvent.SET_SIZE_END]:                     { particleEmitter: ParticleEmitter, sizeEnd: number }

  /** Emitted when the size variance at the end of an emitted particle's lifetime is set. */
  [ParticleEmitterEvent.SET_SIZE_END_VARIANCE]:            { particleEmitter: ParticleEmitter, sizeEndVariance: number }

  /** Emitted when the size at the start of an emitted particle's lifetime is set. */
  [ParticleEmitterEvent.SET_SIZE_START]:                   { particleEmitter: ParticleEmitter, sizeStart: number }

  /** Emitted when the size variance at the start of an emitted particle's lifetime is set. */
  [ParticleEmitterEvent.SET_SIZE_START_VARIANCE]:          { particleEmitter: ParticleEmitter, sizeStartVariance: number }

  /** Emitted when the texture URI is set. */
  [ParticleEmitterEvent.SET_TEXTURE_URI]:                  { particleEmitter: ParticleEmitter, textureUri: string }

  /** Emitted when the transparency of an emitted particle is set. */
  [ParticleEmitterEvent.SET_TRANSPARENT]:                  { particleEmitter: ParticleEmitter, transparent: boolean }

  /** Emitted when the velocity of an emitted particle is set. */
  [ParticleEmitterEvent.SET_VELOCITY]:                     { particleEmitter: ParticleEmitter, velocity: Vector3Like }

  /** Emitted when the velocity variance of an emitted particle is set. */
  [ParticleEmitterEvent.SET_VELOCITY_VARIANCE]:            { particleEmitter: ParticleEmitter, velocityVariance: Vector3Like }

  /** Emitted when a ParticleEmitter is spawned. */
  [ParticleEmitterEvent.SPAWN]:                            { particleEmitter: ParticleEmitter }
}

/**
 * Represents a particle emitter in the world. Emit 2D
 * particles that always face the camera.
 * 
 * @remarks
 * Particle emitters are created directly as instances. They support a
 * variety of configuration options through the `ParticleEmitterOptions`
 * constructor argument.
 * 
 * <h2>Events</h2>
 * 
 * This class is an EventRouter, and instance of it emit
 * events with payloads listed under `ParticleEmitterEventPayloads`.
 * 
 * @example
 * ```typescript
 * const particleEmitter = new ParticleEmitter({
 *   textureUri: 'textures/particles/smoke.png',
 * });
 * 
 * particleEmitter.spawn(world);
 * ```
 * 
 * **Category:** Particles
 * @public
 */
export default class ParticleEmitter extends EventRouter implements protocol.Serializable {
  /** @internal */
  private _id: number | undefined;

  /** @internal */
  private _alphaTest: number | undefined;

  /** @internal */
  private _attachedToEntity: Entity | undefined;

  /** @internal */
  private _attachedToEntityNodeName: string | undefined;

  /** @internal */
  private _colorEnd: RgbColor | undefined;

  /** @internal */
  private _colorEndVariance: RgbColor | undefined;

  /** @internal */
  private _colorIntensityEnd: number | undefined;

  /** @internal */
  private _colorIntensityEndVariance: number | undefined;

  /** @internal */
  private _colorIntensityStart: number | undefined;

  /** @internal */
  private _colorIntensityStartVariance: number | undefined;  

  /** @internal */
  private _colorStart: RgbColor | undefined;

  /** @internal */
  private _colorStartVariance: RgbColor | undefined;

  /** @internal */
  private _gravity: Vector3Like | undefined;

  /** @internal */
  private _lifetime: number | undefined;

  /** @internal */
  private _lifetimeVariance: number | undefined;

  /** @internal */
  private _lockToEmitter: boolean;

  /** @internal */
  private _maxParticles: number | undefined;

  /** @internal */
  private _offset: Vector3Like | undefined;

  /** @internal */
  private _orientation: ParticleEmitterOrientation | undefined;

  /** @internal */
  private _orientationFixedRotation: Vector3Like | undefined;

  /** @internal */
  private _opacityEnd: number | undefined;

  /** @internal */
  private _opacityEndVariance: number | undefined;

  /** @internal */
  private _opacityStart: number | undefined;

  /** @internal */
  private _opacityStartVariance: number | undefined;

  /** @internal */
  private _paused: boolean | undefined;

  /** @internal */
  private _position: Vector3Like | undefined;

  /** @internal */
  private _positionVariance: Vector3Like | undefined;

  /** @internal */
  private _rate: number | undefined;

  /** @internal */
  private _rateVariance: number | undefined;

  /** @internal */
  private _sizeEnd: number | undefined;

  /** @internal */
  private _sizeEndVariance: number | undefined;

  /** @internal */
  private _sizeStart: number | undefined;

  /** @internal */
  private _sizeStartVariance: number | undefined;

  /** @internal */
  private _sizeVariance: number | undefined;

  /** @internal */
  private _textureUri: string;

  /** @internal */
  private _transparent: boolean | undefined;

  /** @internal */
  private _velocity: Vector3Like | undefined;

  /** @internal */
  private _velocityVariance: Vector3Like | undefined;

  /** @internal */
  private _world: World | undefined;

  public constructor(options: ParticleEmitterOptions) {
    if (!!options.attachedToEntity === !!options.position) {
      ErrorHandler.fatalError('Either attachedToEntity or position must be set, but not both.');
    }

    if (!options.textureUri) {
      ErrorHandler.fatalError('ParticleEmitter.constructor(): textureUri must be provided.');
    }

    super();

    this._alphaTest = options.alphaTest ?? 0.05;
    this._attachedToEntity = options.attachedToEntity;
    this._attachedToEntityNodeName = options.attachedToEntityNodeName;
    this._colorEnd = options.colorEnd;
    this._colorEndVariance = options.colorEndVariance;
    this._colorIntensityEnd = options.colorIntensityEnd;
    this._colorIntensityEndVariance = options.colorIntensityEndVariance;
    this._colorIntensityStart = options.colorIntensityStart;
    this._colorIntensityStartVariance = options.colorIntensityStartVariance;
    this._colorStart = options.colorStart;
    this._colorStartVariance = options.colorStartVariance;
    this._gravity = options.gravity;
    this._lifetime = options.lifetime;
    this._lifetimeVariance = options.lifetimeVariance;
    this._lockToEmitter = options.lockToEmitter ?? false;
    this._maxParticles = options.maxParticles;
    this._offset = options.offset;
    this._orientation = options.orientation;
    this._orientationFixedRotation = options.orientationFixedRotation;
    this._opacityEnd = options.opacityEnd;
    this._opacityEndVariance = options.opacityEndVariance;
    this._opacityStart = options.opacityStart;
    this._opacityStartVariance = options.opacityStartVariance;
    this._paused = false;
    this._position = options.position;
    this._positionVariance = options.positionVariance;
    this._rate = options.rate;
    this._rateVariance = options.rateVariance;
    this._sizeEnd = options.sizeEnd;
    this._sizeEndVariance = options.sizeEndVariance;
    this._sizeStart = options.sizeStart;
    this._sizeStartVariance = options.sizeStartVariance;
    this._textureUri = options.textureUri;
    this._transparent = options.transparent;
    this._velocity = options.velocity;
    this._velocityVariance = options.velocityVariance;
  }

  /** The unique identifier for the ParticlEmitter. */
  public get id(): number | undefined { return this._id; }

  /** The alpha test value, discards particle texture pixels with alpha opacity less than this value. */
  public get alphaTest(): number | undefined { return this._alphaTest; }

  /** The entity to which the ParticleEmitter is attached if explicitly set. */
  public get attachedToEntity(): Entity | undefined { return this._attachedToEntity; }

  /** The name of the node of the attached entity (if the attached entity is a model entity) to attach the particle emitter to. */
  public get attachedToEntityNodeName(): string | undefined { return this._attachedToEntityNodeName; }

  /** The color of an emitted particle at the end of its lifetime. */
  public get colorEnd(): RgbColor | undefined { return this._colorEnd; }

  /** The color variance of an emitted particle at the end of its lifetime. */
  public get colorEndVariance(): RgbColor | undefined { return this._colorEndVariance; }

  /** The color intensity of an emitted particle at the end of its lifetime. */
  public get colorIntensityEnd(): number | undefined { return this._colorIntensityEnd; }

  /** The color intensity variance of an emitted particle at the end of its lifetime. */
  public get colorIntensityEndVariance(): number | undefined { return this._colorIntensityEndVariance; }

  /** The color intensity of an emitted particle at the start of its lifetime. */
  public get colorIntensityStart(): number | undefined { return this._colorIntensityStart; }

  /** The color intensity variance of an emitted particle at the start of its lifetime. */
  public get colorIntensityStartVariance(): number | undefined { return this._colorIntensityStartVariance; }

  /** The color of an emitted particle at the start of its lifetime. */
  public get colorStart(): RgbColor | undefined { return this._colorStart; }

  /** The color variance of an emitted particle at the start of its lifetime. */
  public get colorStartVariance(): RgbColor | undefined { return this._colorStartVariance; }

  /** The gravity vector for an emitted particle. */
  public get gravity(): Vector3Like | undefined { return this._gravity; }

  /** Whether the ParticleEmitter is spawned in the world. */
  public get isSpawned(): boolean { return this._id !== undefined; }

  /** The lifetime of an emitted particle in seconds. */
  public get lifetime(): number | undefined { return this._lifetime; }

  /** The lifetime variance of an emitted particle in seconds. */
  public get lifetimeVariance(): number | undefined { return this._lifetimeVariance; }

  /** Whether emitted particles follow the emitter's world position. Cannot be changed after construction. */
  public get lockToEmitter(): boolean { return this._lockToEmitter; }

  /** The maximum number of live particles. */
  public get maxParticles(): number | undefined { return this._maxParticles; }

  /** The offset of the particle emitter from the attached entity or position. */
  public get offset(): Vector3Like | undefined { return this._offset; }

  /** The orientation mode of emitted particles. */
  public get orientation(): ParticleEmitterOrientation | undefined { return this._orientation; }

  /** The fixed rotation of emitted particles in degrees when orientation is 'fixed'. */
  public get orientationFixedRotation(): Vector3Like | undefined { return this._orientationFixedRotation; }

  /** The opacity of an emitted particle at the end of its lifetime. */
  public get opacityEnd(): number | undefined { return this._opacityEnd; }

  /** The opacity variance of an emitted particle at the end of its lifetime. */
  public get opacityEndVariance(): number | undefined { return this._opacityEndVariance; }

  /** The opacity of an emitted particle at the start of its lifetime. */
  public get opacityStart(): number | undefined { return this._opacityStart; }

  /** The opacity variance of an emitted particle at the start of its lifetime. */
  public get opacityStartVariance(): number | undefined { return this._opacityStartVariance; }

  /** Whether an emitted particle is being paused. */
  public get paused(): boolean | undefined { return this._paused; }

  /** The position of the particle emitter in the world if explicitly set. */
  public get position(): Vector3Like | undefined { return this._position; }

  /** The position variance of an emitted particle. */
  public get positionVariance(): Vector3Like | undefined { return this._positionVariance; }

  /** The rate per second at which particles are emitted. */
  public get rate(): number | undefined { return this._rate; }

  /** The rate per second variance of the particle emission rate. */
  public get rateVariance(): number | undefined { return this._rateVariance; }

  /** The size at the end of an emitted particle's lifetime. */
  public get sizeEnd(): number | undefined { return this._sizeEnd; }

  /** The size variance at the end of an emitted particle's lifetime. */
  public get sizeEndVariance(): number | undefined { return this._sizeEndVariance; }

  /** The size at the start of an emitted particle's lifetime. */
  public get sizeStart(): number | undefined { return this._sizeStart; }

  /** The size variance at the start of an emitted particle's lifetime. */
  public get sizeStartVariance(): number | undefined { return this._sizeStartVariance; }

  /** The size variance of an emitted particle. */
  public get sizeVariance(): number | undefined { return this._sizeVariance; }

  /** The URI or path to the texture to be used for the particles. */
  public get textureUri(): string { return this._textureUri; }

  /** Whether an emitted particle is transparent, resulting in smoother transparency blending. */
  public get transparent(): boolean | undefined { return this._transparent; }

  /** The velocity of an emitted particle. */
  public get velocity(): Vector3Like | undefined { return this._velocity; }

  /** The velocity variance of an emitted particle. */
  public get velocityVariance(): Vector3Like | undefined { return this._velocityVariance; }

  /** The world the ParticleEmitter is in. */
  public get world(): World | undefined { return this._world; }

  /**
   * Sets the alpha test value, discards particle texture pixels with alpha opacity less than this value.
   * 
   * @param alphaTest - The alpha test value, discards particle texture pixels with alpha opacity less than this value.
   */  
  public setAlphaTest(alphaTest: number) {
    if (this._alphaTest === alphaTest) return;

    this._alphaTest = alphaTest;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_ALPHA_TEST, {
        particleEmitter: this,
        alphaTest,
      });
    }
  }

  /**
   * Sets the entity to which the ParticleEmitter is attached.
   * 
   * @remarks
   * Clears any set position (mutual exclusivity).
   * 
   * @param entity - The entity to attach the ParticleEmitter to.
   */
  public setAttachedToEntity(entity: Entity) {
    if (!entity.isSpawned) {
      return ErrorHandler.error(`ParticleEmitter.setAttachedToEntity(): Entity ${entity.id} is not spawned!`);
    }

    if (this._attachedToEntity === entity) return;

    this._attachedToEntity = entity;
    this._position = undefined;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_ATTACHED_TO_ENTITY, {
        particleEmitter: this,
        entity,
      });
    }
  }

  /**
   * Sets the name of the node of the attached entity (if the attached entity is a model entity) to attach the particle emitter to.
   * 
   * @param attachedToEntityNodeName - The name of the node of the attached entity (if the attached entity is a model entity) to attach the particle emitter to.
   */
  public setAttachedToEntityNodeName(attachedToEntityNodeName: string) {
    if (this._attachedToEntityNodeName === attachedToEntityNodeName) return;

    this._attachedToEntityNodeName = attachedToEntityNodeName;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_ATTACHED_TO_ENTITY_NODE_NAME, {
        particleEmitter: this,
        attachedToEntityNodeName,
      });
    }
  }

  /**
   * Sets the color of an emitted particle at the end of its lifetime.
   * 
   * @param colorEnd - The color of an emitted particle at the end of its lifetime.
   */
  public setColorEnd(colorEnd: RgbColor) {
    if (this._colorEnd && this._colorEnd.r === colorEnd.r && this._colorEnd.g === colorEnd.g && this._colorEnd.b === colorEnd.b) return;

    this._colorEnd = colorEnd;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_COLOR_END, {
        particleEmitter: this,
        colorEnd,
      });
    }
  }

  /**
   * Sets the color variance of an emitted particle at the end of its lifetime.
   * 
   * @param colorEndVariance - The color variance of an emitted particle at the end of its lifetime.
   */
  public setColorEndVariance(colorEndVariance: RgbColor) {
    if (this._colorEndVariance && this._colorEndVariance.r === colorEndVariance.r && this._colorEndVariance.g === colorEndVariance.g && this._colorEndVariance.b === colorEndVariance.b) return;

    this._colorEndVariance = colorEndVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_COLOR_END_VARIANCE, {
        particleEmitter: this,
        colorEndVariance,
      });
    }
  }

  /**
   * Sets the color intensity of an emitted particle at the end of its lifetime.
   *
   * @param colorIntensityEnd - The color intensity at the end of lifetime. Values greater than 1 create HDR/bloom effects.
   */
  public setColorIntensityEnd(colorIntensityEnd: number) {
    if (this._colorIntensityEnd === colorIntensityEnd) return;

    this._colorIntensityEnd = colorIntensityEnd;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_COLOR_INTENSITY_END, {
        particleEmitter: this,
        colorIntensityEnd,
      });
    }
  }

  /**
   * Sets the color intensity variance of an emitted particle at the end of its lifetime.
   *
   * @param colorIntensityEndVariance - The color intensity variance at the end of lifetime.
   */
  public setColorIntensityEndVariance(colorIntensityEndVariance: number) {
    if (this._colorIntensityEndVariance === colorIntensityEndVariance) return;

    this._colorIntensityEndVariance = colorIntensityEndVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_COLOR_INTENSITY_END_VARIANCE, {
        particleEmitter: this,
        colorIntensityEndVariance,
      });
    }
  }

  /**
   * Sets the color intensity of an emitted particle at the start of its lifetime.
   *
   * @param colorIntensityStart - The color intensity at the start of lifetime. Values greater than 1 create HDR/bloom effects.
   */
  public setColorIntensityStart(colorIntensityStart: number) {
    if (this._colorIntensityStart === colorIntensityStart) return;

    this._colorIntensityStart = colorIntensityStart;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_COLOR_INTENSITY_START, {
        particleEmitter: this,
        colorIntensityStart,
      });
    }
  }

  /**
   * Sets the color intensity variance of an emitted particle at the start of its lifetime.
   *
   * @param colorIntensityStartVariance - The color intensity variance at the start of lifetime.
   */
  public setColorIntensityStartVariance(colorIntensityStartVariance: number) {
    if (this._colorIntensityStartVariance === colorIntensityStartVariance) return;

    this._colorIntensityStartVariance = colorIntensityStartVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_COLOR_INTENSITY_START_VARIANCE, {
        particleEmitter: this,
        colorIntensityStartVariance,
      });
    }
  }

  /**
   * Sets the color of an emitted particle at the start of its lifetime.
   * 
   * @param colorStart - The color of an emitted particle at the start of its lifetime.
   */
  public setColorStart(colorStart: RgbColor) {
    if (this._colorStart && this._colorStart.r === colorStart.r && this._colorStart.g === colorStart.g && this._colorStart.b === colorStart.b) return;

    this._colorStart = colorStart;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_COLOR_START, {
        particleEmitter: this,
        colorStart,
      });
    }
  }

  /**
   * Sets the color variance of an emitted particle at the start of its lifetime.
   * 
   * @param colorStartVariance - The color variance of an emitted particle at the start of its lifetime.
   */
  public setColorStartVariance(colorStartVariance: RgbColor) {
    if (this._colorStartVariance && this._colorStartVariance.r === colorStartVariance.r && this._colorStartVariance.g === colorStartVariance.g && this._colorStartVariance.b === colorStartVariance.b) return;

    this._colorStartVariance = colorStartVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_COLOR_START_VARIANCE, {
        particleEmitter: this,
        colorStartVariance,
      });
    }
  }

  /**
   * Sets the gravity vector for an emitted particle.
   * 
   * @param gravity - The gravity vector for an emitted particle.
   */
  public setGravity(gravity: Vector3Like) {
    if (this._gravity && this._gravity.x === gravity.x && this._gravity.y === gravity.y && this._gravity.z === gravity.z) return;

    this._gravity = gravity;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_GRAVITY, {
        particleEmitter: this,
        gravity,
      });
    }
  }

  /**
   * Sets the lifetime of an emitted particle in seconds.
   * 
   * @param lifetime - The lifetime of an emitted particle in seconds.
   */
  public setLifetime(lifetime: number) {
    if (this._lifetime === lifetime) return;

    this._lifetime = lifetime;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_LIFETIME, {
        particleEmitter: this,
        lifetime,
      });
    }
  }

  /**
   * Sets the lifetime variance of an emitted particle in seconds.
   * 
   * @param lifetimeVariance - The lifetime variance of an emitted particle in seconds.
   */
  public setLifetimeVariance(lifetimeVariance: number) {
    if (this._lifetimeVariance === lifetimeVariance) return;

    this._lifetimeVariance = lifetimeVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_LIFETIME_VARIANCE, {
        particleEmitter: this,
        lifetimeVariance,
      });
    }
  }

  /**
   * Sets the maximum number of live particles.
   * 
   * @param maxParticles - The maximum number of live particles.
   */
  public setMaxParticles(maxParticles: number) {
    if (this._maxParticles === maxParticles) return;

    this._maxParticles = maxParticles;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_MAX_PARTICLES, {
        particleEmitter: this,
        maxParticles,
      });
    }
  }

  /**
   * Sets the offset of the particle emitter from the attached entity or position.
   * 
   * @param offset - The offset of the particle emitter from the attached entity or position.
   */
  public setOffset(offset: Vector3Like) {
    if (this._offset && this._offset.x === offset.x && this._offset.y === offset.y && this._offset.z === offset.z) return;

    this._offset = offset;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_OFFSET, {
        particleEmitter: this,
        offset,
      });
    }
  }

  /**
   * Sets the orientation mode of emitted particles.
   *
   * @param orientation - The orientation mode. 'billboard' faces the camera, 'billboardY' faces the camera but keeps Y-axis upward, 'fixed' uses a fixed rotation.
   */
  public setOrientation(orientation: ParticleEmitterOrientation) {
    if (this._orientation === orientation) return;

    this._orientation = orientation;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_ORIENTATION, {
        particleEmitter: this,
        orientation,
      });
    }
  }

  /**
   * Sets the fixed rotation of emitted particles when orientation is 'fixed'.
   *
   * @param orientationFixedRotation - The fixed rotation in degrees (x, y, z).
   */
  public setOrientationFixedRotation(orientationFixedRotation: Vector3Like) {
    if (this._orientationFixedRotation && this._orientationFixedRotation.x === orientationFixedRotation.x && this._orientationFixedRotation.y === orientationFixedRotation.y && this._orientationFixedRotation.z === orientationFixedRotation.z) return;

    this._orientationFixedRotation = orientationFixedRotation;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_ORIENTATION_FIXED_ROTATION, {
        particleEmitter: this,
        orientationFixedRotation,
      });
    }
  }

  /**
   * Sets the opacity of an emitted particle at the end of its lifetime.
   * 
   * @param opacityEnd - The opacity of an emitted particle at the end of its lifetime.
   */
  public setOpacityEnd(opacityEnd: number) {
    if (this._opacityEnd === opacityEnd) return;

    this._opacityEnd = opacityEnd;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_OPACITY_END, {
        particleEmitter: this,
        opacityEnd,
      });
    }
  }

  /**
   * Sets the opacity variance of an emitted particle at the end of its lifetime.
   * 
   * @param opacityEndVariance - The opacity variance of an emitted particle at the end of its lifetime.
   */
  public setOpacityEndVariance(opacityEndVariance: number) {
    if (this._opacityEndVariance === opacityEndVariance) return;

    this._opacityEndVariance = opacityEndVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_OPACITY_END_VARIANCE, {
        particleEmitter: this,
        opacityEndVariance,
      });
    }
  }

  /**
   * Sets the opacity of an emitted particle at the start of its lifetime.
   * 
   * @param opacityStart - The opacity of an emitted particle at the start of its lifetime.
   */
  public setOpacityStart(opacityStart: number) {
    if (this._opacityStart === opacityStart) return;

    this._opacityStart = opacityStart;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_OPACITY_START, {
        particleEmitter: this,
        opacityStart,
      });
    }
  }

  /**
   * Sets the opacity variance of an emitted particle at the start of its lifetime.
   * 
   * @param opacityStartVariance - The opacity variance of an emitted particle at the start of its lifetime.
   */
  public setOpacityStartVariance(opacityStartVariance: number) {
    if (this._opacityStartVariance === opacityStartVariance) return;

    this._opacityStartVariance = opacityStartVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_OPACITY_START_VARIANCE, {
        particleEmitter: this,
        opacityStartVariance,
      });
    }
  }

  /**
   * Sets the position of the particle emitter.
   * 
   * @param position - The position of the particle emitter.
   */
  public setPosition(position: Vector3Like) {
    if (this._position && this._position.x === position.x && this._position.y === position.y && this._position.z === position.z) return;

    this._position = position;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_POSITION, {
        particleEmitter: this,
        position,
      });
    }
  }

  /**
   * Sets the position variance of an emitted particle.
   * 
   * @param positionVariance - The position variance of an emitted particle.
   */
  public setPositionVariance(positionVariance: Vector3Like) {
    if (this._positionVariance && this._positionVariance.x === positionVariance.x && this._positionVariance.y === positionVariance.y && this._positionVariance.z === positionVariance.z) return;

    this._positionVariance = positionVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_POSITION_VARIANCE, {
        particleEmitter: this,
        positionVariance,
      });
    }
  }

  /**
   * Sets the rate per second at which particles are emitted.
   * 
   * @param rate - The rate per second at which particles are emitted.
   */
  public setRate(rate: number) {
    if (this._rate === rate) return;

    this._rate = rate;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_RATE, {
        particleEmitter: this,
        rate,
      });
    }
  }

  /**
   * Sets the rate variance of the particle emission rate.
   * 
   * @param rateVariance - The rate variance of the particle emission rate.
   */
  public setRateVariance(rateVariance: number) {
    if (this._rateVariance === rateVariance) return;

    this._rateVariance = rateVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_RATE_VARIANCE, {
        particleEmitter: this,
        rateVariance,
      });
    }
  }

  /**
   * Sets the size at the end of an emitted particle's lifetime.
   * 
   * @param sizeEnd - The size at the end of an emitted particle's lifetime.
   */
  public setSizeEnd(sizeEnd: number) {
    if (this._sizeEnd === sizeEnd) return;

    this._sizeEnd = sizeEnd;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_SIZE_END, {
        particleEmitter: this,
        sizeEnd,
      });
    }
  }

  /**
   * Sets the size variance at the end of an emitted particle's lifetime.
   * 
   * @param sizeEndVariance - The size variance at the end of an emitted particle's lifetime.
   */
  public setSizeEndVariance(sizeEndVariance: number) {
    if (this._sizeEndVariance === sizeEndVariance) return;

    this._sizeEndVariance = sizeEndVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_SIZE_END_VARIANCE, {
        particleEmitter: this,
        sizeEndVariance,
      });
    }
  }

  /**
   * Sets the size at the start of an emitted particle's lifetime.
   * 
   * @param sizeStart - The size at the start of an emitted particle's lifetime.
   */
  public setSizeStart(sizeStart: number) {
    if (this._sizeStart === sizeStart) return;

    this._sizeStart = sizeStart;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_SIZE_START, {
        particleEmitter: this,
        sizeStart,
      });
    }
  }

  /**
   * Sets the size variance at the start of an emitted particle's lifetime.
   * 
   * @param sizeStartVariance - The size variance at the start of an emitted particle's lifetime.
   */
  public setSizeStartVariance(sizeStartVariance: number) {
    if (this._sizeStartVariance === sizeStartVariance) return;

    this._sizeStartVariance = sizeStartVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_SIZE_START_VARIANCE, {
        particleEmitter: this,
        sizeStartVariance,
      });
    }
  }

  /**
   * Sets the texture URI of the particles emitted.
   * 
   * @param textureUri - The texture URI of the particles emitted.
   */
  public setTextureUri(textureUri: string) {
    if (this._textureUri === textureUri) return;

    this._textureUri = textureUri;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_TEXTURE_URI, {
        particleEmitter: this,
        textureUri,
      });
    }
  }

  /**
   * Sets the transparency of the particle emitter.
   * 
   * @param transparent - The transparency of the particle emitter.
   */
  public setTransparent(transparent: boolean) {
    if (this._transparent === transparent) return;

    this._transparent = transparent;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_TRANSPARENT, {
        particleEmitter: this,
        transparent,
      });
    }
  }

  /**
   * Sets the velocity of an emitted particle.
   * 
   * @param velocity - The velocity of an emitted particle.
   */
  public setVelocity(velocity: Vector3Like) {
    if (this._velocity && this._velocity.x === velocity.x && this._velocity.y === velocity.y && this._velocity.z === velocity.z) return;

    this._velocity = velocity;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_VELOCITY, {
        particleEmitter: this,
        velocity,
      });
    }
  }

  /**
   * Sets the velocity variance of an emitted particle.
   * 
   * @param velocityVariance - The velocity variance of an emitted particle.
   */
  public setVelocityVariance(velocityVariance: Vector3Like) {
    if (this._velocityVariance && this._velocityVariance.x === velocityVariance.x && this._velocityVariance.y === velocityVariance.y && this._velocityVariance.z === velocityVariance.z) return;

    this._velocityVariance = velocityVariance;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_VELOCITY_VARIANCE, {
        particleEmitter: this,
        velocityVariance,
      });
    }
  }

  /**
   * Creates a burst of particles, regardless of pause state.
   * 
   * @param count - The number of particles to burst.
   */
  public burst(count: number) {
    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.BURST, {
        particleEmitter: this,
        count,
      });
    }
  }

  /**
   * Despawns the ParticleEmitter from the world.
   */
  public despawn() {
    if (!this.isSpawned || !this._world) return;

    this._world.particleEmitterManager.unregisterParticleEmitter(this);

    this.emitWithWorld(this._world, ParticleEmitterEvent.DESPAWN, { particleEmitter: this });

    this._id = undefined;
    this._world = undefined;
  }

  /**
   * Restarts the particle emission if it was previously stopped.
   */
  public restart() {
    if (!this._paused) return;

    this._paused = false;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_PAUSED, {
        particleEmitter: this,
        paused: this._paused,
      });
    }
  }

  /**
   * Stops the particle emission.
   */
  public stop() {
    if (this._paused) return;

    this._paused = true;

    if (this.isSpawned) {
      this.emitWithWorld(this._world!, ParticleEmitterEvent.SET_PAUSED, {
        particleEmitter: this,
        paused: this._paused,
      });
    }
  }

  /**
   * Spawns the ParticleEmitter in the world.
   * 
   * @remarks
   * **Requires spawned entity:** If attached to an entity, the entity must be spawned first.
   * 
   * @param world - The world to spawn the ParticleEmitter in.
   */
  public spawn(world: World) {
    if (this.isSpawned) return;
    
    if (this._attachedToEntity && !this._attachedToEntity.isSpawned) {
      return ErrorHandler.error(`ParticleEmitter.spawn(): Attached entity ${this._attachedToEntity.id} must be spawned before spawning ParticleEmitter!`);
    }

    this._id = world.particleEmitterManager.registerParticleEmitter(this);
    this._world = world;

    this.emitWithWorld(world, ParticleEmitterEvent.SPAWN, { particleEmitter: this });
  }

  /** @internal */
  public serialize(): protocol.ParticleEmitterSchema {
    return Serializer.serializeParticleEmitter(this);
  }
}
