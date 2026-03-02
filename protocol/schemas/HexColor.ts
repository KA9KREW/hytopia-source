import type { JSONSchemaType } from 'ajv';

export type HexColorSchema = string;

export const hexColorSchema: JSONSchemaType<HexColorSchema> = {
  type: 'string',
  pattern: '^[0-9A-Fa-f]{6}$'
}