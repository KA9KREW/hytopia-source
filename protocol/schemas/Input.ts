import { vectorSchema } from './Vector';
import type { JSONSchemaType } from 'ajv';
import type { VectorSchema } from './Vector';

export type InputSchema = {
  '1'?: boolean;      // 1 key pressed
  '2'?: boolean;      // 2 key pressed
  '3'?: boolean;      // 3 key pressed
  '4'?: boolean;      // 4 key pressed
  '5'?: boolean;      // 5 key pressed
  '6'?: boolean;      // 6 key pressed
  '7'?: boolean;      // 7 key pressed
  '8'?: boolean;      // 8 key pressed
  '9'?: boolean;      // 9 key pressed
  '0'?: boolean;      // 0 key pressed
  w?: boolean;        // w key pressed
  a?: boolean;        // a key pressed
  s?: boolean;        // s key pressed
  d?: boolean;        // d key pressed
  q?: boolean;        // q key pressed
  e?: boolean;        // e key pressed
  r?: boolean;        // r key pressed
  f?: boolean;        // f key pressed
  z?: boolean;        // z key pressed
  x?: boolean;        // x key pressed
  c?: boolean;        // c key pressed
  v?: boolean;        // v key pressed
  u?: boolean;        // u key pressed
  i?: boolean;        // i key pressed
  o?: boolean;        // o key pressed
  j?: boolean;        // j key pressed
  k?: boolean;        // k key pressed
  l?: boolean;        // l key pressed
  n?: boolean;        // n key pressed
  m?: boolean;        // m key pressed
  sp?: boolean;       // space key pressed
  sh?: boolean;       // shift key pressed
  tb?: boolean;       // tab key pressed
  ml?: boolean;       // mouse left button pressed
  mr?: boolean;       // mouse right button pressed
  cp?: number;        // camera pitch radians
  cy?: number;        // camera yaw radians
  ird?: VectorSchema; // interact ray direction
  iro?: VectorSchema; // interact ray origin
  jd?: number;        // joystick direction radians
  sq?: number;        // sequence number for UDP inputs
}

export const inputSchema: JSONSchemaType<InputSchema> = {
  type: 'object',
  properties: {
    '1': { type: 'boolean', nullable: true },
    '2': { type: 'boolean', nullable: true },
    '3': { type: 'boolean', nullable: true },
    '4': { type: 'boolean', nullable: true },
    '5': { type: 'boolean', nullable: true },
    '6': { type: 'boolean', nullable: true },
    '7': { type: 'boolean', nullable: true },
    '8': { type: 'boolean', nullable: true },
    '9': { type: 'boolean', nullable: true },
    '0': { type: 'boolean', nullable: true },
    w: { type: 'boolean', nullable: true },
    a: { type: 'boolean', nullable: true },
    s: { type: 'boolean', nullable: true },
    d: { type: 'boolean', nullable: true },
    q: { type: 'boolean', nullable: true },
    e: { type: 'boolean', nullable: true },
    r: { type: 'boolean', nullable: true },
    f: { type: 'boolean', nullable: true },
    z: { type: 'boolean', nullable: true },
    x: { type: 'boolean', nullable: true },
    c: { type: 'boolean', nullable: true },
    v: { type: 'boolean', nullable: true },
    u: { type: 'boolean', nullable: true },
    i: { type: 'boolean', nullable: true },
    o: { type: 'boolean', nullable: true },
    j: { type: 'boolean', nullable: true },
    k: { type: 'boolean', nullable: true },
    l: { type: 'boolean', nullable: true },
    n: { type: 'boolean', nullable: true },
    m: { type: 'boolean', nullable: true },
    sp: { type: 'boolean', nullable: true },
    sh: { type: 'boolean', nullable: true },
    tb: { type: 'boolean', nullable: true },
    ml: { type: 'boolean', nullable: true },
    mr: { type: 'boolean', nullable: true },
    cp: { type: 'number', nullable: true },
    cy: { type: 'number', nullable: true },
    ird: { ...vectorSchema, nullable: true },
    iro: { ...vectorSchema, nullable: true },
    jd: { type: 'number', nullable: true },
    sq: { type: 'number', nullable: true },
  },
  additionalProperties: false,
}