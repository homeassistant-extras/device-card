import * as sortEntitiesModule from '@common/sort';
import * as featureModule from '@config/feature';
import type { Config } from '@device/types';
import type { OrderedSection } from '@/helpers/device-section';
import type { HomeAssistant } from '@hass/types';
import { renderSection } from '@html/section';
import * as showMoreModule from '@html/show-more';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation, SortConfig } from '@type/config';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('section.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let mockEntities: EntityInformation[];
  let mockSection: OrderedSection;

  let chevronStub: sinon.SinonStub;
  let showMoreStub: sinon.SinonStub;
  let hasFeatureStub: sinon.SinonStub;
  let sortEntitiesStub: sinon.SinonStub;

  const noopToggle = () => {};

  beforeEach(() => {
    mockEntities = [
      {
        entity_id: 'sensor.test_1',
        state: '50',
        translation_key: undefined,
        attributes: { friendly_name: 'Test 1' },
        name: 'Test 1',
        isActive: false,
        isProblemEntity: false,
      } as EntityInformation,
      {
        entity_id: 'sensor.test_2',
        state: '75',
        translation_key: undefined,
        attributes: { friendly_name: 'Test 2' },
        name: 'Test 2',
        isActive: false,
        isProblemEntity: false,
      } as EntityInformation,
      {
        entity_id: 'sensor.test_3',
        state: '25',
        translation_key: undefined,
        attributes: { friendly_name: 'Test 3' },
        name: 'Test 3',
        isActive: false,
        isProblemEntity: false,
      } as EntityInformation,
    ];

    mockHass = {} as HomeAssistant;

    mockConfig = {
      preview_count: 3,
    } as Config;

    mockSection = {
      key: 'test',
      name: 'Test Section',
      entities: mockEntities,
    };

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
    chevronStub.restore();
    showMoreStub.restore();
    hasFeatureStub.restore();
    sortEntitiesStub.restore();
  });

  describe('renderSection', () => {
    it('should return nothing when entities array is empty', () => {
      const result = renderSection(
        mockHass,
        mockConfig,
        { ...mockSection, entities: [] },
        false,
        noopToggle,
      );
      expect(result).to.equal(nothing);
    });

    it('should return nothing when entities is undefined', () => {
      const result = renderSection(
        mockHass,
        mockConfig,
        { ...mockSection, entities: undefined as any },
        false,
        noopToggle,
      );
      expect(result).to.equal(nothing);
    });

    it('should render section with correct title', async () => {
      const sectionTitle = 'Test Section';
      const result = renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );
      const el = await fixture(result as TemplateResult);

      expect(el.querySelector('.section-title')?.textContent).to.equal(
        sectionTitle,
      );
    });

    it('should apply appropriate section classes based on expansion state and number of items', async () => {
      mockConfig.preview_count = 5;
      let result = renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );
      let el = await fixture(result as TemplateResult);
      expect(el.classList.contains('few-items')).to.be.true;
      expect(el.classList.contains('expanded')).to.be.false;

      mockConfig.preview_count = 1;
      result = renderSection(
        mockHass,
        mockConfig,
        mockSection,
        true,
        noopToggle,
      );
      el = await fixture(result as TemplateResult);
      expect(el.classList.contains('few-items')).to.be.false;
      expect(el.classList.contains('expanded')).to.be.true;

      result = renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );
      el = await fixture(result as TemplateResult);
      expect(el.classList.contains('few-items')).to.be.false;
      expect(el.classList.contains('expanded')).to.be.false;
    });

    it('should render a device-card-row for each entity to display with props set', async () => {
      mockConfig.preview_count = 3;
      const result = renderSection(
        mockHass,
        mockConfig,
        mockSection,
        true,
        noopToggle,
      );

      const el = await fixture(result as TemplateResult);
      const rows = Array.from(el.querySelectorAll('device-card-row'));
      expect(rows.length).to.equal(3);

      mockEntities.forEach((entity, index) => {
        const rowEl = rows[index] as any;
        expect(rowEl.hass).to.equal(mockHass);
        expect(rowEl.entity).to.equal(entity);
        expect(rowEl.config).to.equal(mockConfig);
      });
    });

    it('should limit displayed entities when not expanded and preview_count is less than total', async () => {
      mockConfig.preview_count = 2;

      const result = renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );

      const el = await fixture(result as TemplateResult);
      const rows = Array.from(el.querySelectorAll('device-card-row')) as any[];
      expect(rows.length).to.equal(2);
      expect(rows[0].entity).to.equal(mockEntities[0]);
      expect(rows[1].entity).to.equal(mockEntities[1]);
    });

    it('should show all entities when expanded regardless of preview_count', async () => {
      mockConfig.preview_count = 1;

      const result = renderSection(
        mockHass,
        mockConfig,
        mockSection,
        true,
        noopToggle,
      );

      const el = await fixture(result as TemplateResult);
      const rows = Array.from(el.querySelectorAll('device-card-row'));
      expect(rows.length).to.equal(3);
      expect(chevronStub.calledOnce).to.be.true;
      expect(chevronStub.firstCall.args[0]).to.be.true;
      expect(chevronStub.firstCall.args[1]).to.be.a('function');
    });

    it('should call chevron component when section needs expansion', () => {
      mockConfig.preview_count = 1;

      renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );

      expect(chevronStub.calledOnce).to.be.true;
      expect(chevronStub.firstCall.args[0]).to.be.false;
      expect(chevronStub.firstCall.args[1]).to.be.a('function');
    });

    it('should not call chevron component when no expansion is needed', () => {
      mockConfig.preview_count = 5;

      renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );

      expect(chevronStub.called).to.be.false;
    });

    it('should call showMore component when section needs expansion', () => {
      mockConfig.preview_count = 1;

      renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );

      expect(showMoreStub.calledOnce).to.be.true;
      expect(showMoreStub.firstCall.args[0]).to.equal(mockEntities);
      expect(showMoreStub.firstCall.args[1]).to.be.false;
      expect(showMoreStub.firstCall.args[2]).to.equal(1);
      expect(showMoreStub.firstCall.args[3]).to.be.a('function');
    });

    it('should not call showMore component when no expansion is needed', () => {
      mockConfig.preview_count = 5;

      renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );

      expect(showMoreStub.called).to.be.false;
    });

    it('should apply compact class when compact feature is enabled', async () => {
      hasFeatureStub.withArgs(mockConfig, 'compact').returns(true);

      const result = renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );
      const el = await fixture(result as TemplateResult);

      expect(el.classList.contains('compact')).to.be.true;
    });

    it('should not apply compact class when compact feature is disabled', async () => {
      hasFeatureStub.withArgs(mockConfig, 'compact').returns(false);

      const result = renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );
      const el = await fixture(result as TemplateResult);

      expect(el.classList.contains('compact')).to.be.false;
    });

    it('should not show "show more" when compact feature is enabled', () => {
      mockConfig.preview_count = 1;
      hasFeatureStub.withArgs(mockConfig, 'compact').returns(true);

      renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );

      expect(showMoreStub.called).to.be.false;
      expect(chevronStub.called).to.be.true;
    });

    it('should show "show more" when compact feature is disabled', () => {
      mockConfig.preview_count = 1;
      hasFeatureStub.withArgs(mockConfig, 'compact').returns(false);

      renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );

      expect(showMoreStub.called).to.be.true;
    });

    it('should call sortEntities with the correct parameters', () => {
      const sortConfig: SortConfig = { type: 'name', direction: 'asc' };
      mockConfig.sort = sortConfig;

      renderSection(
        mockHass,
        mockConfig,
        mockSection,
        false,
        noopToggle,
      );

      expect(sortEntitiesStub.calledOnce).to.be.true;
      expect(sortEntitiesStub.firstCall.args[0]).to.equal(mockEntities);
      expect(sortEntitiesStub.firstCall.args[1]).to.equal(sortConfig);
    });
  });
});
