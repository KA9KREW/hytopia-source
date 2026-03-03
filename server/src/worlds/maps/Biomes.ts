/**
 * Minecraft-style biome system. Biomes determined by 2D noise (temperature + humidity).
 * @internal
 */

import { samplePerlin2D } from './PerlinNoise';

export type BiomeId = 'plains' | 'forest' | 'desert' | 'mountains' | 'river' | 'beach' | 'taiga';

export interface Biome {
  id: BiomeId;
  name: string;
  /** Surface block: grass, sand, stone */
  surfaceBlock: number;
  /** Subsurface (under grass): dirt, sand */
  subsurfaceBlock: number;
  /** Tree density 0-1 */
  treeDensity: number;
  /** Grass/flower density 0-1 */
  vegetationDensity: number;
  /** Height multiplier for terrain */
  heightMultiplier: number;
}

const BIOMES: Record<BiomeId, Biome> = {
  plains: {
    id: 'plains',
    name: 'Plains',
    surfaceBlock: 7,   // grass-block
    subsurfaceBlock: 17, // dirt
    treeDensity: 0.02,
    vegetationDensity: 0.4,
    heightMultiplier: 1,
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    surfaceBlock: 7,
    subsurfaceBlock: 17,
    treeDensity: 0.12,
    vegetationDensity: 0.6,
    heightMultiplier: 1.1,
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    surfaceBlock: 12,  // sand
    subsurfaceBlock: 12,
    treeDensity: 0,
    vegetationDensity: 0.02,
    heightMultiplier: 0.9,
  },
  mountains: {
    id: 'mountains',
    name: 'Mountains',
    surfaceBlock: 15,  // stone (exposed)
    subsurfaceBlock: 17,
    treeDensity: 0.01,
    vegetationDensity: 0.15,
    heightMultiplier: 1.8,
  },
  river: {
    id: 'river',
    name: 'River',
    surfaceBlock: 19,  // gravel (riverbed - water filled separately)
    subsurfaceBlock: 19,
    treeDensity: 0,
    vegetationDensity: 0.1,
    heightMultiplier: 0.6,
  },
  beach: {
    id: 'beach',
    name: 'Beach',
    surfaceBlock: 12,
    subsurfaceBlock: 12,
    treeDensity: 0,
    vegetationDensity: 0.05,
    heightMultiplier: 0.7,
  },
  taiga: {
    id: 'taiga',
    name: 'Taiga',
    surfaceBlock: 6,   // grass-block-pine
    subsurfaceBlock: 17,
    treeDensity: 0.08,
    vegetationDensity: 0.25,
    heightMultiplier: 1.05,
  },
};

export function getBiome(id: BiomeId): Biome {
  return BIOMES[id];
}

/**
 * Sample biome at world position. Uses temperature + humidity noise.
 */
export function sampleBiome(
  gx: number,
  gz: number,
  options: { seed: number; scale?: number }
): Biome {
  const scale = options.scale ?? 0.008;
  const temp = samplePerlin2D(gx, gz, { scale, octaves: 2, persistence: 0.5, seed: options.seed + 100 });
  const humid = samplePerlin2D(gx + 1000, gz + 1000, { scale, octaves: 2, persistence: 0.5, seed: options.seed + 200 });
  const riverNoise = samplePerlin2D(gx * 0.5, gz * 0.5, { scale: 0.003, octaves: 1, seed: options.seed + 300 });
  const heightNoise = samplePerlin2D(gx, gz, { scale: scale * 0.5, octaves: 3, persistence: 0.6, seed: options.seed + 400 });

  // River valleys: low noise = river
  if (Math.abs(riverNoise - 0.5) < 0.08 && heightNoise < 0.45) {
    return BIOMES.river;
  }

  // Beach: near sea level with sand
  if (heightNoise < 0.35 && temp > 0.4 && temp < 0.7) {
    return BIOMES.beach;
  }

  // Mountains: high height noise
  if (heightNoise > 0.7) {
    return BIOMES.mountains;
  }

  // Desert: hot + dry
  if (temp > 0.65 && humid < 0.35) {
    return BIOMES.desert;
  }

  // Taiga: cold
  if (temp < 0.3) {
    return BIOMES.taiga;
  }

  // Forest: medium temp + humid
  if (temp > 0.35 && temp < 0.65 && humid > 0.45) {
    return BIOMES.forest;
  }

  return BIOMES.plains;
}
