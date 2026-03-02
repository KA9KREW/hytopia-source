import { playerSchema } from './Player';
import type { JSONSchemaType } from 'ajv';
import type { PlayerSchema } from './Player';

export type PlayersSchema = PlayerSchema[];

export const playersSchema: JSONSchemaType<PlayersSchema> = {
  type: 'array',
  items: { ...playerSchema },
}