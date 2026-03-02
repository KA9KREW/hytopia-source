import { vectorSchema } from './Vector';
import type { JSONSchemaType } from 'ajv';
import type { VectorSchema } from './Vector';

export type BlockSchema = {
  i: number;        // block id
  c: VectorSchema;  // block global coordinate
  r?: number;       // block rotation enum index
};

export const blockSchema: JSONSchemaType<BlockSchema> = {
  type: 'object',
  properties: {
    i: { type: 'number' },
    c: vectorSchema,
    r: { type: 'number', nullable: true },
  },
  required: [ 'i', 'c' ],
  additionalProperties: false,
}