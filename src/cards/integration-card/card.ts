import { pascalCase } from '@/common/pascal-case';
import { isInIntegration } from '@delegates/utils/is-integration';
import type { HomeAssistant } from '@hass/types';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { shouldExcludeDevice } from './exclude-devices';
import { shouldIncludeDevice } from './include-devices';
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

    if (!this._config.integration) {
      return;
    }
    // Get all devices from the specified integration
    data.name = pascalCase(this._config.integration);

    // Get config entries for the integration domain
    hass
      .callWS({
        type: 'config_entries/get',
        domain: this._config.integration,
      })
      .then((results: any) => {
        const configEntries = results.map((e: any) => e.entry_id);

        Object.values(hass.devices).forEach((device) => {
          var isIncluded = shouldIncludeDevice(
            this._config,
            device.id,
            device.name,
          );

          var isExcluded =
            !isIncluded &&
            shouldExcludeDevice(this._config, device.id, device.name);

          if (!isExcluded && isInIntegration(device, configEntries)) {
            data.devices.push(device.id);
          }
        });

        if (!equal(data, this._integration)) {
          this._integration = data;
        }
      });
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
    if (!this._integration?.devices?.length) {
      const message = this._integration
        ? `No devices found for integration: ${this._config.integration}`
        : 'Loading...';
      return html`<ha-card>
        <div class="card-content">
          <div class="no-devices">${message}</div>
        </div>
      </ha-card>`;
    }

    // For preview, only show one device
    const devicesToShow = this.isPreview
      ? this._integration?.devices?.slice(0, 1)
      : this._integration?.devices;

    const title = this._config.title ?? this._integration.name;

    // Get grid styles based on columns configuration
    const gridStyles = this._getGridStyles();

    return html`
      <div>
        ${title && !this._config.hide_integration_title
          ? html`<h1 class="integration-title">${title}</h1>`
          : nothing}

        <div class="devices-container" style=${styleMap(gridStyles)}>
          ${devicesToShow.map((deviceId) => {
            return html`
              <device-card
                .config=${{
                  device_id: deviceId,
                  preview_count: this._config.preview_count,
                  exclude_entities: this._config.exclude_entities,
                  exclude_sections: this._config.exclude_sections,
                  section_order: this._config.section_order,
                  tap_action: this._config.tap_action,
                  hold_action: this._config.hold_action,
                  double_tap_action: this._config.double_tap_action,
                  features: this._config.features,
                }}
                .hass=${this._hass}
              ></device-card>
            `;
          })}
        </div>
      </div>
    `;
  }

  /**
   * Generate the grid styles based on the columns configuration
   * @returns {Record<string, string>} Style properties object
   */
  private _getGridStyles(): Record<string, string> {
    // If columns setting is provided, use it to set a fixed number of columns
    if (
      this._config.columns &&
      Number.isInteger(this._config.columns) &&
      this._config.columns > 0
    ) {
      return {
        'grid-template-columns': `repeat(${this._config.columns}, 1fr)`,
      };
    }

    // Otherwise, return an empty object to use the default responsive behavior
    return {};
  }
}
