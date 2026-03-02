import RAPIER from '@dimforge/rapier3d-simd-compat';
import Collider from '@/worlds/physics/Collider';
import ErrorHandler from '@/errors/ErrorHandler';
import EventRouter from '@/events/EventRouter';
import type QuaternionLike from '@/shared/types/math/QuaternionLike';
import type Simulation from '@/worlds/physics/Simulation';
import type SpdMatrix3 from '@/shared/types/math/SpdMatrix3';
import type Vector3Like from '@/shared/types/math/Vector3Like';
import type Vector3Boolean from '@/shared/types/math/Vector3Boolean';
import type { CollisionGroups } from '@/worlds/physics/CollisionGroupsBuilder';
import type { ColliderOptions } from '@/worlds/physics/Collider';

/**
 * The types a RigidBody can be. @public
 *
 * **Category:** Physics
 */
export enum RigidBodyType {
  DYNAMIC = 'dynamic',
  FIXED = 'fixed',
  KINEMATIC_POSITION = 'kinematic_position',
  KINEMATIC_VELOCITY = 'kinematic_velocity',
}

/**
 * @internal
 */
export const DEFAULT_PRECISION_THRESHOLD = 1e-3;

/**
 * The default rigid body type. @public
 *
 * **Category:** Physics
 */
export const DEFAULT_RIGID_BODY_TYPE = RigidBodyType.DYNAMIC;

/**
 * Additional mass properties for a RigidBody. @public
 *
 * **Category:** Physics
 */
export type RigidBodyAdditionalMassProperties = {
  additionalMass: number;
  centerOfMass: Vector3Like;
  principalAngularInertia: Vector3Like;
  principalAngularInertiaLocalFrame: QuaternionLike;
}

/**
 * The base options for a rigid body. @public
 *
 * Use for: initial rigid body configuration when creating entities or bodies.
 * Do NOT use for: runtime changes; use `RigidBody` setter methods instead.
 *
 * **Category:** Physics
 */
export interface BaseRigidBodyOptions {
  /**
   * The type of the rigid body, defaults to `RigidBodyType.DYNAMIC`.
   *
   * **Category:** Physics
   */
  type?: RigidBodyType;

  /**
   * The colliders of the rigid body, provided as `ColliderOptions`.
   *
   * **Category:** Physics
   */
  colliders?: ColliderOptions[];

  /**
   * Whether the rigid body is enabled.
   *
   * **Category:** Physics
   */
  enabled?: boolean;

  /**
   * The position of the rigid body.
   *
   * **Category:** Physics
   */
  position?: Vector3Like;

  /**
   * The rotation of the rigid body.
   *
   * **Category:** Physics
   */
  rotation?: QuaternionLike;

  /**
   * The simulation the rigid body is in. If provided, the rigid body will be automatically added to the simulation.
   *
   * **Category:** Physics
   */
  simulation?: Simulation;
}

/**
 * The options for a dynamic rigid body, also the default type. @public
 *
 * Use for: physics-driven bodies affected by forces and collisions.
 * Do NOT use for: kinematic bodies; use the kinematic option types instead.
 *
 * **Category:** Physics
 */
export interface DynamicRigidBodyOptions extends BaseRigidBodyOptions {
  type: RigidBodyType.DYNAMIC;

  /**
   * The additional mass of the rigid body.
   *
   * **Category:** Physics
   */
  additionalMass?: number;

  /**
   * The additional mass properties of the rigid body.
   *
   * **Category:** Physics
   */
  additionalMassProperties?: RigidBodyAdditionalMassProperties;

  /**
   * The additional solver iterations of the rigid body.
   *
   * **Category:** Physics
   */
  additionalSolverIterations?: number;

  /**
   * The angular damping of the rigid body.
   *
   * **Category:** Physics
   */
  angularDamping?: number;
  
  /**
   * The angular velocity of the rigid body.
   *
   * **Category:** Physics
   */
  angularVelocity?: Vector3Like;

  /**
   * Whether the rigid body has continuous collision detection enabled.
   *
   * **Category:** Physics
   */
  ccdEnabled?: boolean;

  /**
   * The dominance group of the rigid body.
   *
   * **Category:** Physics
   */
  dominanceGroup?: number;

  /**
   * The enabled axes of positional movement of the rigid body.
   *
   * **Category:** Physics
   */
  enabledPositions?: Vector3Boolean;

  /**
   * The enabled rotations of the rigid body.
   *
   * **Category:** Physics
   */
  enabledRotations?: Vector3Boolean;

  /**
   * The gravity scale of the rigid body.
   *
   * **Category:** Physics
   */
  gravityScale?: number;

  /**
   * The linear damping of the rigid body.
   *
   * **Category:** Physics
   */
  linearDamping?: number;

  /**
   * The linear velocity of the rigid body.
   *
   * **Category:** Physics
   */
  linearVelocity?: Vector3Like;

  /**
   * Whether the rigid body is sleeping.
   *
   * **Category:** Physics
   */
  sleeping?: boolean;

  /**
   * The soft continuous collision detection prediction of the rigid body.
   *
   * **Category:** Physics
   */
  softCcdPrediction?: number;
}

/**
 * The options for a fixed rigid body. @public
 *
 * Use for: immovable bodies (world geometry, static platforms).
 * Do NOT use for: moving objects; use dynamic or kinematic options.
 *
 * **Category:** Physics
 */
export interface FixedRigidBodyOptions extends BaseRigidBodyOptions {
  type: RigidBodyType.FIXED;
}

/**
 * The options for a kinematic position rigid body. @public
 *
 * Use for: moving bodies by setting target positions each tick.
 * Do NOT use for: physics-driven motion; use dynamic bodies instead.
 *
 * **Category:** Physics
 */
export interface KinematicPositionRigidBodyOptions extends BaseRigidBodyOptions {
  type: RigidBodyType.KINEMATIC_POSITION;
}

/**
 * The options for a kinematic velocity rigid body. @public
 *
 * Use for: moving bodies by setting velocities each tick.
 * Do NOT use for: physics-driven motion; use dynamic bodies instead.
 *
 * **Category:** Physics
 */
export interface KinematicVelocityRigidBodyOptions extends BaseRigidBodyOptions {
  type: RigidBodyType.KINEMATIC_VELOCITY;

  /**
   * The angular velocity of the rigid body.
   *
   * **Category:** Physics
   */
  angularVelocity?: Vector3Like;

  /**
   * The linear velocity of the rigid body.
   *
   * **Category:** Physics
   */
  linearVelocity?: Vector3Like;
}

