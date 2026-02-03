import type { DeviceRegistryEntry } from '@hass/data/device/device_registry';

/**
 * Checks if a device is in a specific integration
 * @param device
 * @param entryIds
 * @returns
 */
export const isInIntegration = (
  device: DeviceRegistryEntry,
  entryIds: string[],
): boolean =>
  device.config_entries?.some((entryId) => entryIds.includes(entryId)) ?? false;
