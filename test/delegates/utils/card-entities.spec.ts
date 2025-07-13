import * as stateRetriever from '@delegates/retrievers/state';
import { getDeviceEntities } from '@delegates/utils/card-entities';
import type { Config } from '@device/types';
import * as stateActiveModule from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('card-entities.ts', () => {
  let config: Config;
  let mockHass: HomeAssistant;
  let getStateStub: sinon.SinonStub;
  let stateActiveStub: sinon.SinonStub;

  beforeEach(() => {
    // Create mock Home Assistant instance
    mockHass = {
      entities: {
        'light.petkit_light': {
          entity_id: 'light.petkit_light',
          device_id: 'petkit_device_1',
          entity_category: undefined,
          translation_key: 'light',
        },
        'sensor.petkit_temperature': {
          entity_id: 'sensor.petkit_temperature',
          device_id: 'petkit_device_1',
          entity_category: undefined,
          translation_key: 'temperature',
        },
        'text.petkit_status': {
          entity_id: 'text.petkit_status',
          device_id: 'petkit_device_1',
          entity_category: undefined,
          translation_key: 'device_status',
        },
        'sensor.petkit_diagnostic': {
          entity_id: 'sensor.petkit_diagnostic',
          device_id: 'petkit_device_1',
          entity_category: 'diagnostic',
          translation_key: 'diagnostic',
        },
        'switch.petkit_config': {
          entity_id: 'switch.petkit_config',
          device_id: 'petkit_device_1',
          entity_category: 'config',
          translation_key: 'config',
        },
        'binary_sensor.petkit_problem': {
          entity_id: 'binary_sensor.petkit_problem',
          device_id: 'petkit_device_1',
          entity_category: undefined,
          translation_key: 'problem',
        },
        'light.other_device': {
          entity_id: 'light.other_device',
          device_id: 'other_device_id',
          entity_category: undefined,
          translation_key: 'light',
        },
      },
    } as any as HomeAssistant;

    config = {
      device_id: 'device_1',
    };

    // Stub the getState function to return mock states
    getStateStub = stub(stateRetriever, 'getState');

    // Stub the stateActive function
    stateActiveStub = stub(stateActiveModule, 'stateActive');

    // Set up default returns for the getState stub
    getStateStub.withArgs(mockHass, 'light.petkit_light').returns({
      entity_id: 'light.petkit_light',
      state: 'on',
      attributes: {
        friendly_name: 'Device Light',
        device_class: 'light',
      },
    });

    getStateStub.withArgs(mockHass, 'sensor.petkit_temperature').returns({
      entity_id: 'sensor.petkit_temperature',
      state: '25',
      attributes: {
        friendly_name: 'Device Temperature',
        device_class: 'temperature',
        unit_of_measurement: '°C',
      },
    });

    getStateStub.withArgs(mockHass, 'text.petkit_status').returns({
      entity_id: 'text.petkit_status',
      state: 'OK',
      attributes: {
        friendly_name: 'Device Status',
        device_class: 'problem',
      },
    });

    getStateStub.withArgs(mockHass, 'sensor.petkit_diagnostic').returns({
      entity_id: 'sensor.petkit_diagnostic',
      state: '100',
      attributes: {
        friendly_name: 'Device Diagnostic',
        device_class: 'diagnostic',
      },
    });

    getStateStub.withArgs(mockHass, 'switch.petkit_config').returns({
      entity_id: 'switch.petkit_config',
      state: 'off',
      attributes: {
        friendly_name: 'Device Config',
        device_class: 'config',
      },
    });

    getStateStub.withArgs(mockHass, 'binary_sensor.petkit_problem').returns({
      entity_id: 'binary_sensor.petkit_problem',
      state: 'on',
      attributes: {
        friendly_name: 'Device Problem',
        device_class: 'problem',
      },
    });

    getStateStub.withArgs(mockHass, 'light.other_device').returns({
      entity_id: 'light.other_device',
      state: 'on',
      attributes: {
        friendly_name: 'Other Device',
        device_class: 'light',
      },
    });

    // Setup default stateActive behavior
    stateActiveStub.returns(false); // Default most entities to inactive
    stateActiveStub
      .withArgs({
        entity_id: 'light.petkit_light',
        state: 'on',
        attributes: {
          friendly_name: 'Device Light',
          device_class: 'light',
        },
      })
      .returns(true);

    stateActiveStub
      .withArgs({
        entity_id: 'binary_sensor.petkit_problem',
        state: 'on',
        attributes: {
          friendly_name: 'Device Problem',
          device_class: 'problem',
        },
      })
      .returns(true);
  });

  afterEach(() => {
    getStateStub.restore();
    stateActiveStub.restore();
  });

  it('should return array of entity information for a specific device', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    const entities = getDeviceEntities(mockHass, config, deviceId, deviceName);

    // Check we got the right number of entities
    expect(entities.length).to.equal(6);

    // Check entities have the correct structure
    entities.forEach((entity) => {
      expect(entity).to.have.property('entity_id');
      expect(entity).to.have.property('category');
      expect(entity).to.have.property('state');
      expect(entity).to.have.property('attributes');
      expect(entity).to.have.property('isProblemEntity');
      expect(entity).to.have.property('isActive');
      expect(entity.attributes).to.have.property('friendly_name');
    });

    // Check device name was correctly removed from friendly_name
    expect(entities[0]!.attributes.friendly_name).to.equal(' Light');
    expect(entities[1]!.attributes.friendly_name).to.equal(' Temperature');
  });

  it('should correctly determine isProblemEntity based on device_class', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    const entities = getDeviceEntities(mockHass, config, deviceId, deviceName);

    // Find the problem entity
    const problemEntity = entities.find(
      (e) => e.entity_id === 'text.petkit_status',
    );
    expect(problemEntity).to.exist;
    expect(problemEntity!.isProblemEntity).to.be.true;

    // Find another problem entity
    const problemEntity2 = entities.find(
      (e) => e.entity_id === 'binary_sensor.petkit_problem',
    );
    expect(problemEntity2).to.exist;
    expect(problemEntity2!.isProblemEntity).to.be.true;

    // Find a non-problem entity
    const nonProblemEntity = entities.find(
      (e) => e.entity_id === 'sensor.petkit_temperature',
    );
    expect(nonProblemEntity).to.exist;
    expect(nonProblemEntity!.isProblemEntity).to.be.false;
  });

  it('should correctly determine isActive status from stateActive function', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    const entities = getDeviceEntities(mockHass, config, deviceId, deviceName);

    // Find the active entity
    const activeEntity = entities.find(
      (e) => e.entity_id === 'light.petkit_light',
    );
    expect(activeEntity).to.exist;
    expect(activeEntity!.isActive).to.be.true;

    // Find an inactive entity
    const inactiveEntity = entities.find(
      (e) => e.entity_id === 'sensor.petkit_temperature',
    );
    expect(inactiveEntity).to.exist;
    expect(inactiveEntity!.isActive).to.be.false;
  });

  it('should handle entities with both isProblemEntity and isActive', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    const entities = getDeviceEntities(mockHass, config, deviceId, deviceName);

    // Find an entity that is both a problem and active
    const activeProblemEntity = entities.find(
      (e) => e.entity_id === 'binary_sensor.petkit_problem',
    );
    expect(activeProblemEntity).to.exist;
    expect(activeProblemEntity!.isProblemEntity).to.be.true;
    expect(activeProblemEntity!.isActive).to.be.true;
  });

  it('should call stateActive for each valid entity', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    getDeviceEntities(mockHass, config, deviceId, deviceName);

    // stateActive should be called for each entity that has a state
    expect(stateActiveStub.callCount).to.equal(6);
  });

  it('should filter out entities for different devices', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    const entities = getDeviceEntities(mockHass, config, deviceId, deviceName);

    // Check that only entities for the specified device are included
    entities.forEach((entity) => {
      expect(entity.entity_id).to.not.equal('light.other_device');
    });

    // Ensure we don't have the wrong device's entities
    const entityIds = entities.map((e) => e.entity_id);
    expect(entityIds).to.not.include('light.other_device');
  });

  it('should handle null device name', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = null;

    const entities = getDeviceEntities(mockHass, config, deviceId, deviceName);

    // Check we still get the entities
    expect(entities.length).to.equal(6);

    // Check friendly_names are intact since there's no device name to strip
    expect(entities[0]!.attributes.friendly_name).to.equal('Device Light');
  });

  it('should return device name when friendly_name equals device name', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    // Set up a state where the friendly_name equals the device name
    getStateStub.withArgs(mockHass, 'light.petkit_device_name').returns({
      entity_id: 'light.petkit_device_name',
      state: 'on',
      attributes: {
        friendly_name: 'Device', // Same as device name
        device_class: 'light',
      },
    });

    // Add the entity to mockHass
    mockHass.entities['light.petkit_device_name'] = {
      entity_id: 'light.petkit_device_name',
      device_id: 'petkit_device_1',
      entity_category: undefined,
      translation_key: 'light',
      area_id: 'area_1',
      labels: [],
    };

    // Configure stateActive for the new entity
    stateActiveStub
      .withArgs({
        entity_id: 'light.petkit_device_name',
        state: 'on',
        attributes: {
          friendly_name: 'Device',
          device_class: 'light',
        },
      })
      .returns(true);

    const entities = getDeviceEntities(mockHass, config, deviceId, deviceName);

    // Find the new entity
    const targetEntity = entities.find(
      (e) => e.entity_id === 'light.petkit_device_name',
    );
    expect(targetEntity).to.exist;

    // Check that the friendly name is set to the device name, not an empty string
    expect(targetEntity!.attributes.friendly_name).to.equal('Device');
  });

  it('should filter out entities with undefined state', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    // Update one stub to return undefined state
    getStateStub.withArgs(mockHass, 'light.petkit_light').returns(undefined);

    const entities = getDeviceEntities(mockHass, config, deviceId, deviceName);

    // We should have one less entity
    expect(entities.length).to.equal(5);

    // The undefined entity should not be included
    const entityIds = entities.map((e) => e.entity_id);
    expect(entityIds).to.not.include('light.petkit_light');
  });

  it('should preserve entity category information', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    const entities = getDeviceEntities(mockHass, config, deviceId, deviceName);

    // Find the diagnostic entity
    const diagnosticEntity = entities.find(
      (e) => e.entity_id === 'sensor.petkit_diagnostic',
    );
    expect(diagnosticEntity).to.exist;
    expect(diagnosticEntity!.category).to.equal('diagnostic');

    // Find the config entity
    const configEntity = entities.find(
      (e) => e.entity_id === 'switch.petkit_config',
    );
    expect(configEntity).to.exist;
    expect(configEntity!.category).to.equal('config');
  });

  it('should handle empty entities array', () => {
    // Create empty mock hass
    const emptyHass = { entities: {} } as any as HomeAssistant;

    const entities = getDeviceEntities(
      emptyHass,
      config,
      'any_device_id',
      'Any Device',
    );

    expect(entities).to.be.an('array');
    expect(entities.length).to.equal(0);
  });

  it('should preserve all other state attributes', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    const entities = getDeviceEntities(mockHass, config, deviceId, deviceName);

    // Find the temperature entity
    const tempEntity = entities.find(
      (e) => e.entity_id === 'sensor.petkit_temperature',
    );
    expect(tempEntity).to.exist;
    expect(tempEntity!.attributes.device_class).to.equal('temperature');
    expect(tempEntity!.attributes.unit_of_measurement).to.equal('°C');
  });

  it('should preserve translation_key in the entity information', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    const entities = getDeviceEntities(mockHass, config, deviceId, deviceName);

    // Verify translation keys are preserved
    const statusEntity = entities.find(
      (e) => e.entity_id === 'text.petkit_status',
    );
    expect(statusEntity).to.exist;
    expect(statusEntity!.translation_key).to.equal('device_status');
  });

  it('should use card-level actions when defined in card config', () => {
    const deviceId = 'petkit_device_1';
    const deviceName = 'Device';

    // Define custom actions in the config
    const configWithActions: Config = {
      ...config,
      tap_action: { action: 'toggle' },
      hold_action: { action: 'more-info' },
      double_tap_action: {
        action: 'navigate',
        navigation_path: '/lovelace/0',
      },
    };

    const entities = getDeviceEntities(
      mockHass,
      configWithActions,
      deviceId,
      deviceName,
    );

    // Check every entity has the config property with the card-level actions
    entities.forEach((entity) => {
      expect(entity).to.have.property('config');
      expect(entity.config).to.deep.equal({
        tap_action: { action: 'toggle' },
        hold_action: { action: 'more-info' },
        double_tap_action: {
          action: 'navigate',
          navigation_path: '/lovelace/0',
        },
      });
    });
  });
});
