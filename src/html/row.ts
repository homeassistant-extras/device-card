/**
 * @file row.ts
 * @description Entity row rendering for the device card
 * This file handles the rendering of individual entity rows within the device card,
 * including their state content, percentage bars, and expandable attribute details.
 */

import type { DeviceCard } from '@cards/card';
import type { HomeAssistant } from '@hass/types';
import type { EntityInformation } from '@type/config';
import { html, nothing } from 'lit';
import { attributes } from './attributes';
import { percentBar } from './percent';
import { stateContent } from './state-content';

/**
 * Toggles the expanded state of an entity row to show/hide attributes
 *
 * @param {DeviceCard} element - The device card component instance
 * @param {string} entityId - The entity ID to toggle
 * @param {Event} e - The click event that triggered the toggle
 */
const toggleEntityAttributes = (
  element: DeviceCard,
  entityId: string,
  e: Event,
) => {
  // Prevent event from bubbling up
  e.stopPropagation();

  // Initialize expandedEntities if it doesn't exist
  if (!element.expandedEntities) {
    element.expandedEntities = {};
  }

  // Create a new expandedEntities object with the toggled entity
  element.expandedEntities = {
    ...element.expandedEntities,
    [entityId]: !element.expandedEntities[entityId],
  };
};

/**
 * Renders a single entity row with appropriate styling and components
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityInformation} entity - The entity to render
 * @param {DeviceCard} element - The device card component instance
 * @returns {TemplateResult} A lit-html template for the entity row
 */
export const row = (
  hass: HomeAssistant,
  entity: EntityInformation,
  element: DeviceCard,
) => {
  let statusClassName: string | undefined;

  // Determine status class based on problem state
  if (entity.isProblemEntity) {
    // Add color to problem class based on state
    statusClassName = entity.isActive ? 'status-error' : 'status-ok';
  }

  // Determine if we should show a percentage bar
  const showBar =
    entity.attributes.state_class === 'measurement' &&
    entity.attributes.unit_of_measurement === '%';

  // Check if this entity's details are expanded
  const isEntityExpanded = element.expandedEntities[entity.entity_id] || false;

  return html` <div
    class="${[
      'row',
      statusClassName,
      isEntityExpanded ? 'expanded-row' : '',
    ].join(' ')}"
    @click=${(e: Event) => toggleEntityAttributes(element, entity.entity_id, e)}
  >
    <div class="row-content">
      ${stateContent(hass, entity, statusClassName)}
      ${showBar ? percentBar(entity) : nothing}
    </div>
    ${isEntityExpanded ? attributes(entity.attributes) : nothing}
  </div>`;
};
