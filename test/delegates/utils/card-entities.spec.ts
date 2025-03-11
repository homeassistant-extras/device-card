import * as stateRetriever from '@delegates/retrievers/state';
import { getDeviceEntities } from '@delegates/utils/card-entities';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('card-entities.ts', () => {
    let mockHass: HomeAssistant;
    let getStateStub: sinon.SinonStub;

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
          'light.other_device': {
            entity_id: 'light.other_device',
            device_id: 'other_device_id',
            entity_category: undefined,
            translation_key: 'light',
          },
        },
      } as any as HomeAssistant;

      // Stub the getState function to return mock states
      getStateStub = stub(stateRetriever, 'getState');

      // Set up default returns for the stub
      getStateStub.withArgs(mockHass, 'light.petkit_light').returns({
        entity_id: 'light.petkit_light',
        state: 'on',
        attributes: {
          friendly_name: 'PetKit Device Light',
          device_class: 'light',
        },
      });

      getStateStub.withArgs(mockHass, 'sensor.petkit_temperature').returns({
        entity_id: 'sensor.petkit_temperature',
        state: '25',
        attributes: {
          friendly_name: 'PetKit Device Temperature',
          device_class: 'temperature',
          unit_of_measurement: '°C',
        },
      });

      getStateStub.withArgs(mockHass, 'text.petkit_status').returns({
        entity_id: 'text.petkit_status',
        state: 'OK',
        attributes: {
          friendly_name: 'PetKit Device Status',
          device_class: 'problem',
        },
      });

      getStateStub.withArgs(mockHass, 'sensor.petkit_diagnostic').returns({
        entity_id: 'sensor.petkit_diagnostic',
        state: '100',
        attributes: {
          friendly_name: 'PetKit Device Diagnostic',
          device_class: 'diagnostic',
        },
      });

      getStateStub.withArgs(mockHass, 'switch.petkit_config').returns({
        entity_id: 'switch.petkit_config',
        state: 'off',
        attributes: {
          friendly_name: 'PetKit Device Config',
          device_class: 'config',
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
    });

    afterEach(() => {
      getStateStub.restore();
    });

    it('should return array of entity information for a specific device', () => {
      const deviceId = 'petkit_device_1';
      const deviceName = 'PetKit Device';

      const entities = getDeviceEntities(mockHass, deviceId, deviceName);

      // Check we got the right number of entities
      expect(entities.length).to.equal(5);

      // Check entities have the correct structure
      entities.forEach((entity) => {
        expect(entity).to.have.property('entity_id');
        expect(entity).to.have.property('category');
        expect(entity).to.have.property('state');
        expect(entity).to.have.property('attributes');
        expect(entity.attributes).to.have.property('friendly_name');
      });

      // Check device name was correctly removed from friendly_name
      expect(entities[0]!.attributes.friendly_name).to.equal(' Light');
      expect(entities[1]!.attributes.friendly_name).to.equal(' Temperature');
    });

    it('should filter out entities for different devices', () => {
      const deviceId = 'petkit_device_1';
      const deviceName = 'PetKit Device';

      const entities = getDeviceEntities(mockHass, deviceId, deviceName);

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

      const entities = getDeviceEntities(mockHass, deviceId, deviceName);

      // Check we still get the entities
      expect(entities.length).to.equal(5);

      // Check friendly_names are intact since there's no device name to strip
      expect(entities[0]!.attributes.friendly_name).to.equal(
        'PetKit Device Light',
      );
    });

    it('should filter out entities with undefined state', () => {
      const deviceId = 'petkit_device_1';
      const deviceName = 'PetKit Device';

      // Update one stub to return undefined state
      getStateStub.withArgs(mockHass, 'light.petkit_light').returns(undefined);

      const entities = getDeviceEntities(mockHass, deviceId, deviceName);

      // We should have one less entity
      expect(entities.length).to.equal(4);

      // The undefined entity should not be included
      const entityIds = entities.map((e) => e.entity_id);
      expect(entityIds).to.not.include('light.petkit_light');
    });

    it('should preserve entity category information', () => {
      const deviceId = 'petkit_device_1';
      const deviceName = 'PetKit Device';

      const entities = getDeviceEntities(mockHass, deviceId, deviceName);

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
        'any_device_id',
        'Any Device',
      );

      expect(entities).to.be.an('array');
      expect(entities.length).to.equal(0);
    });

    it('should preserve all other state attributes', () => {
      const deviceId = 'petkit_device_1';
      const deviceName = 'PetKit Device';

      const entities = getDeviceEntities(mockHass, deviceId, deviceName);

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
      const deviceName = 'PetKit Device';

      const entities = getDeviceEntities(mockHass, deviceId, deviceName);

      // Verify translation keys are preserved
      const statusEntity = entities.find(
        (e) => e.entity_id === 'text.petkit_status',
      );
      expect(statusEntity).to.exist;
      expect(statusEntity!.translation_key).to.equal('device_status');
    });
  });
};
