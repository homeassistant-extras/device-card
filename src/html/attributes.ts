import { moreInfo } from '@homeassistant-extras/hass/events/more-info';
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
 * Renders the entity attributes in a list. Clicking anywhere in the list opens
 * Home Assistant's more-info dialog for the entity, mirroring what the native
 * `more-info` action does via the `hass-more-info` event.
 *
 * @param {EntityState} entity - The entity state to show details for
 * @returns {TemplateResult} The rendered attributes list
 */
export const attributes = (entity: EntityState): TemplateResult => {
  // Filter out common attributes that are less interesting or already shown.
  // entity_id is listed first as it's logically superior to individual attributes.
  const attributes = Object.entries({
    entity_id: entity.entity_id,
    ...entity.attributes,
  }).filter(([key]) => !EXCLUDE_LIST.includes(key));

  // Open the entity's more-info dialog. The event bubbles + is composed by
  // default, so it reaches HA's more-info handler across the shadow boundary.
  const openMoreInfo = (ev: Event): void => {
    ev.stopPropagation();
    moreInfo(ev.currentTarget as HTMLElement, entity.entity_id);
  };

  return html`
    <div class="entity-attributes" @click=${openMoreInfo}>
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
