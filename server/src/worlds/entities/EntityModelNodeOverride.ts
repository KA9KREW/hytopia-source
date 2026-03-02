import protocol from '@hytopia.com/server-protocol';
import Serializer from '@/networking/Serializer';
import type Entity from '@/worlds/entities/Entity';
import type QuaternionLike from '@/shared/types/math/QuaternionLike';
import type RgbColor from '@/shared/types/RgbColor';
import type Vector3Like from '@/shared/types/math/Vector3Like';

/**
 * The options for creating an EntityModelNodeOverride instance.
 *
 * **Category:** Entities
 * @public
 */
export interface EntityModelNodeOverrideOptions {
  /** The node name match selector. Case-insensitive exact match by default, with optional edge wildcard (`head*`, `*head`, `*head*`). */
  nameMatch: string;

  /** The entity that the model node override belongs to. */
  entity: Entity;

  /** The emissive color for matching nodes. */
  emissiveColor?: RgbColor;

  /** The emissive intensity for matching nodes. */
  emissiveIntensity?: number;

  /** The hidden state for matching nodes. */
  hidden?: boolean;

  /** The local position for matching nodes. */
  localPosition?: Vector3Like;

  /** The interpolation time in milliseconds applied to local position changes. */
  localPositionInterpolationMs?: number;

  /** The local rotation for matching nodes. */
  localRotation?: QuaternionLike;

  /** The interpolation time in milliseconds applied to local rotation changes. */
  localRotationInterpolationMs?: number;

  /** The local scale for matching nodes. */
  localScale?: Vector3Like | number;

  /** The interpolation time in milliseconds applied to local scale changes. */
  localScaleInterpolationMs?: number;
}

/**
 * Event types an EntityModelNodeOverride instance can emit.
 *
 * See `EntityModelNodeOverrideEventPayloads` for payloads.
 *
 * **Category:** Events
 * @public
 */
export enum EntityModelNodeOverrideEvent {
  SET_EMISSIVE_COLOR                  = 'ENTITY_MODEL_NODE_OVERRIDE.SET_EMISSIVE_COLOR',
  SET_EMISSIVE_INTENSITY              = 'ENTITY_MODEL_NODE_OVERRIDE.SET_EMISSIVE_INTENSITY',
  SET_HIDDEN                          = 'ENTITY_MODEL_NODE_OVERRIDE.SET_HIDDEN',
  SET_LOCAL_POSITION                  = 'ENTITY_MODEL_NODE_OVERRIDE.SET_LOCAL_POSITION',
  SET_LOCAL_POSITION_INTERPOLATION_MS = 'ENTITY_MODEL_NODE_OVERRIDE.SET_LOCAL_POSITION_INTERPOLATION_MS',
  SET_LOCAL_ROTATION                  = 'ENTITY_MODEL_NODE_OVERRIDE.SET_LOCAL_ROTATION',
  SET_LOCAL_ROTATION_INTERPOLATION_MS = 'ENTITY_MODEL_NODE_OVERRIDE.SET_LOCAL_ROTATION_INTERPOLATION_MS',
  SET_LOCAL_SCALE                     = 'ENTITY_MODEL_NODE_OVERRIDE.SET_LOCAL_SCALE',
  SET_LOCAL_SCALE_INTERPOLATION_MS    = 'ENTITY_MODEL_NODE_OVERRIDE.SET_LOCAL_SCALE_INTERPOLATION_MS',
}

/**
 * Event payloads for EntityModelNodeOverride emitted events.
 *
 * **Category:** Events
 * @public
 */
export interface EntityModelNodeOverrideEventPayloads {
  /** Emitted when the emissive color for matching nodes is set. */
  [EntityModelNodeOverrideEvent.SET_EMISSIVE_COLOR]:                  { entityModelNodeOverride: EntityModelNodeOverride, emissiveColor: RgbColor | undefined };

  /** Emitted when the emissive intensity for matching nodes is set. */
  [EntityModelNodeOverrideEvent.SET_EMISSIVE_INTENSITY]:              { entityModelNodeOverride: EntityModelNodeOverride, emissiveIntensity: number | undefined };

  /** Emitted when the hidden state for matching nodes is set. */
  [EntityModelNodeOverrideEvent.SET_HIDDEN]:                          { entityModelNodeOverride: EntityModelNodeOverride, hidden: boolean };

  /** Emitted when the position for matching nodes is set. */
  [EntityModelNodeOverrideEvent.SET_LOCAL_POSITION]:                  { entityModelNodeOverride: EntityModelNodeOverride, localPosition: Vector3Like | undefined };

