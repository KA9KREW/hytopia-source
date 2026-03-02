import { particleEmitterSchema } from './ParticleEmitter';
import type { JSONSchemaType } from 'ajv';
import type { ParticleEmitterSchema } from './ParticleEmitter';

export type ParticleEmittersSchema = ParticleEmitterSchema[];

export const particleEmittersSchema: JSONSchemaType<ParticleEmittersSchema> = {
  type: 'array',
  items: { ...particleEmitterSchema },
}