import { matchesPattern } from '@/common/matches';
import type { Config } from './types';

/**
 * Checks if a device ID should be included based on the configuration
 * @param config
 * @param deviceId
 * @param deviceName
 * @returns
 */
export const shouldIncludeDevice = (
  config: Config,
  deviceId: string,
  deviceName: string | null,
): boolean => {
  // If include_devices is specified, device must match one of the patterns
  if (config.include_devices?.length) {
    return config.include_devices.some(
      (pattern) =>
        matchesPattern(deviceId, pattern) ||
        matchesPattern(deviceName, pattern),
    );
  }

  // If no include_devices specified, return false
  return false;
};
