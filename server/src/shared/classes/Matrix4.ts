import * as glMatrix from 'gl-matrix';
import type Quaternion from '@/shared/classes/Quaternion';
import type Vector3 from '@/shared/classes/Vector3';

/**
 * Represents a 4x4 matrix.
 *
 * When to use: 3D transforms (translation, rotation, scale) and camera math.
 * Do NOT use for: immutable math; most methods mutate the instance.
 *
 * @remarks
 * All matrix methods result in mutation of the matrix instance.
 * This class extends `Float32Array` to provide an efficient way to
 * create and manipulate a 4x4 matrix.
 *
 * Pattern: reuse instances to reduce allocations.
 * Anti-pattern: treating matrices as immutable values.
 *
 * **Category:** Math
 * @public
 */
export default class Matrix4 extends Float32Array {
  public constructor(
    m00: number, m01: number, m02: number, m03: number,
    m10: number, m11: number, m12: number, m13: number,
    m20: number, m21: number, m22: number, m23: number,
    m30: number, m31: number, m32: number, m33: number,
  ) {
    super([
      m00, m01, m02, m03,
      m10, m11, m12, m13,
      m20, m21, m22, m23,
      m30, m31, m32, m33,
    ]);
  }

  /** The determinant of the matrix. */
  public get determinant(): number {
    return glMatrix.mat4.determinant(this);
  }

  /** The frobenius norm of the matrix. */
  public get frobeniusNorm(): number {
    return glMatrix.mat4.frob(this);
  }

  /**
   * Creates a new `Matrix4` instance.
   * 
   * @returns A new `Matrix4` instance.
   */
  public static create(): Matrix4 {
    const matrix = new Matrix4(
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    );

    glMatrix.mat4.identity(matrix);

    return matrix;
  }
  /**
   * Creates a new `Matrix4` instance from a `Quaternion` object.
   * 
   * @param quaternion - The `Quaternion` object to create the `Matrix4` instance from.
   * @returns A new `Matrix4` instance.
   */
  public static fromQuaternion(quaternion: Quaternion): Matrix4 {
    const matrix = Matrix4.create();

    glMatrix.mat4.fromQuat(matrix, quaternion);

    return matrix;
  }

  /**
   * Creates a new `Matrix4` instance from an angle and axis.
   * 
   * @param angle - The angle in radians to rotate the matrix by.
   * @param axis - The axis to rotate the matrix around.
   * @returns A new `Matrix4` instance.
   */
  public static fromRotation(angle: number, axis: Vector3): Matrix4 {
    const matrix = Matrix4.create();

    glMatrix.mat4.fromRotation(matrix, angle, axis);

    return matrix;
  }

  /**
   * Creates a new `Matrix4` instance from a rotation and translation.
   * 
   * @param rotation - The rotation of the matrix.
   * @param translation - The translation of the matrix.
   * @returns A new `Matrix4` instance.
   */
  public static fromRotationTranslation(rotation: Quaternion, translation: Vector3): Matrix4 {
    const matrix = Matrix4.create();

    glMatrix.mat4.fromRotationTranslation(matrix, rotation, translation);

    return matrix;
  }

  /**
   * Creates a new `Matrix4` instance from a rotation, translation, and scale.
   * 
   * @param rotation - The rotation of the matrix.
   * @param translation - The translation of the matrix.
   * @param scale - The scale of the matrix.
   * @returns A new `Matrix4` instance.
   */
  public static fromRotationTranslationScale(rotation: Quaternion, translation: Vector3, scale: Vector3): Matrix4 {
    const matrix = Matrix4.create();

    glMatrix.mat4.fromRotationTranslationScale(matrix, rotation, translation, scale);

    return matrix;
  }

  /**
   * Creates a new `Matrix4` instance from a rotation, translation, scale, and origin.
   * 
   * @param rotation - The rotation of the matrix.
   * @param translation - The translation of the matrix.
   * @param scale - The scale of the matrix.
   * @param origin - The origin of the matrix.
   * @returns A new `Matrix4` instance.
   */
  public static fromRotationTranslationScaleOrigin(rotation: Quaternion, translation: Vector3, scale: Vector3, origin: Vector3): Matrix4 {
    const matrix = Matrix4.create();
    glMatrix.mat4.fromRotationTranslationScaleOrigin(matrix, rotation, translation, scale, origin);

    return matrix;
  }

  /**
   * Creates a new `Matrix4` instance from a scale of identity matrix.
   * 
   * @param scale - The scale of the matrix.
   * @returns A new `Matrix4` instance.
   */
  public static fromScaling(scale: Vector3): Matrix4 {
    const matrix = Matrix4.create();

    glMatrix.mat4.fromScaling(matrix, scale);

    return matrix;
  }

