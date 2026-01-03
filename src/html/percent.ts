import type { EntityInformation } from '@type/config';
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
 * Function to create a percentage bar element
 * @param {EntityInformation} entity - The entity information object
 * @param {string[]} inverseEntities - Array of entity IDs that should use inverted colors
 * @return {TemplateResult} - The HTML template result for the percentage bar
 */
export const percentBar = (
  entity: EntityInformation,
  inverseEntities: string[] = [],
): TemplateResult => {
  // Extract the percentage value from the entity state
  const percentage = Number(entity.state);

  // Check if this entity should use inverted colors
  const isInverse = inverseEntities.includes(entity.entity_id);

  // Determine the color class based on percentage value and inverse setting
  const colorClass = getColorClass(percentage, isInverse);

  return html`
    <div class="percent-gauge">
      <div
        class="percent-gauge-fill ${colorClass}"
        style=${styleMap({
          width: `${percentage}%`,
        })}
      ></div>
    </div>
  `;
};
