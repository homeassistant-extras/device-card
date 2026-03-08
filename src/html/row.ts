/**
 * @file row.ts
 * @description Entity row rendering for the device card
 * This file handles the rendering of individual entity rows within the device card,
 * including their state content, percentage bars, and expandable attribute details.
 */

import type { Config, Expansions } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import type { EntityInformation } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';
import { attributes } from './attributes';
import { percentBar } from './percent';
import { stateContent } from './state-content';

/**
 * Renders a single entity row with appropriate styling and components.
 * Expand events bubble to the device card.
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityInformation} entity - The entity to render
 * @param {Expansions} expansions - The expansion state of the card
 * @param {Config} config - The card configuration
 * @returns {Promise<TemplateResult>} A lit-html template for the entity row
 */
export const row = async (
  hass: HomeAssistant,
  entity: EntityInformation,
  expansions: Expansions,
  config?: Config,
): Promise<TemplateResult> => {
  let statusClassName: string | undefined;

  // Determine status class based on problem state
  if (entity.isProblemEntity) {
    // Add color to problem class based on state
    statusClassName = entity.isActive ? 'status-error' : 'status-ok';
  }

  // Determine if we should show a percentage bar
  // Show bar for any entity with % unit (including variations like "% available") and numeric state value
  const showBar =
    entity.attributes.unit_of_measurement?.includes('%') &&
    !Number.isNaN(Number(entity.state));

  // Check if this entity's details are expanded
  const isEntityExpanded =
    expansions.expandedEntities[entity.entity_id] || false;

  const stateContentResult = await stateContent(hass, entity, statusClassName);

  // Get inverse_percent entities from config, default to empty array
  const inverseEntities = config?.inverse_percent || [];

  return html` <div
    class="${[
      'row',
      statusClassName,
      isEntityExpanded ? 'expanded-row' : '',
    ].join(' ')}"
  >
    <div class="row-content">
      ${stateContentResult}
      ${showBar ? percentBar(entity, inverseEntities) : nothing}
    </div>
    ${isEntityExpanded ? attributes(entity.attributes) : nothing}
  </div>`;
};
