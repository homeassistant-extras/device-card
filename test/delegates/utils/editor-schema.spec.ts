import * as cardEntitiesModule from '@delegates/utils/card-entities';
import {
  getDeviceSchema,
  getIntegrationSchema,
} from '@delegates/utils/editor-schema';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('editor-schema.ts', () => {
    let mockHass: HomeAssistant;

    describe('getIntegrationSchema', () => {
      let callWSStub: sinon.SinonStub;

      beforeEach(() => {
        // Create a mock HomeAssistant instance
        mockHass = {
          callWS: async () => [],
        } as unknown as HomeAssistant;

        // Create a stub for the callWS method
        callWSStub = stub(mockHass, 'callWS');
      });

      afterEach(() => {
        // Restore the stub
        callWSStub.restore();
      });

      it('should filter out integrations with non-approved integration_types', async () => {
        // Arrange
        const manifests = [
          {
            name: 'Valid Device',
            domain: 'valid_device',
            integration_type: 'device',
          },
          { name: 'Valid Hub', domain: 'valid_hub', integration_type: 'hub' },
          {
            name: 'Valid Service',
            domain: 'valid_service',
            integration_type: 'service',
          },
          {
            name: 'Valid Integration',
            domain: 'valid_integration',
            integration_type: 'integration',
          },
          { name: 'No Type', domain: 'no_type', integration_type: undefined },
          {
            name: 'Invalid Type',
            domain: 'invalid_type',
            integration_type: 'not_approved',
          },
        ];
        callWSStub.resolves(manifests);

        // Act
        const schema = await getIntegrationSchema(mockHass, 'zwave_js');

        // Assert
        // @ts-ignore
        const options = schema[0]!.selector.select.options;
        expect(options).to.have.lengthOf(5); // Should only include the valid ones
        expect(options.map((o: any) => o.value)).to.include.members([
          'valid_device',
          'valid_hub',
          'valid_service',
          'valid_integration',
          'no_type',
        ]);
        expect(options.map((o: any) => o.value)).to.not.include('invalid_type');
      });

      it('should sort integrations alphabetically by name', async () => {
        // Arrange
        const manifests = [
          {
            name: 'Z Integration',
            domain: 'z_domain',
            integration_type: 'device',
          },
          {
            name: 'A Integration',
            domain: 'a_domain',
            integration_type: 'device',
          },
          {
            name: 'M Integration',
            domain: 'm_domain',
            integration_type: 'device',
          },
        ];
        callWSStub.resolves(manifests);

        // Act
        const schema = await getIntegrationSchema(mockHass, 'zwave_js');

        // Assert
        // @ts-ignore
        const options = schema[0]!.selector!.select.options;
        expect(options[0]!.label).to.equal('A Integration');
        expect(options[1]!.label).to.equal('M Integration');
        expect(options[2]!.label).to.equal('Z Integration');
      });

      it('should return expected schema', async () => {
        // Arrange
        callWSStub.resolves([
          {
            name: 'Device One',
            domain: 'device_one',
            integration_type: 'device',
          },
        ]);
        const integrationName = 'test_integration';

        // Act
        const schema = await getIntegrationSchema(mockHass, integrationName);

        // Assert
        expect(schema).to.deep.equal([
          {
            name: 'integration',
            selector: {
              select: {
                options: [
                  {
                    value: 'device_one',
                    label: 'Device One',
                  },
                ],
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
          },
          {
            name: 'layout',
            label: 'Integration Layout',
            type: 'expandable',
            flatten: true,
            icon: 'mdi:view-grid-plus',
            schema: [
              {
                type: 'grid',
                name: '',
                schema: [
                  {
                    name: 'columns',
                    required: false,
                    label: 'Number of Columns',
                    selector: {
                      number: {
                        min: 1,
                        max: 6,
                        mode: 'box' as 'box',
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
                      integration: integrationName,
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
                      integration: integrationName,
                    },
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
                    filter: {
                      integration: 'test_integration',
                    },
                    include_entities: undefined,
                  },
                },
              },
            ],
          },
          {
            name: 'sort',
            label: 'Sort Options',
            type: 'expandable',
            flatten: false,
            icon: 'mdi:sort',
            schema: [
              {
                type: 'grid',
                name: '',
                label: 'Sort Options',
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
                        mode: 'dropdown' as 'dropdown',
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
                        mode: 'dropdown' as 'dropdown',
                      },
                    },
                  },
                ],
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
        ]);
      });
    });

    describe('getDeviceSchema', () => {
      let getDeviceEntitiesStub: sinon.SinonStub;

      beforeEach(async () => {
        // Stub the getDeviceEntities function
        getDeviceEntitiesStub = stub(cardEntitiesModule, 'getDeviceEntities');
        getDeviceEntitiesStub.returns([
          { entity_id: 'light.test_light' },
          { entity_id: 'sensor.test_sensor' },
          { entity_id: 'switch.test_switch' },
        ]);
      });

      it('should return expected schema', () => {
        // Act
        const schema = getDeviceSchema(mockHass, {
          device_id: 'device_1',
          title: 'My Device',
        });

        // Assert
        expect(schema).to.deep.equal([
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
                    filter: {
                      integration: undefined,
                    },
                    include_entities: [
                      'light.test_light',
                      'sensor.test_sensor',
                      'switch.test_switch',
                    ],
                  },
                },
              },
            ],
          },
          {
            name: 'sort',
            label: 'Sort Options',
            type: 'expandable',
            flatten: false,
            icon: 'mdi:sort',
            schema: [
              {
                type: 'grid',
                name: '',
                label: 'Sort Options',
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
                        mode: 'dropdown' as 'dropdown',
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
                        mode: 'dropdown' as 'dropdown',
                      },
                    },
                  },
                ],
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
        ]);
      });
    });
  });
};
