import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { uiDataSchema } from '../../schemas/UIData';
import type { UIDataSchema } from '../../schemas/UIData';

export type UIDataSendPacket = IPacket<typeof PacketId.UI_DATA_SEND, UIDataSchema>;

export const uiDataSendPacketDefinition = definePacket(
  PacketId.UI_DATA_SEND,
  uiDataSchema
);
