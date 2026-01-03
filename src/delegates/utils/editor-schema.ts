import type { Config } from '@device/types';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { IntegrationManifest } from '@hass/data/integration';
import type { HomeAssistant } from '@hass/types';
import { getDeviceEntities } from './card-entities';

/**
 * Common interactions schema used in both device and integration cards
 * Defines the configuration options for tap, hold, and double tap actions
 * that control card behavior when users interact with it
 */
const INTERACTIONS_SCHEMA: HaFormSchema = {
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
};

/**
 * Generates the schema for the device card's content configuration
 * This includes options for title, preview count, section exclusion,
 *
 */
const CONTENT_SCHEMA: HaFormSchema = {
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
          type: 'number' as const,
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
          mode: 'list' as const,
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
          mode: 'list' as const,
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
};

/**
 * Generates the schema for the sort options in the device card
 * This includes options for sorting by domain, entity ID, name, or state
 *
 */
const SORT_SCHEMA: HaFormSchema = {
  name: 'sort',
  label: 'Sort Options',
  type: 'expandable',
  flatten: false,
  icon: 'mdi:sort',
  schema: [
    {
      type: 'grid',
      name: '',
      label: '',
      schema: [
        {
          name: 'type',
          label: 'Sort Type',
          required: true,
          selector: {
            select: {
              options: [
                { value: 'domain', label: 'Domain' },
                { value: 'entity_id', label: 'Entity ID' },
                { value: 'name', label: 'Name' },
                { value: 'state', label: 'State' },
              ],
              mode: 'dropdown' as const,
            },
          },
        },
        {
          name: 'direction',
          label: 'Sort Direction',
          selector: {
            select: {
              options: [
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ],
              mode: 'dropdown' as const,
            },
          },
        },
      ],
    },
  ],
};

/**
 * Generates the schema for the integration card's layout configuration
 * This includes options for the number of columns, device inclusion/exclusion,
 *
 * @param {string} integration - The current integration domain (if already selected)
 * @returns {HaFormSchema} The complete schema for device card content configuration
 */
const layoutSchema = (integration?: string): HaFormSchema => {
  return {
    name: 'layout',
    label: 'Integration Layout',
    type: 'expandable',
    flatten: true,
    icon: 'mdi:view-grid-plus',
    schema: [
      {
        type: 'grid',
        name: '',
        label: '',
        schema: [
          {
            name: 'columns',
            required: false,
            label: 'Number of Columns',
            selector: {
              number: {
                min: 1,
                max: 6,
                mode: 'box' as const,
              },
            },
          },
          {
            name: 'hide_integration_title',
            label: 'Hide Title',
            selector: { boolean: {} },
          },
        ],
      },
      {
        name: 'include_devices',
        label: 'Devices to include',
        required: false,
        selector: {
          device: {
            multiple: true,
            filter: {
              integration: integration,
            },
          },
        },
      },
      {
        name: 'exclude_devices',
        label: 'Devices to exclude',
        required: false,
        selector: {
          device: {
            multiple: true,
            filter: {
              integration: integration,
            },
          },
        },
      },
    ],
  };
};

const featuresSchema = (
  integration?: string,
  entities?: string[],
): HaFormSchema => {
  return {
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
            mode: 'list' as const,
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
                label: 'Hide Title',
                value: 'hide_title',
              },
              {
                label: 'Hide Entity State',
                value: 'hide_entity_state',
              },
              {
                label: 'Compact Layout',
                value: 'compact',
              },
              {
                label: 'Start Collapsed',
                value: 'collapse',
              },
            ],
          },
        },
      },
      {
        name: 'exclude_entities',
        label: 'Entities to exclude',
        required: false,
        selector: {
          entity: {
            multiple: true,
            include_entities: entities,
            filter: {
              integration: integration,
            },
          },
        },
      },
      {
        name: 'inverse_percent',
        label:
          'Entities with inverted percent colors (green for low, red for high)',
        required: false,
        selector: {
          entity: {
            multiple: true,
            include_entities: entities,
            filter: {
              integration: integration,
            },
          },
        },
      },
    ],
  };
};

/**
 * Generates the schema for the integration card's configuration form
 * Fetches available integrations from Home Assistant and creates a complete
 * configuration schema with integration-specific options
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} integration - The current integration domain (if already selected)
 * @returns {Promise<HaFormSchema[]>} A promise resolving to the complete schema array
 */
export const getIntegrationSchema = async (
  hass: HomeAssistant,
  integration: string,
): Promise<HaFormSchema[]> => {
  // Get all integrations from the manifest
  const manifests = (
    await hass.callWS<IntegrationManifest[]>({
      type: 'manifest/list',
    })
  ).filter((m) =>
    ['device', 'hub', 'service', 'integration'].includes(
      m.integration_type ?? 'unknown',
    ),
  );

  manifests.sort((a, b) => a.name.localeCompare(b.name));

  return [
    {
      name: 'integration',
      selector: {
        select: {
          options: manifests.map((integration) => ({
            value: integration.domain,
            label: integration.name,
          })),
          mode: 'dropdown' as const,
        },
      },
      required: true,
      label: 'Integration',
    },
    CONTENT_SCHEMA,
    layoutSchema(integration),
    featuresSchema(integration),
    SORT_SCHEMA,
    INTERACTIONS_SCHEMA,
  ];
};

/**
 * Generates the schema for the device card's configuration form
 * Creates a complete configuration schema with device-specific options
 * including entity selection and entity picture features
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The current configuration
 * @returns {HaFormSchema[]} The complete schema array for the device card configuration
 */
export const getDeviceSchema = (
  hass: HomeAssistant,
  config: Config,
): HaFormSchema[] => {
  // Get entities for the device (if device_id is available)
  let entities: string[] = [];
  if (config.device_id) {
    entities = getDeviceEntities(hass, config, config.device_id).map(
      (e) => e.entity_id,
    );
  }

  return [
    {
      name: 'device_id',
      selector: {
        device: {},
      },
      required: false,
      label: `Device`,
    },
    {
      name: 'entity_id',
      required: false,
      label: 'Entity (alternative to device selection or for display state)',
      selector: {
        entity: {
          multiple: false,
        },
      },
    },
    CONTENT_SCHEMA,
    featuresSchema(undefined, entities),
    SORT_SCHEMA,
    INTERACTIONS_SCHEMA,
  ];
};