/**
 * The options for a rigid body. @public
 *
 * Use for: constructing rigid bodies; choose an option type matching `RigidBodyType`.
 * Do NOT use for: runtime changes; use `RigidBody` methods instead.
 *
 * **Category:** Physics
 */
export type RigidBodyOptions =
  | DynamicRigidBodyOptions
  | FixedRigidBodyOptions
  | KinematicPositionRigidBodyOptions
  | KinematicVelocityRigidBodyOptions;

/**
 * Represents a rigid body in a world's physics simulation.
 *
 * When to use: physics-simulated or kinematic objects that need forces, collisions, or velocity.
 * Do NOT use for: purely visual transforms; use entity transforms without physics when possible.
 *
 * @remarks
 * Provide `simulation` in `RigidBodyOptions` or call `RigidBody.addToSimulation` to create the
 * underlying physics body. Many methods are type-specific (dynamic vs kinematic); see `RigidBody.setType`.
 *
 * **Category:** Physics
 * @public
 */
export default class RigidBody extends EventRouter {
  /**
   * @internal
   */
  private _additionalMass: number = 0;

  /**
   * @internal
   */
  private _colliders: Set<Collider> = new Set();

  /**
   * @internal
   */
  private _explicitSleep: boolean = false;

  /**
   * @internal
   */
  private _enabledPositions: Vector3Boolean = { x: true, y: true, z: true }; 

  /**
   * @internal
   */
  private _enabledRotations: Vector3Boolean = { x: true, y: true, z: true };

  /**
   * @internal
   */
  private _rigidBody: RAPIER.RigidBody | undefined;

  /**
   * @internal
   */
  private _rigidBodyDesc: RAPIER.RigidBodyDesc | undefined;

  /**
   * @internal
   */
  private _rigidBodyType: RigidBodyType;

  /**
   * @internal
   */
  private _simulation: Simulation | undefined;

  /**
   * Creates a rigid body with the provided options.
   *
   * Use for: configuring physics behavior before adding to a simulation.
   * Do NOT use for: immediate physics queries; the rigid body must be simulated first.
   *
   * @param options - The options for the rigid body instance.
   *
   * **Category:** Physics
   */
  public constructor(options: RigidBodyOptions) {
    super();

    options.type ??= DEFAULT_RIGID_BODY_TYPE;

    this._rigidBodyDesc = this._createRigidBodyDesc(options);
    this._rigidBodyType = options.type;
    this._applyRigidBodyOptions(options);
    this._autoAddToSimulation(options);
  }

  /*
   * Getters
   */

  /**
   * The additional mass of the rigid body.
   *
   * **Category:** Physics
   */
  public get additionalMass(): number {
    if (!this._requireNotRemoved('additionalMass')) { return 0; }

    return this._additionalMass;
  }

  /**
   * The additional solver iterations of the rigid body.
   *
   * **Category:** Physics
   */
  public get additionalSolverIterations(): number {
    if (!this._requireNotRemoved('additionalSolverIterations')) { return 0; }

    return this._rigidBody
      ? this._rigidBody.additionalSolverIterations()
      : this._rigidBodyDesc!.additionalSolverIterations;
  }

  /**
   * The angular damping of the rigid body.
   *
   * **Category:** Physics
   */
  public get angularDamping(): number {
    if (!this._requireNotRemoved('angularDamping')) { return 0; }

    return this._rigidBody
      ? this._rigidBody.angularDamping()
      : this._rigidBodyDesc!.angularDamping;
  }

  /**
   * The angular velocity of the rigid body.
   *
   * **Category:** Physics
   */
  public get angularVelocity(): Vector3Like {
    if (!this._requireNotRemoved('angularVelocity')) { return { x: 0, y: 0, z: 0 }; }

    return this._rigidBody
      ? this._rigidBody.angvel()
      : this._rigidBodyDesc!.angvel;
  }

  /**
   * The colliders of the rigid body.
   *
   * **Category:** Physics
   */
  public get colliders(): Set<Collider> {
    return this._colliders;
  }

  /**
   * The dominance group of the rigid body.
   *
   * **Category:** Physics
   */
  public get dominanceGroup(): number {
    if (!this._requireNotRemoved('dominanceGroup')) { return 0; }

    return this._rigidBody
      ? this._rigidBody.dominanceGroup()
      : this._rigidBodyDesc!.dominanceGroup;
  }

  /**
   * The direction from the rotation of the rigid body. (-Z identity)
   *
   * **Category:** Physics
   */
  public get directionFromRotation(): Vector3Like {
    const { x, y, z, w } = this.rotation;

    return {
      x: -2 * (x*z + w*y),
      y: -2 * (y*z - w*x),
      z: -(1 - 2 * (x*x + y*y)),
    };
  }

  /**
   * The effective angular inertia of the rigid body.
   *
   * **Category:** Physics
   */
  public get effectiveAngularInertia(): SpdMatrix3 | undefined {
    if (!this._requireNotRemoved('effectiveAngularInertia')) { return undefined; }

    return this._rigidBody
      ? this._rigidBody.effectiveAngularInertia()
      : undefined;
  }

  /**
   * The effective inverse mass of the rigid body.
   *
   * **Category:** Physics
   */
  public get effectiveInverseMass(): Vector3Like | undefined {
    if (!this._requireNotRemoved('effectiveInverseMass')) { return undefined; }

    return this._rigidBody
      ? this._rigidBody.effectiveInvMass()
      : undefined;
  }

  /**
   * The enabled axes of rotational movement of the rigid body.
   *
   * **Category:** Physics
   */
  public get enabledRotations(): Vector3Boolean {
    if (!this._requireNotRemoved('enabledRotations')) { return { x: true, y: true, z: true }; }

    return this._enabledRotations;
  }

  /**
   * The enabled axes of positional movement of the rigid body.
   *
   * **Category:** Physics
   */
  public get enabledPositions(): Vector3Boolean {
    if (!this._requireNotRemoved('enabledPositions')) { return { x: true, y: true, z: true }; }

    return this._enabledPositions;
  }

  /**
   * The gravity scale of the rigid body.
   *
   * **Category:** Physics
   */
  public get gravityScale(): number {
    if (!this._requireNotRemoved('gravityScale')) { return 0; }

    return this._rigidBody
      ? this._rigidBody.gravityScale()
      : this._rigidBodyDesc!.gravityScale;
  }

  /**
   * The inverse mass of the rigid body.
   *
   * **Category:** Physics
   */
  public get inverseMass(): number | undefined {
    if (!this._requireNotRemoved('inverseMass')) { return undefined; }

    return this._rigidBody
      ? this._rigidBody.invMass()
      : undefined;
  }

