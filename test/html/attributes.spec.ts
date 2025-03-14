import { attributes } from '@html/attributes';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

export default () => {
  describe('attributes.ts', () => {
    it('should render a list of attributes', async () => {
      const testAttributes = {
        temperature: 22,
        humidity: 45,
        unit_of_measurement: '°C',
        device_class: 'temperature',
      };

      const result = attributes(testAttributes);
      const el = await fixture(result as TemplateResult);

      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('entity-attributes')).to.be.true;

      // Check that all attributes are rendered
      const attributeRows = el.querySelectorAll('.attribute-row');
      expect(attributeRows.length).to.equal(4);

      // Check specific attribute values
      const attributeValues = Array.from(attributeRows).map((row) => {
        const key = row
          .querySelector('.attribute-key')
          ?.textContent?.replace(':', '');
        const value = row.querySelector('.attribute-value')?.textContent;
        return { key, value };
      });

      expect(attributeValues[0]?.key).to.equal('temperature');
      expect(attributeValues[0]?.value).to.equal('22');
      expect(attributeValues[1]?.key).to.equal('humidity');
      expect(attributeValues[1]?.value).to.equal('45');
      expect(attributeValues[2]?.key).to.equal('unit_of_measurement');
      expect(attributeValues[2]?.value).to.equal('°C');
      expect(attributeValues[3]?.key).to.equal('device_class');
      expect(attributeValues[3]?.value).to.equal('temperature');
    });

    it('should filter out excluded attributes', async () => {
      const testAttributes = {
        temperature: 22,
        icon: 'mdi:thermometer',
        friendly_name: 'Living Room Temperature',
        entity_picture: '/images/temp.jpg',
        supported_features: 1,
        assumed_state: false,
        attribution: 'Data provided by API',
        hidden: false,
      };

      const result = attributes(testAttributes);
      const el = await fixture(result as TemplateResult);

      // Only temperature should remain
      const attributeRows = el.querySelectorAll('.attribute-row');
      expect(attributeRows.length).to.equal(1);

      const key = attributeRows[0]
        ?.querySelector('.attribute-key')
        ?.textContent?.replace(':', '');
      const value =
        attributeRows[0]?.querySelector('.attribute-value')?.textContent;

      expect(key).to.equal('temperature');
      expect(value).to.equal('22');
    });

    it('should handle empty attributes after filtering', async () => {
      const testAttributes = {
        icon: 'mdi:thermometer',
        friendly_name: 'Living Room Temperature',
      };

      const result = attributes(testAttributes);
      const el = await fixture(result as TemplateResult);

      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('entity-attributes-empty')).to.be.true;
      expect(el.textContent?.trim()).to.equal('No additional attributes');
    });

    it('should handle object values by converting to JSON string', async () => {
      const testAttributes = {
        options: { min: 0, max: 100, step: 5 },
        coordinates: { lat: 37.7749, lng: -122.4194 },
      };

      const result = attributes(testAttributes);
      const el = await fixture(result as TemplateResult);

      const attributeRows = el.querySelectorAll('.attribute-row');
      expect(attributeRows.length).to.equal(2);

      const firstValue =
        attributeRows[0]?.querySelector('.attribute-value')?.textContent;
      const secondValue =
        attributeRows[1]?.querySelector('.attribute-value')?.textContent;

      expect(firstValue).to.equal(
        JSON.stringify({ min: 0, max: 100, step: 5 }),
      );
      expect(secondValue).to.equal(
        JSON.stringify({ lat: 37.7749, lng: -122.4194 }),
      );
    });

    it('should handle empty input attributes', async () => {
      const result = attributes({});
      const el = await fixture(result as TemplateResult);

      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('entity-attributes-empty')).to.be.true;
    });

    it('should handle various data types', async () => {
      const testAttributes = {
        boolean_value: true,
        number_value: 42,
        string_value: 'test string',
        null_value: null,
        array_value: [1, 2, 3],
      };

      const result = attributes(testAttributes);
      const el = await fixture(result as TemplateResult);

      const attributeRows = el.querySelectorAll('.attribute-row');
      expect(attributeRows.length).to.equal(5);

      const values = Array.from(attributeRows).map(
        (row) => row.querySelector('.attribute-value')?.textContent,
      );

      expect(values[0]).to.equal('true');
      expect(values[1]).to.equal('42');
      expect(values[2]).to.equal('test string');
      expect(values[3]).to.equal('null');
      expect(values[4]).to.equal('[1,2,3]');
    });
  });
};
