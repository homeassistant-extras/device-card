import type { DeviceRegistryEntry } from '@hass/data/device_registry';

/**
 * Checks if a device is in a specific integration
 * @param device
 * @param integration
 * @returns
 */
export const isInIntegration = (
  device: DeviceRegistryEntry,
  integration: string,
): boolean => {
  if (!device.identifiers) {
    return false;
  }

  for (const parts of device.identifiers) {
    for (const part of parts) {
      if (part === integration) {
        return true;
      }
    }
  }

  return false;
};
