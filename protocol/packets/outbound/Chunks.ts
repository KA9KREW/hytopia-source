import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { chunksSchema } from '../../schemas/Chunks';
import type { ChunksSchema } from '../../schemas/Chunks';
import type { WorldTick } from '../PacketCore';

export type ChunksPacket = IPacket<typeof PacketId.CHUNKS, ChunksSchema> & [WorldTick];

export const chunksPacketDefinition = definePacket(
  PacketId.CHUNKS,
  chunksSchema,
);
