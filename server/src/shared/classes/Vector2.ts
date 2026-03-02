import * as glMatrix from 'gl-matrix';
import type Matrix2 from '@/shared/classes/Matrix2';
import type Matrix3 from '@/shared/classes/Matrix3';
import type Matrix4 from '@/shared/classes/Matrix4';
import type Vector2Like from '@/shared/types/math/Vector2Like';

/**
 * Represents a 2D vector.
 *
 * When to use: performance-sensitive math in game loops or geometry utilities.
 * Do NOT use for: immutable math; most methods mutate the instance.
 *
 * @remarks
 * All vector methods result in mutation of the vector instance.
 * This class extends `Float32Array` to provide an efficient way to
 * create and manipulate a 2-dimensional vector.
 *
 * Pattern: reuse instances (and temporary vectors) to reduce allocations.
 * Anti-pattern: storing references and assuming value semantics.
 *
 * **Category:** Math
 * @public
 */
export default class Vector2 extends Float32Array implements Vector2Like {
  public constructor(x: number, y: number) {
    super([ x, y ]);
  }

  /** The length of the vector. */
  public get length(): number {
    return glMatrix.vec2.length(this);
  }

  /** The squared length of the vector. */
  public get squaredLength(): number {
    return glMatrix.vec2.squaredLength(this);
  }

  /** The magnitude of the vector. Alias for `length`. */
  public get magnitude(): number {
    return glMatrix.vec2.length(this);
  }

