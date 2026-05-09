/**
 * https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/entity-rows/types.ts
 */

import type { HomeAssistant } from '@hass/types';

export type LovelaceRowConfig = {};

export interface LovelaceRow extends HTMLElement {
  hass?: HomeAssistant;
  preview?: boolean;
  setConfig(config: LovelaceRowConfig): void;
}
