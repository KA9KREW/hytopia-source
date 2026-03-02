import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { audiosSchema } from '../../schemas/Audios';
import type { AudiosSchema } from '../../schemas/Audios';
import type { WorldTick } from '../PacketCore';

export type AudiosPacket = IPacket<typeof PacketId.AUDIOS, AudiosSchema> & [WorldTick];

export const audiosPacketDefinition = definePacket(
  PacketId.AUDIOS,
  audiosSchema,
);
