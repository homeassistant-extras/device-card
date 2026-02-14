import * as integrationSchemaModule from '@delegates/utils/editor-schema';
import type { HomeAssistant } from '@hass/types';
import { IntegrationCardEditor } from '@integration/editor';
import type { Config } from '@integration/types';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('editor.ts', () => {
  let card: IntegrationCardEditor;
  let hass: HomeAssistant;
  let dispatchStub: sinon.SinonStub;
  let getIntegrationSchemaStub: sinon.SinonStub;
  let mockSchema: any[];

  beforeEach(async () => {
    // Create mock schema
    mockSchema = [
      {
        name: 'integration',
        selector: {
          select: {
            options: [
              { value: 'zwave_js', label: 'Z-Wave JS' },
              { value: 'mqtt', label: 'MQTT' },
            ],
            mode: 'dropdown',
          },
        },
        required: true,
        label: 'Integration',
      },
      {
        name: 'content',
        label: 'Content',
        type: 'expandable',
        schema: [],
      },
    ];

    // Create mock HomeAssistant instance
    hass = {
      callWS: async () => [],
    } as any as HomeAssistant;

    // Create component instance
    card = new IntegrationCardEditor();

    // Stub the dispatch event method
    dispatchStub = stub(card, 'dispatchEvent');

    // Stub the getIntegrationSchema function
    getIntegrationSchemaStub = stub(
      integrationSchemaModule,
      'getIntegrationSchema',
    );
    getIntegrationSchemaStub.resolves(mockSchema);

    // Set hass and config
    card.hass = hass;
    card.setConfig({ integration: 'zwave_js' });
  });

  afterEach(() => {
    dispatchStub.restore();
    getIntegrationSchemaStub.restore();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(card).to.be.instanceOf(IntegrationCardEditor);
    });

    it('should have default properties', () => {
      expect(card.hass).to.exist;
      expect(card['_config']).to.deep.equal({ integration: 'zwave_js' });
    });
  });

  describe('setConfig', () => {
    it('should set the configuration correctly', () => {
      const testConfig: Config = {
        integration: 'mqtt',
        title: 'MQTT Devices',
      };

      card.setConfig(testConfig);
      expect(card['_config']).to.deep.equal(testConfig);
    });
  });

  describe('render', () => {
    it('should return nothing when hass is not set', () => {
      card.hass = undefined as any;
      const result = card.render();
      expect(result).to.equal(nothing);
    });

    it('should return nothing when config is not set', () => {
      card['_config'] = undefined as any;
      const result = card.render();
      expect(result).to.equal(nothing);
    });

    it('should render task with the correct states', async () => {
      // Mock the task render function to test different states
      const taskRenderStub = stub(card['_getIntegrationsTask'], 'render');

      // Test render
      card.render();

      // Verify task.render was called with the correct handlers
      expect(taskRenderStub.calledOnce).to.be.true;
      const handlers = taskRenderStub.firstCall.args[0];

      // Test initial state
      // @ts-ignore
      expect(handlers.initial()).to.equal(nothing);

      // Test pending state
      // @ts-ignore
      expect(handlers.pending()).to.equal(nothing);

      // Test error state
      const error = new Error('Test error');
      // @ts-ignore
      const errorResult = handlers.error(error) as TemplateResult;
      expect(errorResult.values).to.deep.equal([error]);

      // Test complete state with schema
      const el = await fixture(
        // @ts-ignore
        handlers.complete(mockSchema) as TemplateResult,
      );
      expect(el.outerHTML).to.equal('<ha-form></ha-form>');

      // Restore stub
      taskRenderStub.restore();
    });
  });

  describe('_valueChanged', () => {
    it('should fire config-changed event with the updated config', () => {
      // Simulate value-changed event
      const detail = {
        value: {
          integration: 'mqtt',
          title: 'MQTT Devices',
          preview_count: 5,
          exclude_sections: ['diagnostics'],
          features: ['compact'],
        },
      };

      const event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      // Verify event was dispatched with correct data
      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        integration: 'mqtt',
        title: 'MQTT Devices',
        preview_count: 5,
        exclude_sections: ['diagnostics'],
        features: ['compact'],
      });
    });

    it('should remove empty arrays from config', () => {
      // Simulate value-changed event with empty arrays
      const detail = {
        value: {
          integration: 'mqtt',
          features: [],
          exclude_entities: [],
          exclude_sections: [],
          section_order: [],
          exclude_devices: [],
        },
      };

      const event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      // Verify event was dispatched with properties removed
      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        integration: 'mqtt',
      });
    });

    it('should remove columns property if zero or negative', () => {
      // Test with zero columns
      let detail = {
        value: {
          integration: 'mqtt',
          columns: 0,
        },
      };

      let event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        integration: 'mqtt',
      });

      // Reset stub
      dispatchStub.reset();

      // Test with negative columns
      detail = {
        value: {
          integration: 'mqtt',
          columns: -2,
        },
      };

      event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        integration: 'mqtt',
      });
    });

    it('should keep valid columns value', () => {
      const detail = {
        value: {
          integration: 'mqtt',
          columns: 3,
        },
      };

      const event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        integration: 'mqtt',
        columns: 3,
      });
    });

    describe('include_devices / exclude_devices (string template vs array)', () => {
      it('should keep non-empty template string', () => {
        const detail = {
          value: {
            integration: 'mqtt',
            include_devices: '{{ state_attr("device.id", "device_id") }}',
            exclude_devices: '{{ expand(integration_entities("zwave_js")) }}',
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        const config = dispatchStub.firstCall.args[0].detail.config;
        expect(config.include_devices).to.equal(
          '{{ state_attr("device.id", "device_id") }}',
        );
        expect(config.exclude_devices).to.equal(
          '{{ expand(integration_entities("zwave_js")) }}',
        );
      });

      it('should delete empty template string', () => {
        const detail = {
          value: {
            integration: 'mqtt',
            include_devices: '',
            exclude_devices: '',
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        const config = dispatchStub.firstCall.args[0].detail.config;
        expect(config).to.not.have.property('include_devices');
        expect(config).to.not.have.property('exclude_devices');
      });

      it('should delete whitespace-only template string', () => {
        const detail = {
          value: {
            integration: 'mqtt',
            include_devices: '   \n\t  ',
            exclude_devices: '   \n\t  ',
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        const config = dispatchStub.firstCall.args[0].detail.config;
        expect(config).to.not.have.property('include_devices');
        expect(config).to.not.have.property('exclude_devices');
      });

      it('should delete empty array', () => {
        const detail = {
          value: {
            integration: 'mqtt',
            include_devices: [],
            exclude_devices: [],
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        const config = dispatchStub.firstCall.args[0].detail.config;
        expect(config).to.not.have.property('include_devices');
        expect(config).to.not.have.property('exclude_devices');
      });

      it('should keep non-empty array', () => {
        const detail = {
          value: {
            integration: 'mqtt',
            include_devices: ['device_1', 'device_2'],
            exclude_devices: ['device_3', 'device_4'],
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        const config = dispatchStub.firstCall.args[0].detail.config;
        expect(config.include_devices).to.deep.equal(['device_1', 'device_2']);
        expect(config.exclude_devices).to.deep.equal(['device_3', 'device_4']);
      });
    });
  });
});
