import { vectorSchema } from './Vector';
import type { JSONSchemaType } from 'ajv';
import type { VectorSchema } from './Vector';

export type PhysicsDebugRaycastSchema = {
  o: VectorSchema; // rapier raycast origin
  d: VectorSchema; // rapier raycast direction
  l: number;       // rapier raycast length
  h: boolean;      // rapier raycast hit
}

export const physicsDebugRaycastSchema: JSONSchemaType<PhysicsDebugRaycastSchema> = {
  type: 'object',
  properties: {
    o: { ...vectorSchema },
    d: { ...vectorSchema },
    l: { type: 'number' },
    h: { type: 'boolean' },
  },
  required: [ 'o', 'd', 'l', 'h' ],
  additionalProperties: false,
}