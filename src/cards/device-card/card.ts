import { getOrderedSections } from '@/helpers/device-section';
import '@cards/components/section/section';
import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { hasFeature } from '@config/feature';
import { getDevice } from '@delegates/utils/get-device';
import { hasProblem } from '@delegates/utils/has-problem';
import { styles } from '@device/styles';
import type { HomeAssistant } from '@hass/types';
import { deviceCardHeader } from '@html/device-card-header';
import { picture } from '@html/picture';
import { pinnedEntity } from '@html/pinned-entity';
import type { Device } from '@type/config';
import equal from 'fast-deep-equal';
import {
  type CSSResult,
  html,
  LitElement,
  nothing,
  type TemplateResult,
} from 'lit';
import { state } from 'lit/decorators.js';
import type { Config } from './types';

export class DeviceCard extends HassUpdateMixin(LitElement) {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Device information
   */
  @state()
  protected _device!: Device;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  private _hass!: HomeAssistant;

  /**
   * Internal collapsed state, separate from the config
   */
  @state()
  private collapse = false;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    if (!equal(config, this._config)) {
      this._config = config;
      this.collapse = hasFeature(config, 'collapse');
    }
  }

  // required for integration card
  set config(config: Config) {
    this.setConfig(config);
  }

  /**
   * Home Assistant instance (readable for HassUpdateElement interface)
   */
  override get hass(): HomeAssistant {
    return this._hass;
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  override set hass(hass: HomeAssistant) {
    this._hass = hass;

    const device = getDevice(hass, this._config);

    if (device && !equal(device, this._device)) {
      this._device = device;
    }
  }

  // card configuration
  static getConfigElement() {
    return document.createElement('device-card-editor');
  }

  public static getStubConfig(hass: HomeAssistant): Config {
    const device = Object.values(hass.devices)[0];

    return {
      device_id: device?.id ?? '',
    };
  }

  /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this._device) {
      return nothing;
    }

    if (hasFeature(this._config, 'entity_picture')) {
      return picture(this._device);
    }

    const problem = hasProblem(this._device);
    const entity = pinnedEntity(this._hass, this._config);
    const headerContent = deviceCardHeader({
      config: this._config,
      device: this._device,
      hass: this._hass,
      collapse: this.collapse,
      onCollapseToggle: () => (this.collapse = !this.collapse),
      entity,
    });

    return html`
      <ha-card class="${problem ? 'problem' : ''}">
        ${headerContent}
        ${this.collapse
          ? nothing
          : getOrderedSections(this._hass, this._config, this._device).map(
              (s) =>
                html`<device-card-section
                  .hass=${this._hass}
                  .config=${this._config}
                  .section=${s}
                ></device-card-section>`,
            )}
      </ha-card>
    `;
  }
}
