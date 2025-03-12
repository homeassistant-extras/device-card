import { percentBar } from '@html/percent';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

export default () => {
  describe('percent.ts', () => {
    // Common test variables
    let mockEntity: EntityInformation;

    beforeEach(() => {
      // Set up base mock entity for testing
      mockEntity = {
        entity_id: 'sensor.test_percentage',
        state: '50',
        translation_key: undefined,
        attributes: {
          state_class: 'measurement',
          unit_of_measurement: '%',
        },
        isActive: false,
        isProblemEntity: false,
      } as EntityInformation;
    });

    it('should render a percentage gauge with correct width', async () => {
      const result = percentBar(mockEntity);
      const el = await fixture(result as TemplateResult);

      // Verify the gauge exists
      const fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement).to.exist;

      // Verify the width is set correctly
      expect((fillElement as HTMLElement).style.width).to.equal('50%');
    });

    it('should apply "high" class for percentages above 60', async () => {
      mockEntity.state = '75';
      const result = percentBar(mockEntity);
      const el = await fixture(result as TemplateResult);

      const fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement).to.exist;
      expect(fillElement?.classList.contains('high')).to.be.true;
      expect(fillElement?.classList.contains('medium')).to.be.false;
      expect(fillElement?.classList.contains('low')).to.be.false;
    });

    it('should apply "medium" class for percentages between 31 and 60', async () => {
      mockEntity.state = '45';
      const result = percentBar(mockEntity);
      const el = await fixture(result as TemplateResult);

      const fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement).to.exist;
      expect(fillElement?.classList.contains('medium')).to.be.true;
      expect(fillElement?.classList.contains('high')).to.be.false;
      expect(fillElement?.classList.contains('low')).to.be.false;
    });

    it('should apply "low" class for percentages 30 and below', async () => {
      mockEntity.state = '20';
      const result = percentBar(mockEntity);
      const el = await fixture(result as TemplateResult);

      const fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement).to.exist;
      expect(fillElement?.classList.contains('low')).to.be.true;
      expect(fillElement?.classList.contains('medium')).to.be.false;
      expect(fillElement?.classList.contains('high')).to.be.false;
    });

    it('should handle boundary values correctly', async () => {
      // Test boundary between low and medium
      mockEntity.state = '30';
      let result = percentBar(mockEntity);
      let el = await fixture(result as TemplateResult);

      let fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement?.classList.contains('low')).to.be.true;

      mockEntity.state = '31';
      result = percentBar(mockEntity);
      el = await fixture(result as TemplateResult);

      fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement?.classList.contains('medium')).to.be.true;

      // Test boundary between medium and high
      mockEntity.state = '60';
      result = percentBar(mockEntity);
      el = await fixture(result as TemplateResult);

      fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement?.classList.contains('medium')).to.be.true;

      mockEntity.state = '61';
      result = percentBar(mockEntity);
      el = await fixture(result as TemplateResult);

      fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement?.classList.contains('high')).to.be.true;
    });

    it('should handle extreme values correctly', async () => {
      // Test 0%
      mockEntity.state = '0';
      let result = percentBar(mockEntity);
      let el = await fixture(result as TemplateResult);

      let fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement).to.exist;
      expect((fillElement as HTMLElement).style.width).to.equal('0%');
      expect(fillElement?.classList.contains('low')).to.be.true;

      // Test 100%
      mockEntity.state = '100';
      result = percentBar(mockEntity);
      el = await fixture(result as TemplateResult);

      fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement).to.exist;
      expect((fillElement as HTMLElement).style.width).to.equal('100%');
      expect(fillElement?.classList.contains('high')).to.be.true;
    });

    it('should handle invalid state values by converting them to numbers', async () => {
      // Test non-numeric state
      mockEntity.state = 'invalid';
      const result = percentBar(mockEntity);
      const el = await fixture(result as TemplateResult);

      const fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement).to.exist;
      // NaN is converted to 0 for width
      expect((fillElement as HTMLElement).style.width).to.equal('');
      expect(fillElement?.classList.contains('low')).to.be.true;
    });

    it('should handle CSS class structure correctly', async () => {
      const result = percentBar(mockEntity);
      const el = await fixture(result as TemplateResult);

      // Verify outer container class
      expect(el.classList.contains('percent-gauge')).to.be.true;

      // Verify inner fill class
      const fillElement = el.querySelector('.percent-gauge-fill');
      expect(fillElement).to.exist;
    });
  });
};
