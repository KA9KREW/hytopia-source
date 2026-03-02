import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { entitiesSchema } from '../../schemas/Entities';
import type { EntitiesSchema } from '../../schemas/Entities';
import type { WorldTick } from '../PacketCore';

export type EntitiesPacket = IPacket<typeof PacketId.ENTITIES, EntitiesSchema> & [WorldTick];

export const entitiesPacketDefinition = definePacket(
  PacketId.ENTITIES,
  entitiesSchema,
);
