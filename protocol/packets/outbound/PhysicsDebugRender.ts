import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { physicsDebugRenderSchema } from '../../schemas/PhysicsDebugRender';
import type { PhysicsDebugRenderSchema } from '../../schemas/PhysicsDebugRender';
import type { WorldTick } from '../PacketCore';

export type PhysicsDebugRenderPacket = IPacket<typeof PacketId.PHYSICS_DEBUG_RENDER, PhysicsDebugRenderSchema> & [WorldTick];

export const physicsDebugRenderPacketDefinition = definePacket(
  PacketId.PHYSICS_DEBUG_RENDER,
  physicsDebugRenderSchema,
);
