import type { Config } from '@device/types';
import { hasFeature } from '@homeassistant-extras/hass/common/config/feature';
import { getState } from '@homeassistant-extras/hass/delegates/retrievers/state';
import { stateDisplay } from '@homeassistant-extras/hass/render/state-display';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { Device } from '@type/config';
import { nothing, type TemplateResult } from 'lit';

/**
 * Renders a state display for the device's featured entity
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The configuration object
 * @param {Device} device - The device holding the resolved featured entity
 * @returns {TemplateResult | typeof nothing} A lit-html template for the state display or nothing if there is no featured entity or the feature is hidden
 */
export const pinnedEntity = (
  hass: HomeAssistant,
  config: Config,
  device: Device,
): TemplateResult | typeof nothing => {
  // Check if the hide_entity_state feature is enabled
  if (hasFeature(config, 'hide_entity_state')) {
    return nothing;
  }

  const state = getState(hass, device.entity?.entity_id);
  if (!state) return nothing;

  return stateDisplay(hass, state);
};
