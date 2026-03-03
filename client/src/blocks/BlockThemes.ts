import type BlockType from './BlockType';

/**
 * Themed block sets derived from block names.
 * Use for render passes (e.g. foliage overlay) and visual grouping.
 */
export type BlockThemeId = 'foliage' | string;

/** Predicate: returns true if the block belongs to this theme. */
export type BlockThemePredicate = (blockType: BlockType) => boolean;

/** Default themes keyed by id. Extend BLOCK_THEMES to add more. */
export const BLOCK_THEMES: Record<BlockThemeId, BlockThemePredicate> = {
  foliage: (blockType) => {
    const n = blockType.name.toLowerCase();
    return (
      n.includes('leaves') ||
      n.includes('grass') ||
      n.includes('flower') ||
      n.includes('fern') ||
      n.includes('vine') ||
      n.includes('moss')
    );
  },
};

/**
 * Check if a block belongs to a theme.
 */
export function isBlockInTheme(blockType: BlockType, themeId: BlockThemeId): boolean {
  const predicate = BLOCK_THEMES[themeId];
  return predicate ? predicate(blockType) : false;
}
