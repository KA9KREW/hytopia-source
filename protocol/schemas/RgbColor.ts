import type { JSONSchemaType } from 'ajv';

export type RgbColorSchema = [
  number, // r
  number, // g
  number, // b
];

export const rgbColorSchema: JSONSchemaType<RgbColorSchema> = {
  type: 'array',
  items: [
    { type: 'number', minimum: 0, maximum: 255 },
    { type: 'number', minimum: 0, maximum: 255 },
    { type: 'number', minimum: 0, maximum: 255 }
  ],
  minItems: 3,
  maxItems: 3,
}
