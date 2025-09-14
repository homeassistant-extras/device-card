import * as sortEntitiesModule from '@common/sort';
import * as featureModule from '@config/feature';
import type { Config, Expansions } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import * as rowModule from '@html/row';
import { renderSection } from '@html/section';
import * as showMoreModule from '@html/show-more';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation, SortConfig } from '@type/config';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('section.ts', () => {
  // Common test variables
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let mockElement: any;
  let mockExpansions: Expansions;
  let mockEntities: EntityInformation[];
  let mockUpdater: (expansion: Expansions) => void;

  // Stubs for extracted components
  let rowStub: sinon.SinonStub;
  let chevronStub: sinon.SinonStub;
  let showMoreStub: sinon.SinonStub;
  let hasFeatureStub: sinon.SinonStub;
  let sortEntitiesStub: sinon.SinonStub;

  beforeEach(() => {
    // Create mock entities
    mockEntities = [
      {
        entity_id: 'sensor.test_1',
        state: '50',
        translation_key: undefined,
        attributes: { friendly_name: 'Test 1' },
        isActive: false,
        isProblemEntity: false,
      } as EntityInformation,
      {
        entity_id: 'sensor.test_2',
        state: '75',
        translation_key: undefined,
        attributes: { friendly_name: 'Test 2' },
        isActive: false,
        isProblemEntity: false,
      } as EntityInformation,
      {
        entity_id: 'sensor.test_3',
        state: '25',
        translation_key: undefined,
        attributes: { friendly_name: 'Test 3' },
        isActive: false,
        isProblemEntity: false,
      } as EntityInformation,
    ];

    // Mock Home Assistant
    mockHass = {} as HomeAssistant;

    // Mock config
    mockConfig = {
      preview_count: 3, // Default preview count
    } as Config;

    // Mock element with expandedSections property
    mockElement = {
      expandedEntities: {},
    };

    mockExpansions = {
      expandedSections: {},
      expandedEntities: {},
    };

    mockUpdater = (expansion: Expansions) => {
      mockExpansions = expansion;
    };

    // Create stubs for the extracted components
    rowStub = stub(rowModule, 'row');
    rowStub.resolves(html`<div class="mocked-row"></div>`);

    chevronStub = stub(showMoreModule, 'chevron');
    chevronStub.returns(html`<div class="mocked-chevron"></div>`);

    showMoreStub = stub(showMoreModule, 'showMore');
    showMoreStub.returns(html`<div class="mocked-show-more"></div>`);

    hasFeatureStub = stub(featureModule, 'hasFeature');
    hasFeatureStub.returns(false);

    sortEntitiesStub = stub(sortEntitiesModule, 'sortEntities');
    sortEntitiesStub.returns(mockEntities);
  });

  afterEach(() => {
    // Restore all stubs
    rowStub.restore();
    chevronStub.restore();
    showMoreStub.restore();
    hasFeatureStub.restore();
    sortEntitiesStub.restore();
  });

  describe('renderSection', () => {
    it('should return nothing when entities array is empty', async () => {
      const result = await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        [],
        mockUpdater,
      );
      expect(result).to.equal(nothing);
    });

    it('should return nothing when entities is undefined', async () => {
      const result = await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        undefined as any,
        mockUpdater,
      );
      expect(result).to.equal(nothing);
    });

    it('should render section with correct title', async () => {
      const sectionTitle = 'Test Section';
      const result = await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        sectionTitle,
        mockEntities,
        mockUpdater,
      );
      const el = await fixture(result as TemplateResult);

      const titleElement = el.querySelector('.section-title');
      expect(titleElement?.textContent).to.equal(sectionTitle);
    });

    it('should apply appropriate section classes based on expansion state and number of items', async () => {
      // Test with few items (no expansion needed)
      mockConfig.preview_count = 5; // More than our 3 mock entities
      let result = await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );
      let el = await fixture(result as TemplateResult);
      expect(el.classList.contains('few-items')).to.be.true;
      expect(el.classList.contains('expanded')).to.be.false;

      // Test with many items, expanded
      mockConfig.preview_count = 1; // Less than our 3 mock entities
      mockExpansions.expandedSections['Test Section'] = true;
      result = await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );
      el = await fixture(result as TemplateResult);
      expect(el.classList.contains('few-items')).to.be.false;
      expect(el.classList.contains('expanded')).to.be.true;

      // Test with many items, collapsed
      mockExpansions.expandedSections['Test Section'] = false;
      result = await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );
      el = await fixture(result as TemplateResult);
      expect(el.classList.contains('few-items')).to.be.false;
      expect(el.classList.contains('expanded')).to.be.false;
    });

    it('should call row component for each entity to display', async () => {
      // Test with 3 entities, all displayed
      mockConfig.preview_count = 3;
      await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );

      // Should call row once for each entity
      expect(rowStub.callCount).to.equal(3);

      // Check that row was called with the correct arguments
      mockEntities.forEach((entity, index) => {
        expect(rowStub.getCall(index).args[0]).to.equal(mockHass);
        expect(rowStub.getCall(index).args[1]).to.equal(entity);
        expect(rowStub.getCall(index).args[2]).to.equal(mockElement);
      });
    });

    it('should limit displayed entities when not expanded and preview_count is less than total', async () => {
      // Set preview count to 2 (less than our 3 entities)
      mockConfig.preview_count = 2;
      mockExpansions.expandedSections['Test Section'] = false;

      await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );

      // Should only call row for the first 2 entities
      expect(rowStub.callCount).to.equal(2);

      // Check that row was called with the correct entities
      expect(rowStub.firstCall.args[1]).to.equal(mockEntities[0]);
      expect(rowStub.secondCall.args[1]).to.equal(mockEntities[1]);
    });

    it('should show all entities when expanded regardless of preview_count', async () => {
      // Set preview count to 1 (less than our 3 entities)
      mockConfig.preview_count = 1;
      mockExpansions.expandedSections['Test Section'] = true;

      await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );

      // Should call row for all 3 entities
      expect(rowStub.callCount).to.equal(3);
    });

    it('should call chevron component when section needs expansion', async () => {
      // Set preview count to 1 (less than our 3 entities)
      mockConfig.preview_count = 1;
      mockExpansions.expandedSections['Test Section'] = false;

      await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );

      // Should call chevron with the correct arguments
      expect(chevronStub.calledOnce).to.be.true;
      expect(chevronStub.firstCall.args[0]).to.equal(mockExpansions);
      expect(chevronStub.firstCall.args[1]).to.equal('Test Section');
      expect(chevronStub.firstCall.args[2]).to.be.false; // isExpanded = false
    });

    it('should not call chevron component when no expansion is needed', async () => {
      // Set preview count to 5 (more than our 3 entities)
      mockConfig.preview_count = 5;

      await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );

      // Should not call chevron
      expect(chevronStub.called).to.be.false;
    });

    it('should call showMore component when section needs expansion', async () => {
      // Set preview count to 1 (less than our 3 entities)
      mockConfig.preview_count = 1;
      mockExpansions.expandedSections['Test Section'] = false;

      await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );

      // Should call showMore with the correct arguments
      expect(showMoreStub.calledOnce).to.be.true;
      expect(showMoreStub.firstCall.args[0]).to.equal(mockExpansions);
      expect(showMoreStub.firstCall.args[1]).to.equal('Test Section');
      expect(showMoreStub.firstCall.args[2]).to.equal(mockEntities);
      expect(showMoreStub.firstCall.args[3]).to.be.false; // isExpanded = false
      expect(showMoreStub.firstCall.args[4]).to.equal(1); // size = 1
    });

    it('should not call showMore component when no expansion is needed', async () => {
      // Set preview count to 5 (more than our 3 entities)
      mockConfig.preview_count = 5;

      await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );

      // Should not call showMore
      expect(showMoreStub.called).to.be.false;
    });

    it('should apply compact class when compact feature is enabled', async () => {
      // Set hasFeature to return true for 'compact'
      hasFeatureStub.withArgs(mockConfig, 'compact').returns(true);

      const result = await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );
      const el = await fixture(result as TemplateResult);

      // Verify compact class is applied
      expect(el.classList.contains('compact')).to.be.true;
    });

    it('should not apply compact class when compact feature is disabled', async () => {
      // Set hasFeature to return false for 'compact'
      hasFeatureStub.withArgs(mockConfig, 'compact').returns(false);

      const result = await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );
      const el = await fixture(result as TemplateResult);

      // Verify compact class is not applied
      expect(el.classList.contains('compact')).to.be.false;
    });

    it('should not show "show more" when compact feature is enabled', async () => {
      // Set preview count to 1 (less than our 3 entities) to trigger "show more"
      mockConfig.preview_count = 1;
      mockExpansions.expandedSections['Test Section'] = false;

      // Set hasFeature to return true for 'compact'
      hasFeatureStub.withArgs(mockConfig, 'compact').returns(true);

      await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );

      // Verify showMore was not called (should be hidden in compact mode)
      expect(showMoreStub.called).to.be.false;

      // Verify chevron was still called (should be visible in compact mode)
      expect(chevronStub.called).to.be.true;
    });

    it('should show "show more" when compact feature is disabled', async () => {
      // Set preview count to 1 (less than our 3 entities) to trigger "show more"
      mockConfig.preview_count = 1;
      mockExpansions.expandedSections['Test Section'] = false;

      // Set hasFeature to return false for 'compact'
      hasFeatureStub.withArgs(mockConfig, 'compact').returns(false);

      await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );

      // Verify showMore was called (should be visible in normal mode)
      expect(showMoreStub.called).to.be.true;
    });

    it('should call sortEntities with the correct parameters', async () => {
      const sortConfig: SortConfig = { type: 'name', direction: 'asc' };
      mockConfig.sort = sortConfig;

      await renderSection(
        mockElement,
        mockExpansions,
        mockHass,
        mockConfig,
        'Test Section',
        mockEntities,
        mockUpdater,
      );

      // Verify sortEntities was called with the correct parameters
      expect(sortEntitiesStub.calledOnce).to.be.true;
      expect(sortEntitiesStub.firstCall.args[0]).to.equal(mockEntities);
      expect(sortEntitiesStub.firstCall.args[1]).to.equal(sortConfig);

      // Restore the stub
      sortEntitiesStub.restore();
    });
  });
});
