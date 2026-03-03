import DefaultPlayerEntityController from '@/worlds/entities/controllers/DefaultPlayerEntityController';
import type PlayerEntity from '@/worlds/entities/PlayerEntity';
import type { PlayerInput } from '@/players/Player';
import type { PlayerCameraOrientation } from '@/players/PlayerCamera';

const DOUBLE_TAP_MS = 350;
const FLY_VELOCITY = 12;
const FLY_VERTICAL_VELOCITY = 10;

/**
 * Extends DefaultPlayerEntityController with double-tap spacebar to toggle fly mode.
 * When flying: space = up, shift = down, WASD = move. Gravity disabled.
 */
export default class FlyablePlayerEntityController extends DefaultPlayerEntityController {
  private _lastSpaceReleaseAt = 0;
  private _wasSpacePressed = false;
  private _isFlying = true; // default fly on spawn so player doesn't fall before chunks load

  public override tickWithPlayerInput(
    entity: PlayerEntity,
    input: PlayerInput,
    cameraOrientation: PlayerCameraOrientation,
    deltaTimeMs: number
  ): void {
    const { sp, w, a, s, d, sh } = input;
    const now = performance.now();

    // Double-tap space detection
    if (sp && !this._wasSpacePressed) {
      if (now - this._lastSpaceReleaseAt < DOUBLE_TAP_MS) {
        this._isFlying = !this._isFlying;
        entity.setGravityScale(this._isFlying ? 0 : 1);
      }
    }
    this._wasSpacePressed = !!sp;
    if (!sp) {
      this._lastSpaceReleaseAt = now;
    }

    if (this._isFlying) {
      entity.setGravityScale(0);
      const { yaw } = cameraOrientation;
      const sinYaw = Math.sin(yaw);
      const cosYaw = Math.cos(yaw);
      let vx = 0;
      let vz = 0;
      let vy = 0;

      if (w) { vx -= FLY_VELOCITY * sinYaw; vz -= FLY_VELOCITY * cosYaw; }
      if (s) { vx += FLY_VELOCITY * sinYaw; vz += FLY_VELOCITY * cosYaw; }
      if (a) { vx -= FLY_VELOCITY * cosYaw; vz += FLY_VELOCITY * sinYaw; }
      if (d) { vx += FLY_VELOCITY * cosYaw; vz -= FLY_VELOCITY * sinYaw; }
      if (sp) vy = FLY_VERTICAL_VELOCITY;
      if (sh) vy = -FLY_VERTICAL_VELOCITY;

      const horizontalSpeed = Math.sqrt(vx * vx + vz * vz);
      if (horizontalSpeed > FLY_VELOCITY) {
        const factor = FLY_VELOCITY / horizontalSpeed;
        vx *= factor;
        vz *= factor;
      }

      entity.setLinearVelocity({ x: vx, y: vy, z: vz });

      // Apply character rotation (face movement or camera)
      const hasMove = w || a || s || d;
      let movementYaw = yaw;
      if (hasMove) {
        if (w && a && !d && !s) movementYaw = yaw + Math.PI / 4;
        else if (w && d && !a && !s) movementYaw = yaw - Math.PI / 4;
        else if (s && a && !w && !d) movementYaw = yaw + Math.PI - Math.PI / 4;
        else if (s && d && !w && !a) movementYaw = yaw + Math.PI + Math.PI / 4;
        else if (s && !w && !a && !d) movementYaw = yaw + Math.PI;
        else if (a && !w && !s && !d) movementYaw = yaw + Math.PI / 2;
        else if (d && !w && !a && !s) movementYaw = yaw - Math.PI / 2;
      }
      const halfYaw = movementYaw * 0.5;
      entity.setRotation({
        x: 0,
        y: Math.sin(halfYaw),
        z: 0,
        w: Math.cos(halfYaw),
      });
      return;
    }

    super.tickWithPlayerInput(entity, input, cameraOrientation, deltaTimeMs);
  }
}
