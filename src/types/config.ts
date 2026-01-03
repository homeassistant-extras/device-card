/**
 * @file Card Configuration TypeScript type definitions
 * @description Core type definitions for card configuration.
 */

import type { EntityCategory } from '@hass/data/entity_registry';
import type { ActionConfig } from '@hass/data/lovelace/config/action';

/**
 * Configuration settings for entity display and behavior within Home Assistant.
 */
export interface BaseConfig {
  /** Optional display title for the device */
  title?: string;

  /** How many sensors to preview */
  preview_count?: number;

  /** The entities to exclude */
  exclude_entities?: string[];

  /** The sections to exclude */
  exclude_sections?: string[];

  /** The order in which sections should be displayed */
  section_order?: string[];

  /** Entity IDs that should use inverted percent bar colors (green for low, red for high) */
  inverse_percent?: string[];

  /** The order in which entities should be displayed */
  sort?: SortConfig;

  /** Action to perform on tap */
  tap_action?: ActionConfig;

  /** Action to perform on hold */
  hold_action?: ActionConfig;

  /** Action to perform on double tap */
  double_tap_action?: ActionConfig;

  /** Options to enable disable features **/
  features?: Features[];
}

/** Features to enable or disable functionality */
export type Features =
  | 'collapse'
  | 'compact'
  | 'entity_picture'
  | 'hide_device_model'
  | 'hide_title'
  | 'hide_entity_state';

/**
 * Configuration settings for sorting entities within the card.
 */
export interface SortConfig {
  type: 'domain' | 'entity_id' | 'name' | 'state';
  direction?: 'asc' | 'desc';
}

/**
 * Represents the states of various sensors in a Z-Wave device
 */
export interface Device {
  /** The name of the device */
  name?: string;

  /** The model of the device */
  model?: string;

  /** Entities used to control the unit */
  controls: EntityInformation[];

  /** The sensors of the device */
  sensors: EntityInformation[];

  /** The diagnostics of the device */
  diagnostics: EntityInformation[];

  /** The configurations of the device */
  configurations: EntityInformation[];
}

export interface EntityInformation extends EntityState {
  /** The name of the entity */
  name: string;

  /** Optional category of the entity */
  category?: EntityCategory;

  /** Translation key */
  translation_key: string | undefined;

  /** Whether this entity is a problem entity */
  isProblemEntity: boolean;

  /** Whether this entity is active */
  isActive: boolean;

  /** The entity configuration */
  config?: EntityConfig;
}

export interface EntityState {
  /** ID of the entity this state belongs to */
  entity_id: string;

  /** Current state value as a string (e.g., "on", "off", "25.5") */
  state: string;

  /** Additional attributes associated with the state */
  attributes: Record<string, any>;
}

/**
 * Configuration for an individual entity including display and interaction options.
 */
export interface EntityConfig {
  /** Action to perform on tap */
  tap_action?: ActionConfig;

  /** Action to perform on hold */
  hold_action?: ActionConfig;

  /** Action to perform on double tap */
  double_tap_action?: ActionConfig;
}
