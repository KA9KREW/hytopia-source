import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { playersSchema } from '../../schemas/Players';
import type { PlayersSchema } from '../../schemas/Players';
import type { WorldTick } from '../PacketCore';

export type PlayersPacket = IPacket<typeof PacketId.PLAYERS, PlayersSchema> & [WorldTick];

export const playersPacketDefinition = definePacket(
  PacketId.PLAYERS,
  playersSchema,
);
