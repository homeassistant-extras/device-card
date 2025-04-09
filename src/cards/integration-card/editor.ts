import { pascalCase } from '@/common/pascal-case';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
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
   * Generates the schema for the card editor form
   */
  private _getSchema(): HaFormSchema[] {
    const integrations: string[] = [];

    Object.values(this.hass.devices).forEach((device) => {
      for (const parts of device.identifiers) {
        const part = parts[0];

        if (!integrations.includes(part)) {
          integrations.push(part);
        }
      }
    });

    return [
      {
        name: 'integration',
        selector: {
          select: {
            options: integrations.sort().map((integration) => ({
              value: integration,
              label: pascalCase(integration),
            })),
            mode: 'dropdown' as 'dropdown',
          },
        },
        required: true,
        label: 'Integration',
      },
      {
        name: 'content',
        label: 'Content',
        type: 'expandable',
        flatten: true,
        icon: 'mdi:text-short',
        schema: [
          {
            name: 'title',
            required: false,
            label: 'Card Title',
            selector: {
              text: {},
            },
          },
          {
            name: 'preview_count',
            required: false,
            label: 'Preview Count',
            selector: {
              text: {
                type: 'number' as 'number',
              },
            },
          },
          {
            name: 'exclude_sections',
            label: 'Sections to exclude',
            required: false,
            selector: {
              select: {
                multiple: true,
                mode: 'list' as 'list',
                options: [
                  {
                    label: 'Controls',
                    value: 'controls',
                  },
                  {
                    label: 'Configuration',
                    value: 'configurations',
                  },
                  {
                    label: 'Sensors',
                    value: 'sensors',
                  },
                  {
                    label: 'Diagnostic',
                    value: 'diagnostics',
                  },
                ],
              },
            },
          },
          {
            name: 'section_order',
            label: 'Section display order (click in order)',
            required: false,
            selector: {
              select: {
                multiple: true,
                mode: 'list' as 'list',
                options: [
                  {
                    label: 'Controls',
                    value: 'controls',
                  },
                  {
                    label: 'Configuration',
                    value: 'configurations',
                  },
                  {
                    label: 'Sensors',
                    value: 'sensors',
                  },
                  {
                    label: 'Diagnostic',
                    value: 'diagnostics',
                  },
                ],
              },
            },
          },
        ],
      },
      {
        name: 'features',
        label: 'Features',
        type: 'expandable',
        flatten: true,
        icon: 'mdi:list-box',
        schema: [
          {
            name: 'features',
            label: 'Enable Features',
            required: false,
            selector: {
              select: {
                multiple: true,
                mode: 'list' as 'list',
                options: [
                  {
                    label: 'Compact Layout',
                    value: 'compact',
                  },
                  {
                    label: 'Hide Device Model',
                    value: 'hide_device_model',
                  },
                ],
              },
            },
          },
        ],
      },
      {
        name: 'interactions',
        label: 'Interactions',
        type: 'expandable',
        flatten: true,
        icon: 'mdi:gesture-tap',
        schema: [
          {
            name: 'tap_action',
            label: 'Tap Action',
            selector: {
              ui_action: {},
            },
          },
          {
            name: 'hold_action',
            label: 'Hold Action',
            selector: {
              ui_action: {},
            },
          },
          {
            name: 'double_tap_action',
            label: 'Double Tap Action',
            selector: {
              ui_action: {},
            },
          },
        ],
      },
    ];
  }

  /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._getSchema()}
        .computeLabel=${(s: HaFormSchema) => s.label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
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

    // @ts-ignore
    fireEvent(this, 'config-changed', {
      config,
    });
  }
}
