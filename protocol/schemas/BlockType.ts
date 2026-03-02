import type { JSONSchemaType } from 'ajv';

export type BlockTypeSchema = {
  i: number;                    // block type id
  l?: boolean;                  // liquid
  ll?: number;                  // light level
  n?: string;                   // name
  t?: string;                   // textureUri
  ti?: Uint32Array | number[];  // trimesh-based block indices
  tv?: Float32Array | number[]; // trimesh-based block vertices
}

export const blockTypeSchema: JSONSchemaType<BlockTypeSchema> = {
  type: 'object',
  properties: {
    i: { type: 'number' },
    l: { type: 'boolean', nullable: true },
    ll: { type: 'number', nullable: true },
    n: { type: 'string', nullable: true },
    t: { type: 'string', nullable: true },
    ti: { type: 'array', items: { type: 'number' }, nullable: true },
    tv: { type: 'array', items: { type: 'number' }, nullable: true },
  },
  required: [ 'i' ],
  additionalProperties: false,
};