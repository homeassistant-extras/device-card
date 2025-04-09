/**
 * @file Integration Card Configuration TypeScript type definitions
 * @description Type definitions for integration card configuration.
 */

import type { BaseConfig } from '@type/config';

/**
 * Configuration settings for the integration card
 */
export interface Config extends BaseConfig {
  /** Integration domain to display devices for */
  integration: string;
}

/**
 * Data structure for integration state
 */
export interface IntegrationData {
  /** Integration name */
  name: string;

  /** Array of device IDs for this integration */
  devices: string[];
}
