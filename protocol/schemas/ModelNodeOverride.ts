import { rgbColorSchema } from './RgbColor';
import { quaternionSchema } from './Quaternion';
import { vectorSchema } from './Vector';
import type { JSONSchemaType } from 'ajv';
import type { QuaternionSchema } from './Quaternion';
import type { RgbColorSchema } from './RgbColor';
import type { VectorSchema } from './Vector';


export type ModelNodeOverrideSchema = {
  n: string;            // node name match
  ec?: RgbColorSchema;  // emissive color
  ei?: number;          // emissive intensity
  h?: boolean;          // hidden
  p?: VectorSchema;     // local position
  pi?: number;          // local position interpolation time in milliseconds
  r?: QuaternionSchema; // local rotation
  ri?: number;          // local rotation interpolation time in milliseconds
  rm?: boolean;         // removed/remove
  s?: VectorSchema;     // local scale
  si?: number;          // local scale interpolation time in milliseconds
}

export const modelNodeOverrideSchema: JSONSchemaType<ModelNodeOverrideSchema> = {
  type: 'object',
  properties: {
    n: { type: 'string' },
    ec: { ...rgbColorSchema, nullable: true },
    ei: { type: 'number', nullable: true },
    h: { type: 'boolean', nullable: true },
    p: { ...vectorSchema, nullable: true },
    pi: { type: 'number', nullable: true },
    r: { ...quaternionSchema, nullable: true },
    ri: { type: 'number', nullable: true },
    rm: { type: 'boolean', nullable: true },
    s: { ...vectorSchema, nullable: true },
    si: { type: 'number', nullable: true },
  },
  required: [ 'n' ],
  additionalProperties: false,
}