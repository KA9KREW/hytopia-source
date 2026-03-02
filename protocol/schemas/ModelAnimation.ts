import { JSONSchemaType } from 'ajv';

export type ModelAnimationSchema = {
  n: string;    // animation name
  b?: number;   // blend mode enum index
  c?: boolean;  // clamp when finished
  fi?: boolean; // fades in
  fo?: boolean; // fades out
  l?: number;   // loop mode enum index
  p?: boolean;  // play
  pa?: boolean; // pause
  pr?: number;  // playback rate
  r?: boolean;  // restart
  s?: boolean;  // stop
  w?: number;   // weight
}

export const modelAnimationSchema: JSONSchemaType<ModelAnimationSchema> = {
  type: 'object',
  properties: {
    n: { type: 'string' },
    b: { type: 'number', nullable: true },
    c: { type: 'boolean', nullable: true },
    fi: { type: 'boolean', nullable: true },
    fo: { type: 'boolean', nullable: true },
    l: { type: 'number', nullable: true },
    p: { type: 'boolean', nullable: true },
    pa: { type: 'boolean', nullable: true },
    pr: { type: 'number', nullable: true },
    r: { type: 'boolean', nullable: true },
    s: { type: 'boolean', nullable: true },
    w: { type: 'number', nullable: true },
  },
  required: [ 'n' ],
  additionalProperties: false,
}