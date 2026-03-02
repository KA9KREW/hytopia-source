import type { JSONSchemaType } from 'ajv';

export type DebugConfigSchema = {
  // physics debug render enabled,
  // setting true will cause the
  // server to send a PhysicsDebugRender
  // packet per tick.
  pdr?: boolean; 
}

export const debugConfigSchema: JSONSchemaType<DebugConfigSchema> = {
  type: 'object',
  properties: {
    pdr: { type: 'boolean', nullable: true },
  },
  additionalProperties: false,
}