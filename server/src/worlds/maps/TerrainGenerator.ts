import { CHUNK_SIZE, CHUNK_VOLUME } from '@/worlds/blocks/Chunk';
import { samplePerlin2D, samplePerlin3D } from './PerlinNoise';
import { sampleBiome } from './Biomes';
import type Vector3Like from '@/shared/types/math/Vector3Like';

/** Block IDs for procedural terrain (matches boilerplate + procedural) */
export const DEFAULT_BLOCK_IDS = {
  air: 0,
  grass: 7,
  dirt: 17,
  stone: 15,
  sand: 12,
  water: 16,
  gravel: 19,
  bedrock: 18,
  coal_ore: 4,
  iron_ore: 20,
  gold_ore: 21,
  diamond_ore: 22,
  grass_flower: 9,
  oak_log: 11,
  oak_leaves: 10,
  snow: 23,
  grass_snow_block: 24,
  // Boilerplate: andesite 1, birch-leaves 2, grass-block-pine 6, grass-flower-block-pine 8, spruce-leaves 13, spruce-log 14
  andesite: 1,
  birch_leaves: 2,
  grass_pine: 6,
  grass_flower_pine: 8,
  spruce_leaves: 13,
  spruce_log: 14,
  // New procedural blocks (textures from world editor)
  cobblestone_snow: 25,
  snow_rocky: 26,
  sandstone: 27,
  mossy_cobblestone: 28,
  hay_block: 29,
  birch_log: 30,
  farmland: 31,
  lava: 32,
  magma_block: 33,
} as const;

export interface TerrainGeneratorOptions {
  seed: number;
  seaLevel?: number;
  maxHeight?: number;
  scale?: number;
  blockIds?: typeof DEFAULT_BLOCK_IDS;
  /** Enable caves */
  caves?: boolean;
  /** Enable ores */
  ores?: boolean;
  /** Enable rivers */
  rivers?: boolean;
  /** Enable trees/vegetation */
  vegetation?: boolean;
}

const DEFAULT_OPTIONS: Required<Omit<TerrainGeneratorOptions, 'blockIds'>> & { blockIds: typeof DEFAULT_BLOCK_IDS } = {
  seed: 0,
  seaLevel: 32,
  maxHeight: 64,
  scale: 0.04,
  blockIds: DEFAULT_BLOCK_IDS,
  caves: true,
  ores: true,
  rivers: true,
  vegetation: true,
};