  /** Emitted when the interpolation time in milliseconds applied to local position changes is set. */
  [EntityModelNodeOverrideEvent.SET_LOCAL_POSITION_INTERPOLATION_MS]: { entityModelNodeOverride: EntityModelNodeOverride, interpolationMs: number | undefined };

  /** Emitted when the rotation for matching nodes is set. */
  [EntityModelNodeOverrideEvent.SET_LOCAL_ROTATION]:                  { entityModelNodeOverride: EntityModelNodeOverride, localRotation: QuaternionLike | undefined };

  /** Emitted when the interpolation time in milliseconds applied to local rotation changes is set. */
  [EntityModelNodeOverrideEvent.SET_LOCAL_ROTATION_INTERPOLATION_MS]: { entityModelNodeOverride: EntityModelNodeOverride, interpolationMs: number | undefined };

  /** Emitted when the scale for matching nodes is set. */
  [EntityModelNodeOverrideEvent.SET_LOCAL_SCALE]:                     { entityModelNodeOverride: EntityModelNodeOverride, localScale: Vector3Like | undefined };

  /** Emitted when the interpolation time in milliseconds applied to local scale changes is set. */
  [EntityModelNodeOverrideEvent.SET_LOCAL_SCALE_INTERPOLATION_MS]:    { entityModelNodeOverride: EntityModelNodeOverride, interpolationMs: number | undefined };
}

/**
 * Represents a name-match model node override rule for an Entity.
 *
 * When to use: configuring visual and transform overrides for one or more
 * model nodes selected by name match.
 *
 * @remarks
 * Node overrides are match-rule based and may target multiple nodes.
 * Matching is case-insensitive. Exact match is used by default; wildcard
 * matching is only enabled when `*` is used at the start and/or end of
 * `nameMatch` (`head*`, `*head`, `*head*`).
 * Supported override settings include emissive color/intensity, hidden state,
 * and local position/rotation/scale.
 *
 * **Category:** Entities
 * @public
 */
export default class EntityModelNodeOverride implements protocol.Serializable {
  /** @internal */
  private _nameMatch: string;

  /** @internal */
  private _entity: Entity;

  /** @internal */
  private _emissiveColor: RgbColor | undefined;

  /** @internal */
  private _emissiveIntensity: number | undefined;

  /** @internal */
  private _hidden: boolean = false;

  /** @internal */
  private _isRemoved: boolean = false;

  /** @internal */
  private _localPosition: Vector3Like | undefined;

  /** @internal */
  private _localPositionInterpolationMs: number | undefined;

  /** @internal */
  private _localRotation: QuaternionLike | undefined;

  /** @internal */
  private _localRotationInterpolationMs: number | undefined;

  /** @internal */
  private _localScale: Vector3Like | undefined;

  /** @internal */
  private _localScaleInterpolationMs: number | undefined;

  /**
   * Creates a new EntityModelNodeOverride instance.
   *
   * @param options - The options for the model node override.
   *
   * **Category:** Entities
   */
  public constructor(options: EntityModelNodeOverrideOptions) {
    this._nameMatch = options.nameMatch.toLowerCase();
    this._entity = options.entity;
    this._emissiveColor = options.emissiveColor;
    this._emissiveIntensity = options.emissiveIntensity;
    this._hidden = options.hidden ?? this._hidden;
    this._localPosition = options.localPosition;
    this._localPositionInterpolationMs = options.localPositionInterpolationMs;
    this._localRotation = options.localRotation;
    this._localRotationInterpolationMs = options.localRotationInterpolationMs;
    this._localScale = typeof options.localScale === 'number' ? { x: options.localScale, y: options.localScale, z: options.localScale } : options.localScale;
    this._localScaleInterpolationMs = options.localScaleInterpolationMs;
  }

  /**
   * The node name match selector for this override.
   * Exact match by default, with optional edge wildcard (`head*`, `*head`, `*head*`).
   *
   * **Category:** Entities
   */
  public get nameMatch(): string { return this._nameMatch; }

  /**
   * Alias used by networking serializer and protocol schema (`n`).
   *
   * **Category:** Entities
   */
  public get name(): string { return this._nameMatch; }

  /**
   * The entity that the model node override belongs to.
   *
   * **Category:** Entities
   */
  public get entity(): Entity { return this._entity; }

  /**
   * The emissive color for matching nodes.
   *
   * **Category:** Entities
   */
  public get emissiveColor(): RgbColor | undefined { return this._emissiveColor; }

  /**
   * The emissive intensity for matching nodes.
   *
   * **Category:** Entities
   */
  public get emissiveIntensity(): number | undefined { return this._emissiveIntensity; }

