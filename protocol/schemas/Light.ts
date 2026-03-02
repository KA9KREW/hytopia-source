import { vectorSchema } from './Vector';
import { rgbColorSchema } from './RgbColor';
import type { JSONSchemaType } from 'ajv';
import type { RgbColorSchema } from './RgbColor';
import type { VectorSchema } from './Vector';

export type LightSchema = {
  i: number;          // light id
  a?: number;         // if spotlight, angle in radians
  e?: number;         // entity attachment, follows entity id
  c?: RgbColorSchema; // light color
  d?: number;         // maximum distance of the light
  n?: number;         // light intensity
  o?: VectorSchema;   // offset
  p?: VectorSchema;   // spatial position of the light
  pe?: number;        // if spotlight, penumbra %, 0 to 1
  rm?: boolean;       // remove/removed
  t?: number;         // light type, 0: point, 1: spotlight
  te?: number;        // if spotlight, tracked entity id
  tp?: VectorSchema;  // if spotlight, tracked position
}

export const lightSchema: JSONSchemaType<LightSchema> = {
  type: 'object',
  properties: {
    i: { type: 'number' },
    a: { type: 'number', nullable: true },
    e: { type: 'number', nullable: true },
    c: { ...rgbColorSchema, nullable: true },
    d: { type: 'number', nullable: true },
    n: { type: 'number', nullable: true },
    o: { ...vectorSchema, nullable: true },
    p: { ...vectorSchema, nullable: true },
    pe: { type: 'number', minimum: 0, maximum: 1, nullable: true },
    rm: { type: 'boolean', nullable: true },
    t: { type: 'number', nullable: true },
    te: { type: 'number', nullable: true },
    tp: { ...vectorSchema, nullable: true },
  },
  required: ['i'],
  additionalProperties: false,
}