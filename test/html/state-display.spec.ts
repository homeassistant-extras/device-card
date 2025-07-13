import type { HomeAssistant } from '@hass/types';
import { stateDisplay } from '@html/state-display';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation, EntityState } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

describe('stateDisplay.ts', () => {
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

  it('should render state-display with correct hass and stateObj properties', async () => {
    const result = stateDisplay(mockHass, mockEntity);
    const el = await fixture(result as TemplateResult);

    // Check that the element was correctly created
    expect(el.tagName.toLowerCase()).to.equal('state-display');

    // Check that properties were correctly passed
    expect((el as any).hass).to.equal(mockHass);
    expect((el as any).stateObj).to.equal(mockEntity);
  });
});
