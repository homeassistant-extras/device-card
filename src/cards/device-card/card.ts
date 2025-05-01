import { hasFeature } from '@config/feature';
import { getDevice } from '@delegates/utils/get-device';
import { hasProblem } from '@delegates/utils/has-problem';
import { styles } from '@device/styles';
import type { HomeAssistant } from '@hass/types';
import { renderSections } from '@html/device-section';
import { picture } from '@html/picture';
import type { Device } from '@type/config';
import { CSSResult, html, LitElement, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { Config, Expansions } from './types';
const equal = require('fast-deep-equal');

export class DeviceCard extends LitElement {
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
   * Track the card's expanded state
   */
  @state()
  public _expansions: Expansions = {
    expandedSections: {},
    expandedEntities: {},
  };

  /**
   * Track expanded state of entity attributes
   */
  @state()
  public expandedEntities: Record<string, boolean> = {};

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
    }
  }

  // required for integration card
  set config(config: Config) {
    this.setConfig(config);
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
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

  public static async getStubConfig(hass: HomeAssistant): Promise<Config> {
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

    return html`
      <ha-card class="${problem ? 'problem' : ''}">
        <div class="card-header">
          <div class="title">
            <span>${this._config.title ?? this._device.name}</span>
            ${hasFeature(this._config, 'hide_device_model')
              ? nothing
              : html`<span class="model">${this._device.model}</span>`}
          </div>
        </div>

        ${renderSections(
          this,
          this._expansions,
          this._hass,
          this._config,
          this._device,
          (e) => (this._expansions = e),
        )}
      </ha-card>
    `;
  }
}
