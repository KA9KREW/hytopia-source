import { lightSchema } from './Light';
import type { JSONSchemaType } from 'ajv';
import type { LightSchema } from './Light';

export type LightsSchema = LightSchema[];

export const lightsSchema: JSONSchemaType<LightsSchema> = {
  type: 'array',
  items: { ...lightSchema },
}