  /**
   * Creates a new `Matrix4` instance from a translation of identity matrix.
   * 
   * @param translation - The translation of the matrix.
   * @returns A new `Matrix4` instance.
   */
  public static fromTranslation(translation: Vector3): Matrix4 {
    const matrix = Matrix4.create();

    glMatrix.mat4.fromTranslation(matrix, translation);

    return matrix;
  }

  /**
   * Creates a new `Matrix4` instance from an x-rotation of identity matrix.
   * 
   * @param angle - The angle in radians to rotate the matrix by.
   * @returns A new `Matrix4` instance.
   */
  public static fromXRotation(angle: number): Matrix4 {
    const matrix = Matrix4.create();

    glMatrix.mat4.fromXRotation(matrix, angle);

    return matrix;
  }

  /**
   * Creates a new `Matrix4` instance from a y-rotation of identity matrix.
   * 
   * @param angle - The angle in radians to rotate the matrix by.
   * @returns A new `Matrix4` instance.
   */
  public static fromYRotation(angle: number): Matrix4 {
    const matrix = Matrix4.create();

    glMatrix.mat4.fromYRotation(matrix, angle);

    return matrix;
  }

  /**
   * Creates a new `Matrix4` instance from a z-rotation of identity matrix.
   * 
   * @param angle - The angle in radians to rotate the matrix by.
   * @returns A new `Matrix4` instance.
   */
  public static fromZRotation(angle: number): Matrix4 {
    const matrix = Matrix4.create();

    glMatrix.mat4.fromZRotation(matrix, angle);

    return matrix;
  }

  /**
   * Adds a matrix to the current matrix.
   * 
   * @param matrix4 - The matrix to add to the current matrix.
   * @returns The current matrix.
   */
  public add(matrix4: Matrix4): Matrix4 {
    glMatrix.mat4.add(this, this, matrix4);

    return this;
  }
  
  /**
   * Sets the adjugate of the current matrix.
   * 
   * @returns The current matrix.
   */
  public adjoint(): Matrix4 {
    glMatrix.mat4.adjoint(this, this);

    return this;
  }

  /**
   * Clones the current matrix.
   * 
   * @returns A clone of the current matrix.
   */
  public clone(): Matrix4 {
    return new Matrix4(
      this[0], this[1], this[2], this[3],
      this[4], this[5], this[6], this[7],
      this[8], this[9], this[10], this[11],
      this[12], this[13], this[14], this[15],
    );
  }

  /**
   * Copies a matrix to the current matrix.
   * 
   * @param matrix4 - The matrix to copy to the current matrix.
   * @returns The current matrix.
   */
  public copy(matrix4: Matrix4): Matrix4 {
    glMatrix.mat4.copy(this, matrix4);

    return this;
  }

  /**
   * Checks if the current matrix is approximately equal to another matrix.
   * 
   * @param matrix4 - The matrix to compare to the current matrix.
   * @returns `true` if the current matrix is equal to the provided matrix, `false` otherwise.
   */
  public equals(matrix4: Matrix4): boolean {
    return glMatrix.mat4.equals(this, matrix4);
  }

  /**
   * Checks if the current matrix is exactly equal to another matrix.
   * 
   * @param matrix4 - The matrix to compare to the current matrix.
   * @returns `true` if the current matrix is equal to the provided matrix, `false` otherwise.
   */
  public exactEquals(matrix4: Matrix4): boolean {
    return glMatrix.mat4.exactEquals(this, matrix4);
  }

  /**
   * Sets the current matrix to a frustrum matrix with the given bounds.
   * 
   * @param left - The left bound of the projection.
   * @param right - The right bound of the projection.
   * @param bottom - The bottom bound of the projection.
   * @param top - The top bound of the projection.
   * @param near - The near bound of the projection.
   * @param far - The far bound of the projection.
   * @returns The current matrix.
   */
  public frustrum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
    glMatrix.mat4.frustum(this, left, right, bottom, top, near, far);

