import type { HomeAssistant } from '@hass/types';
import type { EntityInformation } from '@type/config';
import { html } from 'lit';

// Extend the window object to include loadCardHelpers
declare global {
  interface Window {
    loadCardHelpers: () => Promise<{
      createRowElement: (config: LovelaceRowConfig) => LovelaceRowElement;
    }>;
  }
}

// Lovelace row configuration interface
interface LovelaceRowConfig {
  entity: string;
  name?: string;
  [key: string]: any;
}

// Interface for the row element returned by createRowElement
interface LovelaceRowElement extends HTMLElement {
  hass?: any;
}

/**
 * Renders a row element using Home Assistant's createRowElement
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityInformation} entity - The entity to render
 * @param {string | undefined} className - Optional class name for styling
 * @returns {TemplateResult} A lit-html template for the row element
 */
export const stateContent = async (
  hass: HomeAssistant,
  entity: EntityInformation,
  className: string | undefined,
) => {
  // Load the card helpers
  const helpers = await window.loadCardHelpers();

  // Create the row configuration, we will handle actions ourselves
  const config: LovelaceRowConfig = {
    entity: entity.entity_id,
    tap_action: {
      action: 'none',
    },
    hold_action: {
      action: 'none',
    },
    double_tap_action: {
      action: 'none',
    },
  };

  // Create the row element
  const element = helpers.createRowElement(config);

  // Set the hass property
  element.hass = hass;

  // Apply the class name if provided
  if (className) {
    element.className = className;
  }

  return html`${element}`;
};
