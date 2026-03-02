import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { blocksSchema } from '../../schemas/Blocks';
import type { BlocksSchema } from '../../schemas/Blocks';
import type { WorldTick } from '../PacketCore';

export type BlocksPacket = IPacket<typeof PacketId.BLOCKS, BlocksSchema> & [WorldTick];

export const blocksPacketDefinition = definePacket(
  PacketId.BLOCKS,
  blocksSchema,
);
