import type { Config } from '@device/types';
import type { HaFormSchema } from '@hass/components/ha-form/types';
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

const contentSchema = (integration?: string): HaFormSchema => {
  const schema = {
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
        name: 'columns',
        required: false,
        label: 'Number of Columns',
        selector: {
          number: {
            min: 1,
            max: 6,
            mode: 'slider' as 'slider',
          },
        },
      },
      {
        name: 'excluded_devices',
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

  if (!integration) {
    schema.schema = schema.schema.filter(
      (s) => !['excluded_devices', 'columns'].includes(s.name),
    );
  }

  return schema as HaFormSchema;
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
    (await hass.callWS({
      type: 'manifest/list',
    })) as { name: string; domain: string; integration_type: string }[]
  ).filter(
    (m) =>
      !m.integration_type ||
      ['device', 'hub', 'service', 'integration'].includes(m.integration_type),
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
          mode: 'dropdown' as 'dropdown',
        },
      },
      required: true,
      label: 'Integration',
    },
    contentSchema(integration),
    featuresSchema(integration),
    INTERACTIONS_SCHEMA,
  ];
};

/**
 * Generates the schema for the device card's configuration form
 * Creates a complete configuration schema with device-specific options
 * including entity selection and entity picture features
 *
 * @param {string[]} entityIds - Array of entity IDs associated with the device
 * @returns {HaFormSchema[]} The complete schema array for the device card configuration
 */
export const getDeviceSchema = (
  hass: HomeAssistant,
  config: Config,
): HaFormSchema[] => {
  const entities = getDeviceEntities(hass, config, config.device_id).map(
    (e) => e.entity_id,
  );
  return [
    {
      name: 'device_id',
      selector: {
        device: {},
      },
      required: true,
      label: `Device`,
    },
    contentSchema(),
    featuresSchema(undefined, entities),
    INTERACTIONS_SCHEMA,
  ];
};
