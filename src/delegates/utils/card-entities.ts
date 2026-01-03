import { getState } from '@delegates/retrievers/state';
import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import type { BaseConfig, EntityInformation } from '@type/config';

export const getDeviceEntities = (
  hass: HomeAssistant,
  config: BaseConfig,
  deviceId: string,
  deviceName?: string | null,
): EntityInformation[] => {
  const deviceEntities = Object.values(hass.entities)
    .filter((entity) => entity.device_id === deviceId)
    .map((entity) => {
      const state = getState(hass, entity.entity_id);
      if (state === undefined) {
        return;
      }

      // convenience
      const name =
        state.attributes.friendly_name === deviceName
          ? deviceName
          : state.attributes.friendly_name.replace(deviceName, '').trim();
      const active = stateActive(state);
      return {
        name,
        ...state,
        category: entity.entity_category,
        translation_key: entity.translation_key,
        isProblemEntity: state.attributes.device_class === 'problem',
        isActive: active,
        config: {
          tap_action: config.tap_action,
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
