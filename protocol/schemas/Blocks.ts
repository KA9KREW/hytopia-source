import { blockSchema } from './Block';
import type { JSONSchemaType } from 'ajv';
import type { BlockSchema } from './Block';

export type BlocksSchema = BlockSchema[];

export const blocksSchema: JSONSchemaType<BlocksSchema> = {
  type: 'array',
  items: { ...blockSchema },
}