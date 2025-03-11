import { hasProblem } from '@delegates/utils/has-problem';
import * as stateActiveModule from '@hass/common/entity/state_active';
import type { Device, EntityInformation } from '@type/config';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('has-problem.ts', () => {
    let mockUnit: Device;
    let stateActiveStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock problem entities
      const problemEntity1 = {
        entity_id: 'binary_sensor.petkit_problem1',
        state: 'on',
        translation_key: undefined,
        attributes: {
          device_class: 'problem',
          friendly_name: 'PetKit Problem 1',
        },
      } as any as EntityInformation;

      const problemEntity2 = {
        entity_id: 'binary_sensor.petkit_problem2',
        state: 'off',
        translation_key: undefined,
        attributes: {
          device_class: 'problem',
          friendly_name: 'PetKit Problem 2',
        },
      } as any as EntityInformation;

      // Create mock PetKit unit
      mockUnit = {
        name: 'Mock PetKit Device',
        model: 'PetKit V1 123',
        sensors: [],
        controls: [],
        diagnostics: [],
        configurations: [],
        problemEntities: [problemEntity1, problemEntity2],
      };

      // Stub stateActive function
      stateActiveStub = stub(stateActiveModule, 'stateActive');
    });

    afterEach(() => {
      stateActiveStub.restore();
    });

    it('should return true when at least one problem entity is active', () => {
      // Set first problem entity as active
      stateActiveStub.withArgs(mockUnit.problemEntities[0]).returns(true);
      stateActiveStub.withArgs(mockUnit.problemEntities[1]).returns(false);

      const result = hasProblem(mockUnit);

      expect(result).to.be.true;
      expect(stateActiveStub.calledWith(mockUnit.problemEntities[0])).to.be
        .true;
    });

    it('should return false when no problem entities are active', () => {
      // Set all problem entities as inactive
      stateActiveStub.returns(false);

      const result = hasProblem(mockUnit);

      expect(result).to.be.false;
      expect(stateActiveStub.called).to.be.true;
    });

    it('should return false when problem entities array is empty', () => {
      // Empty the problem entities array
      mockUnit.problemEntities = [];

      const result = hasProblem(mockUnit);

      expect(result).to.be.false;
      expect(stateActiveStub.called).to.be.false; // Should not call stateActive at all
    });

    it('should check all problem entities until finding an active one', () => {
      // Add more problem entities
      const additionalEntity1 = {
        entity_id: 'binary_sensor.petkit_problem3',
        state: 'off',
        translation_key: undefined,
        attributes: {
          device_class: 'problem',
          friendly_name: 'PetKit Problem 3',
        },
      } as any as EntityInformation;

      const additionalEntity2 = {
        entity_id: 'binary_sensor.petkit_problem4',
        state: 'on',
        translation_key: undefined,
        attributes: {
          device_class: 'problem',
          friendly_name: 'PetKit Problem 4',
        },
      } as any as EntityInformation;

      mockUnit.problemEntities.push(additionalEntity1, additionalEntity2);

      // Set only the third element (index 2) as active
      stateActiveStub.onCall(0).returns(false);
      stateActiveStub.onCall(1).returns(false);
      stateActiveStub.onCall(2).returns(true);
      stateActiveStub.onCall(3).returns(false); // This shouldn't be called due to short-circuit

      const result = hasProblem(mockUnit);

      expect(result).to.be.true;
      expect(stateActiveStub.callCount).to.equal(3); // Should stop after finding an active problem
    });

    it('should handle undefined unit gracefully', () => {
      const result = hasProblem(undefined as unknown as Device);

      // Since TypeScript won't allow this at compile time,
      // this is more of a runtime check for robustness
      expect(result).to.be.false;
    });

    // New tests for the desiccant_left_days translation_key condition

    it('should return true when desiccant_left_days is 0', () => {
      // Create a desiccant entity with 0 days left
      const desiccantEntity = {
        entity_id: 'sensor.petkit_desiccant',
        state: '0',
        translation_key: 'desiccant_left_days',
        attributes: {
          friendly_name: 'PetKit Desiccant Days Left',
        },
      } as any as EntityInformation;

      // Replace the problem entities with just the desiccant entity
      mockUnit.problemEntities = [desiccantEntity];

      // stateActive should not be called for desiccant_left_days entities
      stateActiveStub.returns(false);

      const result = hasProblem(mockUnit);

      expect(result).to.be.true;
      expect(stateActiveStub.called).to.be.false;
    });

    it('should return false when desiccant_left_days is not 0', () => {
      // Create a desiccant entity with days left
      const desiccantEntity = {
        entity_id: 'sensor.petkit_desiccant',
        state: '5',
        translation_key: 'desiccant_left_days',
        attributes: {
          friendly_name: 'PetKit Desiccant Days Left',
        },
      } as any as EntityInformation;

      // Replace the problem entities with just the desiccant entity
      mockUnit.problemEntities = [desiccantEntity];

      // stateActive should not be called for desiccant_left_days entities
      stateActiveStub.returns(true); // This should be ignored for desiccant entity

      const result = hasProblem(mockUnit);

      expect(result).to.be.false;
      expect(stateActiveStub.called).to.be.false;
    });

    it('should handle mixed problem entities with desiccant correctly', () => {
      // Regular problem entity (inactive)
      const regularProblem = {
        entity_id: 'binary_sensor.petkit_problem',
        state: 'off',
        translation_key: undefined,
        attributes: {
          device_class: 'problem',
          friendly_name: 'PetKit Problem',
        },
      } as any as EntityInformation;

      // Desiccant entity with days left (not a problem)
      const desiccantNotZero = {
        entity_id: 'sensor.petkit_desiccant',
        state: '5',
        translation_key: 'desiccant_left_days',
        attributes: {
          friendly_name: 'PetKit Desiccant Days Left',
        },
      } as any as EntityInformation;

      mockUnit.problemEntities = [regularProblem, desiccantNotZero];
      stateActiveStub.returns(false);

      let result = hasProblem(mockUnit);
      expect(result).to.be.false;
      expect(stateActiveStub.calledOnce).to.be.true;

      // Now with desiccant at 0 (should be a problem)
      const desiccantZero = {
        ...desiccantNotZero,
        state: '0',
      };

      mockUnit.problemEntities = [regularProblem, desiccantZero];
      stateActiveStub.reset();
      stateActiveStub.returns(false);

      result = hasProblem(mockUnit);
      expect(result).to.be.true;
      // stateActive should only be called for the regular problem entity
      expect(stateActiveStub.calledOnce).to.be.true;
    });
  });
};
