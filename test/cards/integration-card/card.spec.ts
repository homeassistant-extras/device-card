import * as integrationDevicesModule from '@delegates/integration-devices';
import * as wsTemplatesModule from '@hass/data/ws-templates';
import type { HomeAssistant } from '@hass/types';
import { IntegrationCard } from '@integration/card';
import type { Config } from '@integration/types';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('integration-card.ts', () => {
  let card: IntegrationCard;
  let mockHass: HomeAssistant;
  let computeIntegrationDevicesStub: sinon.SinonStub;
  let subscribeRenderTemplateStub: sinon.SinonStub;

  beforeEach(() => {
    card = new IntegrationCard();

    computeIntegrationDevicesStub = stub(
      integrationDevicesModule,
      'computeIntegrationDevices',
    );

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
      language: 'en',
      connection: {} as any,
      callWS: async () => [],
    } as any as HomeAssistant;

    subscribeRenderTemplateStub = stub(
      wsTemplatesModule,
      'subscribeRenderTemplate',
    );
  });

  afterEach(() => {
    computeIntegrationDevicesStub.restore();
    subscribeRenderTemplateStub.restore();
    if (card.parentNode) {
      card.parentNode.removeChild(card);
    }
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

  /** Simulate connection so _tryConnect runs and triggers _computeIntegration */
  function connectCard() {
    card.connectedCallback();
  }

  describe('hass property setter', () => {
    it('should call computeIntegrationDevices with integration domain when connected', async () => {
      computeIntegrationDevicesStub.resolves({
        name: 'Zwave Js',
        devices: ['device_1', 'device_2'],
      });

      card.setConfig({ integration: 'zwave_js' });
      card.hass = mockHass;
      connectCard();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(computeIntegrationDevicesStub.calledOnce).to.be.true;
      expect(computeIntegrationDevicesStub.firstCall.args[1]).to.deep.include({
        integration: 'zwave_js',
      });
    });

    it('should update integration data when computeIntegrationDevices resolves', async () => {
      computeIntegrationDevicesStub.resolves({
        name: 'Zwave Js',
        devices: ['device_1', 'device_2'],
      });

      card.setConfig({ integration: 'zwave_js' });
      card.hass = mockHass;
      connectCard();

      await new Promise((resolve) => setTimeout(resolve, 0));

      const integrationData = card['_integration'];
      expect(integrationData.name).to.equal('Zwave Js');
      expect(integrationData.devices).to.deep.equal(['device_1', 'device_2']);
    });

    [
      {
        name: 'include_devices',
        config: { integration: 'zwave_js', include_devices: ['device_1'] },
        expected: { includeDevices: ['device_1'] },
      },
      {
        name: 'exclude_devices',
        config: { integration: 'zwave_js', exclude_devices: ['device_1'] },
        expected: { excludeDevices: ['device_1'] },
      },
      {
        name: 'both include_devices and exclude_devices',
        config: {
          integration: 'zwave_js',
          include_devices: ['device_1', 'device_2'],
          exclude_devices: ['device_2'],
        },
        expected: {
          includeDevices: ['device_1', 'device_2'],
          excludeDevices: ['device_2'],
        },
      },
    ].forEach(({ name, config, expected }) => {
      it(`should pass ${name} to computeIntegrationDevices`, async () => {
        computeIntegrationDevicesStub.resolves({
          name: 'Zwave Js',
          devices: ['device_1'],
        });

        card.setConfig(config);
        card.hass = mockHass;
        connectCard();

        await new Promise((resolve) => setTimeout(resolve, 0));

        const params = computeIntegrationDevicesStub.firstCall.args[1];
        expect(params).to.deep.include(expected);
      });
    });

    it('should pass resolved exclude_devices from template to computeIntegrationDevices', async () => {
      let excludeCallback: (msg: { result: string[] }) => void;
      subscribeRenderTemplateStub.callsFake((_conn, cb) => {
        excludeCallback = cb;
        return Promise.resolve(() => {});
      });

      computeIntegrationDevicesStub.resolves({
        name: 'Zwave Js',
        devices: ['device_2'],
      });

      card.setConfig({
        integration: 'zwave_js',
        exclude_devices: '{{ ["device_1"] }}',
      });
      card.hass = mockHass;
      connectCard();

      await Promise.resolve();
      excludeCallback!({ result: ['device_1'] });
      await new Promise((resolve) => setTimeout(resolve, 0));

      const params = computeIntegrationDevicesStub.firstCall.args[1];
      expect(params.excludeDevices).to.deep.equal(['device_1']);
    });

    it('should only call computeIntegrationDevices once when connected', async () => {
      computeIntegrationDevicesStub.resolves({
        name: 'Zwave Js',
        devices: ['device_1', 'device_2'],
      });

      card.setConfig({ integration: 'zwave_js' });
      card.hass = mockHass;
      connectCard();

      await new Promise((resolve) => setTimeout(resolve, 0));
      card.hass = mockHass;
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(computeIntegrationDevicesStub.callCount).to.equal(1);
    });

    it('should not call computeIntegrationDevices when integration is not set', () => {
      card.setConfig({} as Config);
      card.hass = mockHass;
      connectCard();

      expect(computeIntegrationDevicesStub.called).to.be.false;
    });
  });

  describe('rendering', () => {
    beforeEach(async () => {
      card['_integration'] = {
        name: 'Zwave Js',
        devices: ['device_1', 'device_2'],
      };
      card.setConfig({ integration: 'zwave_js' });
      card.hass = mockHass;
    });

    // Test for hide_integration_title flag
    it('should hide the integration title when hide_integration_title is true', async () => {
      // Set up integration data
      card['_integration'] = {
        name: 'Zwave Js',
        devices: ['device_1', 'device_2'],
      };

      // Configure card with hide_integration_title flag
      card.setConfig({
        integration: 'zwave_js',
        hide_integration_title: true,
      });

      const el = await fixture(card.render() as TemplateResult);

      // Verify that the title element doesn't exist
      const titleElement = el.querySelector('.integration-title');
      expect(titleElement).to.be.null;
    });

    // Test for Loading message
    it('should render a loading message when integration is not yet loaded', async () => {
      // Set integration to undefined to simulate loading state
      (card as any)._integration = undefined;

      // Configure card
      card.setConfig({
        integration: 'zwave_js',
      });

      // Set hass property
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      expect(el.querySelector('.no-devices')).to.exist;
      expect(el.textContent).to.include('Loading...');
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
      expect(element.tagName.toLowerCase()).to.equal('integration-card-editor');
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
