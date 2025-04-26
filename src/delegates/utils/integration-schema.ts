import type { HomeAssistant } from '@hass/types';

export const getSchema = async (hass: HomeAssistant, integration: string) => {
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
};