  /**
   * Whether the matched node(s) are hidden.
   *
   * **Category:** Entities
   */
  public get isHidden(): boolean { return this._hidden; }

  /**
   * The local position set for matching nodes.
   *
   * **Category:** Entities
   */
  public get localPosition(): Vector3Like | undefined { return this._localPosition; }

  /**
   * The interpolation time in milliseconds applied to local position changes.
   *
   * **Category:** Entities
   */
  public get localPositionInterpolationMs(): number | undefined { return this._localPositionInterpolationMs; }

  /**
   * The local rotation set for matching nodes.
   *
   * **Category:** Entities
   */
  public get localRotation(): QuaternionLike | undefined { return this._localRotation; }

  /**
   * The interpolation time in milliseconds applied to local rotation changes.
   *
   * **Category:** Entities
   */
  public get localRotationInterpolationMs(): number | undefined { return this._localRotationInterpolationMs; }

  /**
   * The local scale set for matching nodes.
   *
   * **Category:** Entities
   */
  public get localScale(): Vector3Like | undefined { return this._localScale; }

  /**
   * The interpolation time in milliseconds applied to local scale changes.
   *
   * **Category:** Entities
   */
  public get localScaleInterpolationMs(): number | undefined { return this._localScaleInterpolationMs; }

  /**
   * Removes this model node override from its parent entity.
   *
   * @remarks
   * This delegates to `Entity.removeModelNodeOverride()` so that map mutation
   * and related event emission remain centralized on the entity.
   *
   * **Category:** Entities
   */
  public remove() {
    this._entity.removeModelNodeOverride(this.nameMatch);
  }

