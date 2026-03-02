import type { JSONSchemaType } from 'ajv';

export type VectorBooleanSchema = [
  boolean, // x
  boolean, // y
  boolean, // z
];

export const vectorBooleanSchema: JSONSchemaType<VectorBooleanSchema> = {
  type: 'array',
  items: [
    { type: 'boolean' },
    { type: 'boolean' },
    { type: 'boolean' }
  ],
  minItems: 3,
  maxItems: 3
}