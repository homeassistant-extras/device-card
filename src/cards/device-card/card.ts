import { hasFeature } from '@config/feature';
import { getDevice } from '@delegates/utils/get-device';
import { hasProblem } from '@delegates/utils/has-problem';
import { styles } from '@device/styles';
import type { HomeAssistant } from '@hass/types';
import { renderSections } from '@html/device-section';
import { picture } from '@html/picture';
import { pinnedEntity } from '@html/pinned-entity';
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
    const hideTitle = hasFeature(this._config, 'hide_title');
    const hideDeviceModel = hasFeature(this._config, 'hide_device_model');
    const hideHeader = hideTitle && hideDeviceModel;
    const entity = pinnedEntity(this._hass, this._config);

    // Prepare header content
    let headerContent: TemplateResult | typeof nothing = nothing;

    if (!hideHeader) {
      const titleContent = hideTitle
        ? nothing
        : html`<span>${this._config.title ?? this._device.name}</span>`;

      const modelContent = hideDeviceModel
        ? nothing
        : html`<span class="model">${this._device.model}</span>`;

      headerContent = html`
        <div
          class="card-header ${this.collapse ? 'collapsed' : ''}"
          @click="${() => (this.collapse = !this.collapse)}"
          title="${this.collapse ? 'Expand' : 'Collapse'}"
        >
          <div class="title">${titleContent} ${modelContent}</div>
          ${entity}
        </div>
      `;
    } else if (entity) {
      // If header is hidden but we have an entity state to show
      headerContent = html`<div class="entity-state-only">${entity}</div>`;
    }

    return html`
      <ha-card class="${problem ? 'problem' : ''}">
        ${headerContent}
        ${!this.collapse
          ? renderSections(
              this,
              this._expansions,
              this._hass,
              this._config,
              this._device,
              (e) => (this._expansions = e),
            )
          : nothing}
      </ha-card>
    `;
  }
}
