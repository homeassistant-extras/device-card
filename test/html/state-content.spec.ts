import type { HomeAssistant } from '@hass/types';
import { stateContent } from '@html/state-content';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation, EntityState } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

describe('stateContent.ts', () => {
  // Common test variables
  let mockHass: HomeAssistant;
  let mockEntity: EntityInformation;
  let mockState: EntityState;

  beforeEach(() => {
    // Mock state object
    mockState = {
      entity_id: 'light.test_light',
      state: 'on',
      attributes: {
        friendly_name: 'Test Light',
        icon: 'mdi:lightbulb',
      },
    };

    // Mock entity information
    mockEntity = {
      entity_id: 'light.test_light',
      state: 'on',
    } as any as EntityInformation;

    // Mock Home Assistant
    mockHass = {
      entities: {
        'light.test_light': {
          area_id: 'test_area',
          device_id: 'test_device',
          labels: [],
        },
      },
      devices: {
        test_device: { area_id: 'test_area' },
      },
      areas: {
        test_area: { area_id: 'Test Area', icon: '' },
      },
      states: {
        'light.test_light': mockState,
      },
    } as any as HomeAssistant;
  });

  it('should render state-card-content with correct hass and stateObj properties', async () => {
    const result = stateContent(mockHass, mockEntity, undefined);
    const el = await fixture(result as TemplateResult);

    // Check that the element was correctly created
    expect(el.tagName.toLowerCase()).to.equal('state-card-content');

    // Check that properties were correctly passed
    expect((el as any).hass).to.equal(mockHass);
    expect((el as any).stateObj).to.equal(mockEntity);
  });

  it('should apply className when provided', async () => {
    const className = 'test-class';
    const result = stateContent(mockHass, mockEntity, className);
    const el = await fixture(result as TemplateResult);

    expect(el.classList.contains(className)).to.be.true;
  });

  it('should not apply a class when className is undefined', async () => {
    const result = stateContent(mockHass, mockEntity, undefined);
    const el = await fixture(result as TemplateResult);

    // The class attribute should be empty string or not present
    expect(el.className).to.equal('');
  });

  it('should handle multiple class names when separated by spaces', async () => {
    const className = 'class1 class2 class3';
    const result = stateContent(mockHass, mockEntity, className);
    const el = await fixture(result as TemplateResult);

    expect(el.classList.contains('class1')).to.be.true;
    expect(el.classList.contains('class2')).to.be.true;
    expect(el.classList.contains('class3')).to.be.true;
  });
});