  /**
   * Whether the rigid body has continuous collision detection enabled.
   *
   * **Category:** Physics
   */
  public get isCcdEnabled(): boolean {
    if (!this._requireNotRemoved('isCcdEnabled')) { return false; }

    return this._rigidBody
      ? this._rigidBody.isCcdEnabled()
      : this._rigidBodyDesc!.ccdEnabled;
  }

  /**
   * Whether the rigid body is dynamic.
   *
   * **Category:** Physics
   */
  public get isDynamic(): boolean {
    if (!this._requireNotRemoved('isDynamic')) { return false; }

    return this._rigidBodyType === RigidBodyType.DYNAMIC;
  }

  /**
   * Whether the rigid body is enabled.
   *
   * **Category:** Physics
   */
  public get isEnabled(): boolean {
    if (!this._requireNotRemoved('isEnabled')) { return false; }

    return this._rigidBody
      ? this._rigidBody.isEnabled()
      : this._rigidBodyDesc!.enabled;
  }

  /**
   * Whether the rigid body is fixed.
   *
   * **Category:** Physics
   */
  public get isFixed(): boolean {
    if (!this._requireNotRemoved('isFixed')) { return false; }

    return this._rigidBodyType === RigidBodyType.FIXED;
  }

  /**
   * Whether the rigid body is kinematic.
   *
   * **Category:** Physics
   */
  public get isKinematic(): boolean {
    if (!this._requireNotRemoved('isKinematic')) { return false; }

    return [ RigidBodyType.KINEMATIC_POSITION, RigidBodyType.KINEMATIC_VELOCITY ].includes(this._rigidBodyType);
  }

  /**
   * Whether the rigid body is kinematic position based.
   *
   * **Category:** Physics
   */
  public get isKinematicPositionBased(): boolean {
    if (!this._requireNotRemoved('isKinematicPositionBased')) { return false; }

    return this._rigidBodyType === RigidBodyType.KINEMATIC_POSITION;
  }

  /**
   * Whether the rigid body is kinematic velocity based.
   *
   * **Category:** Physics
   */
  public get isKinematicVelocityBased(): boolean {
    if (!this._requireNotRemoved('isKinematicVelocityBased')) { return false; }

    return this._rigidBodyType === RigidBodyType.KINEMATIC_VELOCITY;
  }

  /**
   * Whether the rigid body is moving.
   *
   * **Category:** Physics
   */
  public get isMoving(): boolean {
    if (!this._requireNotRemoved('isMoving')) { return false; }

    return this._rigidBody
      ? this._rigidBody.isMoving()
      : false;
  }

  /**
   * Whether the rigid body has been removed from the simulation.
   *
   * **Category:** Physics
   */
  public get isRemoved(): boolean {
    return !this._rigidBody && !this._rigidBodyDesc;
  }

  /**
   * Whether the rigid body is simulated.
   *
   * **Category:** Physics
   */
  public get isSimulated(): boolean {
    if (!this._requireNotRemoved('isSimulated')) { return false; }

    return this._rigidBody
      ? true
      : false;
  }

  /**
   * Whether the rigid body is sleeping.
   *
   * **Category:** Physics
   */
  public get isSleeping(): boolean {
    if (!this._requireNotRemoved('isSleeping')) { return false; }

    return this._rigidBody
      ? this._rigidBody.isSleeping()
      : this._rigidBodyDesc!.sleeping;
  }

  /**
   * The linear damping of the rigid body.
   *
   * **Category:** Physics
   */
  public get linearDamping(): number {
    if (!this._requireNotRemoved('linearDamping')) { return 0; }

    return this._rigidBody
      ? this._rigidBody.linearDamping()
      : this._rigidBodyDesc!.linearDamping;
  }

  /**
   * The linear velocity of the rigid body.
   *
   * **Category:** Physics
   */
  public get linearVelocity(): Vector3Like {
    if (!this._requireNotRemoved('linearVelocity')) { return { x: 0, y: 0, z: 0 }; }

    return this._rigidBody
      ? this._rigidBody.linvel()
      : this._rigidBodyDesc!.linvel;
  }

  /**
   * The local center of mass of the rigid body.
   *
   * **Category:** Physics
   */
  public get localCenterOfMass(): Vector3Like {
    if (!this._requireNotRemoved('localCenterOfMass')) { return { x: 0, y: 0, z: 0 }; }

    return this._rigidBody
      ? this._rigidBody.localCom()
      : this._rigidBodyDesc!.centerOfMass;
  }

  /**
   * The mass of the rigid body.
   *
   * **Category:** Physics
   */
  public get mass(): number {
    if (!this._requireNotRemoved('mass')) { return 0; }

    return this._rigidBody
      ? this._rigidBody.mass()
      : this._rigidBodyDesc!.mass;
  }

  /**
   * The next kinematic rotation of the rigid body.
   *
   * **Category:** Physics
   */
  public get nextKinematicRotation(): QuaternionLike {
    if (!this._requireNotRemoved('nextKinematicRotation')) { return { x: 0, y: 0, z: 0, w: 1 }; }

    return this._rigidBody
      ? this._rigidBody.nextRotation()
      : this._rigidBodyDesc!.rotation;
  }

  /**
   * The next kinematic position of the rigid body.
   *
   * **Category:** Physics
   */
  public get nextKinematicPosition(): Vector3Like {
    if (!this._requireNotRemoved('nextKinematicPosition')) { return { x: 0, y: 0, z: 0 }; }

    return this._rigidBody
      ? this._rigidBody.nextTranslation()
      : this._rigidBodyDesc!.translation;
  }

  /**
   * The number of colliders in the rigid body.
   *
   * **Category:** Physics
   */
  public get numColliders(): number {
    return this._colliders.size;
  }

  /**
   * The principal angular inertia of the rigid body.
   *
   * **Category:** Physics
   */
  public get principalAngularInertia(): Vector3Like {
    if (!this._requireNotRemoved('principalAngularInertia')) { return { x: 0, y: 0, z: 0 }; }

    return this._rigidBody
      ? this._rigidBody.principalInertia()
      : this._rigidBodyDesc!.principalAngularInertia;
  }

  /**
   * The principal angular inertia local frame of the rigid body.
   *
   * **Category:** Physics
   */
  public get principalAngularInertiaLocalFrame(): QuaternionLike | undefined {
    if (!this._requireNotRemoved('principalAngularInertiaLocalFrame')) { return undefined; }

    return this._rigidBody
      ? this._rigidBody.principalInertiaLocalFrame()
      : undefined;
  }

