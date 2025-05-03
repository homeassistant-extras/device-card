// test/html/pinned-entity.spec.ts

import * as stateRetrieverModule from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import { pinnedEntity } from '@html/pinned-entity';
import * as stateDisplayModule from '@html/state-display';
import { expect } from 'chai';
import { html, nothing } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('pinned-entity.ts', () => {
    let mockHass: HomeAssistant;
    let getStateStub: sinon.SinonStub;
    let stateDisplayStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock HomeAssistant instance
      mockHass = {} as HomeAssistant;

      // Create stubs for the dependencies
      getStateStub = stub(stateRetrieverModule, 'getState');
      stateDisplayStub = stub(stateDisplayModule, 'stateDisplay');

      // Default stub behavior
      stateDisplayStub.returns(
        html`<div class="mocked-state-display">Mocked State</div>`,
      );
    });

    afterEach(() => {
      // Restore all stubs
      getStateStub.restore();
      stateDisplayStub.restore();
    });

    describe('basic functionality', () => {
      it('should return nothing when no entityId is provided', () => {
        // Act
        const result = pinnedEntity(mockHass, undefined);

        // Assert
        expect(result).to.equal(nothing);
        expect(getStateStub.called).to.be.false;
        expect(stateDisplayStub.called).to.be.false;
      });

      it('should call getState with the provided entityId', () => {
        // Arrange
        const entityId = 'sensor.test_entity';
        getStateStub.returns({
          entity_id: entityId,
          state: '50',
          attributes: { unit_of_measurement: '%' },
        });

        // Act
        pinnedEntity(mockHass, entityId);

        // Assert
        expect(getStateStub.calledOnce).to.be.true;
        expect(getStateStub.calledWith(mockHass, entityId)).to.be.true;
      });

      it('should call stateDisplay with hass and state when state exists', () => {
        // Arrange
        const entityId = 'sensor.test_entity';
        const mockState = {
          entity_id: entityId,
          state: '50',
          attributes: { unit_of_measurement: '%' },
        };
        getStateStub.returns(mockState);

        // Act
        const result = pinnedEntity(mockHass, entityId);

        // Assert
        expect(stateDisplayStub.calledOnce).to.be.true;
        expect(stateDisplayStub.calledWith(mockHass, mockState)).to.be.true;
        expect(result).to.not.equal(nothing);
      });
    });

    describe('edge cases', () => {
      it('should return nothing when getState returns undefined', () => {
        // Arrange
        const entityId = 'sensor.non_existent_entity';
        getStateStub.returns(undefined);

        // Act
        const result = pinnedEntity(mockHass, entityId);

        // Assert
        expect(result).to.equal(nothing);
        expect(getStateStub.calledOnce).to.be.true;
        expect(stateDisplayStub.called).to.be.false;
      });

      it('should handle empty string entity IDs', () => {
        // Arrange
        const entityId = '';
        getStateStub.returns(undefined);

        // Act
        const result = pinnedEntity(mockHass, entityId);

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

          // Act
          const result = pinnedEntity(mockHass, state.entity_id);

          // Assert
          expect(getStateStub.calledOnce).to.be.true;
          expect(stateDisplayStub.calledOnce).to.be.true;
          expect(stateDisplayStub.calledWith(mockHass, state)).to.be.true;
          expect(result).to.not.equal(nothing);
        }
      });
    });
  });
};
