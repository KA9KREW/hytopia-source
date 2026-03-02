import { rgbColorSchema } from './RgbColor';
import type { JSONSchemaType } from 'ajv';
import type { RgbColorSchema } from './RgbColor';

export type OutlineSchema = {
  c?: RgbColorSchema;  // color
  ci?: number;         // color intensity
  th?: number;         // thickness
  o?: number;          // opacity
  oc?: boolean;        // occluded
}

export const outlineSchema: JSONSchemaType<OutlineSchema> = {
  type: 'object',
  properties: {
    c: { ...rgbColorSchema, nullable: true },
    ci: { type: 'number', nullable: true },
    th: { type: 'number', nullable: true },
    o: { type: 'number', nullable: true },
    oc: { type: 'boolean', nullable: true },
  },
  required: [],
  additionalProperties: false,
}
