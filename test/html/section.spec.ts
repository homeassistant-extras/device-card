import * as stateActiveModule from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import * as percentBarModule from '@html/percent';
import { renderSection } from '@html/section';
import * as stateContentModule from '@html/state-content';
import { fixture, html } from '@open-wc/testing-helpers';
import type { Config, EntityInformation, EntityState } from '@type/config';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub, type SinonStub } from 'sinon';

export default () => {
  describe('section.ts', () => {
    // Common test variables
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let mockElement: any;
    let mockEntities: EntityInformation[];
    let mockEntityStates: Record<string, EntityState>;

    // Stubs for imported functions
    let stateContentStub: SinonStub;
    let percentBarStub: SinonStub;
    let stateActiveStub: SinonStub;

    beforeEach(() => {
      // Create mock entity states
      mockEntityStates = {
        'sensor.test_percentage': {
          entity_id: 'sensor.test_percentage',
          state: '50',
          attributes: {
            friendly_name: 'Test Percentage',
            state_class: 'measurement',
            unit_of_measurement: '%',
          },
        },
        'sensor.desiccant_left': {
          entity_id: 'sensor.desiccant_left',
          state: '15',
          attributes: {
            friendly_name: 'Desiccant Left',
          },
        },
        'light.test_light': {
          entity_id: 'light.test_light',
          state: 'on',
          attributes: {
            friendly_name: 'Test Light',
          },
        },
        'binary_sensor.problem': {
          entity_id: 'binary_sensor.problem',
          state: 'on',
          attributes: {
            friendly_name: 'Problem Sensor',
            device_class: 'problem',
          },
        },
      };

      // Create mock entities as EntityInformation
      mockEntities = [
        {
          entity_id: 'sensor.test_percentage',
          state: '50',
          translation_key: undefined,
          attributes: {
            friendly_name: 'Test Percentage',
            state_class: 'measurement',
            unit_of_measurement: '%',
          },
        } as any as EntityInformation,
        {
          entity_id: 'sensor.desiccant_left',
          state: '15',
          translation_key: 'desiccant_left_days',
          attributes: {
            friendly_name: 'Desiccant Left',
          },
        } as any as EntityInformation,
        {
          entity_id: 'light.test_light',
          state: 'on',
          translation_key: undefined,
          attributes: {
            friendly_name: 'Test Light',
          },
        } as any as EntityInformation,
        {
          entity_id: 'binary_sensor.problem',
          state: 'on',
          translation_key: undefined,
          attributes: {
            friendly_name: 'Problem Sensor',
            device_class: 'problem',
          },
        } as any as EntityInformation,
      ];

      // Mock Home Assistant
      mockHass = {
        states: mockEntityStates,
      } as any as HomeAssistant;

      // Mock config
      mockConfig = {
        preview_count: 5,
      } as Config;

      // Mock element with expandedSections property
      mockElement = {
        expandedSections: {},
      };

      // Create stubs for the imported functions
      stateContentStub = stub(stateContentModule, 'stateContent');
      stateContentStub.returns(html`<div class="mocked-state-content"></div>`);

      percentBarStub = stub(percentBarModule, 'percentBar');
      percentBarStub.returns(html`<div class="mocked-percent-bar"></div>`);

      stateActiveStub = stub(stateActiveModule, 'stateActive');
      stateActiveStub.returns(true);
    });

    afterEach(() => {
      // Restore all stubs
      stateContentStub.restore();
      percentBarStub.restore();
      stateActiveStub.restore();
    });

    it('should return nothing when entities array is empty', async () => {
      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        [],
      );
      expect(result).to.equal(nothing);
    });

    it('should return nothing when entities is undefined', async () => {
      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        undefined as any,
      );
      expect(result).to.equal(nothing);
    });

    it('should render section with correct title', async () => {
      const sectionTitle = 'Test Section';
      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        sectionTitle,
        mockEntities,
      );
      const el = await fixture(result as TemplateResult);

      const titleElement = el.querySelector('.section-title');
      expect(titleElement?.textContent).to.equal(sectionTitle);
    });

    it('should apply "few-items" class when there are fewer entities than preview count', async () => {
      mockConfig.preview_count = 5; // Set preview count higher than number of entities
      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      const el = await fixture(result as TemplateResult);

      expect(el.classList.contains('few-items')).to.be.true;
    });

    it('should not apply "few-items" class when there are more entities than preview count', async () => {
      mockConfig.preview_count = 2; // Set preview count lower than number of entities
      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      const el = await fixture(result as TemplateResult);

      expect(el.classList.contains('few-items')).to.be.false;
    });

    it('should show the correct number of items based on preview_count when not expanded', async () => {
      mockConfig.preview_count = 2;
      mockElement.expandedSections = { 'Test Section': false };

      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      const el = await fixture(result as TemplateResult);

      const rows = el.querySelectorAll('.row');
      expect(rows.length).to.equal(2); // Should match preview_count
    });

    it('should show all items when section is expanded', async () => {
      mockConfig.preview_count = 1; // Preview count less than entities
      mockElement.expandedSections = { 'Test Section': true };

      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      const el = await fixture(result as TemplateResult);

      const rows = el.querySelectorAll('.row');
      expect(rows.length).to.equal(mockEntities.length); // Should show all entities
    });

    it('should apply "expanded" class to section when expanded', async () => {
      mockElement.expandedSections = { 'Test Section': true };

      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      const el = await fixture(result as TemplateResult);

      expect(el.classList.contains('expanded')).to.be.true;
    });

    it('should render "Show more" text with correct count when not expanded', async () => {
      mockConfig.preview_count = 1;
      mockElement.expandedSections = { 'Test Section': false };

      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      const el = await fixture(result as TemplateResult);

      const showMoreElement = el.querySelector('.show-more');
      expect(showMoreElement).to.exist;
      expect(showMoreElement?.textContent?.trim()).to.include('Show 3 more...'); // 4 entities - 1 preview = 2 more
    });

    it('should not render "Show more" text when expanded', async () => {
      mockConfig.preview_count = 1;
      mockElement.expandedSections = { 'Test Section': true };

      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      const el = await fixture(result as TemplateResult);

      const showMoreElement = el.querySelector('.show-more');
      expect(showMoreElement).to.not.exist;
    });

    it('should render chevron icon with correct direction based on expanded state', async () => {
      mockConfig.preview_count = 1; // Make sure we need expansion

      // Test collapsed state
      mockElement.expandedSections = { 'Test Section': false };
      let result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      let el = await fixture(result as TemplateResult);
      let chevronIcon = el.querySelector('ha-icon');
      expect(chevronIcon?.getAttribute('icon')).to.equal('mdi:chevron-down');

      // Test expanded state
      mockElement.expandedSections = { 'Test Section': true };
      result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      el = await fixture(result as TemplateResult);
      chevronIcon = el.querySelector('ha-icon');
      expect(chevronIcon?.getAttribute('icon')).to.equal('mdi:chevron-up');
    });

    it('should not render chevron or footer when there are fewer entities than preview count', async () => {
      mockConfig.preview_count = 5; // More than our 3 mock entities

      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      const el = await fixture(result as TemplateResult);

      const chevron = el.querySelector('.section-chevron');
      const footer = el.querySelector('.section-footer');

      expect(chevron).to.not.exist;
      expect(footer).to.not.exist;
    });

    it('should call percentBar only for percentage measurement entities', async () => {
      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      await fixture(result as TemplateResult);

      // Should be called only for the percentage entity
      expect(percentBarStub.callCount).to.equal(1);
      expect(percentBarStub.firstCall.args[0].entity_id).to.equal(
        'sensor.test_percentage',
      );
    });

    it('should toggle expanded state when clicking on chevron', async () => {
      mockConfig.preview_count = 1; // Ensure we need expansion
      mockElement.expandedSections = { 'Test Section': false };

      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      const el = await fixture(result as TemplateResult);

      const chevron = el.querySelector('.section-chevron') as HTMLElement;
      expect(chevron).to.exist;

      // Simulate click
      chevron.click();

      // Check that the expanded state was toggled
      expect(mockElement.expandedSections['Test Section']).to.be.true;
    });

    it('should toggle expanded state when clicking on "Show more"', async () => {
      mockConfig.preview_count = 1; // Ensure we need expansion
      mockElement.expandedSections = { 'Test Section': false };

      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
      );
      const el = await fixture(result as TemplateResult);

      const showMore = el.querySelector('.show-more') as HTMLElement;
      expect(showMore).to.exist;

      // Simulate click
      showMore.click();

      // Check that the expanded state was toggled
      expect(mockElement.expandedSections['Test Section']).to.be.true;
    });

    it('should not show percentBar for entities without proper conditions', async () => {
      // Create a new array with only entities that shouldn't display percent bars
      const nonPercentEntities = [
        mockEntities[2], // light.test_light
        mockEntities[3], // binary_sensor.problem
      ] as EntityInformation[];

      const result = renderSection(
        mockElement,
        mockHass,
        mockConfig,
        'Test Section',
        nonPercentEntities,
      );

      await fixture(result as TemplateResult);

      // Verify percentBar was not called for these entities
      expect(percentBarStub.callCount).to.equal(0);
    });
  });
};
