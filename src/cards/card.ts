import { getDevice } from '@delegates/utils/get-device';
import { hasProblem } from '@delegates/utils/has-problem';
import type { HomeAssistant } from '@hass/types';
import { picture } from '@html/picture';
import { renderSection } from '@html/section';
import { styles } from '@theme/styles';
import type { Config, Device } from '@type/config';
import { CSSResult, html, LitElement, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { version } from '../../package.json';
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
   * Track expanded state of sections
   */
  @state()
  public expandedSections: Record<string, boolean> = {};

  constructor() {
    super();
    console.info(
      `%c🐱 Poat's Tools: device-card-card - ${version}`,
      'color: #CFC493;',
    );
  }

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
      device_id: device?.id || '',
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

    if (this._config.features?.includes('entity_picture')) {
      return picture(this._device);
    }

    const problem = hasProblem(this._device);

    return html`
      <ha-card class="${problem ? 'problem' : ''}">
        <div class="card-header">
          <div class="title">
            <span>${this._config.title || this._device.name}</span>
            <span class="model">${this._device.model}</span>
          </div>
        </div>

        ${renderSection(
          this,
          this._hass,
          this._config,
          'Controls',
          this._device.controls,
        )}
        ${renderSection(
          this,
          this._hass,
          this._config,
          'Configuration',
          this._device.configurations,
        )}
        ${renderSection(
          this,
          this._hass,
          this._config,
          'Sensors',
          this._device.sensors,
        )}
        ${renderSection(
          this,
          this._hass,
          this._config,
          'Diagnostic',
          this._device.diagnostics,
        )}
      </ha-card>
    `;
  }
}
