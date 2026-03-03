/**
 * Deterministic Perlin noise for procedural terrain.
 * Port of world editor's PerlinNoiseGenerator for chunk-at-a-time generation.
 * @internal
 */

function createSeededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function generatePermutationTable(seed: number): Uint8Array {
  const random = createSeededRandom(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return perm;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function grad2D(hash: number, x: number, y: number): number {
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function perlin2D(x: number, y: number, perm: Uint8Array): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  const u = fade(x);
  const v = fade(y);
  const A = perm[X] + Y;
  const B = perm[X + 1] + Y;
  const g1 = grad2D(perm[perm[A]], x, y);
  const g2 = grad2D(perm[perm[B]], x - 1, y);
  const g3 = grad2D(perm[perm[A + 1]], x, y - 1);
  const g4 = grad2D(perm[perm[B + 1]], x - 1, y - 1);
  return lerp(lerp(g1, g2, u), lerp(g3, g4, u), v);
}

function grad3D(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function perlin3D(x: number, y: number, z: number, perm: Uint8Array): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);
  const A = perm[X] + Y;
  const B = perm[X + 1] + Y;
  const AA = perm[A] + Z;
  const AB = perm[A + 1] + Z;
  const BA = perm[B] + Z;
  const BB = perm[B + 1] + Z;
  const g1 = grad3D(perm[perm[AA]], x, y, z);
  const g2 = grad3D(perm[perm[BA]], x - 1, y, z);
  const g3 = grad3D(perm[perm[AB]], x, y - 1, z);
  const g4 = grad3D(perm[perm[BB]], x - 1, y - 1, z);
  const g5 = grad3D(perm[perm[AA + 1]], x, y, z - 1);
  const g6 = grad3D(perm[perm[BA + 1]], x - 1, y, z - 1);
  const g7 = grad3D(perm[perm[AB + 1]], x, y - 1, z - 1);
  const g8 = grad3D(perm[perm[BB + 1]], x - 1, y - 1, z - 1);
  return lerp(
    lerp(lerp(g1, g2, u), lerp(g3, g4, u), v),
    lerp(lerp(g5, g6, u), lerp(g7, g8, u), v),
    w
  );
}

/**
 * Multi-octave 3D Perlin noise. Returns value in [0, 1].
 * Used for cave generation.
 */
export function samplePerlin3D(
  x: number,
  y: number,
  z: number,
  options: { scale?: number; octaves?: number; persistence?: number; seed?: number } = {}
): number {
  const scale = options.scale ?? 0.02;
  const octaves = options.octaves ?? 2;
  const persistence = options.persistence ?? 0.5;
  const seed = options.seed ?? 0;
  const perm = generatePermutationTable(seed);
  let total = 0;
  let amp = 1;
  let freq = 1;
  let maxVal = 0;
  for (let o = 0; o < octaves; o++) {
    total += perlin3D(x * scale * freq, y * scale * freq, z * scale * freq, perm) * amp;
    maxVal += amp;
    amp *= persistence;
    freq *= 2;
  }
  return (total / maxVal + 1) * 0.5;
}

/**
 * Multi-octave 2D Perlin noise at a single point. Returns value in [0, 1].
 */
export function samplePerlin2D(
  x: number,
  y: number,
  options: { scale?: number; octaves?: number; persistence?: number; seed?: number } = {}
): number {
  const scale = options.scale ?? 0.01;
  const octaves = options.octaves ?? 1;
  const persistence = options.persistence ?? 0.5;
  const seed = options.seed ?? 0;

  const perm = generatePermutationTable(seed);
  let total = 0;
  let amp = 1;
  let freq = 1;
  let maxVal = 0;

  for (let o = 0; o < octaves; o++) {
    total += perlin2D(x * scale * freq, y * scale * freq, perm) * amp;
    maxVal += amp;
    amp *= persistence;
    freq *= 2;
  }
  return (total / maxVal + 1) * 0.5;
}
