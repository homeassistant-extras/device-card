import { getDevice as getHassDevice } from '@delegates/retrievers/device';
import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HomeAssistant } from '@hass/types';
import type { Config, Device } from '@type/config';
import { getDeviceEntities } from './card-entities';

/**
 * Get the device information
 * @param {HomeAssistant} hass - Home Assistant instance
 * @param {Config} config - Card configuration
 * @returns {Device | undefined} - device information
 */
export const getDevice = (
  hass: HomeAssistant,
  config: Config,
): Device | undefined => {
  const device: Device = {
    sensors: [],
    controls: [],
    diagnostics: [],
    configurations: [],
  };

  const hassDevice = getHassDevice(hass, config.device_id);
  if (!hassDevice) {
    return undefined;
  }

  device.name = hassDevice.name || 'Device';
  device.model = [
    hassDevice.manufacturer,
    hassDevice.model,
    hassDevice.model_id,
  ]
    .filter((s) => s)
    .join(' ');

  const entities = getDeviceEntities(
    hass,
    config,
    hassDevice.id,
    hassDevice.name,
  );
  entities.forEach((entity) => {
    if (config.exclude_entities?.includes(entity.entity_id)) {
      return;
    }

    if (entity.category === 'diagnostic') {
      if (config.exclude_sections?.includes('diagnostics')) {
        return;
      }
      device.diagnostics.push(entity);
    } else if (entity.category === 'config') {
      if (config.exclude_sections?.includes('configurations')) {
        return;
      }
      device.configurations.push(entity);
    } else {
      const domain = computeDomain(entity.entity_id);
      if (['text', 'button', 'switch', 'select'].includes(domain)) {
        if (config.exclude_sections?.includes('controls')) {
          return;
        }
        device.controls.push(entity);
      } else {
        if (config.exclude_sections?.includes('sensors')) {
          return;
        }
        // everything else is a sensor
        device.sensors.push(entity);
      }
    }
  });

  return device;
};
