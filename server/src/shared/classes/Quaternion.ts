import * as glMatrix from 'gl-matrix';
import type QuaternionLike from '@/shared/types/math/QuaternionLike';
import type Vector3 from '@/shared/classes/Vector3';

/**
 * Represents a quaternion.
 *
 * When to use: rotation math for entities, cameras, or transforms.
 * Do NOT use for: immutable math; most methods mutate the instance.
 *
 * @remarks
 * All quaternion methods result in mutation of the quaternion instance.
 * This class extends `Float32Array` to provide an efficient way to
 * create and manipulate a quaternion.
 *
 * Pattern: reuse instances to avoid allocations in tight loops.
 * Anti-pattern: assuming methods return new instances; most mutate in place.
 *
 * **Category:** Math
 * @public
 */
export default class Quaternion extends Float32Array implements QuaternionLike {
  public constructor(x: number, y: number, z: number, w: number) {
    super([ x, y, z, w ]);
  }

  /** The length of the quaternion. */
  public get length(): number {
    return glMatrix.quat.length(this);
  }

  /** The squared length of the quaternion. */
  public get squaredLength(): number {
    return glMatrix.quat.squaredLength(this);
  }

  /** The magnitude of the quaternion. Alias for `.length`. */
  public get magnitude(): number {
    return glMatrix.quat.length(this);
  }

  /** The squared magnitude of the quaternion. Alias for `.squaredLength`. */
  public get squaredMagnitude(): number {
    return glMatrix.quat.squaredLength(this);
  }

  /** The x-component of the quaternion. */
  public get x(): number {
    return this[0];
  }
  
  public set x(value: number) {
    this[0] = value;
  }

  /** The y-component of the quaternion. */
  public get y(): number {
    return this[1];
  }
  
  public set y(value: number) {
    this[1] = value;
  }

  /** The z-component of the quaternion. */
  public get z(): number {
    return this[2];
  }
  
  public set z(value: number) {
    this[2] = value;
  }
  
  /** The w-component of the quaternion. */
  public get w(): number {
    return this[3];
  }

  public set w(value: number) {
    this[3] = value;
  }

  /**
   * Creates a quaternion from Euler angles.
   * 
   * @param x - The x-component of the Euler angles in degrees.
   * @param y - The y-component of the Euler angles in degrees.
   * @param z - The z-component of the Euler angles in degrees.
   */
  public static fromEuler(x: number, y: number, z: number): Quaternion {
    const quat = glMatrix.quat.fromEuler(new Float32Array(4), x, y, z);
    
    return new Quaternion(quat[0], quat[1], quat[2], quat[3]);
  }

  /**
   * Creates a quaternion from a `QuaternionLike` object.
   * 
   * @param quaternionLike - The `QuaternionLike` object to create the quaternion from.
   */
  public static fromQuaternionLike(quaternionLike: QuaternionLike): Quaternion {
    return new Quaternion(quaternionLike.x, quaternionLike.y, quaternionLike.z, quaternionLike.w);
  }

  /**
   * Creates a clone of the current quaternion.
   * 
   * @returns A new `Quaternion` instance.
   */
  public clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  /**
   * Conjugates the current quaternion.
   * 
   * @returns The current quaternion.
   */
  public conjugate(): Quaternion {
    glMatrix.quat.conjugate(this, this);

    return this;
  }

  /**
   * Copies the components of a `QuaternionLike` object to the current quaternion.
   * 
   * @param quaternionLike - The `QuaternionLike` object to copy the components from.
   * @returns The current quaternion.
   */
  public copy(quaternion: Quaternion): Quaternion {
    glMatrix.quat.copy(this, quaternion);

    return this;
  }

  /**
   * Calculates the dot product of the current quaternion and another quaternion.
   * 
   * @param quaternionLike - The quaternion to calculate the dot product with.
   * @returns The dot product.
   */
  public dot(quaternion: Quaternion): number {
    return glMatrix.quat.dot(this, quaternion);
  }

  /**
   * Calculates and sets the current quaternion to its exponential.
   * 
   * @returns The current quaternion.
   */
  public exponential(): Quaternion {
    glMatrix.quat.exp(this, this);

    return this;
  }

  /**
   * Checks if the current quaternion is approximately equal to another quaternion.
   * 
   * @param quaternionLike - The quaternion to check against.
   * @returns `true` if the quaternions are approximately equal, `false` otherwise.
   */
  public equals(quaternion: Quaternion): boolean {
    return glMatrix.quat.equals(this, quaternion);
  }

  /**
   * Checks if the current quaternion is exactly equal to another quaternion.
   * 
   * @param quaternionLike - The quaternion to check against.
   * @returns `true` if the quaternions are exactly equal, `false` otherwise.
   */
  public exactEquals(quaternion: Quaternion): boolean {
    return glMatrix.quat.exactEquals(this, quaternion);
  }

