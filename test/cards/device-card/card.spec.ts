import * as deviceSectionHelpers from '@/helpers/device-section';
import * as deviceUtils from '@delegates/utils/get-device';
import * as problemUtils from '@delegates/utils/has-problem';
import { DeviceCard } from '@device/card';
import { styles } from '@device/styles';
import type { HomeAssistant } from '@hass/types';
import * as pictureModule from '@html/picture';
import * as pinnedEntityModule from '@html/pinned-entity';
import { fixture } from '@open-wc/testing-helpers';
import type { Device, Features } from '@type/config';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('card.ts', () => {
  let card: DeviceCard;
  let mockHass: HomeAssistant;
  let mockUnit: Device;
  let hasProblemStub: sinon.SinonStub;
  let getDeviceStub: sinon.SinonStub;
  let getOrderedSectionsStub: sinon.SinonStub;
  let pinnedEntityStub: sinon.SinonStub;

  beforeEach(() => {
    hasProblemStub = stub(problemUtils, 'hasProblem');
    getDeviceStub = stub(deviceUtils, 'getDevice');
    getOrderedSectionsStub = stub(deviceSectionHelpers, 'getOrderedSections');
    pinnedEntityStub = stub(pinnedEntityModule, 'pinnedEntity');

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
      states: {
        'sensor.test_progress': {
          entity_id: 'sensor.test_progress',
          state: '75.5',
          attributes: {
            unit_of_measurement: '%',
          },
        },
      },
    } as any;

    // Create mock device
    mockUnit = {
      name: 'Device',
      model: 'Feeder Plus Pro',
      sensors: [
        {
          name: 'Battery',
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
          name: 'Power',
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
          name: 'Diagnostic',
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
          name: 'Config',
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
    getOrderedSectionsStub.returns([
      {
        key: 'controls',
        name: 'Controls',
        entities: mockUnit.controls,
      },
    ]);
    pinnedEntityStub.returns(
      html`<div class="pinned-entity-state">75.5%</div>`,
    );

    card.setConfig({ device_id: 'device_1' });
    card.hass = mockHass;
  });

  afterEach(() => {
    hasProblemStub.restore();
    getDeviceStub.restore();
    getOrderedSectionsStub.restore();
    pinnedEntityStub.restore();
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

    it('should initialize internal collapsed state from config', () => {
      expect((card as any).collapse).to.be.false;

      card.setConfig({
        device_id: 'device_1',
        features: ['collapse'],
      });

      expect((card as any).collapse).to.be.true;
    });
  });

  describe('hass property setter', () => {
    it('should call getDevice with hass and config', () => {
      card.hass = mockHass;
      expect(getDeviceStub.calledWith(mockHass, card['_config'])).to.be.true;
    });

    it('should update unit when getDevice returns a new value', () => {
      const newUnit = { ...mockUnit, name: 'Updated Device' };
      getDeviceStub.returns(newUnit);
      card.hass = mockHass;
      expect(card['_device']).to.equal(newUnit);
    });

    it('should not update unit if getDevice returns identical data', () => {
      // First call to set initial unit
      card.hass = mockHass;
      const originalUnit = card['_device'];

      // Second call should not update unit since it's identical
      card.hass = mockHass;
      expect(card['_device']).to.equal(originalUnit);
    });

    it('should not update unit if getDevice returns undefined', () => {
      // First set a valid unit
      card.hass = mockHass;
      const originalUnit = card['_device'];

      // Then test with undefined return value
      getDeviceStub.returns(undefined);
      card.hass = mockHass;
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
      const result = card.render();
      const el = await fixture(result as TemplateResult);
      expect(el.tagName.toLowerCase()).to.equal('ha-card');

      // not collapsed
      const header = el.querySelector('.card-header');
      expect(header).to.exist;
      expect(header?.classList.contains('collapsed')).to.be.false;
      expect(el.querySelector('device-card-section')).to.exist;
    });

    it('should add problem class when problem exists', async () => {
      hasProblemStub.returns(true);
      const el = await fixture(card.render() as TemplateResult);
      expect(el.classList.contains('problem')).to.be.true;
    });

    it('should not display header when both hide_title and hide_device_model are set', async () => {
      // Configure the card with both hide flags
      card.setConfig({
        device_id: 'device_1',
        features: ['hide_title', 'hide_device_model'],
      });

      const result = card.render();
      const el = await fixture(result as TemplateResult);

      // Header should not exist at all
      const headerElement = el.querySelector('.card-header');
      expect(headerElement).to.be.null;
      expect(el.querySelector('device-card-section')).to.exist;
    });

    it('should call getOrderedSections', async () => {
      const result = card.render();
      await fixture(result as TemplateResult);

      expect(getOrderedSectionsStub.calledOnce).to.be.true;
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

    it('should not render sections when collapsed', async () => {
      card.setConfig({
        device_id: 'device_1',
        features: ['collapse'],
      });

      // Render the card
      const el = await fixture(card.render() as TemplateResult);
      const header = el.querySelector('.card-header');

      // Check that getOrderedSections is not called
      expect(getOrderedSectionsStub.called).to.be.false;
      expect(header).to.exist;
      expect(header?.classList.contains('collapsed')).to.be.true;
    });

    it('should render entity state when entity_id is provided', async () => {
      // Set up the card with an entity_id
      const config = {
        device_id: 'device_1',
        entity_id: 'sensor.test_progress',
      };
      card.setConfig(config);

      // Render the card
      const element = await fixture(card.render() as TemplateResult);

      // Verify pinnedEntity was called with the right parameters
      expect(pinnedEntityStub.calledOnce).to.be.true;
      expect(pinnedEntityStub.calledWith(mockHass, config)).to.be.true;

      // Verify the pinned entity state was rendered in the card
      const stateElement = element.querySelector('.pinned-entity-state');
      expect(stateElement).to.exist;
      expect(stateElement?.textContent).to.equal('75.5%');
    });

    it('should still render entity state when header is hidden', async () => {
      // Set up the card with an entity_id and hide_title + hide_device_model features
      const config = {
        device_id: 'device_1',
        entity_id: 'sensor.test_progress',
        features: ['hide_title', 'hide_device_model'] as Features[],
      };
      card.setConfig(config);

      // Render the card
      const element = await fixture(card.render() as TemplateResult);

      // Verify pinnedEntity was called
      expect(pinnedEntityStub.calledOnce).to.be.true;

      // Verify entity state is shown in entity-state-only container
      const stateElement = element.querySelector('.pinned-entity-state');
      expect(stateElement).to.exist;
      expect(stateElement?.textContent).to.equal('75.5%');
    });

    it('should hide entity state when hide_entity_state feature is enabled', async () => {
      // Set up the card with an entity_id and hide_entity_state feature
      const config = {
        device_id: 'device_1',
        entity_id: 'sensor.test_progress',
        features: ['hide_entity_state'] as Features[],
      };
      card.setConfig(config);

      // Mock pinnedEntity to return nothing (as it would with hide_entity_state)
      pinnedEntityStub.returns(nothing);

      // Render the card
      const element = await fixture(card.render() as TemplateResult);

      // Verify pinnedEntity was called
      expect(pinnedEntityStub.calledOnce).to.be.true;
      expect(pinnedEntityStub.calledWith(mockHass, config)).to.be.true;

      // Verify the pinned entity state was NOT rendered in the card
      const stateElement = element.querySelector('.pinned-entity-state');
      expect(stateElement).to.not.exist;
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
