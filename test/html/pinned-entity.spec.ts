// test/html/pinned-entity.spec.ts

import * as featureModule from '@config/feature';
import * as stateRetrieverModule from '@delegates/retrievers/state';
import type { Config } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import { pinnedEntity } from '@html/pinned-entity';
import * as stateDisplayModule from '@html/state-display';
import { expect } from 'chai';
import { html, nothing } from 'lit';
import { stub } from 'sinon';

describe('pinned-entity.ts', () => {
  let mockHass: HomeAssistant;
  let getStateStub: sinon.SinonStub;
  let stateDisplayStub: sinon.SinonStub;
  let hasFeatureStub: sinon.SinonStub;

  beforeEach(() => {
    // Create mock HomeAssistant instance
    mockHass = {} as HomeAssistant;

    // Create stubs for the dependencies
    getStateStub = stub(stateRetrieverModule, 'getState');
    stateDisplayStub = stub(stateDisplayModule, 'stateDisplay');
    hasFeatureStub = stub(featureModule, 'hasFeature');

    // Default stub behavior
    stateDisplayStub.returns(
      html`<div class="mocked-state-display">Mocked State</div>`,
    );
    hasFeatureStub.returns(false); // Default to not hiding the pinned state
  });

  afterEach(() => {
    // Restore all stubs
    getStateStub.restore();
    stateDisplayStub.restore();
    hasFeatureStub.restore();
  });

  describe('basic functionality', () => {
    it('should return nothing when no entityId is provided', () => {
      // Arrange
      const config: Config = {};

      // Act
      const result = pinnedEntity(mockHass, config);

      // Assert
      expect(result).to.equal(nothing);
      expect(getStateStub.called).to.be.false;
      expect(stateDisplayStub.called).to.be.false;
    });

    it('should use entity property when entity_id is not provided (auto-entities)', () => {
      const config: Config = { entity: 'sensor.auto_entities_entity' };
      getStateStub.returns({
        entity_id: 'sensor.auto_entities_entity',
        state: '22',
        attributes: { unit_of_measurement: '°C' },
      });
      pinnedEntity(mockHass, config);
      expect(getStateStub.calledWith(mockHass, 'sensor.auto_entities_entity'))
        .to.be.true;
    });

    it('should call getState with the provided entityId', () => {
      // Arrange
      const config: Config = {
        entity_id: 'sensor.test_entity',
      };
      getStateStub.returns({
        entity_id: 'sensor.test_entity',
        state: '50',
        attributes: { unit_of_measurement: '%' },
      });

      // Act
      pinnedEntity(mockHass, config);

      // Assert
      expect(getStateStub.calledOnce).to.be.true;
      expect(getStateStub.calledWith(mockHass, 'sensor.test_entity')).to.be
        .true;
    });

    it('should call stateDisplay with hass and state when state exists', () => {
      // Arrange
      const config: Config = {
        entity_id: 'sensor.test_entity',
      };
      const mockState = {
        entity_id: 'sensor.test_entity',
        state: '50',
        attributes: { unit_of_measurement: '%' },
      };
      getStateStub.returns(mockState);

      // Act
      const result = pinnedEntity(mockHass, config);

      // Assert
      expect(stateDisplayStub.calledOnce).to.be.true;
      expect(stateDisplayStub.calledWith(mockHass, mockState)).to.be.true;
      expect(result).to.not.equal(nothing);
    });
  });

  describe('edge cases', () => {
    it('should return nothing when getState returns undefined', () => {
      // Arrange
      const config: Config = {
        entity_id: 'sensor.non_existent_entity',
      };
      getStateStub.returns(undefined);

      // Act
      const result = pinnedEntity(mockHass, config);

      // Assert
      expect(result).to.equal(nothing);
      expect(getStateStub.calledOnce).to.be.true;
      expect(stateDisplayStub.called).to.be.false;
    });

    it('should handle empty string entity IDs', () => {
      // Arrange
      const config: Config = {
        entity_id: '',
      };
      getStateStub.returns(undefined);

      // Act
      const result = pinnedEntity(mockHass, config);

      // Assert
      expect(result).to.equal(nothing);
      expect(getStateStub.called).to.be.false;
    });

    it('should support all state types through stateDisplay', () => {
      // Arrange - test with states of different types
      const testStates = [
        {
          entity_id: 'sensor.temperature',
          state: '22.5',
          attributes: { unit_of_measurement: '°C' },
        },
        { entity_id: 'switch.light', state: 'on', attributes: {} },
        {
          entity_id: 'sensor.progress',
          state: '75.5',
          attributes: { unit_of_measurement: '%' },
        },
      ];

      for (const state of testStates) {
        // Reset stubs for each test case
        getStateStub.reset();
        stateDisplayStub.reset();

        // Set up stubs for this test case
        getStateStub.returns(state);

        // Create config with entity_id
        const config: Config = {
          entity_id: state.entity_id,
        };

        // Act
        const result = pinnedEntity(mockHass, config);

        // Assert
        expect(getStateStub.calledOnce).to.be.true;
        expect(stateDisplayStub.calledOnce).to.be.true;
        expect(stateDisplayStub.calledWith(mockHass, state)).to.be.true;
        expect(result).to.not.equal(nothing);
      }
    });
  });

  describe('hide_entity_state feature flag', () => {
    it('should return nothing when hide_entity_state feature is enabled', () => {
      // Arrange
      const config: Config = {
        entity_id: 'sensor.test_entity',
        features: ['hide_entity_state'],
      };
      hasFeatureStub.returns(true);

      // Act
      const result = pinnedEntity(mockHass, config);

      // Assert
      expect(result).to.equal(nothing);
      expect(hasFeatureStub.calledOnce).to.be.true;
      expect(hasFeatureStub.calledWith(config, 'hide_entity_state')).to.be.true;
      expect(getStateStub.called).to.be.false;
      expect(stateDisplayStub.called).to.be.false;
    });

    it('should render normally when hide_entity_state feature is not enabled', () => {
      // Arrange
      const config: Config = {
        entity_id: 'sensor.test_entity',
      };
      const mockState = {
        entity_id: 'sensor.test_entity',
        state: '50',
        attributes: { unit_of_measurement: '%' },
      };
      hasFeatureStub.returns(false);
      getStateStub.returns(mockState);

      // Act
      const result = pinnedEntity(mockHass, config);

      // Assert
      expect(result).to.not.equal(nothing);
      expect(hasFeatureStub.calledOnce).to.be.true;
      expect(hasFeatureStub.calledWith(config, 'hide_entity_state')).to.be.true;
      expect(getStateStub.calledOnce).to.be.true;
      expect(stateDisplayStub.calledOnce).to.be.true;
    });
  });
});
