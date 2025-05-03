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

  /** List of device IDs to include in the display (takes precedence over exclusions) */
  include_devices?: string[];

  /** List of device IDs to exclude from the display */
  exclude_devices?: string[];

  /** Fixed number of columns for device display (overrides responsive behavior) */
  columns?: number;

  /** Hide the integration title */
  hide_integration_title?: boolean;
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
