import { pascalCase } from '@/common/pascal-case';
import { isInIntegration } from '@delegates/utils/is-integration';
import type { HomeAssistant } from '@hass/types';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { integrationStyles } from './styles';
import type { Config, IntegrationData } from './types';
const equal = require('fast-deep-equal');

/**
 * Integration Card
 *
 * A card that displays all devices from a specific Home Assistant integration
 */
export class IntegrationCard extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Integration data state
   */
  @state()
  private _integration!: IntegrationData;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  private _hass!: HomeAssistant;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return integrationStyles;
  }

  // getter for preview mode detection
  get isPreview(): boolean {
    return (
      (this as HTMLElement).parentElement?.classList.contains('preview') ||
      false
    );
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

    const data: IntegrationData = {
      name: '',
      devices: [],
    };

    // Get all devices from the specified integration
    if (this._config.integration) {
      data.name = pascalCase(this._config.integration);

      Object.values(hass.devices).forEach((device) => {
        if (isInIntegration(device, this._config.integration)) {
          data.devices.push(device.id);
        }
      });
    }

    // Update state if changed
    if (!equal(data, this._integration)) {
      this._integration = data;
    }
  }

  // card configuration
  static getConfigElement(): Element {
    return document.createElement('integration-card-editor');
  }

  /**
   * Returns a stub configuration for the card
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  public static async getStubConfig(hass: HomeAssistant): Promise<Config> {
    const device = Object.values(hass.devices).find(
      (device) => device.identifiers && device.identifiers.length > 0,
    );

    const integration = device?.identifiers?.[0]?.[0] || '';

    return {
      integration: integration,
    };
  }
  /**
   * Renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this._integration || !this._integration.devices.length) {
      return html`<ha-card>
        <div class="card-content">
          <div class="no-devices">
            No devices found for integration:
            ${this._config.integration || 'not specified'}
          </div>
        </div>
      </ha-card>`;
    }

    // For preview, only show one device
    const devicesToShow = this.isPreview
      ? this._integration.devices.slice(0, 1)
      : this._integration.devices;

    const title = this._config.title || this._integration.name;

    return html`
      <div class="integration-wrapper">
        ${title ? html`<h1 class="integration-title">${title}</h1>` : nothing}

        <div class="devices-container">
          ${devicesToShow.map((deviceId) => {
            return html`
              <device-card
                .config=${{
                  device_id: deviceId,
                  ...this._config,
                }}
                .hass=${this._hass}
              ></device-card>
            `;
          })}
        </div>
      </div>
    `;
  }
}
