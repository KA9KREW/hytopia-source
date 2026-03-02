import type { JSONSchemaType } from 'ajv';

export type SyncResponseSchema = {
  r: number; // server absolute time at sync request as Date.now()
  s: number; // server absolute time at sync response as Date.now()
  p: number; // high resolution ms of total processing time from request receipt to response
  n: number; // high resolution ms at server response time until next server tick
};

export const syncResponseSchema: JSONSchemaType<SyncResponseSchema> = {
  type: 'object',
  properties: {
    r: { type: 'number' },
    s: { type: 'number' },
    p: { type: 'number' },
    n: { type: 'number' },
  },
  required: [ 'r', 's', 'p', 'n' ],
  additionalProperties: false,
}