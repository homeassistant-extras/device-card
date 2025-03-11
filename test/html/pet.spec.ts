import { pet } from '@html/pet';
import { fixture } from '@open-wc/testing-helpers';
import type { Device, EntityInformation } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

export default () => {
  describe('pet.ts', () => {
    // Common test variables
    let mockUnit: Device;
    let mockSensors: EntityInformation[];

    beforeEach(() => {
      // Create mock sensor with pet information
      const petSensor = {
        entity_id: 'sensor.petkit_pet_last_use',
        state: '2025-03-08T14:30:00',
        translation_key: 'pet_last_use_date',
        attributes: {
          friendly_name: 'Pet Last Use',
          entity_picture: 'https://example.com/pet.jpg',
        },
      } as EntityInformation;

      // Create other mock sensors
      const otherSensor = {
        entity_id: 'sensor.petkit_status',
        state: 'active',
        translation_key: 'status',
        attributes: {
          friendly_name: 'Status',
        },
      } as EntityInformation;

      // Combine sensors into an array
      mockSensors = [petSensor, otherSensor];

      // Create mock PetKit unit
      mockUnit = {
        name: "Fluffy's Feeder",
        model: 'PetKit V1 123',
        sensors: mockSensors,
        controls: [],
        diagnostics: [],
        configurations: [],
        problemEntities: [],
      };
    });

    it('should render a card with pet information', async () => {
      const result = pet(mockUnit);
      const el = await fixture(result as TemplateResult);

      // Verify the rendered card has the correct structure
      expect(el.tagName.toLowerCase()).to.equal('ha-card');
      expect(el.classList.contains('portrait')).to.be.true;

      // Check the image is present with the correct source
      const imgElement = el.querySelector('img');
      expect(imgElement).to.exist;
      expect(imgElement?.getAttribute('src')).to.equal(
        'https://example.com/pet.jpg',
      );

      // Check the title is present with the correct unit name
      const titleElement = el.querySelector('.title span');
      expect(titleElement).to.exist;
      expect(titleElement?.textContent).to.equal("Fluffy's Feeder");
    });

    it('should handle missing pet sensor', async () => {
      // Create a unit without the pet_last_use_date sensor
      const unitWithoutPet: Device = {
        ...mockUnit,
        sensors: [mockSensors[1]!], // Only include the non-pet sensor
      };

      const result = pet(unitWithoutPet);
      const el = await fixture(result as TemplateResult);

      // Verify the card still renders
      expect(el.tagName.toLowerCase()).to.equal('ha-card');

      // The image should exist but have an undefined src
      const imgElement = el.querySelector('img');
      expect(imgElement).to.exist;
      expect(imgElement?.getAttribute('src')).to.equal('');

      // The title should still show the unit name
      const titleElement = el.querySelector('.title span');
      expect(titleElement).to.exist;
      expect(titleElement?.textContent).to.equal("Fluffy's Feeder");
    });

    it('should handle empty sensors array', async () => {
      // Create a unit with an empty sensors array
      const emptyUnit: Device = {
        ...mockUnit,
        sensors: [],
      };

      const result = pet(emptyUnit);
      const el = await fixture(result as TemplateResult);

      // Verify the card still renders
      expect(el.tagName.toLowerCase()).to.equal('ha-card');

      // The image should exist but have an undefined src
      const imgElement = el.querySelector('img');
      expect(imgElement).to.exist;
      expect(imgElement?.getAttribute('src')).to.be.equal('');
    });
  });
};
