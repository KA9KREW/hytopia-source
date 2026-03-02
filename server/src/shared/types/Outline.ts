import type RgbColor from '@/shared/types/RgbColor';

/**
 * The options for rendering an outline.
 *
 * **Category:** Types
 * @public
 */
interface Outline {
  /** The color of the outline. Defaults to black. */
  color?: RgbColor;

  /** The intensity multiplier for the outline color. Use values over 1 for brighter/glowing outlines. Defaults to 1.0. */
  colorIntensity?: number;

  /** The thickness of the outline in world units. Defaults to 0.03. */
  thickness?: number;

  /** The opacity of the outline between 0 and 1. Defaults to 1.0. */
  opacity?: number;

  /** Whether the outline should be hidden when the entity is occluded by other objects. If false, the outline is always visible (shows through walls). Defaults to true. */
  occluded?: boolean;
}

export default Outline;
