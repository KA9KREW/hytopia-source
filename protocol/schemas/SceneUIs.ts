import { sceneUISchema } from './SceneUI';
import type { JSONSchemaType } from 'ajv';
import type { SceneUISchema } from './SceneUI';

export type SceneUIsSchema = SceneUISchema[];

export const sceneUIsSchema: JSONSchemaType<SceneUIsSchema> = {
  type: 'array',
  items: { ...sceneUISchema },
}