  /** The squared magnitude of the vector. Alias for `squaredLength`. */
  public get squaredMagnitude(): number {
    return glMatrix.vec2.squaredLength(this);
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

  /**
   * Creates a new `Vector2` instance.
   * 
   * @returns A new `Vector2` instance.
   */
  public static create(): Vector2 {
    const vector = new Vector2(0, 0);

    return vector;
  }

  /**
   * Adds a vector to the current vector.
   * 
   * @param vector2 - The vector to add to the current vector.
   * @returns The current vector.
   */
  public add(vector2: Vector2): Vector2 {
    glMatrix.vec2.add(this, this, vector2);

    return this;
  }
  
  /**
   * Returns the angle between two vectors.
   * 
   * @param vector2 - The vector to compare to the current vector.
   * @returns The angle between the two vectors.
   */
  public angle(vector2: Vector2): number {
    return glMatrix.vec2.angle(this, vector2);
  }

  /**
   * Rounds each component of the vector up to the nearest integer.
   * 
   * @returns The current vector.
   */
  public ceil(): Vector2 {
    glMatrix.vec2.ceil(this, this);

    return this;
  }
  
  /**
   * Returns a new vector with the same components as the current vector.
   * 
   * @returns A new `Vector2` instance.
   */
  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  /**
   * Copies the components of a vector to the current vector.
   * 
   * @param vector2 - The vector to copy the components from.
   * @returns The current vector.
   */
  public copy(vector2: Vector2): Vector2 {
    glMatrix.vec2.copy(this, vector2);

    return this;
  }

  /**
   * Calculates the distance between the current vector and another vector.
   * 
   * @param vector2 - The vector to calculate the distance to.
   * @returns The distance between the two vectors.
   */
  public distance(vector2: Vector2): number {
    return glMatrix.vec2.distance(this, vector2);
  }

  /**
   * Divides the current vector by another vector.
   * 
   * @param vector2 - The vector to divide the current vector by.
   * @returns The current vector.
   */
  public divide(vector2: Vector2): Vector2 {
    glMatrix.vec2.divide(this, this, vector2);

    return this;
  }
  
  /**
   * Calculates the dot product of the current vector and another vector.
   * 
   * @param vector2 - The vector to calculate the dot product with.
   * @returns The dot product of the two vectors.
   */
  public dot(vector2: Vector2): number {
    return glMatrix.vec2.dot(this, vector2);
  }

  /**
   * Checks if the current vector is approximately equal to another vector.
   * 
   * @param vector2 - The vector to compare to the current vector.
   * @returns `true` if the two vectors are equal, `false` otherwise.
   */
  public equals(vector2: Vector2): boolean {
    return glMatrix.vec2.equals(this, vector2);
  }

  /**
   * Checks if the current vector is exactly equal to another vector.
   * 
   * @param vector2 - The vector to compare to the current vector.
   * @returns `true` if the two vectors are equal, `false` otherwise.
   */
  public exactEquals(vector2: Vector2): boolean {
    return glMatrix.vec2.exactEquals(this, vector2);
  }
  
  /**
   * Rounds each component of the vector down to the nearest integer.
   * 
   * @returns The current vector.
   */
  public floor(): Vector2 {
    glMatrix.vec2.floor(this, this);

    return this;
  }

  /**
   * Inverts the components of the current vector.
   * 
   * @returns The current vector.
   */
  public invert(): Vector2 {
    glMatrix.vec2.inverse(this, this);

    return this;
  }

  /**
   * Linearly interpolates between the current vector and another vector.
   * 
   * @param vector2 - The vector to interpolate to.
   * @param t - The interpolation factor. A value between 0 and 1.
   * @returns The current vector.
   */
  public lerp(vector2: Vector2, t: number): Vector2 {
    glMatrix.vec2.lerp(this, this, vector2, t);

    return this;
  }
  
  /**
   * Sets each component of the vector to the maximum of the current vector and another vector.
   * 
   * @param vector2 - The vector to compare to the current vector.
   * @returns The current vector.
   */
  public max(vector2: Vector2): Vector2 {
    glMatrix.vec2.max(this, this, vector2);

    return this;
  }
  
  /**
   * Sets each component of the vector to the minimum of the current vector and another vector.
   * 
   * @param vector2 - The vector to compare to the current vector.
   * @returns The current vector.
   */
  public min(vector2: Vector2): Vector2 {
    glMatrix.vec2.min(this, this, vector2);

    return this;
  }
  
  /**
   * Multiplies each component of the current vector by the corresponding component of another vector.
   * 
   * @param vector2 - The vector to multiply the current vector by.
   * @returns The current vector.
   */
  public multiply(vector2: Vector2): Vector2 {
    glMatrix.vec2.mul(this, this, vector2);

    return this;
  }

  /**
   * Negates each component of the vector.
   * 
   * @returns The current vector.
   */
  public negate(): Vector2 {
    glMatrix.vec2.negate(this, this);

    return this;
  }

  /**
   * Normalizes the current vector.
   * 
   * @returns The current vector.
   */
  public normalize(): Vector2 {
    glMatrix.vec2.normalize(this, this);

    return this;
  }
  
  /**
   * Randomizes the components of the current vector.
   * 
   * @param scale - The scale of the resulting vector.
   * @returns The current vector.
   */
  public randomize(scale?: number): Vector2 {
    glMatrix.vec2.random(this, scale);

    return this;
  }
  
  /**
   * Rotates the current vector around an origin.
   * 
   * @param vector2 - The vector to rotate around.
   * @param angle - The angle to rotate the vector by.
   * @returns The current vector.
   */
  public rotate(vector2: Vector2, angle: number): Vector2 {
    glMatrix.vec2.rotate(this, this, vector2, angle);

    return this;
  }

  /**
   * Rounds each component of the vector to the nearest integer.
   * 
   * @returns The current vector.
   */
  public round(): Vector2 {
    glMatrix.vec2.round(this, this);

    return this;
  }
  
  /**
   * Scales the current vector by a scalar value.
   * 
   * @param scale - The scalar value to scale the vector by.
   * @returns The current vector.
   */
  public scale(scale: number): Vector2 {
    glMatrix.vec2.scale(this, this, scale);

    return this;
  }
  
  /**
   * Scales the current vector by a scalar value and adds the result to another vector.
   * 
   * @param vector2 - The vector to add the scaled vector to.
   * @param scale - The scalar value to scale the vector by.
   * @returns The current vector.
   */
  public scaleAndAdd(vector2: Vector2, scale: number): Vector2 {
    glMatrix.vec2.scaleAndAdd(this, this, vector2, scale);

    return this;
  }

  /**
   * Subtracts a vector from the current vector.
   * 
   * @param vector2 - The vector to subtract from the current vector.
   * @returns The current vector.
   */
  public subtract(vector2: Vector2): Vector2 {
    glMatrix.vec2.sub(this, this, vector2);

    return this;
  }

  /**
   * Returns a string representation of the vector in x,y format.
   * 
   * @returns A string representation of the vector in the format x,y.
   */
  public toString(): string {
    return `${this.x},${this.y}`;
  }
  
  /**
   * Transforms the current vector by a matrix2.
   * 
   * @param matrix2 - The matrix2 to transform the vector by.
   * @returns The current vector.
   */
  public transformMatrix2(matrix2: Matrix2): Vector2 {
    glMatrix.vec2.transformMat2(this, this, matrix2);

    return this;
  }
  
  /**
   * Transforms the current vector by a matrix3.
   * 
   * @param matrix3 - The matrix3 to transform the vector by.
   * @returns The current vector.
   */
  public transformMatrix3(matrix3: Matrix3): Vector2 {
    glMatrix.vec2.transformMat3(this, this, matrix3);

    return this;
  }
  
  /**
   * Transforms the current vector by a matrix4.
   * 
   * @param matrix4 - The matrix4 to transform the vector by.
   * @returns The current vector.
   */
  public transformMatrix4(matrix4: Matrix4): Vector2 {
    glMatrix.vec2.transformMat4(this, this, matrix4);

    return this;
  }
  
  /**
   * Sets each component of the vector to zero.
   * 
   * @returns The current vector.
   */
  public zero(): Vector2 {
    glMatrix.vec2.zero(this);

    return this;
  }
}
