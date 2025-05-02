import { matchesPattern } from '@/common/matches';
import type { Config } from './types';

/**
 * Checks if a device ID should be excluded based on the configuration
 * @param config
 * @param deviceId
 * @param deviceName
 * @returns
 */
export const shouldExcludeDevice = (
  config: Config,
  deviceId: string,
  deviceName: string | null,
): boolean => {
  if (!config.exclude_devices?.length) {
    return false;
  }

  // Check if any exclusion pattern matches the device ID or name
  return config.exclude_devices.some(
    (pattern) =>
      matchesPattern(deviceId, pattern) || matchesPattern(deviceName, pattern),
  );
};
