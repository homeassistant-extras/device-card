import type { DeviceRegistryEntry } from '@hass/data/device_registry';
import type { HomeAssistant } from '@hass/types';
import { IntegrationCardEditor } from '@integration/editor';
import type { Config } from '@integration/types';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('editor.ts', () => {
    let card: IntegrationCardEditor;
    let hass: HomeAssistant;
    let dispatchStub: sinon.SinonStub;

    beforeEach(async () => {
      // Create mock HomeAssistant instance
      hass = {
        states: {},
        areas: {},
        entities: {},
        devices: {
          device_1: {
            identifiers: [['device_one']],
          } as any as DeviceRegistryEntry,
        },
      } as HomeAssistant;
      card = new IntegrationCardEditor();
      dispatchStub = stub(card, 'dispatchEvent');

      card.hass = hass;
    });

    afterEach(() => {
      dispatchStub.restore();
    });

    describe('initialization', () => {
      it('should be defined', () => {
        expect(card).to.be.instanceOf(IntegrationCardEditor);
      });

      it('should have default properties', () => {
        expect(card.hass).to.exist;
        expect(card['_config']).to.be.undefined;
      });
    });

    describe('setConfig', () => {
      it('should set the configuration correctly', () => {
        const testConfig: Config = {
          integration: 'device_1',
          title: 'My Device',
          preview_count: 5,
        };

        card.setConfig(testConfig);
        expect(card['_config']).to.deep.equal(testConfig);
      });
    });

    describe('render', () => {
      it('should return nothing when hass is not set', async () => {
        card.hass = undefined as any;
        const result = card.render();
        expect(result).to.equal(nothing);
      });

      it('should return nothing when config is not set', async () => {
        const result = card.render();
        expect(result).to.equal(nothing);
      });

      it('should render ha-form when both hass and config are set', async () => {
        const testConfig: Config = {
          integration: 'device_1',
        };
        card.setConfig(testConfig);

        const el = await fixture(card.render() as TemplateResult);
        expect(el.outerHTML).to.equal('<ha-form></ha-form>');
      });

      it('should pass correct props to ha-form', async () => {
        const testConfig: Config = {
          integration: 'device_one',
          title: 'My Device',
        };
        card.setConfig(testConfig);

        const el = await fixture(card.render() as TemplateResult);
        expect((el as any).hass).to.deep.equal(hass);
        expect((el as any).data).to.deep.equal(testConfig);
        expect((el as any).schema).to.deep.equal([
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
                      integration: testConfig.integration,
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

    describe('form behavior', () => {
      it('should compute labels correctly', async () => {
        const testConfig: Config = {
          integration: 'device_1',
          title: 'My Device',
        };
        card.setConfig(testConfig);

        const el = await fixture(card.render() as TemplateResult);
        const computeLabelFn = (el as any).computeLabel;
        expect(computeLabelFn).to.be.a('function');

        // Test the compute label function
        const testSchema = { name: 'test', label: 'Test Label' };
        const result = computeLabelFn(testSchema);
        expect(result).to.equal('Test Label');
      });
    });

    describe('_valueChanged', () => {
      it('should fire config-changed event with the updated config', () => {
        const testConfig: Config = {
          integration: 'device_1',
          title: 'My Device',
        };
        card.setConfig(testConfig);

        // Simulate value-changed event
        const detail = {
          value: {
            integration: 'device_1',
            title: 'Updated Device',
            preview_count: 5,
            exclude_sections: ['controls', 'diagnostics'],
            exclude_entities: ['sensor.test_sensor'],
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        // Verify event was dispatched with correct data
        expect(dispatchStub.calledOnce).to.be.true;
        expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
        expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
          integration: 'device_1',
          title: 'Updated Device',
          preview_count: 5,
          exclude_sections: ['controls', 'diagnostics'],
          exclude_entities: ['sensor.test_sensor'],
        });
      });

      it('should handle config with only integration', () => {
        const testConfig: Config = {
          integration: 'device_1',
        };
        card.setConfig(testConfig);

        // Simulate value-changed event with minimal config
        const detail = {
          value: {
            integration: 'device_1',
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        // Verify event was dispatched correctly
        expect(dispatchStub.calledOnce).to.be.true;
        expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
        expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
          integration: 'device_1',
        });
      });

      it('should remove array properties when array is empty', () => {
        const testConfig: Config = {
          integration: 'device_1',
          features: [],
          exclude_entities: [],
          exclude_sections: [],
          section_order: [],
        };
        card.setConfig(testConfig);

        // Simulate value-changed event with empty arrays
        const detail = {
          value: {
            integration: 'device_2',
            features: [],
            exclude_entities: [],
            exclude_sections: [],
            section_order: [],
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        // Verify event was dispatched with features property removed
        expect(dispatchStub.calledOnce).to.be.true;
        expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
        expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
          integration: 'device_2',
        });
        expect(dispatchStub.firstCall.args[0].detail.config.features).to.be
          .undefined;
        expect(dispatchStub.firstCall.args[0].detail.config.exclude_entities).to
          .be.undefined;
        expect(dispatchStub.firstCall.args[0].detail.config.exclude_sections).to
          .be.undefined;
        expect(dispatchStub.firstCall.args[0].detail.config.section_order).to.be
          .undefined;
      });
    });
  });
};
