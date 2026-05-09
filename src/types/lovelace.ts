import type {
  LovelaceRow,
  LovelaceRowConfig,
} from '@hass/panels/lovelace/entity-rows/types';

declare global {
  // eslint-disable-next-line no-var
  var loadCardHelpers: (() => Promise<CardHelpers>) | undefined;
}

/**
 * @description Lovelace card helpers type definitions
 */
export interface CardHelpers {
  createRowElement: (config: LovelaceRowConfig) => LovelaceRow;
}
