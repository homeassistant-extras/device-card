import type { BaseConfig } from '@type/config';

/**
 * Configuration settings for the integration card
 */
export interface Config extends BaseConfig {
  /** Unique identifier for the device */
  device_id: string;

  /** Optional entity ID to display state in header */
  entity_id?: string;
}

/**
 * Expansion settings for the device card
 */
export interface Expansions {
  /** * Track expanded state of sections */
  expandedSections: Record<string, boolean>;

  /** Track expanded state of entity attributes */
  expandedEntities: Record<string, boolean>;
}
