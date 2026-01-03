import { picture } from '@html/picture';
import { fixture } from '@open-wc/testing-helpers';
import type { Device, EntityInformation } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

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
      name: 'Pet Last Use',
      isActive: false,
      isProblemEntity: false,
    } as EntityInformation;

    // Create other mock sensors
    const otherSensor = {
      entity_id: 'sensor.petkit_status',
      state: 'active',
      translation_key: 'status',
      attributes: {
        friendly_name: 'Status',
      },
      name: 'Status',
      isActive: false,
      isProblemEntity: false,
    } as EntityInformation;

    // Combine sensors into an array
    mockSensors = [petSensor, otherSensor];

    // Create mock device
    mockUnit = {
      name: "Fluffy's Feeder",
      model: 'PetKit V1 123',
      sensors: mockSensors,
      controls: [],
      diagnostics: [],
      configurations: [],
    };
  });

  it('should render a card with pet information', async () => {
    const result = picture(mockUnit);
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

    const result = picture(unitWithoutPet);
    const el = await fixture(result as TemplateResult);

    // Verify the card still renders
    expect(el.tagName.toLowerCase()).to.equal('ha-alert');
    expect(el.getAttribute('alert-type')).to.equal('error');

    // Should have text content
    const text = el.textContent;
    expect(text).to.exist;
    expect(text).to.equal('No entity picture found!');
  });

  it('should handle empty sensors array', async () => {
    // Create a unit with an empty sensors array
    const emptyUnit: Device = {
      ...mockUnit,
      sensors: [],
    };

    const result = picture(emptyUnit);
    const el = await fixture(result as TemplateResult);

    // Verify the card still renders
    expect(el.tagName.toLowerCase()).to.equal('ha-alert');
    expect(el.getAttribute('alert-type')).to.equal('error');

    // Should have text content
    const text = el.textContent;
    expect(text).to.exist;
    expect(text).to.equal('No entity picture found!');
  });
});
