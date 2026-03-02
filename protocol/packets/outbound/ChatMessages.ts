import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { chatMessagesSchema } from '../../schemas/ChatMessages';
import type { ChatMessagesSchema } from '../../schemas/ChatMessages';
import type { WorldTick } from '../PacketCore';

export type ChatMessagesPacket = IPacket<typeof PacketId.CHAT_MESSAGES, ChatMessagesSchema> & [WorldTick];

export const chatMessagesPacketDefinition = definePacket(
  PacketId.CHAT_MESSAGES,
  chatMessagesSchema,
);