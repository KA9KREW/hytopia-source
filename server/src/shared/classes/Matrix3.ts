import * as glMatrix from 'gl-matrix';
import type Matrix4 from '@/shared/classes/Matrix4';
import type Quaternion from '@/shared/classes/Quaternion';
import type Vector2 from '@/shared/classes/Vector2';
import type Vector3 from '@/shared/classes/Vector3';

/**
 * Represents a 3x3 matrix.
 *
 * When to use: 2D homogeneous transforms or normal matrix math.
 * Do NOT use for: immutable math; most methods mutate the instance.
 *
 * @remarks
 * All matrix methods result in mutation of the matrix instance.
 * This class extends `Float32Array` to provide an efficient way to
 * create and manipulate a 3x3 matrix.
 *
 * Pattern: reuse instances to reduce allocations.
 * Anti-pattern: treating matrices as immutable values.
 *
 * **Category:** Math
 * @public
 */
export default class Matrix3 extends Float32Array {
  public constructor(
    m00: number, m01: number, m02: number,
    m10: number, m11: number, m12: number,
    m20: number, m21: number, m22: number,
  ) {
    super([
      m00, m01, m02,
      m10, m11, m12,
      m20, m21, m22,
    ]);
  }

  /** The determinant of the matrix. */
  public get determinant(): number {
    return glMatrix.mat3.determinant(this);
  }

  /** The frobenius norm of the matrix. */
  public get frobeniusNorm(): number {
    return glMatrix.mat3.frob(this);
  }

  /**
   * Creates a new `Matrix3` instance.
   * 
   * @returns A new `Matrix3` instance.
   */
  public static create(): Matrix3 {
    const matrix = new Matrix3(
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
    );

    glMatrix.mat3.identity(matrix);

    return matrix;
  }

  /**
   * Creates a new `Matrix3` instance from a `Matrix4` instance.
   * 
   * @param matrix4 - The `Matrix4` instance to create the `Matrix3` instance from.
   * @returns A new `Matrix3` instance.
   */
  public static fromMatrix4(matrix4: Matrix4): Matrix3 {
    const matrix = Matrix3.create();

    glMatrix.mat3.fromMat4(matrix, matrix4);

    return matrix;
  }

  /**
   * Creates a new `Matrix3` instance from a `Quaternion` instance.
   * 
   * @param quaternion - The `Quaternion` instance to create the `Matrix3` instance from.
   * @returns A new `Matrix3` instance.
   */
  public static fromQuaternion(quaternion: Quaternion): Matrix3 {
    const matrix = Matrix3.create();

    glMatrix.mat3.fromQuat(matrix, quaternion);

    return matrix;
  }

  /**
   * Creates a new `Matrix3` instance from a rotation of identity matrix.
   * 
   * @param angle - The angle in radians to rotate the matrix by.
   * @returns A new `Matrix3` instance.
   */
  public static fromRotation(angle: number): Matrix3 {
    const matrix = Matrix3.create();

    glMatrix.mat3.fromRotation(matrix, angle);

    return matrix;
  }

  /**
   * Creates a new `Matrix3` instance from a scale of identity matrix.
   * 
   * @param scale - The scale of the matrix.
   * @returns A new `Matrix3` instance.
   */
  public static fromScaling(scale: Vector3): Matrix3 {
    const matrix = Matrix3.create();

    glMatrix.mat3.fromScaling(matrix, scale);

    return matrix;
  }

  /**
   * Creates a new `Matrix3` instance from a translation of identity matrix.
   * This is used only when working with two-dimensional homogeneous coordinates, 
   * which is why the `translation` parameter is a `Vector2`.
   * 
   * @param translation - The translation of the matrix.
   * @returns A new `Matrix3` instance.
   */
  public static fromTranslation(translation: Vector2): Matrix3 {
    const matrix = Matrix3.create();

    glMatrix.mat3.fromTranslation(matrix, translation);

    return matrix;
  }

  /**
   * Adds a matrix to the current matrix.
   * 
   * @param matrix3 - The matrix to add to the current matrix.
   * @returns The current matrix.
   */
  public add(matrix3: Matrix3): Matrix3 {
    glMatrix.mat3.add(this, this, matrix3);

    return this;
  }
  
