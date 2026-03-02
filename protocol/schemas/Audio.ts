import { vectorSchema } from './Vector';
import type { JSONSchemaType } from 'ajv';
import type { VectorSchema } from './Vector';

export type AudioSchema = {
  i: number;        // audio id
  a?: string;       // audio uri
  cd?: number;      // cutoff distance
  d?: number;       // duration
  de?: number;      // detune
  di?: number;      // distortion (0 to 1, or 1+)
  e?: number;       // entity attachment, follows entity id
  l?: boolean;      // loop
  o?: number;       // offset
  p?: VectorSchema; // spatial position of audio
  pa?: boolean;     // pause
  pl?: boolean;     // play
  pr?: number;      // playback rate (0+)
  r?: boolean;      // restart
  rd?: number;      // reference distance
  s?: number;       // start tick
  v?: number;       // volume (0 to 1)
}

export const audioSchema: JSONSchemaType<AudioSchema> = {
  type: 'object',
  properties: {
    i: { type: 'number' },
    a: { type: 'string', nullable: true },
    cd: { type: 'number', nullable: true },
    d: { type: 'number', nullable: true },
    de: { type: 'number', nullable: true },
    di: { type: 'number', minimum: 0, nullable: true },
    e: { type: 'number', nullable: true },
    l: { type: 'boolean', nullable: true },
    o: { type: 'number', nullable: true },
    p: { ...vectorSchema, nullable: true },
    pa: { type: 'boolean', nullable: true },
    pl: { type: 'boolean', nullable: true },
    pr: { type: 'number', minimum: 0, nullable: true },
    r: { type: 'boolean', nullable: true },
    rd: { type: 'number', nullable: true },
    s: { type: 'number', nullable: true },
    v: { type: 'number', minimum: 0, maximum: 1, nullable: true },
  },
  required: ['i'],
  additionalProperties: false,
}
