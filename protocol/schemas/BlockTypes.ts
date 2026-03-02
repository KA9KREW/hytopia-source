import { blockTypeSchema } from './BlockType';
import type { JSONSchemaType } from 'ajv';
import type { BlockTypeSchema } from './BlockType';

export type BlockTypesSchema = BlockTypeSchema[];

export const blockTypesSchema: JSONSchemaType<BlockTypesSchema> = {
  type: 'array',
  items: { ...blockTypeSchema },
}