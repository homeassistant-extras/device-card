import * as isIntegrationModule from '@delegates/utils/is-integration';
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
    let callWSStub: sinon.SinonStub;

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
        callWS: async () => [],
      } as any as HomeAssistant;

      // Stub the callWS method
      callWSStub = stub(mockHass, 'callWS');
      callWSStub.resolves([]);
    });

    afterEach(() => {
      isInIntegrationStub.restore();
      callWSStub.restore();
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
    });

    describe('hass property setter', () => {
      beforeEach(() => {
        // Configure the stub to return config entries
        const configEntries = [
          { entry_id: 'entry_1', domain: 'zwave_js' },
          { entry_id: 'entry_2', domain: 'zwave_js' },
        ];
        callWSStub.resolves(configEntries);

        // Configure isInIntegration to return true for specific devices with the right config entries
        isInIntegrationStub
          .withArgs(mockHass.devices.device_1, ['entry_1', 'entry_2'])
          .returns(true);
        isInIntegrationStub
          .withArgs(mockHass.devices.device_2, ['entry_1', 'entry_2'])
          .returns(true);
      });

      it('should call the config_entries/get WebSocket API', async () => {
        // Set config for the card
        card.setConfig({ integration: 'zwave_js' });

        // Set hass property
        card.hass = mockHass;

        // Wait for the promise to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Verify callWS was called with the correct parameters
        expect(callWSStub.calledOnce).to.be.true;
        expect(callWSStub.firstCall.args[0]).to.deep.equal({
          type: 'config_entries/get',
          domain: 'zwave_js',
        });
      });

      it('should update integration data with devices from config entries', async () => {
        // Set config to filter for zwave_js devices
        card.setConfig({ integration: 'zwave_js' });

        // Set hass property
        card.hass = mockHass;

        // Wait for the promise to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Check integration data
        const integrationData = card['_integration'];
        expect(integrationData.name).to.equal('Zwave Js');
        expect(integrationData.devices).to.have.length(2);
        expect(integrationData.devices).to.include('device_1');
        expect(integrationData.devices).to.include('device_2');
        expect(integrationData.devices).to.not.include('device_3');
      });

      it('should exclude devices specified in exclude_devices', async () => {
        // Set config with excluded devices
        card.setConfig({
          integration: 'zwave_js',
          exclude_devices: ['device_1'],
        });

        // Set hass property
        card.hass = mockHass;

        // Wait for the promise to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Check that device_1 is excluded
        const integrationData = card['_integration'];
        expect(integrationData.devices).to.have.length(1);
        expect(integrationData.devices).to.include('device_2');
        expect(integrationData.devices).to.not.include('device_1');
      });

      it('should not update integration data if nothing changed', async () => {
        // Initial setup
        card.setConfig({ integration: 'zwave_js' });
        card.hass = mockHass;

        // Wait for the promise to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        const originalIntegration = card['_integration'];

        // Set same hass object again
        callWSStub.resetHistory();
        card.hass = mockHass;

        // Wait for the promise to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Should be the same object reference (not recreated)
        expect(card['_integration']).to.equal(originalIntegration);
      });

      it('should handle case when integration is not set', async () => {
        // Set config without integration
        card.setConfig({} as Config);

        // Set hass property
        card.hass = mockHass;

        // Verify callWS was not called
        expect(callWSStub.called).to.be.false;
      });
    });

    describe('rendering', () => {
      beforeEach(async () => {
        // Set up integration data for rendering tests
        card['_integration'] = {
          name: 'Zwave Js',
          devices: ['device_1', 'device_2'],
        };

        // Configure the card
        card.setConfig({ integration: 'zwave_js' });
      });

      it('should render a message when no devices are found', async () => {
        // Set empty integration data
        card['_integration'] = {
          name: 'Zwave Js',
          devices: [],
        };

        const el = await fixture(card.render() as TemplateResult);

        expect(el.querySelector('.no-devices')).to.exist;
        expect(el.textContent).to.include('No devices found for integration');
        expect(el.textContent).to.include('zwave_js');
      });

      it('should render one device card in preview mode', async () => {
        // Set preview mode to true
        Object.defineProperty(card, 'isPreview', {
          get: () => true,
        });

        const el = await fixture(card.render() as TemplateResult);

        // In preview mode, should only show one device card
        const deviceCards = el.querySelectorAll('device-card');
        expect(deviceCards).to.have.lengthOf(1);
      });

      it('should render all device cards when not in preview mode', async () => {
        const el = await fixture(card.render() as TemplateResult);

        // Should show all device cards
        const deviceCards = el.querySelectorAll('device-card');
        expect(deviceCards).to.have.lengthOf(2);
      });

      it('should use grid styles based on columns configuration', async () => {
        // Set columns config
        card.setConfig({
          integration: 'zwave_js',
          columns: 3,
        });
        const el = await fixture(card.render() as TemplateResult);

        // Check the grid style
        const container = el.querySelector('.devices-container');
        expect(container).to.exist;
        expect(container?.getAttribute('style')).to.include(
          'grid-template-columns:repeat(3, 1fr)',
        );
      });

      it('should not apply grid styles when columns is not set', async () => {
        const el = await fixture(card.render() as TemplateResult);

        // Check the grid style
        const container = el.querySelector('.devices-container');
        expect(container).to.exist;
        expect(container?.getAttribute('style')).to.equal('');
      });

      it('should ignore invalid columns values', async () => {
        // Test with negative columns
        card.setConfig({
          integration: 'zwave_js',
          columns: -2,
        });

        let el = await fixture(card.render() as TemplateResult);
        let container = el.querySelector('.devices-container');
        expect(container?.getAttribute('style')).to.equal('');

        // Test with zero columns
        card.setConfig({
          integration: 'zwave_js',
          columns: 0,
        });

        el = await fixture(card.render() as TemplateResult);
        container = el.querySelector('.devices-container');
        expect(container?.getAttribute('style')).to.equal('');

        // Test with non-integer columns
        card.setConfig({
          integration: 'zwave_js',
          columns: 2.5,
        });

        el = await fixture(card.render() as TemplateResult);
        container = el.querySelector('.devices-container');
        expect(container?.getAttribute('style')).to.equal('');
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
