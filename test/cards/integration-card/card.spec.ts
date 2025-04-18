import * as isIntegrationModule from '@delegates/utils/is-integration';
import type { DeviceRegistryEntry } from '@hass/data/device_registry';
import type { HomeAssistant } from '@hass/types';
import { IntegrationCard } from '@integration/card';
import type { Config } from '@integration/types';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('integration-card.ts', () => {
    let card: IntegrationCard;
    let mockHass: HomeAssistant;
    let isInIntegrationStub: sinon.SinonStub;

    beforeEach(() => {
      // Create the card instance
      card = new IntegrationCard();

      // Stub the isInIntegration function
      isInIntegrationStub = stub(isIntegrationModule, 'isInIntegration');
      isInIntegrationStub.returns(false); // Default to false

      // Mock Home Assistant instance
      mockHass = {
        devices: {
          device_1: {
            id: 'device_1',
            name: 'Device 1',
            identifiers: [['zwave_js', 'node_1']],
            manufacturer: 'Test',
            model: 'Model 1',
          },
          device_2: {
            id: 'device_2',
            name: 'Device 2',
            identifiers: [['zwave_js', 'node_2']],
            manufacturer: 'Test',
            model: 'Model 2',
          },
          device_3: {
            id: 'device_3',
            name: 'Device 3',
            identifiers: [['mqtt', 'node_3']],
            manufacturer: 'Other',
            model: 'Model 3',
          },
        },
        states: {},
        entities: {},
      } as any as HomeAssistant;

      // Configure the stub to mark specific devices as part of the integration
      isInIntegrationStub
        .withArgs(mockHass.devices.device_1, 'zwave_js')
        .returns(true);
      isInIntegrationStub
        .withArgs(mockHass.devices.device_2, 'zwave_js')
        .returns(true);
      isInIntegrationStub
        .withArgs(mockHass.devices.device_3, 'mqtt')
        .returns(true);
    });

    afterEach(() => {
      isInIntegrationStub.restore();
    });

    describe('initialization', () => {
      it('should be defined', () => {
        expect(card).to.be.instanceOf(IntegrationCard);
      });

      it('should have default properties', () => {
        expect(card['_config']).to.be.undefined;
        expect(card['_integration']).to.be.undefined;
        expect(card['_hass']).to.be.undefined;
      });
    });

    describe('setConfig', () => {
      it('should set the configuration correctly', () => {
        const testConfig: Config = {
          integration: 'zwave_js',
          title: 'Z-Wave Devices',
        };

        card.setConfig(testConfig);
        expect(card['_config']).to.deep.equal(testConfig);
      });

      it('should not update config if identical', () => {
        const testConfig: Config = {
          integration: 'zwave_js',
        };

        card.setConfig(testConfig);
        const originalConfig = card['_config'];

        card.setConfig(testConfig);
        expect(card['_config']).to.equal(originalConfig);
      });
    });

    describe('hass property setter', () => {
      it('should update integration data with correct devices', () => {
        // Set config to filter for zwave_js devices
        card.setConfig({ integration: 'zwave_js' });

        // Set hass property
        card.hass = mockHass;

        // Check integration data
        const integrationData = card['_integration'];
        expect(integrationData.name).to.equal('Zwave Js');
        expect(integrationData.devices).to.have.length(2);
        expect(integrationData.devices).to.include('device_1');
        expect(integrationData.devices).to.include('device_2');
        expect(integrationData.devices).to.not.include('device_3');
      });

      it('should update integration data when hass changes', () => {
        // Initial setup
        card.setConfig({ integration: 'zwave_js' });
        card.hass = mockHass;

        // Modify the mock data
        const updatedHass = { ...mockHass };

        // Add a new device
        updatedHass.devices = {
          ...mockHass.devices,
          device_4: {
            id: 'device_4',
            name: 'Device 4',
            identifiers: [['zwave_js', 'node_4']],
            manufacturer: 'Test',
            model: 'Model 4',
          } as any as DeviceRegistryEntry,
        };

        // Update stub to include the new device
        isInIntegrationStub
          .withArgs(updatedHass.devices.device_4, 'zwave_js')
          .returns(true);

        // Update hass
        card.hass = updatedHass as any as HomeAssistant;

        // Check integration data was updated
        const integrationData = card['_integration'];
        expect(integrationData.devices).to.have.length(3);
        expect(integrationData.devices).to.include('device_4');
      });

      it('should not update integration data if unchanged', () => {
        // Initial setup
        card.setConfig({ integration: 'zwave_js' });
        card.hass = mockHass;

        const originalIntegration = card['_integration'];

        // Set same hass object again
        card.hass = mockHass;

        // Should be the same object reference (not recreated)
        expect(card['_integration']).to.equal(originalIntegration);
      });
    });

    describe('rendering', () => {
      it('should render a message when no devices are found', async () => {
        // Config with integration that doesn't exist
        card.setConfig({ integration: 'non_existent' });
        card.hass = mockHass;

        const el = await fixture(card.render() as TemplateResult);

        expect(el.querySelector('.no-devices')).to.exist;
        expect(el.textContent).to.include('No devices found for integration');
        expect(el.textContent).to.include('non_existent');
      });

      it('should render one device card in preview mode', async () => {
        // Setup
        card.setConfig({ integration: 'zwave_js' });
        card.hass = mockHass;

        // Set preview mode to true
        Object.defineProperty(card, 'isPreview', {
          get: () => true,
        });

        const el = await fixture(card.render() as TemplateResult);

        // In preview mode, should only show one node-info component
        const nodeInfoElements = el.querySelectorAll('device-card');
        expect(nodeInfoElements).to.have.lengthOf(1);
      });

      it('should render all device cards when not in preview mode', async () => {
        // Setup
        card.setConfig({ integration: 'zwave_js' });
        card.hass = mockHass;

        const el = await fixture(card.render() as TemplateResult);

        // In preview mode, should only show one node-info component
        const nodeInfoElements = el.querySelectorAll('device-card');
        expect(nodeInfoElements).to.have.lengthOf(2);
      });

      it('should use config title when provided', async () => {
        // Setup with custom title
        card.setConfig({
          integration: 'zwave_js',
          title: 'My Custom Z-Wave Title',
        });
        card.hass = mockHass;

        const result = card.render() as TemplateResult;

        // Create a fixture to check the rendered HTML
        const el = await fixture(result);
        const titleEl = el.querySelector('.integration-title');

        expect(titleEl).to.exist;
        expect(titleEl?.textContent).to.equal('My Custom Z-Wave Title');
      });

      it('should use integration name when no title is provided', async () => {
        // Setup without custom title
        card.setConfig({ integration: 'zwave_js' });
        card.hass = mockHass;

        const result = card.render() as TemplateResult;

        // Create a fixture to check the rendered HTML
        const el = await fixture(result);
        const titleEl = el.querySelector('.integration-title');

        expect(titleEl).to.exist;
        expect(titleEl?.textContent).to.equal('Zwave Js');
      });

      it('should pass configuration to child device cards', async () => {
        // Setup with some extra config options that should be passed down
        const config = {
          integration: 'zwave_js',
          title: 'Z-Wave',
          preview_count: 2,
          features: ['hide_device_model'],
        } as Config;
        card.setConfig(config);
        card.hass = mockHass;

        const el = await fixture(card.render() as TemplateResult);

        const deviceElement = el.querySelector('device-card');
        expect(deviceElement).to.exist;
        expect((deviceElement as any).hass).to.equal(mockHass);
        expect((deviceElement as any).config).to.deep.equal({
          device_id: 'device_1',
          ...config,
        });
      });
    });

    describe('static methods', () => {
      it('getConfigElement should return an editor element', () => {
        const element = IntegrationCard.getConfigElement();
        expect(element).to.be.an('HTMLElement');
        expect(element.tagName.toLowerCase()).to.equal(
          'integration-card-editor',
        );
      });

      it('getStubConfig should return config with found integration', async () => {
        const config = await IntegrationCard.getStubConfig(mockHass);
        expect(config).to.be.an('object');
        expect(config).to.have.property('integration');
        // Should find one of the integrations in the mock data
        expect(['zwave_js', 'mqtt']).to.include(config.integration);
      });
    });
  });
};
