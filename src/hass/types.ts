/**
 * https://github.com/home-assistant/frontend/blob/dev/src/types.ts
 */

import type { DeviceRegistryEntry } from './data/device/device_registry';
import type { EntityRegistryDisplayEntry } from './data/entity/entity_registry';
import type { Connection, HassEntities, MessageBase } from './ws/types';

export interface CurrentUser {
  name: string;
}

export interface HomeAssistant {
  connection: Connection;
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
  user?: CurrentUser;
  callWS<T>(msg: MessageBase): Promise<T>;
}
