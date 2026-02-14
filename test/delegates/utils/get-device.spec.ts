import * as deviceRetriever from '@delegates/retrievers/device';
import * as cardEntities from '@delegates/utils/card-entities';
import { getDevice } from '@delegates/utils/get-device';
import type { Config } from '@device/types';
import * as domainUtils from '@hass/common/entity/compute_domain';
import type { HomeAssistant } from '@hass/types';
import type { EntityInformation } from '@type/config';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('get-device.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let getDeviceStub: sinon.SinonStub;
  let getDeviceEntitiesStub: sinon.SinonStub;
  let computeDomainStub: sinon.SinonStub;

  beforeEach(() => {
    // Create stubs for imported functions
    getDeviceStub = stub(deviceRetriever, 'getDevice');
    getDeviceEntitiesStub = stub(cardEntities, 'getDeviceEntities');
    computeDomainStub = stub(domainUtils, 'computeDomain');

    // Set up mock Home Assistant instance
    mockHass = {
      states: {},
      devices: {
        device_1: {
          id: 'device_1',
          name: 'Device',
          model: 'Feeder',
          model_id: 'Plus Pro',
        },
      },
      entities: {},
    } as any as HomeAssistant;

    // Set up mock config
    mockConfig = {
      device_id: 'device_1',
    };

    // Configure stubs with default behavior
    getDeviceStub.returns(mockHass.devices.device_1);
    getDeviceEntitiesStub.returns([]);
    computeDomainStub.callsFake((entity_id) => entity_id.split('.')[0]!);
  });

  afterEach(() => {
    // Restore all stubs
    getDeviceStub.restore();
    getDeviceEntitiesStub.restore();
    computeDomainStub.restore();
  });

  it('should resolve device from entity property (auto-entities compatibility)', () => {
    mockHass.entities = {
      'sensor.th_outdoor': {
        entity_id: 'sensor.th_outdoor',
        device_id: 'device_1',
      },
    } as any;
    const configWithEntity = { entity: 'sensor.th_outdoor' } as Config;
    const result = getDevice(mockHass, configWithEntity);
    expect(result).to.not.be.undefined;
    expect(result?.name).to.equal('Device');
  });

  it('should return undefined if device not found', () => {
    getDeviceStub.returns(undefined);
    const result = getDevice(mockHass, mockConfig);
    expect(result).to.be.undefined;
  });

  it('should initialize unit with device name and model', () => {
    const result = getDevice(mockHass, mockConfig);
    expect(result).to.not.be.undefined;
    expect(result?.name).to.equal('Device');
    expect(result?.model).to.equal('Feeder Plus Pro');
  });

  it('should use default name if device name is missing', () => {
    getDeviceStub.returns({
      ...mockHass.devices.device_1,
      name: null,
    });

    const result = getDevice(mockHass, mockConfig);
    expect(result?.name).to.equal('Device');
  });

  it('should categorize entities correctly', () => {
    const mockEntities: EntityInformation[] = [
      {
        entity_id: 'sensor.petkit_battery',
        state: '75',
        attributes: { device_class: 'battery' },
        name: 'PetKit Battery',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'switch.petkit_power',
        state: 'on',
        attributes: {},
        name: 'PetKit Power',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'sensor.petkit_problem',
        state: 'off',
        attributes: { device_class: 'problem' },
        name: 'PetKit Problem',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'text.petkit_config',
        state: 'default',
        attributes: {},
        name: 'PetKit Config',
        category: 'config',
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'sensor.petkit_diagnostic',
        state: 'ok',
        attributes: {},
        name: 'PetKit Diagnostic',
        category: 'diagnostic',
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
    ];

    getDeviceEntitiesStub.returns(mockEntities);

    const result = getDevice(mockHass, mockConfig);

    expect(result?.sensors).to.have.length(2);
    expect(result?.controls).to.have.length(1);
    expect(result?.diagnostics).to.have.length(1);
    expect(result?.configurations).to.have.length(1);

    // Verify correct categorization
    expect(result?.sensors[0]!.entity_id).to.equal('sensor.petkit_battery');
    expect(result?.controls[0]!.entity_id).to.equal('switch.petkit_power');
    expect(result?.diagnostics[0]!.entity_id).to.equal(
      'sensor.petkit_diagnostic',
    );
    expect(result?.configurations[0]!.entity_id).to.equal('text.petkit_config');
  });

  it('should categorize control entities based on domain', () => {
    computeDomainStub.withArgs('text.control').returns('text');
    computeDomainStub.withArgs('button.control').returns('button');
    computeDomainStub.withArgs('switch.control').returns('switch');
    computeDomainStub.withArgs('select.control').returns('select');
    computeDomainStub.withArgs('sensor.data').returns('sensor');

    const mockEntities: EntityInformation[] = [
      {
        entity_id: 'text.control',
        state: 'some text',
        attributes: {},
        name: 'Text Control',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'button.control',
        state: 'idle',
        attributes: {},
        name: 'Button Control',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'switch.control',
        state: 'on',
        attributes: {},
        name: 'Switch Control',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'select.control',
        state: 'option1',
        attributes: {},
        name: 'Select Control',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'sensor.data',
        state: '42',
        attributes: {},
        name: 'Sensor Data',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
    ];

    getDeviceEntitiesStub.returns(mockEntities);

    const result = getDevice(mockHass, mockConfig);

    expect(result?.controls).to.have.length(4);
    expect(result?.sensors).to.have.length(1);

    // Verify control entities are correctly identified
    const controlIds = result?.controls.map((c) => c.entity_id);
    expect(controlIds).to.include('text.control');
    expect(controlIds).to.include('button.control');
    expect(controlIds).to.include('switch.control');
    expect(controlIds).to.include('select.control');
  });

  it('should exclude entities listed in exclude_entities config', () => {
    const mockEntities: EntityInformation[] = [
      {
        entity_id: 'sensor.petkit_battery',
        state: '75',
        attributes: { device_class: 'battery' },
        name: 'PetKit Battery',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'sensor.petkit_temperature',
        state: '22',
        attributes: { device_class: 'temperature' },
        name: 'PetKit Temperature',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
    ];

    getDeviceEntitiesStub.returns(mockEntities);

    // Reset section exclusions
    mockConfig.exclude_sections = [];

    // Configure to exclude one of the entities
    mockConfig.exclude_entities = ['sensor.petkit_temperature'];

    const result = getDevice(mockHass, mockConfig);

    // Should only have one sensor and it should be the battery, not the temperature
    expect(result?.sensors).to.have.length(1);
    expect(result?.sensors[0]!.entity_id).to.equal('sensor.petkit_battery');
  });

  it('should categorize sensor domains as sensors', () => {
    const sensorDomains = [
      'sensor',
      'binary_sensor',
      'calendar',
      'camera',
      'device_tracker',
      'image',
      'weather',
    ];

    const mockEntities: EntityInformation[] = sensorDomains.map((domain) => ({
      entity_id: `${domain}.test_entity`,
      state: 'test',
      attributes: {},
      name: `Test Entity ${domain}`,
      category: undefined,
      translation_key: undefined,
      isActive: false,
      isProblemEntity: false,
    }));

    getDeviceEntitiesStub.returns(mockEntities);

    const result = getDevice(mockHass, mockConfig);

    expect(result?.sensors).to.have.length(sensorDomains.length);
    expect(result?.controls).to.have.length(0);

    // Verify all sensor domains are categorized as sensors
    sensorDomains.forEach((domain) => {
      const entityId = `${domain}.test_entity`;
      const found = result?.sensors.find((s) => s.entity_id === entityId);
      expect(found).to.not.be.undefined;
    });
  });

  it('should categorize non-sensor domains as controls by default', () => {
    const controlDomains = [
      'text',
      'button',
      'number',
      'switch',
      'select',
      'input_text',
      'input_boolean',
      'input_number',
      'input_select',
      'input_datetime',
      'cover',
      'light',
      'climate',
      'fan',
      'vacuum',
      'media_player',
      'lock',
      'alarm_control_panel',
      'scene',
      'script',
      'automation',
      'timer',
      'counter',
      'input_datetime',
      'zone',
      'person',
      'group',
      'zone',
      'scene',
      'script',
      'automation',
      'timer',
      'counter',
      'input_datetime',
      'zone',
      'person',
      'group',
    ];

    const mockEntities: EntityInformation[] = controlDomains.map((domain) => ({
      entity_id: `${domain}.test_entity`,
      state: 'test',
      attributes: {},
      name: `Test Entity ${domain}`,
      category: undefined,
      translation_key: undefined,
      isActive: false,
      isProblemEntity: false,
    }));

    getDeviceEntitiesStub.returns(mockEntities);

    const result = getDevice(mockHass, mockConfig);

    expect(result?.controls).to.have.length(controlDomains.length);
    expect(result?.sensors).to.have.length(0);

    // Verify all control domains are categorized as controls
    controlDomains.forEach((domain) => {
      const entityId = `${domain}.test_entity`;
      const found = result?.controls.find((c) => c.entity_id === entityId);
      expect(found).to.not.be.undefined;
    });
  });

  it('should respect exclude_sections configuration', () => {
    const mockEntities: EntityInformation[] = [
      {
        entity_id: 'sensor.temperature',
        state: '22',
        attributes: {},
        name: 'Temperature',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'switch.living_room',
        state: 'on',
        attributes: {},
        name: 'Living Room',
        category: undefined,
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'sensor.diagnostic',
        state: 'ok',
        attributes: {},
        name: 'Diagnostic',
        category: 'diagnostic',
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
      {
        entity_id: 'text.config',
        state: 'default',
        attributes: {},
        name: 'Config',
        category: 'config',
        translation_key: undefined,
        isActive: false,
        isProblemEntity: false,
      },
    ];

    getDeviceEntitiesStub.returns(mockEntities);

    // Test excluding sensors
    const configWithSensorsExcluded = {
      ...mockConfig,
      exclude_sections: ['sensors'],
    };
    let result = getDevice(mockHass, configWithSensorsExcluded);
    expect(result?.sensors).to.have.length(0);
    expect(result?.controls).to.have.length(2);
    expect(result?.diagnostics).to.have.length(1);
    expect(result?.configurations).to.have.length(1);

    // Test excluding controls
    const configWithControlsExcluded = {
      ...mockConfig,
      exclude_sections: ['controls'],
    };
    result = getDevice(mockHass, configWithControlsExcluded);
    expect(result?.sensors).to.have.length(1);
    expect(result?.controls).to.have.length(0);
    expect(result?.diagnostics).to.have.length(1);
    expect(result?.configurations).to.have.length(1);

    // Test excluding diagnostics
    const configWithDiagnosticsExcluded = {
      ...mockConfig,
      exclude_sections: ['diagnostics'],
    };
    result = getDevice(mockHass, configWithDiagnosticsExcluded);
    expect(result?.sensors).to.have.length(1);
    expect(result?.controls).to.have.length(1);
    expect(result?.diagnostics).to.have.length(0);
    expect(result?.configurations).to.have.length(1);

    // Test excluding configurations
    const configWithConfigurationsExcluded = {
      ...mockConfig,
      exclude_sections: ['configurations'],
    };
    result = getDevice(mockHass, configWithConfigurationsExcluded);
    expect(result?.sensors).to.have.length(1);
    expect(result?.controls).to.have.length(1);
    expect(result?.diagnostics).to.have.length(1);
    expect(result?.configurations).to.have.length(0);
  });
});