  /**
   * The position of the rigid body.
   *
   * **Category:** Physics
   */
  public get position(): Vector3Like {
    if (!this._requireNotRemoved('position')) { return { x: 0, y: 0, z: 0 }; }

    return this._rigidBody
      ? this._rigidBody.translation()
      : this._rigidBodyDesc!.translation;
  }

  /**
   * The raw RAPIER rigid body instance.
   *
   * **Category:** Physics
   */
  public get rawRigidBody(): RAPIER.RigidBody | undefined {
    if (!this._requireNotRemoved('rawRigidBody')) { return undefined; }

    return this._rigidBody;
  }

  /**
   * The rotation of the rigid body.
   *
   * **Category:** Physics
   */
  public get rotation(): QuaternionLike {
    if (!this._requireNotRemoved('rotation')) { return { x: 0, y: 0, z: 0, w: 1 }; }

    return this._rigidBody
      ? this._rigidBody.rotation()
      : this._rigidBodyDesc!.rotation;
  }

  /**
   * The soft continuous collision detection prediction of the rigid body.
   *
   * **Category:** Physics
   */
  public get softCcdPrediction(): number {
    if (!this._requireNotRemoved('softCcdPrediction')) { return 0; }

    return this._rigidBody
      ? this._rigidBody.softCcdPrediction()
      : this._rigidBodyDesc!.softCcdPrediction;
  }

  /**
   * The type of the rigid body.
   *
   * **Category:** Physics
   */
  public get type(): RigidBodyType {
    if (!this._requireNotRemoved('type')) { return RigidBodyType.DYNAMIC; }

    return this._rigidBodyType;
  }

  /**
   * The world center of mass of the rigid body.
   *
   * **Category:** Physics
   */
  public get worldCenterOfMass(): Vector3Like | undefined {
    if (!this._requireNotRemoved('worldCenterOfMass')) { return undefined; }

    return this._rigidBody
      ? this._rigidBody.worldCom()
      : undefined;
  }

  /*
   * Setters
   */

  /**
   * Sets the additional mass of the rigid body.
   * @param additionalMass - The additional mass of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setAdditionalMass(additionalMass: number) {
    if (!this._requireDynamic('setAdditionalMass')) { return; }
    if (!this._requireNotRemoved('setAdditionalMass')) { return; }

    this._rigidBody
      ? this._rigidBody.setAdditionalMass(additionalMass, !this._explicitSleep)
      : this._rigidBodyDesc!.setAdditionalMass(additionalMass);
  }

  /**
   * Sets the additional mass properties of the rigid body.
   * @param additionalMassProperties - The additional mass properties of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setAdditionalMassProperties(additionalMassProperties: RigidBodyAdditionalMassProperties): void {
    if (!this._requireDynamic('setAdditionalMassProperties')) { return; }
    if (!this._requireNotRemoved('setAdditionalMassProperties')) { return; }

    const { additionalMass, centerOfMass, principalAngularInertia, principalAngularInertiaLocalFrame } = additionalMassProperties;

    this._rigidBody
      ? this._rigidBody.setAdditionalMassProperties(additionalMass, centerOfMass, principalAngularInertia, principalAngularInertiaLocalFrame, !this._explicitSleep)
      : this._rigidBodyDesc!.setAdditionalMassProperties(additionalMass, centerOfMass, principalAngularInertia, principalAngularInertiaLocalFrame);
  }


  /**
   * Sets the additional solver iterations of the rigid body.
   * @param solverIterations - The additional solver iterations of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setAdditionalSolverIterations(solverIterations: number) {
    if (!this._requireDynamic('setAdditionalSolverIterations')) { return; }
    if (!this._requireNotRemoved('setAdditionalSolverIterations')) { return; }

    this._rigidBody
      ? this._rigidBody.setAdditionalSolverIterations(solverIterations)
      : this._rigidBodyDesc!.setAdditionalSolverIterations(solverIterations);
  }

  /**
   * Sets the angular damping of the rigid body.
   * @param angularDamping - The angular damping of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setAngularDamping(angularDamping: number) {
    if (!this._requireDynamic('setAngularDamping')) { return; }
    if (!this._requireNotRemoved('setAngularDamping')) { return; }

    this._rigidBody
      ? this._rigidBody.setAngularDamping(angularDamping)
      : this._rigidBodyDesc!.setAngularDamping(angularDamping);
  }

  /**
   * Sets the angular velocity of the rigid body.
   * @param angularVelocity - The angular velocity of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setAngularVelocity(angularVelocity: Vector3Like) {
    if (!this._requireNotKinematicPositionBased('setAngularVelocity')) { return; }
    if (!this._requireNotRemoved('setAngularVelocity')) { return; }

    this._rigidBody
      ? this._rigidBody.setAngvel(angularVelocity, !this._explicitSleep)
      : this._rigidBodyDesc!.setAngvel(angularVelocity);
  }

  /**
   * Sets whether the rigid body has continuous collision detection enabled.
   * @param ccdEnabled - Whether the rigid body has continuous collision detection enabled.
   *
   *
   * **Category:** Physics
   */
  public setCcdEnabled(ccdEnabled: boolean) {
    if (!this._requireDynamic('setCcdEnabled')) { return; }
    if (!this._requireNotRemoved('setCcdEnabled')) { return; }

    this._rigidBody
      ? this._rigidBody.enableCcd(ccdEnabled)
      : this._rigidBodyDesc!.setCcdEnabled(ccdEnabled);
  }

  /**
   * Sets the dominance group of the rigid body.
   * @param dominanceGroup - The dominance group of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setDominanceGroup(dominanceGroup: number) {
    if (!this._requireDynamic('setDominanceGroup')) { return; }
    if (!this._requireNotRemoved('setDominanceGroup')) { return; }

    this._rigidBody
      ? this._rigidBody.setDominanceGroup(dominanceGroup)
      : this._rigidBodyDesc!.setDominanceGroup(dominanceGroup);
  }

  /**
   * Sets whether the rigid body is enabled.
   * @param enabled - Whether the rigid body is enabled.
   *
   *
   * **Category:** Physics
   */
  public setEnabled(enabled: boolean) {
    if (!this._requireNotRemoved('setEnabled')) { return; }

    this._rigidBody
      ? this._rigidBody.setEnabled(enabled)
      : this._rigidBodyDesc!.setEnabled(enabled);
  }

