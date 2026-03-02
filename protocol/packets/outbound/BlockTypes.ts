import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { blockTypesSchema } from '../../schemas/BlockTypes';
import type { BlockTypesSchema } from '../../schemas/BlockTypes';
import type { WorldTick } from '../PacketCore';

export type BlockTypesPacket = IPacket<typeof PacketId.BLOCK_TYPES, BlockTypesSchema> & [WorldTick];

export const blockTypesPacketDefinition = definePacket(
  PacketId.BLOCK_TYPES,
  blockTypesSchema,
);
