import type { EntityState } from '@type/config';
import { type TemplateResult, html } from 'lit';
import { map } from 'lit/directives/map.js';

// List of attributes to exclude
const EXCLUDE_LIST = [
  'icon',
  'friendly_name',
  'entity_picture',
  'supported_features',
  'assumed_state',
  'attribution',
  'hidden',
];

/**
 * Renders the entity attributes in a list
 * @param {EntityState} entity - The entity state to show details for
 * @returns {TemplateResult} The rendered attributes list
 */
export const attributes = (entity: EntityState): TemplateResult => {
  // Filter out common attributes that are less interesting or already shown
  const attributes = Object.entries({
    ...entity.attributes,
    entity_id: entity.entity_id,
  }).filter(([key]) => !EXCLUDE_LIST.includes(key));

  return html`
    <div class="entity-attributes">
      ${map(
        attributes,
        ([key, value]) => html`
          <div class="attribute-row">
            <span class="attribute-key">${key}:</span>
            <span class="attribute-value"
              >${typeof value === 'object'
                ? JSON.stringify(value)
                : value}</span
            >
          </div>
        `,
      )}
    </div>
  `;
};
