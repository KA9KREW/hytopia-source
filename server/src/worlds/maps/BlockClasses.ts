/**
 * Minecraft-style block class system for procedural generation.
 * Blocks are categorized by generation role (terrain, ore, vegetation, etc.).
 * @internal
 */

export type BlockCategory =
  | 'air'
  | 'bedrock'
  | 'stone'
  | 'ore'
  | 'dirt'
  | 'grass'
  | 'sand'
  | 'water'
  | 'vegetation'
  | 'log'
  | 'leaves';

export interface BlockDef {
  id: number;
  name: string;
  category: BlockCategory;
  /** Texture URI for block type registration */
  textureUri: string;
  isMultiTexture?: boolean;
  /** Min Y level for placement (ores) */
  minY?: number;
  /** Max Y level for placement (ores) */
  maxY?: number;
  /** Rarity 0-1, higher = more common (ores) */
  rarity?: number;
  /** Biomes this block appears in */
  biomes?: string[];
}

/** Block palette for procedural world - maps categories to block IDs. */
export const BLOCK_PALETTE: Record<string, BlockDef> = {
  air: { id: 0, name: 'air', category: 'air', textureUri: '' },
  bedrock: { id: 18, name: 'bedrock', category: 'bedrock', textureUri: 'blocks/bedrock.png' },
  stone: { id: 15, name: 'stone', category: 'stone', textureUri: 'blocks/stone.png' },
  dirt: { id: 17, name: 'dirt', category: 'dirt', textureUri: 'blocks/dirt.png' },
  grass: { id: 7, name: 'grass-block', category: 'grass', textureUri: 'blocks/grass-block', isMultiTexture: true },
  grass_pine: { id: 6, name: 'grass-block-pine', category: 'grass', textureUri: 'blocks/grass-block-pine', isMultiTexture: true },
  grass_flower: { id: 9, name: 'grass-flower-block', category: 'grass', textureUri: 'blocks/grass-flower-block', isMultiTexture: true },
  sand: { id: 12, name: 'sand', category: 'sand', textureUri: 'blocks/sand.png' },
  gravel: { id: 19, name: 'gravel', category: 'stone', textureUri: 'blocks/gravel.png' },
  water: { id: 16, name: 'water', category: 'water', textureUri: 'blocks/water.png' },
  coal_ore: { id: 4, name: 'coal-ore', category: 'ore', textureUri: 'blocks/coal-ore.png', minY: 0, maxY: 128, rarity: 0.12 },
  iron_ore: { id: 20, name: 'iron-ore', category: 'ore', textureUri: 'blocks/iron-ore.png', minY: 0, maxY: 64, rarity: 0.08 },
  gold_ore: { id: 21, name: 'gold-ore', category: 'ore', textureUri: 'blocks/gold-ore.png', minY: 0, maxY: 32, rarity: 0.04 },
  diamond_ore: { id: 22, name: 'diamond-ore', category: 'ore', textureUri: 'blocks/diamond-ore.png', minY: 0, maxY: 16, rarity: 0.015 },
  oak_log: { id: 11, name: 'oak-log', category: 'log', textureUri: 'blocks/oak-log', isMultiTexture: true },
  oak_leaves: { id: 10, name: 'oak-leaves', category: 'leaves', textureUri: 'blocks/oak-leaves.png' },
};

/** Get block ID by key */
export function getBlockId(key: keyof typeof BLOCK_PALETTE): number {
  return BLOCK_PALETTE[key]?.id ?? 0;
}

/** All block definitions for world registration */
export function getAllBlockDefs(): BlockDef[] {
  return Object.values(BLOCK_PALETTE).filter(b => b.id > 0);
}
