import { getState } from '@delegates/retrievers/state';
import type { Config } from '@device/types';
import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import type { EntityInformation } from '@type/config';

export const getDeviceEntities = (
  hass: HomeAssistant,
  config: Config,
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
          : state.attributes.friendly_name.replace(deviceName, '');
      const active = stateActive(state);
      return {
        entity_id: entity.entity_id,
        category: entity.entity_category,
        state: state.state,
        translation_key: entity.translation_key,
        isProblemEntity: state.attributes.device_class === 'problem',
        isActive: active,
        config: {
          tap_action: config.tap_action,
          hold_action: config.hold_action,
          double_tap_action: config.double_tap_action,
        },
        attributes: {
          ...state.attributes,
          friendly_name: name,
        },
      } as EntityInformation;
    })
    .filter((e) => e !== undefined) as EntityInformation[];
  return deviceEntities;
};
