import type { JSONSchemaType } from 'ajv';

export type SyncRequestSchema = null;

export const syncRequestSchema: JSONSchemaType<SyncRequestSchema> = {
  type: 'null',
  nullable: true,
}
