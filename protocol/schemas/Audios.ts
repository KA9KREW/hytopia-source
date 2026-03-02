import { audioSchema } from './Audio';
import type { JSONSchemaType } from 'ajv';
import type { AudioSchema } from './Audio';

export type AudiosSchema = AudioSchema[];

export const audiosSchema: JSONSchemaType<AudiosSchema> = {
  type: 'array',
  items: { ...audioSchema },
}