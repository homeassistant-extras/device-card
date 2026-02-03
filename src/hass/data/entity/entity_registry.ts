/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/entity/entity_registry.ts
 */

export type EntityCategory = 'config' | 'diagnostic';

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  area_id: string;
  device_id: string;
  labels: string[];
  entity_category?: EntityCategory;
  translation_key?: string;
  hidden?: boolean;
}
