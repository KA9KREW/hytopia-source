import { chunkSchema } from './Chunk';
import type { JSONSchemaType } from 'ajv';
import type { ChunkSchema } from './Chunk';

export type ChunksSchema = ChunkSchema[];

export const chunksSchema: JSONSchemaType<ChunksSchema> = {
  type: 'array',
  items: { ...chunkSchema },
}