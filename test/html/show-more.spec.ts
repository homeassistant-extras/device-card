import { DeviceCard } from '@device/card';
import { chevron, showMore } from '@html/show-more';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

export default () => {
  describe('show-more.ts', () => {
    // Common test variables
    let mockElement: DeviceCard;
    let mockEntities: EntityInformation[];

    beforeEach(() => {
      // Create a mock DeviceCard element
      mockElement = {
        expandedSections: {},
      } as DeviceCard;

      // Create mock entities for testing
      mockEntities = [
        {
          entity_id: 'sensor.test_1',
          state: '50',
          translation_key: undefined,
          attributes: {
            friendly_name: 'Test 1',
          },
          isActive: false,
          isProblemEntity: false,
        } as EntityInformation,
        {
          entity_id: 'sensor.test_2',
          state: '75',
          translation_key: undefined,
          attributes: {
            friendly_name: 'Test 2',
          },
          isActive: false,
          isProblemEntity: false,
        } as EntityInformation,
        {
          entity_id: 'sensor.test_3',
          state: '25',
          translation_key: undefined,
          attributes: {
            friendly_name: 'Test 3',
          },
          isActive: false,
          isProblemEntity: false,
        } as EntityInformation,
      ];
    });

    describe('toggleSection functionality', () => {
      it('should toggle section state when interacting with chevron', async () => {
        // Initial state
        mockElement.expandedSections = { 'Test Section': false };

        // Render chevron
        const result = chevron(mockElement, 'Test Section', false);
        const el = (await fixture(result as TemplateResult)) as HTMLElement;

        // Simulate click on chevron
        el.click();

        // Verify state was toggled
        expect(mockElement.expandedSections['Test Section']).to.be.true;
      });

      it('should toggle section state when interacting with show more', async () => {
        // Initial state
        mockElement.expandedSections = { 'Test Section': false };

        // Render show more
        const result = showMore(
          mockElement,
          'Test Section',
          mockEntities,
          false,
          1,
        );
        const el = await fixture(result as TemplateResult);

        // Find and click the show more element
        const showMoreEl = el.querySelector('.show-more') as HTMLElement;
        showMoreEl.click();

        // Verify state was toggled
        expect(mockElement.expandedSections['Test Section']).to.be.true;
      });
    });

    describe('chevron component', () => {
      it('should render a down chevron when section is collapsed', async () => {
        const result = chevron(mockElement, 'Test Section', false);
        const el = await fixture(result as TemplateResult);

        const icon = el.querySelector('ha-icon');
        expect(icon?.getAttribute('icon')).to.equal('mdi:chevron-down');
        expect(el.classList.contains('expanded')).to.be.false;
      });

      it('should render an up chevron when section is expanded', async () => {
        const result = chevron(mockElement, 'Test Section', true);
        const el = await fixture(result as TemplateResult);

        const icon = el.querySelector('ha-icon');
        expect(icon?.getAttribute('icon')).to.equal('mdi:chevron-up');
        expect(el.classList.contains('expanded')).to.be.true;
      });
    });

    describe('showMore component', () => {
      it('should not render show more text when section is expanded', async () => {
        const result = showMore(
          mockElement,
          'Test Section',
          mockEntities,
          true,
          1,
        );
        const el = await fixture(result as TemplateResult);

        const showMoreText = el.querySelector('.show-more');
        expect(showMoreText).to.not.exist;
      });

      it('should show correct count of hidden entities when collapsed', async () => {
        const result = showMore(
          mockElement,
          'Test Section',
          mockEntities,
          false,
          1,
        );
        const el = await fixture(result as TemplateResult);

        const showMoreText = el.querySelector('.show-more');
        expect(showMoreText?.textContent?.trim()).to.equal('Show 2 more...');
      });

      it('should display correct message with different number of hidden entities', async () => {
        // Test with showing 2 of 3 entities (1 hidden)
        const result = showMore(
          mockElement,
          'Test Section',
          mockEntities,
          false,
          2,
        );
        const el = await fixture(result as TemplateResult);

        const showMoreText = el.querySelector('.show-more');
        expect(showMoreText?.textContent?.trim()).to.equal('Show 1 more...');
      });
    });
  });
};
