import { rgbColorSchema } from './RgbColor';
import { vectorSchema } from './Vector';
import type { JSONSchemaType } from 'ajv';
import type { RgbColorSchema } from './RgbColor';
import type { VectorSchema } from './Vector';

export type ParticleEmitterSchema = {
  i: number;            // particle emitter id
  at?: number;          // alpha test, 0 to 1
  b?: number;           // burst particle count
  ce?: RgbColorSchema;  // color end, rgb color
  cev?: RgbColorSchema; // color end variance, rgb color
  cs?: RgbColorSchema;  // color start, rgb color
  csv?: RgbColorSchema; // color start variance, rgb color
  cie?: number;         // color intensity end
  ciev?: number;        // color intensity end variance
  cis?: number;         // color intensity start
  cisv?: number;        // color intensity start variance
  e?: number;           // entity attachment, follows entity id
  en?: string;          // entity attachment node name, follows entity node name
  g?: VectorSchema;     // gravity per axis as vector3
  l?: number;           // lifetime, in seconds
  le?: boolean;         // lock to emitter, particles follow emitter position
  lv?: number;          // lifetime variance, in seconds
  mp?: number;          // max particles
  o?: VectorSchema;     // offset
  oe?: number;          // opacity end
  oev?: number;         // opacity end variance
  or?: number;          // orientation mode: 0=billboard, 1=billboardY, 2=fixed, 3=velocity
  ofr?: VectorSchema;   // orientation fixed rotation in degrees (x, y, z)
  os?: number;          // opacity start
  osv?: number;         // opacity start variance
  p?: VectorSchema;     // spatial position
  pa?: boolean;         // paused state
  pv?: VectorSchema;    // particle spatial variance relative to attachment or position
  r?: number;           // rate, in particles per second
  rv?: number;          // rate variance, in particles per second
  rm?: boolean;         // remove/removed
  se?: number;          // size end, in world units
  sev?: number;         // size end variance, in world units
  ss?: number;          // size start, in world units
  ssv?: number;         // size start variance, in world units
  t?: boolean;          // transparent
  tu?: string;          // texture uri
  v?: VectorSchema;     // velocity per axis as vector3
  vv?: VectorSchema;    // velocity variance per axis as vector3
}

export const particleEmitterSchema: JSONSchemaType<ParticleEmitterSchema> = {
  type: 'object',
  properties: {
    i: { type: 'number' },
    at: { type: 'number', nullable: true },
    b: { type: 'number', nullable: true },
    ce: { ...rgbColorSchema, nullable: true },
    cev: { ...rgbColorSchema, nullable: true },
    cs: { ...rgbColorSchema, nullable: true },
    csv: { ...rgbColorSchema, nullable: true },
    cie: { type: 'number', nullable: true },
    ciev: { type: 'number', nullable: true },
    cis: { type: 'number', nullable: true },
    cisv: { type: 'number', nullable: true },
    e: { type: 'number', nullable: true },
    en: { type: 'string', nullable: true },
    g: { ...vectorSchema, nullable: true },
    l: { type: 'number', nullable: true },
    le: { type: 'boolean', nullable: true },
    lv: { type: 'number', nullable: true },
    mp: { type: 'number', nullable: true },
    o: { ...vectorSchema, nullable: true },
    oe: { type: 'number', nullable: true },
    oev: { type: 'number', nullable: true },
    or: { type: 'number', nullable: true },
    ofr: { ...vectorSchema, nullable: true },
    os: { type: 'number', nullable: true },
    osv: { type: 'number', nullable: true },
    p: { ...vectorSchema, nullable: true },
    pa: { type: 'boolean', nullable: true },
    pv: { ...vectorSchema, nullable: true },
    r: { type: 'number', nullable: true },
    rv: { type: 'number', nullable: true },
    rm: { type: 'boolean', nullable: true },
    se: { type: 'number', nullable: true },
    sev: { type: 'number', nullable: true },
    ss: { type: 'number', nullable: true },
    ssv: { type: 'number', nullable: true },
    t: { type: 'boolean', nullable: true },
    tu: { type: 'string', nullable: true },
    v: { ...vectorSchema, nullable: true },
    vv: { ...vectorSchema, nullable: true },
  },
  required: ['i'],
  additionalProperties: false,
}
