import { DeviceCardEditor } from '@/cards/editor';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('editor.ts', () => {
    let card: DeviceCardEditor;
    let hass: HomeAssistant;
    let dispatchStub: sinon.SinonStub;

    beforeEach(async () => {
      // Create mock HomeAssistant instance
      hass = {
        states: {},
        areas: {},
        entities: {},
        devices: {},
      } as HomeAssistant;
      card = new DeviceCardEditor();
      dispatchStub = stub(card, 'dispatchEvent');

      card.hass = hass;
    });

    afterEach(() => {
      dispatchStub.restore();
    });

    describe('initialization', () => {
      it('should be defined', () => {
        expect(card).to.be.instanceOf(DeviceCardEditor);
      });

      it('should have default properties', () => {
        expect(card.hass).to.exist;
        expect(card['_config']).to.be.undefined;
      });
    });

    describe('setConfig', () => {
      it('should set the configuration correctly', () => {
        const testConfig: Config = {
          device_id: 'device_1',
          title: 'My PetKit Device',
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
          device_id: 'device_1',
        };
        card.setConfig(testConfig);

        const el = await fixture(card.render() as TemplateResult);
        expect(el.outerHTML).to.equal('<ha-form></ha-form>');
      });

      it('should pass correct props to ha-form', async () => {
        const testConfig: Config = {
          device_id: 'device_1',
          title: 'My PetKit Device',
        };
        card.setConfig(testConfig);

        const el = await fixture(card.render() as TemplateResult);
        expect((el as any).hass).to.deep.equal(hass);
        expect((el as any).data).to.deep.equal(testConfig);
        expect((el as any).schema).to.deep.equal([
          {
            name: 'device_id',
            selector: {
              device: {},
            },
            required: true,
            label: `Device`,
          },
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
                type: 'number',
              },
            },
          },
          {
            name: 'features',
            label: 'Features',
            required: false,
            selector: {
              select: {
                multiple: true,
                mode: 'list',
                options: [
                  {
                    label: 'Use Entity Picture',
                    value: 'entity_picture',
                  },
                ],
              },
            },
          },
        ]);
      });
    });

    describe('form behavior', () => {
      it('should compute labels correctly', async () => {
        const testConfig: Config = {
          device_id: 'device_1',
          title: 'My PetKit Device',
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
          device_id: 'device_1',
          title: 'My PetKit Device',
        };
        card.setConfig(testConfig);

        // Simulate value-changed event
        const detail = {
          value: {
            device_id: 'device_1',
            title: 'Updated PetKit Device',
            preview_count: 5,
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        // Verify event was dispatched with correct data
        expect(dispatchStub.calledOnce).to.be.true;
        expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
        expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
          device_id: 'device_1',
          title: 'Updated PetKit Device',
          preview_count: 5,
        });
      });

      it('should handle config with only device_id', () => {
        const testConfig: Config = {
          device_id: 'device_1',
        };
        card.setConfig(testConfig);

        // Simulate value-changed event with minimal config
        const detail = {
          value: {
            device_id: 'device_1',
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        // Verify event was dispatched correctly
        expect(dispatchStub.calledOnce).to.be.true;
        expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
        expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
          device_id: 'device_1',
        });
      });

      it('should remove features property when features array is empty', () => {
        const testConfig: Config = {
          device_id: 'device_1',
          features: [],
        };
        card.setConfig(testConfig);

        // Simulate value-changed event with empty features
        const detail = {
          value: {
            device_id: 'device_2',
            features: [],
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        // Verify event was dispatched with features property removed
        expect(dispatchStub.calledOnce).to.be.true;
        expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
        expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
          device_id: 'device_2',
        });
        expect(dispatchStub.firstCall.args[0].detail.config.features).to.be
          .undefined;
      });
    });
  });
};
