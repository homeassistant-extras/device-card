import { hasProblem } from '@delegates/utils/has-problem';
import { getDevice } from '@delegates/utils/petkit-unit';
import type { HomeAssistant } from '@hass/types';
import { pet } from '@html/pet';
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
   * PetKit Unit information
   */
  @state()
  protected _unit!: Device;

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

    const unit = getDevice(hass, this._config);

    if (unit && !equal(unit, this._unit)) {
      this._unit = unit;
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
    if (!this._unit) {
      return nothing;
    }

    if (
      this._unit.model === 'Pet PET' &&
      this._config.features?.includes('entity_picture')
    ) {
      return pet(this._unit);
    }

    const problem = hasProblem(this._unit);

    return html`
      <ha-card class="${problem ? 'problem' : ''}">
        <div class="card-header">
          <div class="title">
            <span>${this._config.title || this._unit.name}</span>
            <span class="model">${this._unit.model}</span>
          </div>
        </div>

        ${renderSection(
          this,
          this._hass,
          this._config,
          'Controls',
          this._unit.controls,
        )}
        ${renderSection(
          this,
          this._hass,
          this._config,
          'Configuration',
          this._unit.configurations,
        )}
        ${renderSection(
          this,
          this._hass,
          this._config,
          'Sensors',
          this._unit.sensors,
        )}
        ${renderSection(
          this,
          this._hass,
          this._config,
          'Diagnostic',
          this._unit.diagnostics,
        )}
      </ha-card>
    `;
  }
}
