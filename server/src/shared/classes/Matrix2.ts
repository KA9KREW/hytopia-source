import * as glMatrix from 'gl-matrix';
import type Vector2 from '@/shared/classes/Vector2';

/**
 * Represents a 2x2 matrix.
 *
 * When to use: 2D transforms or linear algebra utilities.
 * Do NOT use for: immutable math; most methods mutate the instance.
 *
 * @remarks
 * All matrix methods result in mutation of the matrix instance.
 * This class extends `Float32Array` to provide an efficient way to
 * create and manipulate a 2x2 matrix.
 *
 * Pattern: reuse instances to reduce allocations.
 * Anti-pattern: treating matrices as immutable values.
 *
 * **Category:** Math
 * @public
 */
export default class Matrix2 extends Float32Array {
  public constructor(
    m00: number, m01: number,
    m10: number, m11: number,
  ) {
    super([
      m00, m01,
      m10, m11,
    ]);
  }

  /** The determinant of the matrix. */
  public get determinant(): number {
    return glMatrix.mat2.determinant(this);
  }

  /** The frobenius normal of the matrix. */
  public get frobeniusNorm(): number {
    return glMatrix.mat2.frob(this);
  }

  /**
   * Creates a new `Matrix2` instance.
   * 
   * @returns A new `Matrix2` instance.
   */
  public static create(): Matrix2 {
    const matrix = new Matrix2(
      0, 0,
      0, 0,
    );
   
    glMatrix.mat2.identity(matrix);

    return matrix;
  }

  /**
   * Creates a new `Matrix2` instance from a rotation of identity matrix.
   * 
   * @param angle - The angle in radians to rotate the matrix by.
   * @returns A new `Matrix2` instance.
   */
  public static fromRotation(angle: number): Matrix2 {
    const matrix = Matrix2.create();

    glMatrix.mat2.fromRotation(matrix, angle);

    return matrix;
  }

  /**
   * Creates a new `Matrix2` instance from a scale of identity matrix.
   * 
   * @param scale - The scale of the matrix.
   * @returns A new `Matrix2` instance.
   */
  public static fromScaling(scale: Vector2): Matrix2 {
    const matrix = Matrix2.create();

    glMatrix.mat2.fromScaling(matrix, scale);

    return matrix;
  }
  
  
  /**
   * Adds a matrix to the current matrix.
   * 
   * @param matrix2 - The matrix to add to the current matrix.
   * @returns The current matrix.
   */
  public add(matrix2: Matrix2): Matrix2 {
    glMatrix.mat2.add(this, this, matrix2);

    return this;
  }
  
  /**
   * Sets the adjugate of the current matrix.
   * 
   * @returns The current matrix.
   */
  public adjoint(): Matrix2 {
    glMatrix.mat2.adjoint(this, this);

    return this;
  }

  /**
   * Clones the current matrix.
   * 
   * @returns A clone of the current matrix.
   */
  public clone(): Matrix2 {
    return new Matrix2(
      this[0], this[1],
      this[2], this[3],
    );
  }

  /**
   * Copies a matrix to the current matrix.
   * 
   * @param matrix2 - The matrix2 to copy to the current matrix.
   * @returns The current matrix.
   */
  public copy(matrix2: Matrix2): Matrix2 {
    glMatrix.mat2.copy(this, matrix2);

    return this;
  }

  /**
   * Checks if the current matrix is approximately equal to another matrix.
   * 
   * @param matrix2 - The matrix to compare to the current matrix.
   * @returns `true` if the current matrix is equal to the provided matrix, `false` otherwise.
   */
  public equals(matrix2: Matrix2): boolean {
    return glMatrix.mat2.equals(this, matrix2);
  }

  /**
   * Checks if the current matrix is exactly equal to another matrix.
   * 
   * @param matrix2 - The matrix to compare to the current matrix.
   * @returns `true` if the current matrix is equal to the provided matrix, `false` otherwise.
   */
  public exactEquals(matrix2: Matrix2): boolean {
    return glMatrix.mat2.exactEquals(this, matrix2);
  }

  /**
   * Sets the current matrix to the identity matrix.
   * 
   * @returns The current matrix.
   */
  public identity(): Matrix2 {
    glMatrix.mat2.identity(this);

    return this;
  }

  /**
   * Inverts the current matrix.
   * 
   * @returns The current matrix.
   */
  public invert(): Matrix2 {
    glMatrix.mat2.invert(this, this);

    return this;
  }

  /**
   * Multiplies the current matrix by another matrix.
   * 
   * @param matrix2 - The matrix to multiply the current matrix by.
   * @returns The current matrix.
   */
  public multiply(matrix2: Matrix2): Matrix2 {
    glMatrix.mat2.mul(this, this, matrix2);

    return this;
  }
  
  /**
   * Multiplies each element of the current matrix by a scalar value.
   * 
   * @param scalar - The scalar value to multiply the current matrix elements by.
   * @returns The current matrix.
   */
  public multiplyScalar(scalar: number): Matrix2 {
    glMatrix.mat2.multiplyScalar(this, this, scalar);

    return this;
  }
  
  /**
   * Rotates the current matrix by an angle in radians.
   * 
   * @param angle - The angle in radians to rotate the current matrix by.
   * @returns The current matrix.
   */
  public rotate(angle: number): Matrix2 {
    glMatrix.mat2.rotate(this, this, angle);

    return this;
  }

  /**
   * Subtracts a matrix from the current matrix.
   * 
   * @param matrix2 - The matrix to subtract from the current matrix.
   * @returns The current matrix.
   */
  public subtract(matrix2: Matrix2): Matrix2 {
    glMatrix.mat2.sub(this, this, matrix2);

    return this;
  }

  /**
   * Returns a string representation of the current matrix.
   * 
   * @returns A string representation of the current matrix.
   */
  public toString(): string {
    return `[${this[0]},${this[1]}]` +
           `[${this[2]},${this[3]}]`;
  }
  
  /**
   * Transposes the current matrix.
   * 
   * @returns The current matrix.
   */
  public transpose(): Matrix2 {
    glMatrix.mat2.transpose(this, this);

    return this;
  } 
}
