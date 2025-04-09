import * as deviceUtils from '@delegates/utils/get-device';
import * as problemUtils from '@delegates/utils/has-problem';
import { DeviceCard } from '@device/card';
import { styles } from '@device/styles';
import type { HomeAssistant } from '@hass/types';
import * as sectionRenderer from '@html/device-section';
import * as pictureModule from '@html/picture';
import { fixture } from '@open-wc/testing-helpers';
import type { Device } from '@type/config';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { version } from '../../../package.json';

export default () => {
  describe('card.ts', () => {
    let card: DeviceCard;
    let mockHass: HomeAssistant;
    let mockUnit: Device;
    let consoleInfoStub: sinon.SinonStub;
    let hasProblemStub: sinon.SinonStub;
    let getDeviceStub: sinon.SinonStub;
    let renderSectionsStub: sinon.SinonStub;

    beforeEach(() => {
      consoleInfoStub = stub(console, 'info');
      hasProblemStub = stub(problemUtils, 'hasProblem');
      getDeviceStub = stub(deviceUtils, 'getDevice');
      renderSectionsStub = stub(sectionRenderer, 'renderSections');

      card = new DeviceCard();
      mockHass = {
        devices: {
          device_1: {
            id: 'device_1',
            name: 'Device',
            model: 'Feeder',
            model_id: 'Plus Pro',
          },
        },
      } as any as HomeAssistant;

      // Create mock device
      mockUnit = {
        name: 'Device',
        model: 'Feeder Plus Pro',
        sensors: [
          {
            entity_id: 'sensor.petkit_battery',
            category: undefined,
            translation_key: undefined,
            state: '75',
            attributes: { device_class: 'battery' },
            isActive: false,
            isProblemEntity: false,
          },
        ],
        controls: [
          {
            entity_id: 'switch.petkit_power',
            category: undefined,
            translation_key: undefined,
            state: 'on',
            attributes: {},
            isActive: false,
            isProblemEntity: false,
          },
        ],
        diagnostics: [
          {
            entity_id: 'sensor.petkit_diagnostic',
            category: 'diagnostic',
            translation_key: undefined,
            state: 'ok',
            attributes: {},
            isActive: false,
            isProblemEntity: false,
          },
        ],
        configurations: [
          {
            entity_id: 'text.petkit_config',
            category: 'config',
            translation_key: undefined,
            state: 'default',
            attributes: {},
            isActive: false,
            isProblemEntity: false,
          },
        ],
      };

      // Configure stubs
      hasProblemStub.returns(false);
      getDeviceStub.returns(mockUnit);
      renderSectionsStub.returns(html`<div class="section">Mock Section</div>`);

      card.setConfig({ device_id: 'device_1' });
      card.hass = mockHass as HomeAssistant;
    });

    afterEach(() => {
      consoleInfoStub.restore();
      hasProblemStub.restore();
      getDeviceStub.restore();
      renderSectionsStub.restore();
    });

    describe('constructor', () => {
      it('should log the version with proper formatting', () => {
        // Assert that console.info was called once
        expect(consoleInfoStub.calledOnce).to.be.true;

        // Assert that it was called with the expected arguments
        expect(
          consoleInfoStub.calledWithExactly(
            `%c🐱 Poat's Tools: device-card-card - ${version}`,
            'color: #CFC493;',
          ),
        ).to.be.true;
      });
    });

    describe('setConfig', () => {
      it('should set the configuration', () => {
        const config = { device_id: 'device_2' };
        card.setConfig(config);
        expect(card['_config']).to.equal(config);
      });

      it('should not update config if identical', () => {
        const config = { device_id: 'device_1' };
        const originalConfig = card['_config'];
        card.setConfig(config);
        expect(card['_config']).to.equal(originalConfig);
      });
    });

    describe('hass property setter', () => {
      it('should call getDevice with hass and config', () => {
        card.hass = mockHass as HomeAssistant;
        expect(getDeviceStub.calledWith(mockHass, card['_config'])).to.be.true;
      });

      it('should update unit when getDevice returns a new value', () => {
        const newUnit = { ...mockUnit, name: 'Updated Device' };
        getDeviceStub.returns(newUnit);
        card.hass = mockHass as HomeAssistant;
        expect(card['_device']).to.equal(newUnit);
      });

      it('should not update unit if getDevice returns identical data', () => {
        // First call to set initial unit
        card.hass = mockHass as HomeAssistant;
        const originalUnit = card['_device'];

        // Second call should not update unit since it's identical
        card.hass = mockHass as HomeAssistant;
        expect(card['_device']).to.equal(originalUnit);
      });

      it('should not update unit if getDevice returns undefined', () => {
        // First set a valid unit
        card.hass = mockHass as HomeAssistant;
        const originalUnit = card['_device'];

        // Then test with undefined return value
        getDeviceStub.returns(undefined);
        card.hass = mockHass as HomeAssistant;
        expect(card['_device']).to.equal(originalUnit);
      });
    });

    describe('styles', () => {
      it('should return expected styles', () => {
        const actual = DeviceCard.styles;
        expect(actual).to.deep.equal(styles);
      });
    });

    describe('rendering', () => {
      it('should render nothing if no unit exists', () => {
        (card as any)._device = undefined;
        const el = card.render();
        expect(el).to.equal(nothing);
      });

      it('should render ha-card with proper sections', async () => {
        const el = await fixture(card.render() as TemplateResult);
        expect(el.tagName.toLowerCase()).to.equal('ha-card');
        expect(el.querySelectorAll('.section')).to.have.length(1);
      });

      it('should add problem class when problem exists', async () => {
        hasProblemStub.returns(true);
        const el = await fixture(card.render() as TemplateResult);
        expect(el.classList.contains('problem')).to.be.true;
      });

      it('should use title from config if available', async () => {
        card.setConfig({ device_id: 'device_1', title: 'Custom Title' });
        const el = await fixture(card.render() as TemplateResult);
        const titleElement = el.querySelector('.title span');
        expect(titleElement?.textContent).to.equal('Custom Title');
      });

      it('should use device name if no title in config', async () => {
        const el = await fixture(card.render() as TemplateResult);
        const titleElement = el.querySelector('.title span');
        expect(titleElement?.textContent).to.equal('Device');
      });

      it('should display model information', async () => {
        const el = await fixture(card.render() as TemplateResult);
        const modelElement = el.querySelector('.model');
        expect(modelElement?.textContent).to.equal('Feeder Plus Pro');
      });

      it('should not display model information if hide_device_model set', async () => {
        // Configure the card with the hide_device_model feature
        card.setConfig({
          device_id: 'device_1',
          features: ['hide_device_model'],
        });

        const el = await fixture(card.render() as TemplateResult);
        const modelElement = el.querySelector('.model');
        expect(modelElement).to.be.null;
      });

      it('should call renderSections', () => {
        card.render();
        expect(renderSectionsStub.callCount).to.equal(1);
        expect(
          renderSectionsStub.calledWith(
            card,
            mockHass,
            card['_config'],
            card['_device'],
          ),
        ).to.be.true;
      });

      it('should render device when entity_picture feature is enabled', () => {
        // Setup mock for pet function
        const deviceStub = stub(pictureModule, 'picture');
        deviceStub.returns(html`<div class="mock-device">device</div>`);

        // Configure the card with the entity_picture feature
        card.setConfig({
          device_id: 'device_1',
          features: ['entity_picture'],
        });

        // Render the card
        const result = card.render();

        // Check that pet() was called with the correct unit
        expect(deviceStub.calledOnce).to.be.true;
        expect(deviceStub.calledWith(card['_device'])).to.be.true;

        // Check that the result of pet() was returned
        expect(result).to.not.equal(nothing);

        // Restore the stub
        deviceStub.restore();
      });
    });

    describe('getConfigElement()', () => {
      it('should return a device-card-editor element', () => {
        const element = DeviceCard.getConfigElement();
        expect(element).to.be.an('HTMLElement');
        expect(element.tagName.toLowerCase()).to.equal('device-card-editor');
      });

      it('should return a new element instance each time', () => {
        const element1 = DeviceCard.getConfigElement();
        const element2 = DeviceCard.getConfigElement();
        expect(element1).to.not.equal(element2);
      });
    });

    describe('getStubConfig()', () => {
      it('should return config with device id', async () => {
        const config = await DeviceCard.getStubConfig(mockHass);
        expect(config).to.be.an('object');
        expect(config).to.have.property('device_id');
        expect(config.device_id).to.equal('device_1');
      });
    });
  });
};
