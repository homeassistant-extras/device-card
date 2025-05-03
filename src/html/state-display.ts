import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import { html, type TemplateResult } from 'lit';

/**
 * Renders a state display for a given entity
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {HassEntity} entity - The entity to render
 * @returns {TemplateResult} A lit-html template for the state display
 */
export const stateDisplay = (
  hass: HomeAssistant,
  entity: HassEntity,
): TemplateResult =>
  html`<state-display .hass=${hass} .stateObj=${entity}></state-display>`;