  /**
   * Calculates and returns the angle between the current quaternion and another quaternion.
   * 
   * @param quaternionLike - The quaternion to calculate the angle with.
   * @returns The angle in degrees.
   */
  public getAngle(quaternion: Quaternion): number {
    return glMatrix.quat.getAngle(this, quaternion);
  }

  /**
   * Sets the current quaternion to the identity quaternion.
   * 
   * @returns The current quaternion.
   */
  public identity(): Quaternion {
    glMatrix.quat.identity(this);

    return this;
  }

  /**
   * Inverts each component of the quaternion.
   * 
   * @returns The current quaternion.
   */
  public invert(): Quaternion {
    glMatrix.quat.invert(this, this);

    return this;
  }

  /**
   * Linearly interpolates between the current quaternion and another quaternion.
   * 
   * @param quaternionLike - The quaternion to interpolate with.
   * @param t - The interpolation factor.
   * @returns The current quaternion.
   */
  public lerp(quaternion: Quaternion, t: number): Quaternion {
    glMatrix.quat.lerp(this, this, quaternion, t);

    return this;
  }

  /**
   * Sets the current quaternion to its natural logarithm.
   * 
   * @returns The current quaternion.
   */
  public logarithm(): Quaternion {
    glMatrix.quat.ln(this, this);

    return this;
  }

  /**
   * Multiplies the quaternion by another quaternion.
   * 
   * @param quaternionLike - The quaternion to multiply by.
   * @returns The current quaternion.
   */
  public multiply(quaternion: Quaternion): Quaternion {
    glMatrix.quat.multiply(this, this, quaternion);

    return this;
  }

  /**
   * Rotates the provided vector by the rotation this quaternion represents.
   * This modifies the vector in-place, but also returns the rotated vector.
   * 
   * @param vector - the vector to rotate
   * @returns the rotated vector. 
   */
  public transformVector(vector: Vector3): Vector3 {
	  return vector.transformQuaternion(this);
  }

  /**
   * Normalizes the quaternion.
   * 
   * @returns The current quaternion.
   */
  public normalize(): Quaternion {
    glMatrix.quat.normalize(this, this);

    return this;
  }

  /**
   * Raises the current quaternion to a power.
   * 
   * @param exponent - The exponent to raise the quaternion to.
   * @returns The current quaternion.
   */
  public power(exponent: number): Quaternion {
    glMatrix.quat.pow(this, this, exponent);

    return this;
  }

  /**
   * Randomizes the current quaternion.
   * 
   * @returns The current quaternion.
   */
  public randomize(): Quaternion {
    glMatrix.quat.random(this);

    return this;
  }

  /**
   * Rotates the quaternion around the x-axis.
   * 
   * @param angle - The angle to rotate in degrees.
   * @returns The current quaternion.
   */
  public rotateX(angle: number): Quaternion {
    glMatrix.quat.rotateX(this, this, angle);

    return this;
  }

  /**
   * Rotates the quaternion around the y-axis.
   * 
   * @param angle - The angle to rotate in degrees.
   * @returns The current quaternion.
   */
  public rotateY(angle: number): Quaternion {
    glMatrix.quat.rotateY(this, this, angle);

    return this;
  }

  /**
   * Rotates the quaternion around the z-axis.
   * 
   * @param angle - The angle to rotate in degrees.
   * @returns The current quaternion.
   */
  public rotateZ(angle: number): Quaternion {
    glMatrix.quat.rotateZ(this, this, angle);

    return this;
  }

  /**
   * Scales the quaternion by a scalar value.
   * 
   * @param scale - The scalar value to scale the quaternion by.
   * @returns The current quaternion.
   */
  public scale(scale: number): Quaternion {
    glMatrix.quat.scale(this, this, scale);

    return this;
  }

  /**
   * Sets the current quaternion to the angle and rotation axis.
   * 
   * @param axis - The axis to rotate around.
   * @param angle - The angle to rotate in radians.
   * @returns The current quaternion.
   */
  public setAxisAngle(axis: Vector3, angle: number): Quaternion {
    glMatrix.quat.setAxisAngle(this, axis, angle);

    return this;
  }

  /**
   * Spherically interpolates between the current quaternion and another quaternion.
   * 
   * @param quaternion - The quaternion to interpolate with.
   * @param t - The interpolation factor.
   * @returns The current quaternion.
   */
  public slerp(quaternion: Quaternion, t: number): Quaternion {
    glMatrix.quat.slerp(this, this, quaternion, t);

    return this;
  }

  /**
   * Returns a string representation of the quaternion in x,y,z,w format.
   * 
   * @returns A string representation of the quaternion in the format x,y,z,w.
   */
  public toString(): string {
    return `${this.x},${this.y},${this.z},${this.w}`;
  }
}