  /**
   * Sets whether the rigid body has enabled positional movement.
   * @param enabledPositions - Whether the rigid body has enabled positional movement.
   *
   *
   * **Category:** Physics
   */
  public setEnabledPositions(enabledPositions: Vector3Boolean) {
    if (!this._requireDynamic('setEnabledPositions')) { return; }
    if (!this._requireNotRemoved('setEnabledPositions')) { return; }

    this._rigidBody
      ? this._rigidBody.setEnabledTranslations(enabledPositions.x, enabledPositions.y, enabledPositions.z, !this._explicitSleep)
      : this._rigidBodyDesc!.enabledTranslations(enabledPositions.x, enabledPositions.y, enabledPositions.z);

    this._enabledPositions = enabledPositions;
  }

  /**
   * Sets whether the rigid body has enabled rotations.
   * @param enabledRotations - Whether the rigid body has enabled rotations.
   *
   *
   * **Category:** Physics
   */
  public setEnabledRotations(enabledRotations: Vector3Boolean) {
    if (!this._requireDynamic('setEnabledRotations')) { return; }
    if (!this._requireNotRemoved('setEnabledRotations')) { return; }

    this._rigidBody
      ? this._rigidBody.setEnabledRotations(enabledRotations.x, enabledRotations.y, enabledRotations.z, !this._explicitSleep)
      : this._rigidBodyDesc!.enabledRotations(enabledRotations.x, enabledRotations.y, enabledRotations.z);

    this._enabledRotations = enabledRotations;
  }

  /**
   * Sets the gravity scale of the rigid body.
   * @param gravityScale - The gravity scale of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setGravityScale(gravityScale: number) {
    if (!this._requireDynamic('setGravityScale')) { return; }
    if (!this._requireNotRemoved('setGravityScale')) { return; }

    this._rigidBody
      ? this._rigidBody.setGravityScale(gravityScale, !this._explicitSleep)
      : this._rigidBodyDesc!.setGravityScale(gravityScale);
  }

  /**
   * Sets the linear damping of the rigid body.
   * @param linearDamping - The linear damping of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setLinearDamping(linearDamping: number) {
    if (!this._requireDynamic('setLinearDamping')) { return; }
    if (!this._requireNotRemoved('setLinearDamping')) { return; }

    this._rigidBody
      ? this._rigidBody.setLinearDamping(linearDamping)
      : this._rigidBodyDesc!.setLinearDamping(linearDamping);
  }

  /**
   * Sets the linear velocity of the rigid body.
   * @param linearVelocity - The linear velocity of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setLinearVelocity(linearVelocity: Vector3Like) {
    if (!this._requireNotKinematicPositionBased('setLinearVelocity')) { return; }
    if (!this._requireNotRemoved('setLinearVelocity')) { return; }

    this._rigidBody
      ? this._rigidBody.setLinvel(linearVelocity, !this._explicitSleep)
      : this._rigidBodyDesc!.setLinvel(linearVelocity.x, linearVelocity.y, linearVelocity.z);
  }

  /**
   * Sets the next kinematic rotation of the rigid body.
   *
   * Use for: kinematic bodies driven by explicit rotation each tick.
   * Do NOT use for: dynamic bodies; use torque or angular velocity instead.
   *
   * @param nextKinematicRotation - The next kinematic rotation of the rigid body.
   *
   * **Requires:** Rigid body must be kinematic.
   *
   * **Category:** Physics
   */
  public setNextKinematicRotation(nextKinematicRotation: QuaternionLike) {
    if (!this._requireKinematic('setNextKinematicRotation')) { return; }
    if (!this._requireNotRemoved('setNextKinematicRotation')) { return; }

    this._rigidBody
      ? this._rigidBody.setNextKinematicRotation(nextKinematicRotation)
      : this._rigidBodyDesc!.setRotation(nextKinematicRotation);
  }

  /**
   * Sets the next kinematic position of the rigid body.
   *
   * Use for: kinematic bodies driven by explicit position each tick.
   * Do NOT use for: dynamic bodies; use forces or velocity instead.
   *
   * @param nextKinematicPosition - The next kinematic position of the rigid body.
   *
   * **Requires:** Rigid body must be kinematic.
   *
   * **Category:** Physics
   */
  public setNextKinematicPosition(nextKinematicPosition: Vector3Like) {
    if (!this._requireKinematic('setNextKinematicPosition')) { return; }
    if (!this._requireNotRemoved('setNextKinematicPosition')) { return; }

    this._rigidBody
      ? this._rigidBody.setNextKinematicTranslation(nextKinematicPosition)
      : this._rigidBodyDesc!.setTranslation(nextKinematicPosition.x, nextKinematicPosition.y, nextKinematicPosition.z);
  }

  /**
   * Sets the position of the rigid body.
   *
   * @remarks
   * This teleports the body to the given position. For smooth motion,
   * prefer velocities or forces (dynamic) or next kinematic targets (kinematic).
   *
   * @param position - The position of the rigid body.
   *
   * **Category:** Physics
   */
  public setPosition(position: Vector3Like) {
    if (!this._requireNotRemoved('setPosition')) { return; }

    this._rigidBody
      ? this._rigidBody.setTranslation(position, !this._explicitSleep)
      : this._rigidBodyDesc!.setTranslation(position.x, position.y, position.z);
  }

  /**
   * Sets the rotation of the rigid body.
   *
   * @remarks
   * **Coordinate system:** Identity rotation (0,0,0,1 quaternion) means facing -Z.
   * For Y-axis rotation only (yaw), use: `{ x: 0, y: sin(yaw/2), z: 0, w: cos(yaw/2) }`.
   * A yaw of 0 faces -Z, positive yaw rotates counter-clockwise when viewed from above.
   *
   * This sets rotation immediately. For smooth rotation, use angular velocity (dynamic)
   * or next kinematic rotation (kinematic).
   *
   * @param rotation - The rotation of the rigid body.
   *
   * **Category:** Physics
   */
  public setRotation(rotation: QuaternionLike) {
    if (!this._requireNotRemoved('setRotation')) { return; }

    this._rigidBody
      ? this._rigidBody.setRotation(rotation, !this._explicitSleep)
      : this._rigidBodyDesc!.setRotation(rotation);
  }

  /**
   * Sets whether the rigid body is sleeping.
   * @param sleeping - Whether the rigid body is sleeping.
   *
   *
   * **Category:** Physics
   */
  public setSleeping(sleeping: boolean) {
    if (!this._requireDynamic('setSleeping')) { return; }
    if (!this._requireNotRemoved('setSleeping')) { return; }

    this._rigidBody
      ? sleeping ? this._rigidBody.sleep() : this._rigidBody.wakeUp()
      : this._rigidBodyDesc!.sleeping = sleeping;

    this._explicitSleep = sleeping;
  }

