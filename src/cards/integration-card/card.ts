import { computeIntegrationDevices } from '@delegates/integration-devices';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { integrationStyles } from './styles';
import { TemplateSubscription } from './template-subscription';
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

  /** Manages the Jinja template websocket subscription for include_devices */
  private readonly _includeTemplateSub = new TemplateSubscription(() => {
    this._computeIntegration();
  });

  /** Manages the Jinja template websocket subscription for exclude_devices */
  private readonly _excludeTemplateSub = new TemplateSubscription(() => {
    this._computeIntegration();
  });

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
      if (
        typeof config.include_devices !== 'string' ||
        config.include_devices !== this._includeTemplateSub.subscribedTemplate
      ) {
        this._includeTemplateSub.disconnect();
      }
      if (
        typeof config.exclude_devices !== 'string' ||
        config.exclude_devices !== this._excludeTemplateSub.subscribedTemplate
      ) {
        this._excludeTemplateSub.disconnect();
      }
    }
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this._hass = hass;

    // update children who are subscribed
    fireEvent(this, 'hass-update', {
      hass,
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._tryConnect();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._includeTemplateSub.disconnect();
    this._excludeTemplateSub.disconnect();
  }

  /**
   * Subscribe to Jinja templates when include_devices or exclude_devices is a template string.
   */
  private _tryConnect(): void {
    if (!this._hass) {
      return;
    }

    const includeTemplate = this._config?.include_devices;
    const excludeTemplate = this._config?.exclude_devices;

    if (typeof includeTemplate === 'string') {
      this._includeTemplateSub.connect(this._hass.connection, includeTemplate);
    } else {
      this._includeTemplateSub.disconnect();
    }

    if (typeof excludeTemplate === 'string') {
      this._excludeTemplateSub.connect(this._hass.connection, excludeTemplate);
    } else {
      this._excludeTemplateSub.disconnect();
    }

    this._computeIntegration();
  }

  /**
   * Compute the integration data (device list) from current state.
   * Called from the hass setter and when template results arrive.
   */
  private _computeIntegration(): void {
    const hass = this._hass;
    if (!hass || !this._config?.integration) return;

    // If using include_devices template but it hasn't resolved yet, wait
    if (
      typeof this._config.include_devices === 'string' &&
      !this._includeTemplateSub.deviceIds
    ) {
      return;
    }

    // If using exclude_devices template but it hasn't resolved yet, wait
    if (
      typeof this._config.exclude_devices === 'string' &&
      !this._excludeTemplateSub.deviceIds
    ) {
      return;
    }

    // pass config and template results to function for it to handle.
    const effectiveIncludeDevices =
      typeof this._config.include_devices === 'string'
        ? this._includeTemplateSub.deviceIds
        : this._config.include_devices;

    const effectiveExcludeDevices =
      typeof this._config.exclude_devices === 'string'
        ? this._excludeTemplateSub.deviceIds
        : this._config.exclude_devices;

    computeIntegrationDevices(hass, {
      integration: this._config.integration,
      includeDevices: effectiveIncludeDevices,
      excludeDevices: effectiveExcludeDevices,
    }).then((data) => {
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

    const integration = device?.identifiers?.[0]?.[0] ?? '';

    return {
      integration: integration,
    };
  }

  /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this._hass) {
      return nothing;
    }

    if (!this._integration?.devices?.length) {
      const message = this._integration
        ? `${localize(this._hass, 'card.no_devices_found')} ${this._config.integration}`
        : localize(this._hass, 'card.loading');
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
                  sort: this._config.sort,
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