    return this;
  }

  /**
   * Sets the current matrix to the identity matrix.
   * 
   * @returns The current matrix.
   */
  public identity(): Matrix4 {
    glMatrix.mat4.identity(this);

    return this;
  }
  
  /**
   * Inverts the current matrix.
   * 
   * @returns The current matrix.
   */
  public invert(): Matrix4 {
    glMatrix.mat4.invert(this, this);

    return this;
  }

  /**
   * Sets the current matrix to a look-at matrix with the given eye, center, and up vectors.
   * 
   * @param eye - The eye vector of the camera.
   * @param center - The center vector of the camera.
   * @param up - The up vector of the camera.
   * @returns The current matrix.
   */
  public lookAt(eye: Vector3, center: Vector3, up: Vector3): Matrix4 {
    glMatrix.mat4.lookAt(this, eye, center, up);

    return this;
  }
  
  /**
   * Multiplies the current matrix by another matrix.
   * 
   * @param matrix4 - The matrix to multiply the current matrix by.
   * @returns The current matrix.
   */
  public multiply(matrix4: Matrix4): Matrix4 {
    glMatrix.mat4.mul(this, this, matrix4);

    return this;
  }
  
  /**
   * Multiplies each element of the current matrix by a scalar value.
   * 
   * @param scalar - The scalar value to multiply the current matrix elements by.
   * @returns The current matrix.
   */
  public multiplyScalar(scalar: number): Matrix4 {
    glMatrix.mat4.multiplyScalar(this, this, scalar);

    return this;
  }

  /**
   * Sets the current matrix to an orthographic projection matrix with the given bounds.
   * 
   * @param left - The left bound of the frustum.
   * @param right - The right bound of the frustum.
   * @param bottom - The bottom bound of the frustum.
   * @param top - The top bound of the frustum.
   * @param near - The near bound of the frustum.
   * @param far - The far bound of the frustum.
   * @returns The current matrix.
   */
  public orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
    glMatrix.mat4.ortho(this, left, right, bottom, top, near, far);

    return this;
  }

  /**
   * Sets the current matrix to a perspective matrix with the given field of view, aspect ratio, and near and far bounds.
   * 
   * @param fovy - The field of view of the projection.
   * @param aspect - The aspect ratio of the projection.
   * @param near - The near bound of the projection.
   * @param far - The far bound of the projection.
   * @returns The current matrix.
   */
  public perspective(fovy: number, aspect: number, near: number, far: number): Matrix4 {
    glMatrix.mat4.perspective(this, fovy, aspect, near, far);

    return this;
  }
  
  /**
   * Rotates the current matrix by an angle in radians around an axis.
   * 
   * @param angle - The angle in radians to rotate the current matrix by.
   * @param axis - The axis to rotate the current matrix around.
   * @returns The current matrix.
   */
  public rotate(angle: number, axis: Vector3): Matrix4 {
    glMatrix.mat4.rotate(this, this, angle, axis);

    return this;
  }
  
  /**
   * Rotates the current matrix by an angle in radians around the x-axis.
   * 
   * @param angle - The angle in radians to rotate the current matrix by.
   * @returns The current matrix.
   */
  public rotateX(angle: number): Matrix4 {
    glMatrix.mat4.rotateX(this, this, angle);

    return this;
  }

  /**
   * Rotates the current matrix by an angle in radians around the y-axis.
   * 
   * @param angle - The angle in radians to rotate the current matrix by.
   * @returns The current matrix.
   */
  public rotateY(angle: number): Matrix4 {
    glMatrix.mat4.rotateY(this, this, angle);

    return this;
  }   

  /**
   * Rotates the current matrix by an angle in radians around the z-axis.
   * 
   * @param angle - The angle in radians to rotate the current matrix by.
   * @returns The current matrix.
   */
  public rotateZ(angle: number): Matrix4 {
    glMatrix.mat4.rotateZ(this, this, angle);

    return this;
  }
  
  /**
   * Scales the current matrix by a vector.
   * 
   * @param vector3 - The vector to scale the current matrix by.
   * @returns The current matrix.
   */
  public scale(vector3: Vector3): Matrix4 {
    glMatrix.mat4.scale(this, this, vector3);

    return this;
  }
  
  /**
   * Subtracts a matrix from the current matrix.
   * 
   * @param matrix4 - The matrix to subtract from the current matrix.
   * @returns The current matrix.
   */
  public subtract(matrix4: Matrix4): Matrix4 {
    glMatrix.mat4.sub(this, this, matrix4);

    return this;
  }

  /**
   * Sets the current matrix to a matrix that looks at a target.
   * 
   * @param eye - The eye vector of the camera.
   * @param center - The center vector of the camera.
   * @param up - The up vector of the camera.
   * @returns The current matrix.
   */
  public targetTo(eye: Vector3, center: Vector3, up: Vector3): Matrix4 {
    glMatrix.mat4.targetTo(this, eye, center, up);

    return this;
  }

  /**
   * Returns a string representation of the current matrix.
   * 
   * @returns A string representation of the current matrix.
   */
  public toString(): string {
    return `[${this[0]},${this[1]},${this[2]},${this[3]}]` +
           `[${this[4]},${this[5]},${this[6]},${this[7]}]` +
           `[${this[8]},${this[9]},${this[10]},${this[11]}]` +
           `[${this[12]},${this[13]},${this[14]},${this[15]}]`;
  }
  
  /**
   * Translates the current matrix by a vector.
   * 
   * @param vector3 - The vector to translate the current matrix by.
   * @returns The current matrix.
   */
  public translate(vector3: Vector3): Matrix4 {
    glMatrix.mat4.translate(this, this, vector3);

    return this;
  }
  
  /**
   * Transposes the current matrix.
   * 
   * @returns The current matrix.
   */
  public transpose(): Matrix4 {
    glMatrix.mat4.transpose(this, this);

    return this;
  }
}
