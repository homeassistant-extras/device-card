import { matchesPattern } from '@/common/matches';
import type { Config } from '@device/types';
import { SENSOR_ENTITIES } from '@homeassistant-extras/hass/common/const';
import { computeDomain } from '@homeassistant-extras/hass/common/entity/compute_domain';
import { getDevice as getHassDevice } from '@homeassistant-extras/hass/delegates/retrievers/device';
import { getEntity } from '@homeassistant-extras/hass/delegates/retrievers/entity';
import { getState } from '@homeassistant-extras/hass/delegates/retrievers/state';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { Device, EntityInformation } from '@type/config';
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
  const entityId = config.entity ?? config.entity_id;
  const device: Device = {
    sensors: [],
    controls: [],
    diagnostics: [],
    configurations: [],
    entity: getState(hass, entityId),
  };

  // Determine device_id from config.device_id or by resolving config.entity/config.entity_id
  const deviceId =
    config.device_id ??
    (entityId ? getEntity(hass, entityId)?.device_id : undefined);

  if (!deviceId) {
    return undefined;
  }

  const hassDevice = getHassDevice(hass, deviceId);
  if (!hassDevice) {
    return undefined;
  }

  device.name = hassDevice.name_by_user ?? hassDevice.name ?? 'Device';
  device.model = [
    hassDevice.manufacturer,
    hassDevice.model,
    hassDevice.model_id,
  ]
    .filter(Boolean)
    .join(' ');

  const entities = getDeviceEntities(hass, config, hassDevice.id, device.name);

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
