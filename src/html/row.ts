/**
 * @file row.ts
 * @description Entity row rendering for the device card
 * This file handles the rendering of individual entity rows within the device card,
 * including their state content, percentage bars, and expandable attribute details.
 */

import {
  actionHandler,
  handleClickAction,
} from '@delegates/action-handler-delegate';
import type { DeviceCard } from '@device/card';
import type { Config } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import type { EntityInformation } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';
import { attributes } from './attributes';
import { percentBar } from './percent';
import { stateContent } from './state-content';

/**
 * Renders a single entity row with appropriate styling and components
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The configuration for the device card
 * @param {EntityInformation} entity - The entity to render
 * @param {DeviceCard} element - The device card component instance
 * @returns {TemplateResult} A lit-html template for the entity row
 */
export const row = (
  hass: HomeAssistant,
  config: Config,
  entity: EntityInformation,
  element: DeviceCard,
): TemplateResult => {
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
    @action=${handleClickAction(element, config, entity)}
    .actionHandler=${actionHandler(entity)}
  >
    <div class="row-content">
      ${stateContent(hass, entity, statusClassName)}
      ${showBar ? percentBar(entity) : nothing}
    </div>
    ${isEntityExpanded ? attributes(entity.attributes) : nothing}
  </div>`;
};
