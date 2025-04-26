import { getSchema } from '@delegates/utils/integration-schema';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('integration-schema.ts', () => {
    describe('getSchema', () => {
      let mockHass: HomeAssistant;
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
        const schema = await getSchema(mockHass, 'zwave_js');

        // Assert
        const options = schema[0]!.selector!.select.options;
        expect(options).to.have.lengthOf(5); // Should only include the valid ones
        expect(options.map((o) => o.value)).to.include.members([
          'valid_device',
          'valid_hub',
          'valid_service',
          'valid_integration',
          'no_type',
        ]);
        expect(options.map((o) => o.value)).to.not.include('invalid_type');
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
        const schema = await getSchema(mockHass, 'zwave_js');

        // Assert
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
        const schema = await getSchema(mockHass, integrationName);

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
                      integration: integrationName,
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
        ]);
      });
    });
  });
};
