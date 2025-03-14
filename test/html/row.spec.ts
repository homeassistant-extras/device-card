import { DeviceCard } from '@cards/card';
import type { HomeAssistant } from '@hass/types';
import * as attributesModule from '@html/attributes';
import * as percentBarModule from '@html/percent';
import { row } from '@html/row';
import * as stateContentModule from '@html/state-content';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation } from '@type/config';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('row.ts', () => {
    // Common test variables
    let mockHass: HomeAssistant;
    let mockElement: DeviceCard;
    let mockEntity: EntityInformation;
    let stateContentStub: sinon.SinonStub;
    let percentBarStub: sinon.SinonStub;
    let attributesStub: sinon.SinonStub;

    beforeEach(() => {
      // Create stubs for imported components
      stateContentStub = stub(stateContentModule, 'stateContent');
      stateContentStub.returns(html`<div class="mocked-state-content"></div>`);

      percentBarStub = stub(percentBarModule, 'percentBar');
      percentBarStub.returns(html`<div class="mocked-percent-bar"></div>`);

      attributesStub = stub(attributesModule, 'attributes');
      attributesStub.returns(html`<div class="mocked-attributes"></div>`);

      // Mock Home Assistant instance
      mockHass = {} as HomeAssistant;

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
        isActive: false,
        isProblemEntity: false,
      } as EntityInformation;
    });

    afterEach(() => {
      // Restore all stubs
      stateContentStub.restore();
      percentBarStub.restore();
      attributesStub.restore();
    });

    describe('row rendering', () => {
      it('should render a basic row with state content', async () => {
        const result = row(mockHass, mockEntity, mockElement);
        const el = await fixture(result as TemplateResult);

        // Check basic structure
        expect(el.classList.contains('row')).to.be.true;
        expect(el.querySelector('.row-content')).to.exist;

        // Check that stateContent was called with correct args
        expect(stateContentStub.calledOnce).to.be.true;
        expect(stateContentStub.firstCall.args[0]).to.equal(mockHass);
        expect(stateContentStub.firstCall.args[1]).to.equal(mockEntity);
      });

      it('should render a percentage bar for entities with percentage measurements', async () => {
        const result = row(mockHass, mockEntity, mockElement);
        await fixture(result as TemplateResult);

        // Check that percentBar was called
        expect(percentBarStub.calledOnce).to.be.true;
        expect(percentBarStub.firstCall.args[0]).to.equal(mockEntity);
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

        const result = row(mockHass, nonPercentEntity, mockElement);
        await fixture(result as TemplateResult);

        // Check that percentBar was not called
        expect(percentBarStub.called).to.be.false;
      });

      it('should apply status-error class for active problem entities', async () => {
        // Create a problem entity that is active
        const problemEntity = {
          ...mockEntity,
          isProblemEntity: true,
          isActive: true,
        };

        const result = row(mockHass, problemEntity, mockElement);
        const el = await fixture(result as TemplateResult);

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

        const result = row(mockHass, problemEntity, mockElement);
        const el = await fixture(result as TemplateResult);

        // Check that status-ok class is applied
        expect(el.classList.contains('status-ok')).to.be.true;
      });
    });

    describe('entity attributes toggling', () => {
      it('should not show attributes when entity is collapsed', async () => {
        // Set entity as not expanded
        mockElement.expandedEntities = { [mockEntity.entity_id]: false };

        const result = row(mockHass, mockEntity, mockElement);
        await fixture(result as TemplateResult);

        // Check that attributes was not called
        expect(attributesStub.called).to.be.false;
      });

      it('should show attributes when entity is expanded', async () => {
        // Set entity as expanded
        mockElement.expandedEntities = { [mockEntity.entity_id]: true };

        const result = row(mockHass, mockEntity, mockElement);
        await fixture(result as TemplateResult);

        // Check that attributes was called with entity attributes
        expect(attributesStub.calledOnce).to.be.true;
        expect(attributesStub.firstCall.args[0]).to.deep.equal(
          mockEntity.attributes,
        );
      });

      it('should apply expanded-row class when entity is expanded', async () => {
        // Set entity as expanded
        mockElement.expandedEntities = { [mockEntity.entity_id]: true };

        const result = row(mockHass, mockEntity, mockElement);
        const el = await fixture(result as TemplateResult);

        // Check that expanded-row class is applied
        expect(el.classList.contains('expanded-row')).to.be.true;
      });

      it('should toggle entity expansion state when row is clicked', async () => {
        // Start with entity not expanded
        mockElement.expandedEntities = { [mockEntity.entity_id]: false };

        const result = row(mockHass, mockEntity, mockElement);
        const el = (await fixture(result as TemplateResult)) as HTMLElement;

        // Simulate click on the row
        el.click();

        // Check that entity is now expanded
        expect(mockElement.expandedEntities[mockEntity.entity_id]).to.be.true;

        // Click again to collapse
        el.click();

        // Check that entity is now collapsed
        expect(mockElement.expandedEntities[mockEntity.entity_id]).to.be.false;
      });

      it('should maintain state of other entities when toggling one entity', async () => {
        // Setup initial state with multiple entities
        mockElement.expandedEntities = {
          [mockEntity.entity_id]: false,
          'sensor.other_entity': true,
        };

        const result = row(mockHass, mockEntity, mockElement);
        const el = (await fixture(result as TemplateResult)) as HTMLElement;

        // Simulate click on the row
        el.click();

        // Verify the target entity was toggled
        expect(mockElement.expandedEntities[mockEntity.entity_id]).to.be.true;
        // Verify other entities remain unchanged
        expect(mockElement.expandedEntities['sensor.other_entity']).to.be.true;
      });
    });
  });
};
