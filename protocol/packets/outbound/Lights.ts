import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { lightsSchema } from '../../schemas/Lights';
import type { LightsSchema } from '../../schemas/Lights';
import type { WorldTick } from '../PacketCore';

export type LightsPacket = IPacket<typeof PacketId.LIGHTS, LightsSchema> & [WorldTick];

export const lightsPacketDefinition = definePacket(
  PacketId.LIGHTS,
  lightsSchema,
);
