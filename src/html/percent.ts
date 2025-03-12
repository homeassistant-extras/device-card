import type { EntityInformation } from '@type/config';
import { html, type TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

export const percentBar = (entity: EntityInformation): TemplateResult => {
  // Extract the percentage value from the entity state
  const percentage = Number(entity.state);

  // todo - flip for humidity?

  // Determine the color class based on percentage value
  const colorClass =
    percentage > 60 ? 'high' : percentage > 30 ? 'medium' : 'low';

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
