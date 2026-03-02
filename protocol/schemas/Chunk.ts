import { vectorSchema } from './Vector';
import type { JSONSchemaType } from 'ajv';
import type { VectorSchema } from './Vector';

export type ChunkSchema = {
  c: VectorSchema;           // chunk origin coordinate [ 16n, 16n, 16n ]
  b?: Uint8Array | number[]; // block ids in chunk, 16^3 entries, registry block ids 1-255, 0 = none
  r?: number[];              // block rotations, sparse array of block id index -> block rotation index
  rm?: boolean;              // removed/remove
};

export const chunkSchema: JSONSchemaType<ChunkSchema> = {
  type: 'object',
  properties: {
    c: vectorSchema,
    b: {
      type: 'array',
      items: {
        type: 'number',
        minimum: 0,
        maximum: 255
      },
      minItems: 4096,
      maxItems: 4096,
      nullable: true,
    },
    r: {
      type: 'array',
      items: { type: 'number' },
      minItems: 0,
      maxItems: 8192, // 4096 blocks per chunk, multiples of 2 for block id index, block rotation index
      nullable: true,
    },
    rm: { type: 'boolean', nullable: true },
  },
  required: [ 'c' ],
  additionalProperties: false,
}