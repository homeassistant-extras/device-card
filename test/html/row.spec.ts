import * as actionHandlerModule from '@/delegates/action-handler-delegate';
import { DeviceCard } from '@device/card';
import type { Config, Expansions } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import * as attributesModule from '@html/attributes';
import * as percentBarModule from '@html/percent';
import { row } from '@html/row';
import * as stateContentModule from '@html/state-content';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation } from '@type/config';
import { expect } from 'chai';
import { html } from 'lit';
import { stub } from 'sinon';

describe('row.ts', () => {
  let config: Config;
  let mockHass: HomeAssistant;
  let mockElement: DeviceCard;
  let mockEntity: EntityInformation;
  let stateContentStub: sinon.SinonStub;
  let percentBarStub: sinon.SinonStub;
  let attributesStub: sinon.SinonStub;
  let actionHandlerStub: sinon.SinonStub;
  let mockExpansions: Expansions;
  let mockUpdater: (expansion: Expansions) => void;

  beforeEach(() => {
    // Create stubs for imported components
    stateContentStub = stub(stateContentModule, 'stateContent');
    stateContentStub.resolves(html`<div class="mocked-state-content"></div>`);

    percentBarStub = stub(percentBarModule, 'percentBar');
    percentBarStub.returns(html`<div class="mocked-percent-bar"></div>`);

    attributesStub = stub(attributesModule, 'attributes');
    attributesStub.returns(html`<div class="mocked-attributes"></div>`);

    actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
      bind: () => {}, // Mock the bind method
      handleAction: () => {}, // Add any other methods that might be called
    });

    // Mock Home Assistant instance
    mockHass = {} as HomeAssistant;

    config = {
      device_id: 'device_1',
    };

    // Mock DeviceCard element with expandedEntities property
    mockElement = {
      expandedEntities: {},
    } as any as DeviceCard;

    // Create a mock entity for testing
    mockEntity = {
      entity_id: 'sensor.test_sensor',
      state: '75',
      translation_key: undefined,
      attributes: {
        friendly_name: 'Test Sensor',
        state_class: 'measurement',
        unit_of_measurement: '%',
      },
      name: 'Test Sensor',
      isActive: false,
      isProblemEntity: false,
    } as EntityInformation;

    mockExpansions = {
      expandedSections: {},
      expandedEntities: {},
    };

    mockUpdater = (expansion: Expansions) => {
      mockExpansions = expansion;
    };
  });

  afterEach(() => {
    // Restore all stubs
    stateContentStub.restore();
    percentBarStub.restore();
    attributesStub.restore();
    actionHandlerStub.restore();
  });

  describe('row rendering', () => {
    it('should render a basic row with state content', async () => {
      const result = await row(
        mockHass,
        mockEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      const el = await fixture(result);

      // Check basic structure
      expect(el.classList.contains('row')).to.be.true;
      expect(el.querySelector('.row-content')).to.exist;

      // Check that stateContent was called with correct args
      expect(stateContentStub.calledOnce).to.be.true;
      expect(stateContentStub.firstCall.args[0]).to.equal(mockHass);
      expect(stateContentStub.firstCall.args[1]).to.equal(mockEntity);
    });

    it('should render a percentage bar for entities with percentage measurements', async () => {
      const result = await row(
        mockHass,
        mockEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      await fixture(result);

      // Check that percentBar was called with entity and inverse entities array
      expect(percentBarStub.calledOnce).to.be.true;
      expect(percentBarStub.firstCall.args[0]).to.equal(mockEntity);
      expect(percentBarStub.firstCall.args[1]).to.deep.equal([]);
    });

    it('should render a percentage bar for entities with % unit even without state_class', async () => {
      // Entity with % unit but no state_class (e.g., battery sensors)
      const entityWithoutStateClass = {
        ...mockEntity,
        attributes: {
          ...mockEntity.attributes,
          state_class: undefined,
          unit_of_measurement: '%',
        },
      };

      const result = await row(
        mockHass,
        entityWithoutStateClass,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      await fixture(result);

      // Check that percentBar was called even without state_class
      expect(percentBarStub.calledOnce).to.be.true;
      expect(percentBarStub.firstCall.args[0]).to.equal(
        entityWithoutStateClass,
      );
      expect(percentBarStub.firstCall.args[1]).to.deep.equal([]);
    });

    it('should render a percentage bar for entities with % unit variations like "% available"', async () => {
      // Entity with % unit variation (e.g., "% available", "% used")
      const entityWithPercentVariation = {
        ...mockEntity,
        attributes: {
          ...mockEntity.attributes,
          unit_of_measurement: '% available',
        },
      };

      const result = await row(
        mockHass,
        entityWithPercentVariation,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      await fixture(result);

      // Check that percentBar was called for % unit variation
      expect(percentBarStub.calledOnce).to.be.true;
      expect(percentBarStub.firstCall.args[0]).to.equal(
        entityWithPercentVariation,
      );
      expect(percentBarStub.firstCall.args[1]).to.deep.equal([]);
    });

    it('should not render a percentage bar for non-percentage entities', async () => {
      // Modify mock entity to not be a percentage
      const nonPercentEntity = {
        ...mockEntity,
        attributes: {
          ...mockEntity.attributes,
          state_class: 'measurement',
          unit_of_measurement: '°C', // Change from '%' to '°C'
        },
      };

      const result = await row(
        mockHass,
        nonPercentEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      await fixture(result);

      // Check that percentBar was not called
      expect(percentBarStub.called).to.be.false;
    });

    it('should not render a percentage bar for entities with % unit but non-numeric state', async () => {
      // Entity with % unit but non-numeric state (e.g., "unknown", "unavailable")
      const entityWithNonNumericState = {
        ...mockEntity,
        state: 'unknown',
        attributes: {
          ...mockEntity.attributes,
          unit_of_measurement: '%',
        },
      };

      const result = await row(
        mockHass,
        entityWithNonNumericState,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      await fixture(result);

      // Check that percentBar was not called for non-numeric state
      expect(percentBarStub.called).to.be.false;
    });

    it('should apply status-error class for active problem entities', async () => {
      // Create a problem entity that is active
      const problemEntity = {
        ...mockEntity,
        isProblemEntity: true,
        isActive: true,
      };

      const result = await row(
        mockHass,
        problemEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      const el = await fixture(result);

      // Check that status-error class is applied
      expect(el.classList.contains('status-error')).to.be.true;
    });

    it('should apply status-ok class for inactive problem entities', async () => {
      // Create a problem entity that is inactive
      const problemEntity = {
        ...mockEntity,
        isProblemEntity: true,
        isActive: false,
      };

      const result = await row(
        mockHass,
        problemEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      const el = await fixture(result);

      // Check that status-ok class is applied
      expect(el.classList.contains('status-ok')).to.be.true;
    });

    it('should pass inverse_percent entities to percentBar when configured', async () => {
      const configWithInverse = {
        ...config,
        inverse_percent: ['sensor.test_sensor', 'sensor.other_sensor'],
      };

      const result = await row(
        mockHass,
        mockEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        configWithInverse,
      );
      await fixture(result);

      // Check that percentBar was called with entity and inverse entities array
      expect(percentBarStub.calledOnce).to.be.true;
      expect(percentBarStub.firstCall.args[0]).to.equal(mockEntity);
      expect(percentBarStub.firstCall.args[1]).to.deep.equal([
        'sensor.test_sensor',
        'sensor.other_sensor',
      ]);
    });

    it('should pass empty array to percentBar when inverse_percent is not configured', async () => {
      const result = await row(
        mockHass,
        mockEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      await fixture(result);

      // Check that percentBar was called with empty array when no inverse_percent
      expect(percentBarStub.calledOnce).to.be.true;
      expect(percentBarStub.firstCall.args[1]).to.deep.equal([]);
    });

    it('should pass empty array to percentBar when config is undefined', async () => {
      const result = await row(
        mockHass,
        mockEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        undefined,
      );
      await fixture(result);

      // Check that percentBar was called with empty array when config is undefined
      expect(percentBarStub.calledOnce).to.be.true;
      expect(percentBarStub.firstCall.args[1]).to.deep.equal([]);
    });
  });

  describe('entity attributes toggling', () => {
    it('should not show attributes when entity is collapsed', async () => {
      // Set entity as not expanded
      mockExpansions.expandedEntities = { [mockEntity.entity_id]: false };

      const result = await row(
        mockHass,
        mockEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      await fixture(result);

      // Check that attributes was not called
      expect(attributesStub.called).to.be.false;
    });

    it('should show attributes when entity is expanded', async () => {
      // Set entity as expanded
      mockExpansions.expandedEntities = { [mockEntity.entity_id]: true };

      const result = await row(
        mockHass,
        mockEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      await fixture(result);

      // Check that attributes was called with entity attributes
      expect(attributesStub.calledOnce).to.be.true;
      expect(attributesStub.firstCall.args[0]).to.deep.equal(
        mockEntity.attributes,
      );
    });

    it('should apply expanded-row class when entity is expanded', async () => {
      // Set entity as expanded
      mockExpansions.expandedEntities = { [mockEntity.entity_id]: true };

      const result = await row(
        mockHass,
        mockEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      const el = await fixture(result);

      // Check that expanded-row class is applied
      expect(el.classList.contains('expanded-row')).to.be.true;
    });

    it('should attach action handlers', async () => {
      const result = await row(
        mockHass,
        mockEntity,
        mockElement,
        mockExpansions,
        mockUpdater,
        config,
      );
      const el = await fixture(result);

      // Verify action handler was attached
      expect((el as any).actionHandler).to.exist;
    });
  });
});
