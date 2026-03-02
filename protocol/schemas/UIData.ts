import type { JSONSchemaType } from 'ajv';

export type UIDataSchema = {
  [key: string]: any;
}

export const uiDataSchema: JSONSchemaType<UIDataSchema> = {
  type: 'object',
  properties: {},
  additionalProperties: true,
}