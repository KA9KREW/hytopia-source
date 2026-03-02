import * as glMatrix from 'gl-matrix';
import type Matrix3 from '@/shared/classes/Matrix3';
import type Matrix4 from '@/shared/classes/Matrix4';
import type Vector3Like from '@/shared/types/math/Vector3Like';
import type Quaternion from '@/shared/classes/Quaternion';

/**
 * Represents a 3-dimensional vector.
 *
 * When to use: performance-sensitive 3D math and transforms.
 * Do NOT use for: immutable math; most methods mutate the instance.
 *
 * @remarks
 * All vector methods result in mutation of the vector instance.
 * This class extends `Float32Array` to provide an efficient way to
 * create and manipulate a 3-dimensional vector.
 *
 * Pattern: reuse instances (and temporary vectors) to reduce allocations.
 * Anti-pattern: storing references and assuming value semantics.
 *
 * **Category:** Math
 * @public
 */
export default class Vector3 extends Float32Array implements Vector3Like {
  public constructor(x: number, y: number, z: number) {
    super([ x, y, z ]);
  }

  /** The length of the vector. */
  public get length(): number {
    return glMatrix.vec3.length(this);
  }

  /** The squared length of the vector. */
  public get squaredLength(): number {
    return glMatrix.vec3.squaredLength(this);
  }

  /** The magnitude of the vector. Alias for `length`. */
  public get magnitude(): number {
    return glMatrix.vec3.length(this);
  }

  /** The squared magnitude of the vector. Alias for `squaredLength`. */
  public get squaredMagnitude(): number {
    return glMatrix.vec3.squaredLength(this);
  }

  /** The x-component of the vector. */
  public get x(): number {
    return this[0];
  }

  public set x(value: number) {
    this[0] = value;
  }
  
  /** The y-component of the vector. */
  public get y(): number {
    return this[1];
  }
  
  public set y(value: number) {
    this[1] = value;
  }
  
  /** The z-component of the vector. */
  public get z(): number {
    return this[2];
  }

  public set z(value: number) {
    this[2] = value;
  }

  /**
   * Creates a new `Vector3` instance.
   * 
   * @returns A new `Vector3` instance.
   */
  public static create(): Vector3 {
    const vector3 = new Vector3(0, 0, 0);

    return vector3;
  }

  /**
   * Creates a new `Vector3` instance from a `Vector3Like` object.
   * 
   * @param vector3Like - The `Vector3Like` object to create the `Vector3` instance from.
   * @returns A new `Vector3` instance.
   */
  public static fromVector3Like(vector3Like: Vector3Like): Vector3 {
    return new Vector3(vector3Like.x, vector3Like.y, vector3Like.z);
  }

  /**
   * Adds a vector to the current vector.
   * 
   * @param vector3 - The vector to add to the current vector.
   * @returns The current vector.
   */
  public add(vector3: Vector3): Vector3 {
    glMatrix.vec3.add(this, this, vector3);

    return this;
  }

  /**
   * Rounds each component of the vector up to the nearest integer.
   * 
   * @returns The current vector.
   */
  public ceil(): Vector3 {
    glMatrix.vec3.ceil(this, this);

    return this;
  }

  /**
   * Returns a new vector with the same components as the current vector.
   * 
   * @returns A new vector.
   */
  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  /**
   * Copies the components of a vector to the current vector.
   * 
   * @param vector3 - The vector to copy the components from.
   * @returns The current vector.
   */
  public copy(vector3: Vector3): Vector3 {
    glMatrix.vec3.copy(this, vector3);

    return this;
  }

  /**
   * Calculates the cross product of the current vector and another vector.
   * 
   * @param vector3 - The vector to calculate the cross product with.
   * @returns The current vector.
   */
  public cross(vector3: Vector3): Vector3 {
    glMatrix.vec3.cross(this, this, vector3);

    return this;
  }

  /**
   * Calculates the distance between the current vector and another vector.
   * 
   * @param vector3 - The vector to calculate the distance to.
   * @returns The distance between the two vectors.
   */
  public distance(vector3: Vector3): number {
    return glMatrix.vec3.distance(this, vector3);
  }

  /**
   * Divides each component of the current vector by the corresponding component of another vector.
   * 
   * @param vector3 - The vector to divide the current vector by.
   * @returns The current vector.
   */
  public divide(vector3: Vector3): Vector3 {
    glMatrix.vec3.div(this, this, vector3);

    return this;
  }

  /**
   * Returns the dot product of this vector and another vector.
   *
   * @param vector3 - the other vector
   * @returns the dot product of this and vector3
   */
  public dot(vector3: Vector3): number {
	  return glMatrix.vec3.dot(this, vector3);
  }

  /**
   * Checks if the current vector is approximately equal to another vector.
   * 
   * @param vector3 - The vector to compare to.
   * @returns A boolean indicating whether the two vectors are approximately equal.
   */
  public equals(vector3: Vector3): boolean {
    return glMatrix.vec3.equals(this, vector3);
  }

  /**
   * Checks if the current vector is exactly equal to another vector.
   * 
   * @param vector3 - The vector to compare to.
   * @returns A boolean indicating whether the two vectors are exactly equal.
   */
  public exactEquals(vector3: Vector3): boolean {
    return glMatrix.vec3.exactEquals(this, vector3);
  }

  /**
   * Rounds each component of the vector down to the nearest integer.
   * 
   * @returns The current vector.
   */
  public floor(): Vector3 {
    glMatrix.vec3.floor(this, this);

    return this;
  }

  /**
   * Inverts each component of the vector.
   * 
   * @returns The current vector.
   */
  public invert(): Vector3 {
    glMatrix.vec3.inverse(this, this);

    return this;
  }

