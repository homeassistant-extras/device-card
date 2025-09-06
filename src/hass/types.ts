/**
 * https://github.com/home-assistant/frontend/blob/dev/src/types.ts
 */

import type { DeviceRegistryEntry } from './data/device_registry';
import type { EntityRegistryDisplayEntry } from './data/entity_registry';
import type { HassEntities, MessageBase } from './ws/types';

export interface HomeAssistant {
  states: HassEntities;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  // i18n
  // current effective language in that order:
  //   - backend saved user selected language
  //   - language in local app storage
  //   - browser language
  //   - english (en)
  language: string;
  callWS<T>(msg: MessageBase): Promise<T>;
}
