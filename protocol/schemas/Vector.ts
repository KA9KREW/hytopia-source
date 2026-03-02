import type { JSONSchemaType } from 'ajv';

export type VectorSchema = [
  number, // x
  number, // y
  number, // z
];

export const vectorSchema: JSONSchemaType<VectorSchema> = {
  type: 'array',
  items: [
    { type: 'number' },
    { type: 'number' },
    { type: 'number' }
  ],
  minItems: 3,
  maxItems: 3
}