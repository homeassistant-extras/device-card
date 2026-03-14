import type { HomeAssistant } from '@hass/types';
import type { DeviceSortConfig } from '@type/config';

/**
 * Sorts an array of device IDs based on the provided sort configuration.
 * Uses device registry data from hass to resolve names for name-based sorting.
 *
 * @param deviceIds - The device IDs to sort
 * @param hass - Home Assistant instance (for device registry lookup)
 * @param sortConfig - Sort configuration (type and direction)
 * @returns The sorted device IDs
 */
export const sortDevices = (
  deviceIds: string[],
  hass: HomeAssistant,
  sortConfig?: DeviceSortConfig,
): string[] => {
  if (!sortConfig || !deviceIds.length) {
    return deviceIds;
  }

  const { direction = 'asc' } = sortConfig;
  const isReverse = direction === 'desc';

  const result = [...deviceIds];

  result.sort((a, b) => {
    const deviceA = hass.devices[a];
    const deviceB = hass.devices[b];
    const valueA =
      deviceA?.name_by_user ?? deviceA?.name ?? deviceA?.id ?? a;
    const valueB =
      deviceB?.name_by_user ?? deviceB?.name ?? deviceB?.id ?? b;

    const comparison = valueA.localeCompare(valueB, undefined, {
      sensitivity: 'base',
    });
    if (comparison < 0) return isReverse ? 1 : -1;
    if (comparison > 0) return isReverse ? -1 : 1;
    return 0;
  });

  return result;
};
