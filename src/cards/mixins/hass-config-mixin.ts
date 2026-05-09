import type { Config } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import type { LitElement } from 'lit';
import type { Constructor } from './hass-update-mixin';

/**
 * Provides non-decorated `hass` and `config` fields.
 *
 * These are intentionally NOT `@property()` to avoid Lit reactive property
 * plumbing/attribute semantics.
 */
export const HassConfigMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class HassConfigClass extends superClass {
    public hass!: HomeAssistant;
    public config!: Config;
  }

  return HassConfigClass;
};

