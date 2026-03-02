import type { JSONSchemaType } from 'ajv';

export type QuaternionSchema = [
  number, // x
  number, // y
  number, // z
  number, // w
];

export const quaternionSchema: JSONSchemaType<QuaternionSchema> = {
  type: 'array',
  items: [
    { type: 'number' },
    { type: 'number' },
    { type: 'number' },
    { type: 'number' }
  ],
  minItems: 4,
  maxItems: 4
}