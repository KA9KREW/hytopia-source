import type { JSONSchemaType } from 'ajv';

export type PhysicsDebugRenderSchema = {
  v: number[]; // rapier debug render vertices
  c: number[]; // rapier debug render colors
}

export const physicsDebugRenderSchema: JSONSchemaType<PhysicsDebugRenderSchema> = {
  type: 'object',
  properties: {
    v: { type: 'array', items: { type: 'number' } },
    c: { type: 'array', items: { type: 'number' } },
  },
  required: [ 'v', 'c' ],
  additionalProperties: false,
}