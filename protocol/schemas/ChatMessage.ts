import { hexColorSchema } from './HexColor';
import type { JSONSchemaType } from 'ajv';
import type { HexColorSchema } from './HexColor';

export type ChatMessageSchema = {
  m: string;          // message
  c?: HexColorSchema; // color
  p?: string;         // player id
}

export const chatMessageSchema: JSONSchemaType<ChatMessageSchema> = {
  type: 'object',
  properties: {
    m: { type: 'string' },
    c: { ...hexColorSchema, nullable: true },
    p: { type: 'string', nullable: true },
  },
  required: ['m'],
  additionalProperties: false,
}