  /**
   * Sets the soft ccd prediction of the rigid body.
   * @param softCcdPrediction - The soft ccd prediction of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setSoftCcdPrediction(softCcdPrediction: number) {
    if (!this._requireDynamic('setSoftCcdPrediction')) { return; }
    if (!this._requireNotRemoved('setSoftCcdPrediction')) { return; }

    this._rigidBody
      ? this._rigidBody.setSoftCcdPrediction(softCcdPrediction)
      : this._rigidBodyDesc!.setSoftCcdPrediction(softCcdPrediction);
  }

  /**
   * Sets the collision groups for solid colliders (non-sensor) of the rigid body.
   * @param collisionGroups - The collision groups for solid colliders of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setCollisionGroupsForSolidColliders(collisionGroups: CollisionGroups) {
    if (!this._requireNotRemoved('setCollisionGroupsForSolidColliders')) {
      return;
    }

    this._colliders.forEach(collider => {
      if (collider.isSensor) { return; }
      collider.setCollisionGroups(collisionGroups);
    });
  }

  /**
   * Sets the collision groups for sensor colliders of the rigid body.
   * @param collisionGroups - The collision groups for sensor colliders of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public setCollisionGroupsForSensorColliders(collisionGroups: CollisionGroups) {
    if (!this._requireNotRemoved('setCollisionGroupsForSensorColliders')) {
      return;
    }

    this._colliders.forEach(collider => {
      if (!collider.isSensor) { return; }
      collider.setCollisionGroups(collisionGroups);
    });
  }

  /**
   * Sets the type of the rigid body.
   *
   * Use for: switching between dynamic, fixed, and kinematic behavior.
   * Do NOT use for: per-tick motion changes; prefer velocity or forces.
   *
   * @param type - The type of the rigid body.
   *
   * **Category:** Physics
   */
  public setType(type: RigidBodyType) {
    if (!this._requireNotRemoved('setType')) { return; }

    const typeMap: Record<RigidBodyType, RAPIER.RigidBodyType> = {
      [RigidBodyType.DYNAMIC]: RAPIER.RigidBodyType.Dynamic,
      [RigidBodyType.FIXED]: RAPIER.RigidBodyType.Fixed,
      [RigidBodyType.KINEMATIC_POSITION]: RAPIER.RigidBodyType.KinematicPositionBased,
      [RigidBodyType.KINEMATIC_VELOCITY]: RAPIER.RigidBodyType.KinematicVelocityBased,
    };

    const rapierRigidBodyType = typeMap[type];

    if (rapierRigidBodyType === undefined) {
      return ErrorHandler.error(`Invalid RigidBodyType: ${type}`);
    }

    this._rigidBody
      ? this._rigidBody.setBodyType(rapierRigidBodyType, !this._explicitSleep)
      : this._rigidBodyDesc!.status = rapierRigidBodyType;

    this._rigidBodyType = type;
  }

  /*
   * Other Methods
   */

  /**
   * Adds a force to the rigid body.
   *
   * @remarks
   * Dynamic bodies only; has no effect on fixed or kinematic bodies.
   *
   * @param force - The force to add to the rigid body.
   *
   * **Category:** Physics
   */
  public addForce(force: Vector3Like) {
    if (!this._requireNotRemoved('addForce')) { return; }
    if (!this._requireCreated('addForce')) { return; }
    if (!this._requireDynamic('addForce')) { return; }
    if (this._isNegligibleVector(force)) return;
    this._rigidBody!.addForce(force, !this._explicitSleep);
  }

  /**
   * Adds a torque to the rigid body.
   *
   * @remarks
   * Dynamic bodies only; has no effect on fixed or kinematic bodies.
   *
   * @param torque - The torque to add to the rigid body.
   *
   * **Category:** Physics
   */
  public addTorque(torque: Vector3Like) {
    if (!this._requireNotRemoved('addTorque')) { return; }
    if (!this._requireCreated('addTorque')) { return; }
    if (!this._requireDynamic('addTorque')) { return; }
    if (this._isNegligibleVector(torque)) return;
    this._rigidBody!.addTorque(torque, !this._explicitSleep);
  }

  /**
   * Adds an unsimulated child collider to the rigid body for the simulation it belongs to.
   * @param collider - The child collider to add to the rigid body for the simulation it belongs to.
   *
   *
   * **Category:** Physics
   */
  public addChildColliderToSimulation(collider: Collider) {
    if (!this._requireNotRemoved('addChildColliderToSimulation')) { return; }
    if (!this._requireCreated('addChildColliderToSimulation')) { return; }
    collider.addToSimulation(this._simulation!, this);
  }

  /**
   * Adds the rigid body to a simulation.
   *
   * @remarks
   * **Child colliders:** Also adds all pending child colliders to the simulation.
   * After this call, the rigid body is simulated and can respond to forces.
   *
   * @param simulation - The simulation to add the rigid body to.
   *
   * **Side effects:** Creates the underlying physics body and registers child colliders.
   *
   * **Category:** Physics
   */
  public addToSimulation(simulation: Simulation) {
    if (!this._requireNotRemoved('addToSimulation')) { return; }

    if (this._rigidBody) {
      return ErrorHandler.error('RigidBody.addToSimulation(): Rigid body already exists in the simulation!');
    }

    this._simulation = simulation;
    this._rigidBody = this._simulation.createRawRigidBody(this._rigidBodyDesc!);

    this._colliders.forEach(collider => {
      if (!collider.isSimulated) {
        collider.addToSimulation(simulation, this);
      }
    });
  }

  /**
   * Applies an impulse to the rigid body.
   *
   * @remarks
   * Dynamic bodies only; has no effect on fixed or kinematic bodies.
   *
   * @param impulse - The impulse to apply to the rigid body.
   *
   * **Category:** Physics
   */
  public applyImpulse(impulse: Vector3Like) {
    if (!this._requireNotRemoved('applyImpulse')) { return; }
    if (!this._requireCreated('applyImpulse')) { return; }
    if (!this._requireDynamic('applyImpulse')) { return; }
    if (this._isNegligibleVector(impulse)) return;
    this._rigidBody!.applyImpulse(impulse, !this._explicitSleep);
  }

