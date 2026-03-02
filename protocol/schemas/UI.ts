import type { JSONSchemaType } from 'ajv';

export type UISchema = {
  p?: boolean;   // pointer lock, true = lock pointer, false = unlock pointer
  pf?: boolean;  // pointer lock freeze, prevents states other than p for pointer lock
  u?: string;    // .html ui uri to load
  ua?: string[]; // .html ui uris to append
};

export const uiSchema: JSONSchemaType<UISchema> = {
  type: 'object',
  properties: {
    p: { type: 'boolean', nullable: true },
    pf: { type: 'boolean', nullable: true },
    u: { type: 'string', nullable: true },
    ua: { type: 'array', items: { type: 'string' }, nullable: true },
  },
  additionalProperties: false,
}