import type { JSONSchemaType } from 'ajv';

export type HeartbeatSchema = null;

export const heartbeatSchema: JSONSchemaType<HeartbeatSchema> = {
  type: 'null',
  nullable: true,
}
