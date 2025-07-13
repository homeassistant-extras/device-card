import { matchesPattern } from '@/common/matches';
import { getDevice as getHassDevice } from '@delegates/retrievers/device';
import type { Config } from '@device/types';
import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HomeAssistant } from '@hass/types';
import type { Device, EntityInformation } from '@type/config';
import { SENSOR_ENTITIES } from '../../hass/common/const';
import { getDeviceEntities } from './card-entities';

/**
 * Gets a device with all its entities sorted into appropriate categories
 * @param hass - The Home Assistant instance
 * @param config - The configuration object
 * @returns The device object or undefined if the device is not found
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

  device.name = hassDevice.name ?? 'Device';
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
    if (shouldSkipEntity(entity, config)) {
      return;
    }

    addEntityToDevice(entity, device, config);
  });

  return device;
};

/**
 * Determines if an entity should be skipped based on configuration
 * @param entity - The entity to check
 * @param config - The configuration object containing exclusion rules
 * @returns True if the entity should be skipped, false otherwise
 */
const shouldSkipEntity = (
  entity: EntityInformation,
  config: Config,
): boolean => {
  if (!config.exclude_entities?.length) {
    return false;
  }

  // Check if any exclusion pattern matches the entity ID
  return config.exclude_entities.some((pattern) =>
    matchesPattern(entity.entity_id, pattern),
  );
};

/**
 * Adds an entity to the appropriate category in the device object
 * based on entity type and configuration exclusion rules
 * @param entity - The entity to categorize and add
 * @param device - The device object to update
 * @param config - The configuration object containing exclusion rules
 */
const addEntityToDevice = (
  entity: EntityInformation,
  device: Device,
  config: Config,
): void => {
  if (entity.category === 'diagnostic') {
    if (!config.exclude_sections?.includes('diagnostics')) {
      device.diagnostics.push(entity);
    }
  } else if (entity.category === 'config') {
    if (!config.exclude_sections?.includes('configurations')) {
      device.configurations.push(entity);
    }
  } else {
    const domain = computeDomain(entity.entity_id);
    const isSensor = SENSOR_ENTITIES.includes(domain);

    if (isSensor && !config.exclude_sections?.includes('sensors')) {
      device.sensors.push(entity);
    } else if (!config.exclude_sections?.includes('controls')) {
      device.controls.push(entity);
    }
  }
};