  /**
   * Sets the emissive color for matching nodes.
   *
   * @param emissiveColor - The emissive color to set.
   * 
   * **Side effects:** Emits `EntityModelNodeOverrideEvent.SET_EMISSIVE_COLOR` when spawned.
   *
   * **Category:** Entities
   */
  public setEmissiveColor(emissiveColor: RgbColor | undefined) {
    if (this._isRemoved) return;

    if ((!emissiveColor && !this._emissiveColor) || (emissiveColor && this._emissiveColor &&
      emissiveColor.r === this._emissiveColor.r &&
      emissiveColor.g === this._emissiveColor.g &&
      emissiveColor.b === this._emissiveColor.b)) {
      return;
    }

    this._emissiveColor = emissiveColor;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelNodeOverrideEvent.SET_EMISSIVE_COLOR, {
        entityModelNodeOverride: this,
        emissiveColor,
      });
    }
  }

  /**
   * Sets the emissive intensity for matching nodes.
   * 
   * @param emissiveIntensity - The emissive intensity to set.
   *
   * **Side effects:** Emits `EntityModelNodeOverrideEvent.SET_EMISSIVE_INTENSITY` when spawned.
   *
   * **Category:** Entities
   */
  public setEmissiveIntensity(emissiveIntensity: number | undefined) {
    if (this._isRemoved) return;

    if (this._emissiveIntensity === emissiveIntensity) return;

    this._emissiveIntensity = emissiveIntensity;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelNodeOverrideEvent.SET_EMISSIVE_INTENSITY, {
        entityModelNodeOverride: this,
        emissiveIntensity,
      });
    }
  }

  /**
   * Sets the hidden state for matching nodes.
   * 
   * @param hidden - The hidden state to set.
   *
   * **Side effects:** Emits `EntityModelNodeOverrideEvent.SET_HIDDEN` when spawned.
   *
   * **Category:** Entities
   */
  public setHidden(hidden: boolean) {
    if (this._isRemoved) return;

    if (this._hidden === hidden) return;

    this._hidden = hidden;
    
    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelNodeOverrideEvent.SET_HIDDEN, {
        entityModelNodeOverride: this,
        hidden,
      });
    }
  }

  /**
   * Sets the local position for matching nodes.
   * 
   * @param localPosition - The local position to set.
   *
   * **Side effects:** Emits `EntityModelNodeOverrideEvent.SET_LOCAL_POSITION` when spawned.
   *
   * **Category:** Entities
   */
  public setLocalPosition(localPosition: Vector3Like | undefined) {
    if (this._isRemoved) return;
    if (localPosition === this._localPosition) return;

    if (localPosition && this._localPosition && 
      this._localPosition.x === localPosition.x &&
      this._localPosition.y === localPosition.y &&
      this._localPosition.z === localPosition.z) {
      return;
    }

    this._localPosition = localPosition;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelNodeOverrideEvent.SET_LOCAL_POSITION, {
        entityModelNodeOverride: this,
        localPosition,
      });
    }
  }

  /**
   * Sets the interpolation time in milliseconds applied to local position changes.
   * 
   * @param interpolationMs - The interpolation time in milliseconds to set.
   *
   * **Side effects:** Emits `EntityModelNodeOverrideEvent.SET_LOCAL_POSITION_INTERPOLATION_MS` when spawned.
   *
   * **Category:** Entities
   */
  public setLocalPositionInterpolationMs(interpolationMs: number | undefined) {
    if (this._isRemoved) return;
    if (interpolationMs === this._localPositionInterpolationMs) return;

    this._localPositionInterpolationMs = interpolationMs;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelNodeOverrideEvent.SET_LOCAL_POSITION_INTERPOLATION_MS, {
        entityModelNodeOverride: this,
        interpolationMs,
      });
    }
  }

  /**
   * Sets the local rotation for matching nodes.
   * 
   * @param localRotation - The local rotation to set.
   *
   * **Side effects:** Emits `EntityModelNodeOverrideEvent.SET_LOCAL_ROTATION` when spawned.
   *
   * **Category:** Entities
   */
  public setLocalRotation(localRotation: QuaternionLike | undefined) {
    if (this._isRemoved) return;
    if (localRotation === this._localRotation) return;

    if (localRotation && this._localRotation && 
      this._localRotation.x === localRotation.x &&
      this._localRotation.y === localRotation.y &&
      this._localRotation.z === localRotation.z &&
      this._localRotation.w === localRotation.w) {
      return;
    }

    this._localRotation = localRotation;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelNodeOverrideEvent.SET_LOCAL_ROTATION, {
        entityModelNodeOverride: this,
        localRotation,
      });
    }
  }

  /**
   * Sets the interpolation time in milliseconds applied to local rotation changes.
   * 
   * @param interpolationMs - The interpolation time in milliseconds to set.
   *
   * **Side effects:** Emits `EntityModelNodeOverrideEvent.SET_LOCAL_ROTATION_INTERPOLATION_MS` when spawned.
   *
   * **Category:** Entities
   */
  public setLocalRotationInterpolationMs(interpolationMs: number | undefined) {
    if (this._isRemoved) return;
    if (interpolationMs === this._localRotationInterpolationMs) return;

    this._localRotationInterpolationMs = interpolationMs;
    
    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelNodeOverrideEvent.SET_LOCAL_ROTATION_INTERPOLATION_MS, {
        entityModelNodeOverride: this,
        interpolationMs,
      });
    }
  }

  /**
   * Sets the local scale for matching nodes.
   * 
   * @param localScale - The local scale to set.
   *
   * **Side effects:** Emits `EntityModelNodeOverrideEvent.SET_LOCAL_SCALE` when spawned.
   *
   * **Category:** Entities
   */
  public setLocalScale(localScale: Vector3Like | number | undefined) {
    if (this._isRemoved) return;
    if (localScale === this._localScale) return;

    if (typeof localScale === 'number') {
      localScale = { x: localScale, y: localScale, z: localScale };
    }
    
    if (localScale && this._localScale && 
      this._localScale.x === localScale.x &&
      this._localScale.y === localScale.y &&
      this._localScale.z === localScale.z) {
      return;
    }

    this._localScale = localScale;

    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelNodeOverrideEvent.SET_LOCAL_SCALE, {
        entityModelNodeOverride: this,
        localScale,
      });
    }
  }

  /**
   * Sets the interpolation time in milliseconds applied to local scale changes.
   * 
   * @param interpolationMs - The interpolation time in milliseconds to set.
   *
   * **Side effects:** Emits `EntityModelNodeOverrideEvent.SET_LOCAL_SCALE_INTERPOLATION_MS` when spawned.
   *
   * **Category:** Entities
   */
  public setLocalScaleInterpolationMs(interpolationMs: number | undefined) {
    if (this._isRemoved) return;
    if (interpolationMs === this._localScaleInterpolationMs) return;

    this._localScaleInterpolationMs = interpolationMs;
    
    if (this._entity.isSpawned) {
      this._entity.emitWithWorld(this._entity.world!, EntityModelNodeOverrideEvent.SET_LOCAL_SCALE_INTERPOLATION_MS, {
        entityModelNodeOverride: this,
        interpolationMs,
      });
    }
  }

  /** @internal */
  public serialize(): protocol.ModelNodeOverrideSchema {
    return Serializer.serializeEntityModelNodeOverride(this);
  }

  /** @internal */
  public markRemoved(): void {
    this._isRemoved = true;
  }
}
