import { stateActive } from '@homeassistant-extras/hass/common/entity/state_active';
import type { ActionConfig } from '@homeassistant-extras/hass/data/lovelace/config/action';
import { getState } from '@homeassistant-extras/hass/delegates/retrievers/state';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { BaseConfig, EntityInformation } from '@type/config';

/**
 * Retrieves all entities for a specific device, filtering out hidden entities
 * Hidden entities (where hidden is true) are excluded by default to match Home Assistant's
 * more-info popup behavior. Enable the show_hidden_entities feature to include them.
 *
 * @param hass - The Home Assistant instance
 * @param config - The configuration object
 * @param deviceId - The ID of the device
 * @param deviceName - Optional device name for friendly name processing
 * @returns Array of entity information for the device
 */
export const getDeviceEntities = (
  hass: HomeAssistant,
  config: BaseConfig,
  deviceId: string,
  deviceName?: string | null,
): EntityInformation[] => {
  const includeHidden = config.features?.includes('show_hidden_entities');
  const deviceEntities = Object.values(hass.entities)
    .filter(
      (entity) =>
        entity.device_id === deviceId && (includeHidden || !entity.hidden),
    )
    .map((entity) => {
      const state = getState(hass, entity.entity_id);
      if (state === undefined) {
        return;
      }

      // convenience
      const friendlyName = state.attributes.friendly_name;
      let name: string;
      if (typeof friendlyName === 'string') {
        if (deviceName && friendlyName === deviceName) {
          name = deviceName;
        } else if (deviceName) {
          name =
            friendlyName.replace(deviceName, '').trim() || entity.entity_id;
        } else {
          name = friendlyName;
        }
      } else {
        name = entity.entity_id;
      }
      const active = stateActive(state);
      return {
        name,
        ...state,
        category: entity.entity_category,
        translation_key: entity.translation_key,
        isProblemEntity: state.attributes.device_class === 'problem',
        isActive: active,
        config: {
          tap_action:
            config.tap_action ||
            ({
              action: 'fire-dom-event',
              device_card: {
                expand: true,
                entity_id: entity.entity_id,
              },
            } as unknown as ActionConfig),
          hold_action: config.hold_action || {
            action: 'more-info',
          },
          double_tap_action: config.double_tap_action,
        },
      };
    })
    .filter((e) => e !== undefined);
  return deviceEntities;
};