/** Seeded hash for ore/vegetation placement */
function hashPos(gx: number, gy: number, gz: number, seed: number): number {
  let h = seed;
  h = Math.imul(h ^ gx, 0x85ebca6b);
  h = Math.imul(h ^ gy, 0xc2b2ae35);
  h = Math.imul(h ^ gz, 0x27d4eb2d);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Place ore with Y-level and rarity check */
function tryOre(gx: number, gy: number, gz: number, opts: TerrainGeneratorOptions, blockId: number, minY: number, maxY: number, rarity: number): boolean {
  if (gy < minY || gy > maxY) return false;
  const h = hashPos(gx, gy, gz, opts.seed + blockId * 1000);
  return (h % 100) / 100 < rarity;
}

/** Place vegetation on surface */
function tryVegetation(gx: number, gz: number, opts: TerrainGeneratorOptions, density: number): boolean {
  const h = hashPos(gx, 0, gz, opts.seed + 7777);
  return (h % 100) / 100 < density;
}

/** Place tree at position */
function tryTree(gx: number, gz: number, opts: TerrainGeneratorOptions, density: number): boolean {
  const h = hashPos(Math.floor(gx / 4) * 4, 0, Math.floor(gz / 4) * 4, opts.seed + 3333);
  return (h % 100) / 100 < density;
}

/**
 * Generates a single 16³ chunk with Minecraft-style features:
 * Biomes, caves, rivers, ores, vegetation.
 */
export function generateChunk(
  origin: Vector3Like,
  options: TerrainGeneratorOptions
): { blocks: Uint8Array; rotations?: Map<number, number> } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const blocks = new Uint8Array(CHUNK_VOLUME);
  const { seed, seaLevel, maxHeight, scale, blockIds, caves, ores, rivers, vegetation } = opts;
  const ids = { ...DEFAULT_BLOCK_IDS, ...blockIds };

  const ox = origin.x;
  const oy = origin.y;
  const oz = origin.z;

  // Precompute surface heights and biomes for the chunk's horizontal extent + 1 for edges
  const surfaceCache: number[] = [];
  const biomeCache: ReturnType<typeof sampleBiome>[] = [];
  const baseHeight = seaLevel - 8;
  const heightRange = Math.min(maxHeight - seaLevel - 4, 40);
  /** Snow line: above this Y, use snow-themed blocks for mountains/grass biomes */
  const snowLine = seaLevel + Math.min(heightRange * 0.5, 28);

  for (let lz = -1; lz <= CHUNK_SIZE; lz++) {
    for (let lx = -1; lx <= CHUNK_SIZE; lx++) {
      const gx = ox + lx;
      const gz = oz + lz;
      const heightNoise = samplePerlin2D(gx, gz, { scale: scale * 0.5, octaves: 4, persistence: 0.5, seed: seed + 1 });
      const detailNoise = samplePerlin2D(gx, gz, { scale: scale * 2, octaves: 2, persistence: 0.5, seed: seed + 2 });
      const biome = sampleBiome(gx, gz, { seed, scale: 0.008 });
      let surfaceY = Math.floor(baseHeight + heightNoise * heightRange * biome.heightMultiplier + detailNoise * 4);

      // River carving: lower terrain in river biomes
      if (rivers && biome.id === 'river') {
        surfaceY = Math.min(surfaceY, seaLevel - 2);
      }
      if (rivers && biome.id === 'beach') {
        surfaceY = Math.min(surfaceY, seaLevel);
      }

      const idx = (lx + 1) + (CHUNK_SIZE + 2) * (lz + 1);
      surfaceCache[idx] = surfaceY;
      biomeCache[idx] = biome;
    }
  }

  const getSurface = (lx: number, lz: number) => surfaceCache[(lx + 1) + (CHUNK_SIZE + 2) * (lz + 1)];
  const getBiomeAt = (lx: number, lz: number) => biomeCache[(lx + 1) + (CHUNK_SIZE + 2) * (lz + 1)];

  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        const gx = ox + lx;
        const gy = oy + ly;
        const gz = oz + lz;

        const surfaceY = getSurface(lx, lz);
        const biome = getBiomeAt(lx, lz);

        const idx = lx + CHUNK_SIZE * (ly + CHUNK_SIZE * lz);

        // Bedrock layer at bottom
        if (gy <= 0) {
          blocks[idx] = ids.bedrock;
          continue;
        }

        // Above surface: air or water
        if (gy > surfaceY) {
          if (rivers && gy <= seaLevel && biome.id === 'river') {
            blocks[idx] = ids.water;
          } else if (gy <= seaLevel && biome.id === 'river') {
            blocks[idx] = ids.water;
          } else {
            blocks[idx] = ids.air;
          }
          continue;
        }

        // Cave carving (3D noise)
        if (caves && gy < surfaceY - 2 && gy > 2) {
          const caveNoise = samplePerlin3D(gx, gy, gz, { scale: 0.04, octaves: 2, persistence: 0.5, seed: seed + 500 });
          const caveWorm = samplePerlin3D(gx * 0.5, gy * 0.5, gz * 0.5, { scale: 0.03, octaves: 1, seed: seed + 600 });
          if (caveNoise > 0.55 || (caveWorm > 0.48 && caveWorm < 0.52)) {
            blocks[idx] = ids.air;
            continue;
          }
        }

        // Below surface: terrain layers
        let blockId: number;

        if (gy === surfaceY) {
          blockId = biome.surfaceBlock; // gravel in rivers, grass/sand elsewhere
          // Temperature zone: snow/ice above snow line; grass on mountain slopes below
          const inSnowZone = surfaceY > snowLine;
          if (inSnowZone) {
            if (biome.surfaceBlock === ids.stone) {
              // Snowy peaks: pure snow or rocky snow variation
              blockId = tryVegetation(gx, gz, opts, 0.2) ? ids.snow_rocky : ids.snow;
            } else if (biome.surfaceBlock === ids.grass || biome.surfaceBlock === 6) {
              blockId = ids.grass_snow_block; // Plains/forest/taiga → grass under snow
            }
          } else if (biome.surfaceBlock === ids.stone) {
            blockId = ids.grass; // Mountains below snow line → grassy slopes
          }
          if (!inSnowZone) {
            // Vegetation: grass/flower on grass surface (plains, forest, taiga, or grassy mountain slopes)
            const isGrassSurface = blockId === ids.grass || biome.surfaceBlock === ids.grass || biome.surfaceBlock === 6;
            if (vegetation && gy >= seaLevel - 1 && isGrassSurface) {
              if (tryVegetation(gx, gz, opts, biome.vegetationDensity)) {
                blockId = biome.id === 'taiga' ? ids.grass_flower_pine : ids.grass_flower;
              }
            }
            // Farmland: flat plains near sea level (rare, replaces grass)
            if (blockId === ids.grass && biome.id === 'plains' && gy >= seaLevel - 2 && gy <= seaLevel + 2) {
              if (tryVegetation(gx, gz, opts, 0.025)) blockId = ids.farmland;
            }
            // Hay block: rare in plains
            if (blockId === ids.grass && biome.id === 'plains' && tryVegetation(gx, gz, opts, 0.015)) {
              blockId = ids.hay_block;
            }
            // Mossy cobblestone boulder: rare in forest
            if (blockId === ids.grass && biome.id === 'forest' && tryVegetation(gx + 1, gz, opts, 0.02)) {
              blockId = ids.mossy_cobblestone;
            }
          }
        } else if (gy > surfaceY - 4 && gy > 0) {
          blockId = biome.subsurfaceBlock;
          // Desert subsurface: sandstone
          if (biome.id === 'desert') blockId = ids.sandstone;
        } else {
          blockId = ids.stone;
          // Deep underground: lava lakes (Y < 8), magma (Y < 16)
          if (gy < 8 && !caves) {
            const lavaNoise = samplePerlin3D(gx * 0.5, gy * 0.5, gz * 0.5, { scale: 0.06, octaves: 1, seed: seed + 700 });
            if (lavaNoise > 0.6) blockId = ids.lava;
          } else if (gy < 16) {
            if (tryOre(gx, gy, gz, opts, ids.magma_block, 0, 16, 0.04)) blockId = ids.magma_block;
          }
          // Stone variations: andesite
          if (blockId === ids.stone && tryOre(gx, gy, gz, opts, ids.andesite, 0, 128, 0.15)) {
            blockId = ids.andesite;
          }
          // Ore veins
          if (ores && blockId === ids.stone) {
            if (tryOre(gx, gy, gz, opts, ids.diamond_ore, 0, 16, 0.015)) blockId = ids.diamond_ore;
            else if (tryOre(gx, gy, gz, opts, ids.gold_ore, 0, 32, 0.04)) blockId = ids.gold_ore;
            else if (tryOre(gx, gy, gz, opts, ids.iron_ore, 0, 64, 0.08)) blockId = ids.iron_ore;
            else if (tryOre(gx, gy, gz, opts, ids.coal_ore, 0, 128, 0.12)) blockId = ids.coal_ore;
          }
          // Occasional gravel in deeper stone
          if (blockId === ids.stone && gy < surfaceY - 8) {
            const h = hashPos(gx, gy, gz, seed + 999);
            if ((h % 100) < 3) blockId = ids.gravel;
          }
          // Cobblestone-snow: exposed stone in snow zone (subsurface)
          if (blockId === ids.stone && surfaceY > snowLine && gy > surfaceY - 3) {
            const h = hashPos(gx, gy, gz, seed + 4444);
            if ((h % 100) / 100 < 0.25) blockId = ids.cobblestone_snow;
          }
        }

        blocks[idx] = blockId;
      }
    }
  }

  // Tree placement pass (place on surface, requires neighbor check)
  if (vegetation) {
    for (let lz = 1; lz < CHUNK_SIZE - 1; lz++) {
      for (let lx = 1; lx < CHUNK_SIZE - 1; lx++) {
        const gx = ox + lx;
        const gz = oz + lz;
        const biome = getBiomeAt(lx, lz);
        if (biome.treeDensity < 0.01) continue;

        if (tryTree(gx, gz, opts, biome.treeDensity)) {
          const surfaceY = getSurface(lx, lz);
          const baseLy = surfaceY - oy;
          if (baseLy >= 0 && baseLy < CHUNK_SIZE - 5 && surfaceY >= seaLevel) {
            const baseIdx = lx + CHUNK_SIZE * (baseLy + CHUNK_SIZE * lz);
            const surfaceBlock = blocks[baseIdx];
            const canPlaceTree =
              surfaceBlock === biome.surfaceBlock ||
              surfaceBlock === ids.grass ||
              surfaceBlock === ids.grass_flower ||
              surfaceBlock === ids.grass_snow_block;
            if (canPlaceTree) {
              const logId = biome.id === 'taiga' ? ids.spruce_log : biome.id === 'forest' && (hashPos(gx, 0, gz, seed + 2222) % 3) === 0 ? ids.birch_log : ids.oak_log;
              const leavesId = logId === ids.spruce_log ? ids.spruce_leaves : logId === ids.birch_log ? ids.birch_leaves : ids.oak_leaves;
              const height = 4 + (hashPos(gx, 0, gz, seed + 1111) % 3);
              for (let ty = 0; ty < height; ty++) {
                const iy = baseLy + ty;
                if (iy < CHUNK_SIZE) {
                  const idx = lx + CHUNK_SIZE * (iy + CHUNK_SIZE * lz);
                  blocks[idx] = logId;
                }
              }
              const capLy = baseLy + height;
              if (capLy < CHUNK_SIZE) {
                for (let dz = -2; dz <= 2; dz++) {
                  for (let dx = -2; dx <= 2; dx++) {
                    for (let dy = 0; dy <= 2; dy++) {
                      const clx = lx + dx;
                      const clz = lz + dz;
                      const cly = capLy + dy;
                      if (clx >= 0 && clx < CHUNK_SIZE && clz >= 0 && clz < CHUNK_SIZE && cly < CHUNK_SIZE) {
                        const dist = Math.abs(dx) + Math.abs(dz) + Math.abs(dy);
                        if (dist <= 3 || (dy <= 1 && dist <= 4)) {
                          const idx = clx + CHUNK_SIZE * (cly + CHUNK_SIZE * clz);
                          if (blocks[idx] === ids.air) blocks[idx] = leavesId;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return { blocks };
}

/**
 * Samples the surface height at a given (x, z) for spawn placement.
 */
export function sampleSurfaceHeight(
  gx: number,
  gz: number,
  options: TerrainGeneratorOptions
): number {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { seed, seaLevel, maxHeight, scale } = opts;
  const heightNoise = samplePerlin2D(gx, gz, { scale: scale * 0.5, octaves: 4, persistence: 0.5, seed: seed + 1 });
  const detailNoise = samplePerlin2D(gx, gz, { scale: scale * 2, octaves: 2, persistence: 0.5, seed: seed + 2 });
  const biome = sampleBiome(gx, gz, { seed, scale: 0.008 });
  const baseHeight = seaLevel - 8;
  const heightRange = Math.min(maxHeight - seaLevel - 4, 40);
  let surfaceY = Math.floor(baseHeight + heightNoise * heightRange * biome.heightMultiplier + detailNoise * 4);
  if (biome.id === 'river') surfaceY = Math.min(surfaceY, seaLevel - 2);
  if (biome.id === 'beach') surfaceY = Math.min(surfaceY, seaLevel);
  return surfaceY;
}
