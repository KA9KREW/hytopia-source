import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { uiSchema } from '../../schemas/UI';
import type { UISchema } from '../../schemas/UI';
import type { WorldTick } from '../PacketCore';

export type UIPacket = IPacket<typeof PacketId.UI, UISchema> & [WorldTick];

export const uiPacketDefinition = definePacket(
  PacketId.UI,
  uiSchema,
);
