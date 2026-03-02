import { vectorSchema } from './Vector';
import type { JSONSchemaType } from 'ajv';
import type { VectorSchema } from './Vector';

export type SceneUISchema = {
  i: number;        // scene ui id
  e?: number;       // entity attachment, follows entity id
  o?: VectorSchema; // offset
  p?: VectorSchema; // spatial position of ui
  rm?: boolean;     // remove/removed
  s?: object;       // state
  t?: string;       // template id
  v?: number;       // view distance
}

export const sceneUISchema: JSONSchemaType<SceneUISchema> = {
  type: 'object',
  properties: {
    i: { type: 'number' },
    e: { type: 'number', nullable: true },
    o: { ...vectorSchema, nullable: true },
    p: { ...vectorSchema, nullable: true },
    rm: { type: 'boolean', nullable: true },
    s: { type: 'object', nullable: true },
    t: { type: 'string', nullable: true },
    v: { type: 'number', nullable: true },
  },
  required: ['i'],
  additionalProperties: false,
}