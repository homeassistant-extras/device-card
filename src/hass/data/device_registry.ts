/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/device_registry.ts
 */

import type { RegistryEntry } from './registry';

export interface DeviceRegistryEntry extends RegistryEntry {
  id: string;
  identifiers: [string, string][];
  manufacturer: string | null;
  model: string | null;
  model_id: string | null;
  name: string | null;
  area_id: string;
}
