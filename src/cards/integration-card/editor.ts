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
    if (!config.exclude_devices?.length) {
      delete config.exclude_devices;
    }
    if (!config.include_devices?.length) {
      delete config.include_devices;
    }
    if (!config.columns || config.columns <= 0) {
      delete config.columns;
    }

    // @ts-ignore
    fireEvent(this, 'config-changed', {
      config,
    });
  }
}
