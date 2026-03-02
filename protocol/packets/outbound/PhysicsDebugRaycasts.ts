import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { physicsDebugRaycastsSchema } from '../../schemas/PhysicsDebugRaycasts';
import type { PhysicsDebugRaycastsSchema } from '../../schemas/PhysicsDebugRaycasts';
import type { WorldTick } from '../PacketCore';

export type PhysicsDebugRaycastsPacket = IPacket<typeof PacketId.PHYSICS_DEBUG_RAYCASTS, PhysicsDebugRaycastsSchema> & [WorldTick];

export const physicsDebugRaycastsPacketDefinition = definePacket(
  PacketId.PHYSICS_DEBUG_RAYCASTS,
  physicsDebugRaycastsSchema,
);
