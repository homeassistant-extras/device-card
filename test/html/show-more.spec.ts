import { chevron, showMore } from '@html/show-more';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

describe('show-more.ts', () => {
  let mockEntities: EntityInformation[];

  beforeEach(() => {
    mockEntities = [
      {
        entity_id: 'sensor.test_1',
        state: '50',
        translation_key: undefined,
        attributes: {
          friendly_name: 'Test 1',
        },
        name: 'Test 1',
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
        name: 'Test 2',
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
        name: 'Test 3',
        isActive: false,
        isProblemEntity: false,
      } as EntityInformation,
    ];
  });

  describe('toggle callbacks', () => {
    it('should invoke onToggleSection when interacting with chevron', async () => {
      let toggles = 0;
      const onToggle = () => {
        toggles += 1;
      };

      const result = chevron(false, onToggle);
      const el = await fixture(result as TemplateResult);

      (el as HTMLElement).click();

      expect(toggles).to.equal(1);
    });

    it('should invoke onToggleSection when interacting with show more', async () => {
      let toggles = 0;
      const onToggle = () => {
        toggles += 1;
      };

      const result = showMore(mockEntities, false, 1, onToggle);
      const el = await fixture(result as TemplateResult);

      const showMoreEl = el.querySelector('.show-more') as HTMLElement;
      showMoreEl.click();

      expect(toggles).to.equal(1);
    });
  });

  describe('chevron component', () => {
    it('should render a down chevron when section is collapsed', async () => {
      const result = chevron(false, () => {});
      const el = await fixture(result as TemplateResult);

      const icon = el.querySelector('ha-icon');
      expect(icon?.getAttribute('icon')).to.equal('mdi:chevron-down');
      expect(el.classList.contains('expanded')).to.be.false;
    });

    it('should render an up chevron when section is expanded', async () => {
      const result = chevron(true, () => {});
      const el = await fixture(result as TemplateResult);

      const icon = el.querySelector('ha-icon');
      expect(icon?.getAttribute('icon')).to.equal('mdi:chevron-up');
      expect(el.classList.contains('expanded')).to.be.true;
    });
  });

  describe('showMore component', () => {
    it('should not render show more text when section is expanded', async () => {
      const result = showMore(mockEntities, true, 1, () => {});
      const el = await fixture(result as TemplateResult);

      const showMoreText = el.querySelector('.show-more');
      expect(showMoreText).to.not.exist;
    });

    it('should show correct count of hidden entities when collapsed', async () => {
      const result = showMore(mockEntities, false, 1, () => {});
      const el = await fixture(result as TemplateResult);

      const showMoreText = el.querySelector('.show-more');
      expect(showMoreText?.textContent?.trim()).to.equal('Show 2 more...');
    });

    it('should display correct message with different number of hidden entities', async () => {
      const result = showMore(mockEntities, false, 2, () => {});
      const el = await fixture(result as TemplateResult);

      const showMoreText = el.querySelector('.show-more');
      expect(showMoreText?.textContent?.trim()).to.equal('Show 1 more...');
    });
  });
});
