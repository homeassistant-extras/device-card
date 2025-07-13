import { hasFeature } from '@config/feature';
import { getState } from '@delegates/retrievers/state';
import type { Config } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import { nothing, type TemplateResult } from 'lit';
import { stateDisplay } from './state-display';

/**
 * Renders a state display for a pinned entity
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The configuration object
 * @returns {TemplateResult | typeof nothing} A lit-html template for the state display or nothing if no entityId is provided or feature is hidden
 */
export const pinnedEntity = (
  hass: HomeAssistant,
  config: Config,
): TemplateResult | typeof nothing => {
  // Check if the hide_entity_state feature is enabled
  if (hasFeature(config, 'hide_entity_state')) {
    return nothing;
  }

  if (!config.entity_id) return nothing;

  const state = getState(hass, config.entity_id);
  if (!state) return nothing;

  return stateDisplay(hass, state);
};
