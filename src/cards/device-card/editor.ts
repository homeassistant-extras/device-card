import { getDeviceEntities } from '@delegates/utils/card-entities';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { Config } from './types';

const getSchema = (entityIds: string[]): HaFormSchema[] => [
  {
    name: 'device_id',
    selector: {
      device: {},
    },
    required: true,
    label: `Device`,
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
                label: 'Use Entity Picture',
                value: 'entity_picture',
              },
              {
                label: 'Hide Device Model',
                value: 'hide_device_model',
              },
              {
                label: 'Compact Layout',
                value: 'compact',
              },
            ],
          },
        },
      },
      {
        name: 'exclude_entities',
        label: 'Entities to exclude',
        required: false,
        selector: { entity: { multiple: true, include_entities: entityIds } },
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

export class DeviceCardEditor extends LitElement {
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
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const entities = getDeviceEntities(
      this.hass,
      this._config,
      this._config.device_id,
    ).map((e) => e.entity_id);

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${getSchema(entities)}
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

  private _valueChanged(ev: CustomEvent) {
    const config = ev.detail.value as Config;
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
