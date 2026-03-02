import { JSONSchemaType } from 'ajv';

export type ConnectionSchema = {
  i?: string;  // connection id   | server -> client | on initial WS connection
  k?: boolean; // kill connection | server -> client | tells client to close connection & not reconnect
};

export const connectionSchema: JSONSchemaType<ConnectionSchema> = {
  type: 'object',
  properties: {
    i: { type: 'string', nullable: true },
    k: { type: 'boolean', nullable: true },
  },
  additionalProperties: false,
};