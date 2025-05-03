import type { HomeAssistant } from '@hass/types';
import type { EntityInformation } from '@type/config';
import { html } from 'lit';

/**
 * Renders a state card content for a given entity
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityInformation} entity - The entity to render
 * @param {string | undefined} className - Optional class name for styling
 * @returns {TemplateResult} A lit-html template for the state card content
 */
export const stateContent = (
  hass: HomeAssistant,
  entity: EntityInformation,
  className: string | undefined,
) =>
  html`<state-card-content
    .hass=${hass}
    .stateObj=${entity}
    class="${className}"
  ></state-card-content>`;
