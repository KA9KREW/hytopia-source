import { entitySchema } from './Entity';
import type { JSONSchemaType } from 'ajv';
import type { EntitySchema } from './Entity';

export type EntitiesSchema = EntitySchema[];

export const entitiesSchema: JSONSchemaType<EntitiesSchema> = {
  type: 'array',
  items: { ...entitySchema },
}