  /**
   * Applies an impulse to the rigid body at a point.
   *
   * @remarks
   * Dynamic bodies only; has no effect on fixed or kinematic bodies.
   *
   * @param impulse - The impulse to apply to the rigid body.
   * @param point - The point at which to apply the impulse.
   *
   * **Category:** Physics
   */
  public applyImpulseAtPoint(impulse: Vector3Like, point: Vector3Like) {
    if (!this._requireNotRemoved('applyImpulseAtPoint')) { return; }
    if (!this._requireCreated('applyImpulseAtPoint')) { return; }
    if (!this._requireDynamic('applyImpulseAtPoint')) { return; }
    if (this._isNegligibleVector(impulse)) return;
    this._rigidBody!.applyImpulseAtPoint(impulse, point, !this._explicitSleep);
  }

  /**
   * Applies a torque impulse to the rigid body.
   *
   * @remarks
   * Dynamic bodies only; has no effect on fixed or kinematic bodies.
   *
   * @param impulse - The torque impulse to apply to the rigid body.
   *
   * **Category:** Physics
   */
  public applyTorqueImpulse(impulse: Vector3Like) {
    if (!this._requireNotRemoved('applyTorqueImpulse')) { return; }
    if (!this._requireCreated('applyTorqueImpulse')) { return; }
    if (!this._requireDynamic('applyTorqueImpulse')) { return; }
    this._rigidBody!.applyTorqueImpulse(impulse, !this._explicitSleep);
  }

  /**
   * Creates and adds a child collider to the rigid body for the simulation it belongs to.
   *
   * @remarks
   * If the rigid body is not simulated, the collider will be added to the rigid body as a pending child collider
   * and also simulated when the rigid body is simulated.
   *
   * @param colliderOptions - The options for the child collider to add.
   * @returns The child collider that was added to the rigid body, or null if failed.
   *
   *
   * **Category:** Physics
   */
  public createAndAddChildCollider(colliderOptions: ColliderOptions): Collider | null {
    if (!this._requireNotRemoved('createAndAddChildCollider')) { return null; }

    const collider = this._simulation ? new Collider({
      ...colliderOptions,
      parentRigidBody: this,
      simulation: this._simulation,
    }) : this._createAndAddPendingChildCollider(colliderOptions);

    return collider;
  }

  /**
   * Creates and adds multiple child colliders to the rigid body for the simulation it belongs to.
   *
   * @remarks
   * If the rigid body is not simulated, the colliders will be added to the rigid body as pending child colliders
   * and also simulated when the rigid body is simulated.
   *
   * @param colliderOptions - The options for the child colliders to add to the rigid body.
   * @returns The child colliders that were added to the rigid body.
   *
   *
   * **Category:** Physics
   */
  public createAndAddChildColliders(colliderOptions: ColliderOptions[]): Collider[] {
    const colliders: Collider[] = [];

    colliderOptions.forEach(colliderOption => {
      const collider = this.createAndAddChildCollider(colliderOption);
      if (collider) { colliders.push(collider); }
    });

    return colliders;
  }

  /**
   * Gets the colliders of the rigid body by tag.
   * @param tag - The tag to filter by.
   * @returns The colliders of the rigid body with the given tag.
   *
   *
   * **Category:** Physics
   */
  public getCollidersByTag(tag: string): Collider[] {
    const colliders: Collider[] = [];

    for (const collider of this._colliders) {
      if (collider.tag === tag) { colliders.push(collider); }
    }

    return colliders;
  }

  /**
   * @internal
   */
  public linkCollider(collider: Collider) {
    if (!this._requireNotRemoved('linkCollider')) { return; }

    if (collider.parentRigidBody !== this) {
      return ErrorHandler.error('RigidBody.linkCollider(): Collider cannot be linked because it is not a child of this rigid body!');
    }

    this._colliders.add(collider);
  }

  /**
   * Locks all rotations of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public lockAllRotations() {
    if (!this._requireNotRemoved('lockAllRotations')) { return; }
    this.setEnabledRotations({ x: false, y: false, z: false });
  }

  /**
   * Locks all positional movement of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public lockAllPositions() {
    if (!this._requireNotRemoved('lockAllPositions')) { return; }
    this.setEnabledPositions({ x: false, y: false, z: false });
  }

  /**
   * Removes the rigid body from the simulation it belongs to.
   *
   * @remarks
   * **Child colliders:** Also removes all child colliders from the simulation.
   *
   * **Side effects:** Unregisters the rigid body and all attached colliders.
   *
   * **Category:** Physics
   */
  public removeFromSimulation() {
    if (!this._requireNotRemoved('removeFromSimulation')) { return; }

    if (!this._rigidBody) {
      return ErrorHandler.error('RigidBody.removeFromSimulation(): Rigid body does not exist in the simulation!');
    }

    this._colliders.forEach(collider => {
      collider.removeFromSimulation();
    });

    this._simulation!.removeRawRigidBody(this._rigidBody);

    this._simulation = undefined;
    this._rigidBody = undefined;
  }

  /**
   * @internal
   */
  public unlinkCollider(collider: Collider) {
    if (!this._requireNotRemoved('unlinkCollider')) { return; }

    if (!collider.isRemoved) {
      return ErrorHandler.error('RigidBody.unlinkCollider(): Collider is still simulated and therefore cannot be unlinked from this rigid body!');
    }

    this._colliders.delete(collider);
  }

  /**
   * Resets the angular velocity of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public resetAngularVelocity() {
    if (!this._requireNotRemoved('resetAngularVelocity')) { return; }
    if (!this._requireCreated('resetAngularVelocity')) { return; }

    this.setAngularVelocity({ x: 0, y: 0, z: 0 });
  }

  /**
   * Resets the forces actiong on the rigid body.
   *
   *
   * **Category:** Physics
   */
  public resetForces() {
    if (!this._requireNotRemoved('resetForces')) { return; }
    if (!this._requireCreated('resetForces')) { return; }

    this._rigidBody!.resetForces(!this._explicitSleep);
  }

  /**
   * Resets the linear velocity of the rigid body.
   *
   *
   * **Category:** Physics
   */
  public resetLinearVelocity() {
    if (!this._requireNotRemoved('resetLinearVelocity')) { return; }
    if (!this._requireCreated('resetLinearVelocity')) { return; }

    this.setLinearVelocity({ x: 0, y: 0, z: 0 });
  }

  /**
   * Resets the torques acting on the rigid body.
   *
   *
   * **Category:** Physics
   */
  public resetTorques() {
    if (!this._requireNotRemoved('resetTorques')) { return; }
    if (!this._requireCreated('resetTorques')) { return; }

    this._rigidBody!.resetTorques(!this._explicitSleep);
  }

