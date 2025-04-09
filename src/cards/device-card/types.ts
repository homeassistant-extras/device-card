import type { BaseConfig } from '@type/config';

/**
 * Configuration settings for the integration card
 */
export interface Config extends BaseConfig {
  /** Unique identifier for the device */
  device_id: string;
}
