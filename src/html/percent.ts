import type { EntityInformation } from '@type/config';
import { html, type TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

/**
 * Function to determine the color class based on percentage value
 * @param {number} percentage - The percentage value (0-100)
 * @return {string} - The color class name
 */
function getColorClass(percentage: number): string {
  if (percentage > 60) {
    return 'high';
  } else if (percentage > 30) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Function to create a percentage bar element
 * @param {EntityInformation} entity - The entity information object
 * @return {TemplateResult} - The HTML template result for the percentage bar
 */
export const percentBar = (entity: EntityInformation): TemplateResult => {
  // Extract the percentage value from the entity state
  const percentage = Number(entity.state);

  // Determine the color class based on percentage value
  const colorClass = getColorClass(percentage);

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
