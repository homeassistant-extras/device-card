import type { Config } from '@device/types';
import { hasFeature } from '@homeassistant-extras/hass/common/config/feature';
import { getState } from '@homeassistant-extras/hass/delegates/retrievers/state';
import { stateDisplay } from '@homeassistant-extras/hass/render/state-display';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { nothing, type TemplateResult } from 'lit';

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

  const entityId = config.entity ?? config.entity_id;
  if (!entityId) return nothing;

  const state = getState(hass, entityId);
  if (!state) return nothing;

  return stateDisplay(hass, state);
};
