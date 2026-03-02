import type { JSONSchemaType } from 'ajv';

export type PlayerSchema = {
  i: string;    // player id
  p?: string;   // profile picture url
  rm?: boolean; // removed/left game
  u?: string;   // username
}

export const playerSchema: JSONSchemaType<PlayerSchema> = {
  type: 'object',
  properties: {
    i: { type: 'string' },
    p: { type: 'string', nullable: true },
    rm: { type: 'boolean', nullable: true },
    u: { type: 'string', nullable: true },
  },
  required: [ 'i' ],
  additionalProperties: false,
}