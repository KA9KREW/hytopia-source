import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { chatMessageSchema } from '../../schemas/ChatMessage';
import type { ChatMessageSchema } from '../../schemas/ChatMessage';

export type ChatMessageSendPacket = IPacket<typeof PacketId.CHAT_MESSAGE_SEND, ChatMessageSchema>;

export const chatMessageSendPacketDefinition = definePacket(
  PacketId.CHAT_MESSAGE_SEND,
  chatMessageSchema
);
