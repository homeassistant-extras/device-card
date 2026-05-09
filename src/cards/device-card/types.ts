import type { BaseConfig } from '@type/config';

/**
 * Configuration settings for the integration card
 */
export interface Config extends BaseConfig {
  /** Unique identifier for the device (optional if entity_id is provided) */
  device_id?: string;

  /** Entity ID to derive device from (alternative to device_id) or display state in header */
  entity_id?: string;

  /** Alias for entity_id - convenience for auto-entities integration */
  entity?: string;
}
