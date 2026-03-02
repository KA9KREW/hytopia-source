import { physicsDebugRaycastSchema } from './PhysicsDebugRaycast';
import type { JSONSchemaType } from 'ajv';
import type { PhysicsDebugRaycastSchema } from './PhysicsDebugRaycast';

export type PhysicsDebugRaycastsSchema = PhysicsDebugRaycastSchema[];

export const physicsDebugRaycastsSchema: JSONSchemaType<PhysicsDebugRaycastsSchema> = {
  type: 'array',
  items: { ...physicsDebugRaycastSchema },
}