  /**
   * Linearly interpolates between the current vector and another vector.
   * 
   * @param vector3 - The vector to interpolate to.
   * @param t - The interpolation factor. A value between 0 and 1.
   * @returns The current vector.
   */
  public lerp(vector3: Vector3, t: number): Vector3 {
    glMatrix.vec3.lerp(this, this, vector3, t);

    return this;
  }

  /**
   * Sets each component of the vector to the maximum of the current vector and another vector.
   * 
   * @param vector3 - The vector to compare to.
   * @returns The current vector.
   */
  public max(vector3: Vector3): Vector3 {
    glMatrix.vec3.max(this, this, vector3);

    return this;
  }

  /**
   * Sets each component of the vector to the minimum of the current vector and another vector.
   * 
   * @param vector3 - The vector to compare to.
   * @returns The current vector.
   */
  public min(vector3: Vector3): Vector3 {
    glMatrix.vec3.min(this, this, vector3);

    return this;
  }

  /**
   * Multiplies each component of the current vector by the corresponding component of another vector.
   * 
   * @param vector3 - The vector to multiply the current vector by.
   * @returns The current vector.
   */
  public multiply(vector3: Vector3): Vector3 {
    glMatrix.vec3.mul(this, this, vector3);

    return this;
  }

  /**
   * Negates each component of the vector.
   * 
   * @returns The current vector.
   */
  public negate(): Vector3 {
    glMatrix.vec3.negate(this, this);

    return this;
  }

  /**
   * Normalizes the vector.
   * 
   * @returns The current vector.
   */
  public normalize(): Vector3 {
    glMatrix.vec3.normalize(this, this);

    return this;
  }

  /**
   * Randomizes the vector.
   * 
   * @param scale - Length of the resulting vector, if omitted a unit vector is set.
   * @returns The current vector.
   */
  public randomize(scale?: number): Vector3 {
    glMatrix.vec3.random(this, scale);

    return this;
  }

  /**
   * Rotates the vector around the x-axis.
   * 
   * @param vector3 - The origin vector to rotate around.
   * @param angle - The angle to rotate the vector by.
   * @returns The current vector.
   */
  public rotateX(vector3: Vector3, angle: number): Vector3 {
    glMatrix.vec3.rotateX(this, this, vector3, angle);

    return this;
  }

  /**
   * Rotates the vector around the y-axis.
   * 
   * @param vector3 - The origin vector to rotate around.
   * @param angle - The angle to rotate the vector by.
   * @returns The current vector.
   */
  public rotateY(vector3: Vector3, angle: number): Vector3 {
    glMatrix.vec3.rotateY(this, this, vector3, angle);

    return this;
  }

  /**
   * Rotates the vector around the z-axis.
   * 
   * @param vector3 - The origin vector to rotate around.
   * @param angle - The angle to rotate the vector by.
   * @returns The current vector.
   */
  public rotateZ(vector3: Vector3, angle: number): Vector3 {
    glMatrix.vec3.rotateZ(this, this, vector3, angle);

    return this;
  }

  /**
   * Rounds each component of the vector to the nearest integer.
   * 
   * @returns The current vector.
   */
  public round(): Vector3 {
    glMatrix.vec3.round(this, this);

    return this;
  }

  /**
   * Scales each component of the vector by a scalar value.
   * 
   * @param scale - The scalar value to scale the vector by.
   * @returns The current vector.
   */
  public scale(scale: number): Vector3 {
    glMatrix.vec3.scale(this, this, scale);

    return this;
  }

  /**
   * Adds 2 vectors together after scaling the provided vector by a scalar value.
   * 
   * @param vector3 - The vector to add the scaled vector to.
   * @param scale - The scalar value to scale the current vector by.
   * @returns The current vector.
   */
  public scaleAndAdd(vector3: Vector3, scale: number): Vector3 {
    glMatrix.vec3.scaleAndAdd(this, this, vector3, scale);

    return this;
  }

  /**
   * Subtracts a vector from the current vector.
   * 
   * @param vector3 - The vector to subtract from the current vector.
   * @returns The current vector.
   */
  public subtract(vector3: Vector3): Vector3 {
    glMatrix.vec3.sub(this, this, vector3);

    return this;
  }

  /**
   * Returns a string representation of the vector in x,y,z format.
   * 
   * @returns A string representation of the vector in the format x,y,z.
   */
  public toString(): string {
    return `${this.x},${this.y},${this.z}`;
  }

  /**
   * Transforms the vector by a matrix3.
   * 
   * @param matrix3 - The matrix3 to transform the vector by.
   * @returns The current vector.
   */
  public transformMatrix3(matrix3: Matrix3): Vector3 {
    glMatrix.vec3.transformMat3(this, this, matrix3);

    return this;
  }
  
  /**
   * Transforms the vector by a matrix4.
   * 
   * @param matrix4 - The matrix4 to transform the vector by.
   * @returns The current vector.
   */
  public transformMatrix4(matrix4: Matrix4): Vector3 {
    glMatrix.vec3.transformMat4(this, this, matrix4);

    return this;
  }

  /**
   * Transforms the vector by a quaternion.
   * 
   * @param quaternion - The quaternion to transform the vector by.
   * @returns The current vector.
   */
  public transformQuaternion(quaternion: Quaternion): Vector3 {
    glMatrix.vec3.transformQuat(this, this, quaternion);

    return this;
  }

  /**
   * Sets each component of the vector to zero.
   * 
   * @returns The current vector.
   */
  public zero(): Vector3 {
    glMatrix.vec3.zero(this);

    return this;
  }
}
