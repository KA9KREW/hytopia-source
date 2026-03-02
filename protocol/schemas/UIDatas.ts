import { uiDataSchema } from './UIData';
import type { JSONSchemaType } from 'ajv';
import type { UIDataSchema } from './UIData';

export type UIDatasSchema = UIDataSchema[];

export const uiDatasSchema: JSONSchemaType<UIDatasSchema> = {
  type: 'array',
  items: { ...uiDataSchema },
}