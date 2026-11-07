import { matchesPattern } from '@common/matches';
import type { EntityInformation, PercentColors } from '@type/config';
import { html, type TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

/**
 * Function to determine the color class based on percentage value
 * @param {number} percentage - The percentage value (0-100)
 * @param {boolean} isInverse - Whether to invert the color logic (green for low, red for high)
 * @return {string} - The color class name
 */
function getColorClass(percentage: number, isInverse: boolean = false): string {
  let baseClass: string;
  if (percentage > 60) {
    baseClass = 'high';
  } else if (percentage > 30) {
    baseClass = 'medium';
  } else {
    baseClass = 'low';
  }

  // If inverse, swap high and low (medium stays the same)
  if (isInverse) {
    if (baseClass === 'high') {
      return 'low';
    } else if (baseClass === 'low') {
      return 'high';
    }
  }

  return baseClass;
}

/**
 * Resolves a custom bar color from the `percent_colors` config.
 * The first key (in config order) whose pattern matches the entity wins.
 * A string value is used as-is; for a threshold list, the color of the highest
 * threshold at or below the percentage is used (the lowest threshold's color
 * if the value is below all of them).
 * @param {string} entityId - The entity ID to match against pattern keys
 * @param {number} percentage - The current percentage value
 * @param {PercentColors} [percentColors] - The percent_colors config
 * @return {string | undefined} - The CSS color, or undefined to use the default scale
 */
export const resolvePercentColor = (
  entityId: string,
  percentage: number,
  percentColors?: PercentColors,
): string | undefined => {
  if (!percentColors) return undefined;

  const match = Object.entries(percentColors).find(([pattern]) =>
    matchesPattern(entityId, pattern),
  );
  if (!match) return undefined;

  const value = match[1];
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return undefined;

  const thresholds = value
    .filter((t) => typeof t?.color === 'string' && Number.isFinite(t?.value))
    .sort((a, b) => a.value - b.value);

  let color = thresholds[0]?.color;
  for (const threshold of thresholds) {
    if (percentage >= threshold.value) color = threshold.color;
  }
  return color;
};

/**
 * Function to create a percentage bar element
 * @param {EntityInformation} entity - The entity information object
 * @param {string[]} inverseEntities - Array of entity IDs that should use inverted colors
 * @param {PercentColors} [percentColors] - Custom colors by entity pattern (overrides inverse)
 * @return {TemplateResult} - The HTML template result for the percentage bar
 */
export const percentBar = (
  entity: EntityInformation,
  inverseEntities: string[] = [],
  percentColors?: PercentColors,
): TemplateResult => {
  // Extract the percentage value from the entity state
  const percentage = Number(entity.state);

  // A custom color replaces the default high/medium/low scale entirely
  const customColor = resolvePercentColor(
    entity.entity_id,
    percentage,
    percentColors,
  );

  // Check if this entity should use inverted colors
  const isInverse = inverseEntities.includes(entity.entity_id);

  // Determine the color class based on percentage value and inverse setting
  const colorClass = customColor ? '' : getColorClass(percentage, isInverse);

  return html`
    <div class="percent-gauge">
      <div
        class="percent-gauge-fill ${colorClass}"
        style=${styleMap({
          width: `${percentage}%`,
          ...(customColor ? { 'background-color': customColor } : {}),
        })}
      ></div>
    </div>
  `;
};
