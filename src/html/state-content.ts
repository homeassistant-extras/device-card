import { getPoatCardHelpers } from '@/helpers/card-helpers';
import type { HomeAssistant } from '@hass/types';
import type { EntityInformation } from '@type/config';
import { nothing } from 'lit';

/**
 * Renders a row element using Home Assistant's createRowElement (from card helpers).
 */
export const stateContent = (
  hass: HomeAssistant,
  entity: EntityInformation,
  className: string | undefined,
) => {
  const helpers = getPoatCardHelpers();
  if (!helpers) {
    // Card is responsible for gating rendering until helpers are resolved.
    // If this happens, it indicates a misuse (e.g., calling stateContent too early).
    return nothing;
  }

  // Create the row configuration - HA's row handles actions using our config.
  const config = {
    entity: entity.entity_id,
    // our name removes the device name from the friendly name
    name: entity.name,
    // add our actions
    ...entity.config,
  };

  // Create the row element
  const element = helpers.createRowElement(config);

  // Set the hass property
  element.hass = hass;

  // Apply the class name if provided
  if (className) {
    element.className = className;
  }

  return element;
};
