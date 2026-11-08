import type { ActionConfig } from '@homeassistant-extras/hass/data/lovelace/config/action';
import type { ActionConfigParams } from '@homeassistant-extras/hass/panels/lovelace/common/handle-action';

/** `ll-custom` detail fired by the header tap action. */
export interface HeaderCollapseDetail {
  device_card?: { collapse?: boolean };
}

/**
 * Path to a device's page in the Home Assistant settings UI.
 */
export const devicePagePath = (deviceId: string): string =>
  `/config/devices/device/${deviceId}`;

/**
 * Tap action for the header: a `fire-dom-event` that HA re-fires as
 * `ll-custom` from the header, which the device card handles to toggle
 * collapse. Requires HA 2026.11+ (frontend 20261028), where `hass-action`
 * fires `ll-custom` from the originating element instead of the app root.
 */
export const collapseAction = (): ActionConfig =>
  ({
    action: 'fire-dom-event',
    device_card: { collapse: true },
  }) as unknown as ActionConfig;

/**
 * Navigate action to the device page.
 */
export const deviceNavigateAction = (deviceId: string): ActionConfig => ({
  action: 'navigate',
  navigation_path: devicePagePath(deviceId),
});

/**
 * Action configs for the card header, handed to HA via `hass-action`.
 * Tap toggles collapse; hold opens the device page (when the device is known).
 */
export const headerActions = (deviceId?: string): ActionConfigParams => ({
  tap_action: collapseAction(),
  ...(deviceId ? { hold_action: deviceNavigateAction(deviceId) } : {}),
});
