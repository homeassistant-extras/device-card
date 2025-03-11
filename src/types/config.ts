/**
 * @file Card Configuration TypeScript type definitions
 * @description Core type definitions for card configuration.
 */

import type { EntityCategory } from '@hass/data/entity_registry';

/**
 * Configuration settings for entity display and behavior within Home Assistant.
 */
export interface Config {
  /** Unique identifier for the device */
  device_id: string;

  /** Optional display title for the device */
  title?: string;

  /** How many sensors to preview */
  preview_count?: number;

  /** Options to enable disable features **/
  features?: Features[];
}

/** Features to enable or disable functionality */
export type Features = 'entity_picture';

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

  /** The problem entities of the device */
  problemEntities: EntityInformation[];
}

export interface EntityInformation extends EntityState {
  /** Optional category of the entity */
  category?: EntityCategory;

  /** Translation key */
  translation_key: string | undefined;
}

export interface EntityState {
  /** ID of the entity this state belongs to */
  entity_id: string;

  /** Current state value as a string (e.g., "on", "off", "25.5") */
  state: string;

  /** Additional attributes associated with the state */
  attributes: Record<string, any>;
}
