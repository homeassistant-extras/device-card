import { matchesDevicePatterns } from '@/common/matches';
import { pascalCase } from '@/common/pascal-case';
import { isInIntegration } from '@delegates/utils/is-integration';
import type { HomeAssistant } from '@hass/types';

/**
 * Params for computing integration devices.
 * Pass the resolved include list and exclude patterns from the card config.
 */
export interface ComputeIntegrationDevicesParams {
  /** Integration domain (e.g. 'zwave_js') */
  integration: string;

  /**
   * Resolved include list. undefined = include all, [] = include none, [...] = match patterns.
   * When include_devices is a template string, pass the template result here.
   */
  includeDevices?: string[];

  /**
   * Resolved exclude list. Device ID/name patterns to exclude.
   * When exclude_devices is a template string, pass the template result here.
   */
  excludeDevices?: string[];
}

/**
 * Result of computing integration devices.
 */
export interface IntegrationDevicesResult {
  name: string;
  devices: string[];
}

/**
 * Computes the list of device IDs for an integration.
 * Fetches config entries via WebSocket, filters devices by integration membership
 * and the provided include/exclude params.
 *
 * @param hass - Home Assistant instance
 * @param params - Integration domain and filter params from the card config
 * @returns Promise resolving to integration name and device IDs
 */
export async function computeIntegrationDevices(
  hass: HomeAssistant,
  params: ComputeIntegrationDevicesParams,
): Promise<IntegrationDevicesResult> {
  const { integration, includeDevices, excludeDevices = [] } = params;

  const results = await hass.callWS<{ entry_id: string }[]>({
    type: 'config_entries/get',
    domain: integration,
  });
  const configEntries = results.map((e) => e.entry_id);

  const devices: string[] = [];
  for (const device of Object.values(hass.devices)) {
    if (!isInIntegration(device, configEntries)) continue;

    const hasIncludeList = !!includeDevices && includeDevices.length > 0;
    const isIncluded = hasIncludeList
      ? matchesDevicePatterns(
          device.id,
          device.name,
          device.name_by_user,
          includeDevices,
        )
      : includeDevices === undefined; // undefined = include all, [] = include none

    const isExcluded = matchesDevicePatterns(
      device.id,
      device.name,
      device.name_by_user,
      excludeDevices,
    );

    if (isIncluded && !isExcluded) {
      devices.push(device.id);
    }
  }

  return {
    name: pascalCase(integration),
    devices,
  };
}
