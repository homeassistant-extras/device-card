import * as deviceRetriever from '@delegates/retrievers/device';
import * as cardEntities from '@delegates/utils/card-entities';
import { getDevice } from '@delegates/utils/get-device';
import * as domainUtils from '@hass/common/entity/compute_domain';
import type { HomeAssistant } from '@hass/types';
import type { Config, EntityInformation } from '@type/config';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('petkit-unit.ts', () => {
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
            name: 'PetKit Feeder',
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

    describe('getDevice', () => {
      it('should return undefined if device not found', () => {
        getDeviceStub.returns(undefined);
        const result = getDevice(mockHass, mockConfig);
        expect(result).to.be.undefined;
      });

      it('should initialize unit with device name and model', () => {
        const result = getDevice(mockHass, mockConfig);
        expect(result).to.not.be.undefined;
        expect(result?.name).to.equal('PetKit Feeder');
        expect(result?.model).to.equal('Feeder Plus Pro');
      });

      it('should use default name if device name is missing', () => {
        getDeviceStub.returns({
          ...mockHass.devices.device_1,
          name: null,
        });

        const result = getDevice(mockHass, mockConfig);
        expect(result?.name).to.equal('PetKit Device');
      });

      it('should categorize entities correctly', () => {
        const mockEntities: EntityInformation[] = [
          {
            entity_id: 'sensor.petkit_battery',
            state: '75',
            attributes: { device_class: 'battery' },
            category: undefined,
            translation_key: undefined,
          },
          {
            entity_id: 'switch.petkit_power',
            state: 'on',
            attributes: {},
            category: undefined,
            translation_key: undefined,
          },
          {
            entity_id: 'sensor.petkit_problem',
            state: 'off',
            attributes: { device_class: 'problem' },
            category: undefined,
            translation_key: undefined,
          },
          {
            entity_id: 'text.petkit_config',
            state: 'default',
            attributes: {},
            category: 'config',
            translation_key: undefined,
          },
          {
            entity_id: 'sensor.petkit_diagnostic',
            state: 'ok',
            attributes: {},
            category: 'diagnostic',
            translation_key: undefined,
          },
        ];

        getDeviceEntitiesStub.returns(mockEntities);

        const result = getDevice(mockHass, mockConfig);

        expect(result?.sensors).to.have.length(2);
        expect(result?.controls).to.have.length(1);
        expect(result?.diagnostics).to.have.length(1);
        expect(result?.configurations).to.have.length(1);
        expect(result?.problemEntities).to.have.length(1);

        // Verify correct categorization
        expect(result?.sensors[0]!.entity_id).to.equal('sensor.petkit_battery');
        expect(result?.controls[0]!.entity_id).to.equal('switch.petkit_power');
        expect(result?.diagnostics[0]!.entity_id).to.equal(
          'sensor.petkit_diagnostic',
        );
        expect(result?.configurations[0]!.entity_id).to.equal(
          'text.petkit_config',
        );
        expect(result?.problemEntities[0]!.entity_id).to.equal(
          'sensor.petkit_problem',
        );
      });

      it('should identify problem entities based on device_class', () => {
        const mockEntities: EntityInformation[] = [
          {
            entity_id: 'sensor.normal_sensor',
            state: 'ok',
            attributes: {},
            category: undefined,
            translation_key: undefined,
          },
          {
            entity_id: 'sensor.problem_sensor',
            state: 'warning',
            attributes: { device_class: 'problem' },
            category: undefined,
            translation_key: undefined,
          },
        ];

        getDeviceEntitiesStub.returns(mockEntities);

        const result = getDevice(mockHass, mockConfig);

        expect(result?.problemEntities).to.have.length(1);
        expect(result?.problemEntities[0]!.entity_id).to.equal(
          'sensor.problem_sensor',
        );
      });

      it('should identify problem entities based on translation_key for desiccant_left_days', () => {
        const mockEntities: EntityInformation[] = [
          {
            entity_id: 'sensor.normal_sensor',
            state: 'ok',
            attributes: {},
            category: undefined,
            translation_key: undefined,
          },
          {
            entity_id: 'sensor.desiccant_days',
            state: '5',
            attributes: {},
            category: undefined,
            translation_key: 'desiccant_left_days',
          },
        ];

        getDeviceEntitiesStub.returns(mockEntities);

        const result = getDevice(mockHass, mockConfig);

        expect(result?.problemEntities).to.have.length(1);
        expect(result?.problemEntities[0]!.entity_id).to.equal(
          'sensor.desiccant_days',
        );
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
            category: undefined,
            translation_key: undefined,
          },
          {
            entity_id: 'button.control',
            state: 'idle',
            attributes: {},
            category: undefined,
            translation_key: undefined,
          },
          {
            entity_id: 'switch.control',
            state: 'on',
            attributes: {},
            category: undefined,
            translation_key: undefined,
          },
          {
            entity_id: 'select.control',
            state: 'option1',
            attributes: {},
            category: undefined,
            translation_key: undefined,
          },
          {
            entity_id: 'sensor.data',
            state: '42',
            attributes: {},
            category: undefined,
            translation_key: undefined,
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
    });
  });
};
