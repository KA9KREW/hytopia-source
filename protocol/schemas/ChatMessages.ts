import { chatMessageSchema } from './ChatMessage';
import type { JSONSchemaType } from 'ajv';
import type { ChatMessageSchema } from './ChatMessage';

export type ChatMessagesSchema = ChatMessageSchema[];

export const chatMessagesSchema: JSONSchemaType<ChatMessagesSchema> = {
  type: 'array',
  items: { ...chatMessageSchema },
}