import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { worldSchema } from '../../schemas/World';
import type { WorldSchema } from '../../schemas/World';
import type { WorldTick } from '../PacketCore';

export type WorldPacket = IPacket<typeof PacketId.WORLD, WorldSchema> & [WorldTick];

export const worldPacketDefinition = definePacket(
  PacketId.WORLD,
  worldSchema,
);