  /**
   * Explicitly puts the rigid body to sleep. Physics otherwise optimizes sleeping.
   *
   *
   * **Category:** Physics
   */
  public sleep() {
    if (!this._requireNotRemoved('sleep')) { return; }
    this.setSleeping(true);
  }

  /**
   * Wakes up the rigid body. Physics otherwise optimizes waking it when necessary.
   *
   *
   * **Category:** Physics
   */
  public wakeUp() {
    if (!this._requireNotRemoved('wakeUp')) { return; }
    this.setSleeping(false);
  }

  /*
   * Helpers
   */

  /**
   * @internal
   */
  private _applyRigidBodyOptions(options: RigidBodyOptions) {
    const setters: Array<[string, (value: any) => void]> = [
      [ 'additionalMass', this.setAdditionalMass.bind(this) ],
      [ 'additionalMassProperties', this.setAdditionalMassProperties.bind(this) ],
      [ 'additionalSolverIterations', this.setAdditionalSolverIterations.bind(this) ],
      [ 'angularDamping', this.setAngularDamping.bind(this) ],
      [ 'angularVelocity', this.setAngularVelocity.bind(this) ],
      [ 'dominanceGroup', this.setDominanceGroup.bind(this) ],
      [ 'ccdEnabled', this.setCcdEnabled.bind(this) ],
      [ 'enabled', this.setEnabled.bind(this) ],
      [ 'enabledPositions', this.setEnabledPositions.bind(this) ],
      [ 'enabledRotations', this.setEnabledRotations.bind(this) ],
      [ 'gravityScale', this.setGravityScale.bind(this) ],
      [ 'linearDamping', this.setLinearDamping.bind(this) ],
      [ 'linearVelocity', this.setLinearVelocity.bind(this) ],
      [ 'position', this.setPosition.bind(this) ],
      [ 'rotation', this.setRotation.bind(this) ],
      [ 'sleeping', this.setSleeping.bind(this) ],
      [ 'softCcdPrediction', this.setSoftCcdPrediction.bind(this) ],
    ];

    setters.forEach(([ key, setter ]) => {
      if (key in options) {
        setter(options[key as keyof typeof options]);
      }
    });
  }

  /**
   * @internal
   */
  private _autoAddToSimulation(options: RigidBodyOptions): void {
    if (options.colliders) {
      this._createAndAddPendingChildColliders(options.colliders);
    }
    
    if (options.simulation) {
      this.addToSimulation(options.simulation);
    }
  }

  /**
   * @internal
   */
  private _createAndAddPendingChildCollider(colliderOptions: ColliderOptions): Collider | null {
    if (!this._requireNotRemoved('createAndAddPendingChildCollider')) { return null; }
    if (!this._requireNotSimulated('createAndAddPendingChildCollider')) { return null; }

    const pendingCollider = new Collider(colliderOptions);

    this._colliders.add(pendingCollider);

    return pendingCollider;
  }

  /**
   * @internal
   */
  private _createAndAddPendingChildColliders(colliderOptions: ColliderOptions[]): Collider[] {
    const pendingColliders: Collider[] = [];

    colliderOptions.forEach(colliderOption => {
      const collider = this._createAndAddPendingChildCollider(colliderOption);
      if (collider) { pendingColliders.push(collider); }
    });

    return pendingColliders;
  }

  /**
   * @internal
   */
  private _createRigidBodyDesc(options: RigidBodyOptions): RAPIER.RigidBodyDesc {
    const type = options.type ?? DEFAULT_RIGID_BODY_TYPE;

    const descCreators = {
      [RigidBodyType.DYNAMIC]: () => RAPIER.RigidBodyDesc.dynamic(),
      [RigidBodyType.FIXED]: () => RAPIER.RigidBodyDesc.fixed(),
      [RigidBodyType.KINEMATIC_POSITION]: () => RAPIER.RigidBodyDesc.kinematicPositionBased(),
      [RigidBodyType.KINEMATIC_VELOCITY]: () => RAPIER.RigidBodyDesc.kinematicVelocityBased(),
    };

    return descCreators[type]();
  }

  /**
   * @internal
   */
  private _requireCreated(methodName: string): boolean {
    if (!this._rigidBody || !this._simulation) {
      ErrorHandler.error(`RigidBody._requireCreated(): Rigid body has not been created and therefore does not support the invoked method: ${methodName}()`);
    }

    return !!this._rigidBody && !!this._simulation;
  }

  /**
   * @internal
   */
  private _requireDynamic(methodName: string): boolean {
    if (!this.isDynamic) {
      ErrorHandler.error(`RigidBody._requireDynamic(): Rigid body is not dynamic and therefore does not support the invoked method: ${methodName}()`);
    }

    return this.isDynamic;
  }

  /**
   * @internal
   */
  private _requireKinematic(methodName: string): boolean {
    if (!this.isKinematic) {
      ErrorHandler.error(`RigidBody._requireKinematic(): Rigid body is not kinematic and therefore does not support the invoked method: ${methodName}()`);
    }

    return this.isKinematic;
  }

  /**
   * @internal
   */
  private _requireNotKinematicPositionBased(methodName: string): boolean {
    if (this.isKinematicPositionBased) {
      ErrorHandler.error(`RigidBody._requireNotKinematicPositionBased(): Rigid body is kinematic position based and therefore does not support the invoked method: ${methodName}()`);
    }

    return !this.isKinematicPositionBased;
  }

  /**
   * @internal
   */
  private _requireNotRemoved(methodName: string): boolean {
    if (!this._rigidBody && !this._rigidBodyDesc) {
      ErrorHandler.error(`RigidBody._requireNotRemoved(): Rigid body has been removed and therefore does not support the invoked method: ${methodName}()`);
    }

    return !!this._rigidBody || !!this._rigidBodyDesc;
  }

  /**
   * @internal
   */
  private _requireNotSimulated(methodName: string): boolean {
    if (this.isSimulated) {
      ErrorHandler.error(`RigidBody._requireNotSimulated(): Rigid body is simulated and therefore does not support the invoked method: ${methodName}()`);
    }

    return !this.isSimulated;
  }

  /**
   * @internal
   */
  private _isNegligibleVector(vector: RAPIER.Vector): boolean {
    return Math.abs(vector.x) < DEFAULT_PRECISION_THRESHOLD &&
           Math.abs(vector.y) < DEFAULT_PRECISION_THRESHOLD && 
           Math.abs(vector.z) < DEFAULT_PRECISION_THRESHOLD;
  }
}
