import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import { nothing, type TemplateResult } from 'lit';
import { stateDisplay } from './state-display';

/**
 * Renders a state display for a pinned entity
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} [entityId] - The ID of the entity to render
 * @returns {TemplateResult | typeof nothing} A lit-html template for the state display or nothing if no entityId is provided
 */
export const pinnedEntity = (
  hass: HomeAssistant,
  entityId?: string,
): TemplateResult | typeof nothing => {
  if (!entityId) return nothing;

  const state = getState(hass, entityId);
  if (!state) return nothing;

  return stateDisplay(hass, state);
};