  /**
     * Sets the adjugate of the current matrix.
   * 
   * @returns The current matrix.
   */
  public adjoint(): Matrix3 {
    glMatrix.mat3.adjoint(this, this);

    return this;
  }

  /**
   * Clones the current matrix.
   * 
   * @returns A clone of the current matrix.
   */
  public clone(): Matrix3 {
    return new Matrix3(
      this[0], this[1], this[2],
      this[3], this[4], this[5],
      this[6], this[7], this[8],
    );
  }

  /**
   * Copies a matrix to the current matrix.
   * 
   * @param matrix3 - The matrix to copy to the current matrix.
   * @returns The current matrix.
   */
  public copy(matrix3: Matrix3): Matrix3 {
    glMatrix.mat3.copy(this, matrix3);

    return this;
  }

  /**
   * Checks if the current matrix is approximately equal to another matrix.
   * 
   * @param matrix3 - The matrix to compare to the current matrix.
   * @returns `true` if the current matrix is equal to the provided matrix, `false` otherwise.
   */
  public equals(matrix3: Matrix3): boolean {
    return glMatrix.mat3.equals(this, matrix3);
  }

  /**
   * Checks if the current matrix is exactly equal to another matrix.
   * 
   * @param matrix3 - The matrix to compare to the current matrix.
   * @returns `true` if the current matrix is equal to the provided matrix, `false` otherwise.
   */
  public exactEquals(matrix3: Matrix3): boolean {
    return glMatrix.mat3.exactEquals(this, matrix3);
  }

  /**
   * Sets the current matrix to the identity matrix.
   * 
   * @returns The current matrix.
   */
  public identity(): Matrix3 {
    glMatrix.mat3.identity(this);

    return this;
  }

  /**
   * Inverts the current matrix.
   * 
   * @returns The current matrix.
   */
  public invert(): Matrix3 {
    glMatrix.mat3.invert(this, this);

    return this;
  }

  /**
   * Multiplies the current matrix by another matrix.
   * 
   * @param matrix3 - The matrix to multiply the current matrix by.
   * @returns The current matrix.
   */
  public multiply(matrix3: Matrix3): Matrix3 {
    glMatrix.mat3.mul(this, this, matrix3);

    return this;
  }
  
  /**
   * Multiplies each element of the current matrix by a scalar value.
   * 
   * @param scalar - The scalar value to multiply the current matrix elements by.
   * @returns The current matrix.
   */
  public multiplyScalar(scalar: number): Matrix3 {
    glMatrix.mat3.multiplyScalar(this, this, scalar);

    return this;
  }

  /**
   * Multiplies the provided vector3 by this matrix. This modifies 
   * the vector in-place, but also returns the transformed vector.
   *
   * @param vector - The vector to multiply by this.
   * @returns The transformed vector.
   */
  public transformVector(vector: Vector3): Vector3 {
    return vector.transformMatrix3(this);
  }

  /**
   * Sets the current matrix to a orthographic projection matrix with the given bounds.
   * 
   * @param width - The width of the projection.
   * @param height - The height of the projection.
   * @returns The current matrix.
   */
  public projection(width: number, height: number): Matrix3 {
    glMatrix.mat3.projection(this, width, height);

    return this;
  }
  
  /**
   * Rotates the current matrix by an angle in radians.
   * 
   * @param angle - The angle in radians to rotate the current matrix by.
   * @returns The current matrix.
   */
  public rotate(angle: number): Matrix3 {
    glMatrix.mat3.rotate(this, this, angle);

    return this;
  }
  
  /**
   * Subtracts a matrix from the current matrix.
   * 
   * @param matrix3 - The matrix to subtract from the current matrix.
   * @returns The current matrix.
   */
  public subtract(matrix3: Matrix3): Matrix3 {
    glMatrix.mat3.sub(this, this, matrix3);

    return this;
  }
  
  /**
   * Returns a string representation of the current matrix.
   * 
   * @returns A string representation of the current matrix.
   */
  public toString(): string {
    return `[${this[0]},${this[1]},${this[2]}]` +
           `[${this[3]},${this[4]},${this[5]}]` +
           `[${this[6]},${this[7]},${this[8]}]`;
  }

  /**
   * Transposes the current matrix.
   * 
   * @returns The current matrix.
   */
  public transpose(): Matrix3 {
    glMatrix.mat3.transpose(this, this);

    return this;
  }
}
