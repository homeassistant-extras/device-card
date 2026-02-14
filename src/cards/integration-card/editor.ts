import { getIntegrationSchema } from '@delegates/utils/editor-schema';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { Task } from '@lit/task';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { Config } from './types';

export class IntegrationCardEditor extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  public hass!: HomeAssistant;

  /**
   * Task that fetches the integrations asynchronously
   * Uses the Home Assistant web sockets Promise
   */
  _getIntegrationsTask = new Task(this, {
    task: async ([integration]) =>
      await getIntegrationSchema(this.hass, integration),
    args: () => [this._config?.integration],
  });

  /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`${this._getIntegrationsTask.render({
      initial: () => nothing,
      pending: () => nothing,
      complete: (value) => html`
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${value}
          .computeLabel=${(s: HaFormSchema) => s.label}
          @value-changed=${this._valueChanged}
        ></ha-form>
      `,
      error: (error) => html`${error}`,
    })}`;
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    this._config = config;
  }

  /**
   * Handle form value changes
   */
  private _valueChanged(ev: CustomEvent) {
    const config = ev.detail.value as Config;

    // Clean up empty arrays and undefined values
    if (!config.features?.length) {
      delete config.features;
    }
    if (!config.exclude_entities?.length) {
      delete config.exclude_entities;
    }
    if (!config.exclude_sections?.length) {
      delete config.exclude_sections;
    }
    if (!config.section_order?.length) {
      delete config.section_order;
    }
    if (!config.columns || config.columns <= 0) {
      delete config.columns;
    }

    this._cleanupDevicesField(config, 'include_devices');
    this._cleanupDevicesField(config, 'exclude_devices');

    // @ts-ignore
    fireEvent(this, 'config-changed', {
      config,
    });
  }

  /**
   * Clean up include_devices or exclude_devices: remove if empty string or empty array.
   * Both support string (template) or string[] (device list).
   */
  private _cleanupDevicesField(
    config: Config,
    key: 'include_devices' | 'exclude_devices',
  ): void {
    const value = config[key];
    if (typeof value === 'string') {
      if (value.trim().length === 0) {
        delete config[key];
      }
    } else if (Array.isArray(value) && !value.length) {
      delete config[key];
    }
  }
}
