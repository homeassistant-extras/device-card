import { matchesPattern } from '@common/matches';
import type { BaseConfig, EntityState } from '@type/config';

/** Matches Home Assistant color tokens (e.g. "red", "deep-purple") */
const COLOR_TOKEN = /^[a-z-]+$/;

/**
 * Resolves the color configured for the current state of the featured entity
 * @param config - The configuration object holding the state colors
 * @param entity - The featured entity state, if any
 * @returns A CSS color or undefined when no configured state matches
 */
export const stateColor = (
  config: BaseConfig,
  entity: EntityState | undefined,
): string | undefined => {
  if (!entity) return undefined;

  const color = config.state_colors?.find((c) =>
    matchesPattern(entity.state, c.state),
  )?.color;

  if (!color) return undefined;

  // Home Assistant color tokens map to theme variables, CSS colors pass through
  return COLOR_TOKEN.test(color) ? `var(--${color}-color, ${color})` : color;
};
