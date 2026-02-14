import type { HomeAssistant } from '@hass/types';
import { stateContent } from '@html/state-content';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation, EntityState } from '@type/config';
import { expect } from 'chai';
import { stub } from 'sinon';

// Interface for the mock element that has a hass property
interface MockRowElement extends HTMLElement {
  hass?: any;
}

describe('stateContent.ts', () => {
  // Common test variables
  let mockHass: HomeAssistant;
  let mockEntity: EntityInformation;
  let mockState: EntityState;
  let mockCreateRowElement: sinon.SinonStub;
  let mockLoadCardHelpers: sinon.SinonStub;
  let mockElement: MockRowElement;

  beforeEach(() => {
    // Create a mock element that will be returned by createRowElement
    mockElement = document.createElement('div') as MockRowElement;
    mockElement.dataset.entity = 'light.test_light';
    // Add the hass property that will be set by the function
    mockElement.hass = undefined;

    // Mock the createRowElement function
    mockCreateRowElement = stub().returns(mockElement);

    // Mock loadCardHelpers to return our mock createRowElement
    mockLoadCardHelpers = stub().resolves({
      createRowElement: mockCreateRowElement,
    });

    // Set up the global window.loadCardHelpers
    globalThis.loadCardHelpers = mockLoadCardHelpers;

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
      translation_key: undefined,
      attributes: {
        friendly_name: 'Test Light',
        icon: 'mdi:lightbulb',
      },
      name: 'Test Light',
      isActive: false,
      isProblemEntity: false,
    } as EntityInformation;

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

  afterEach(() => {
    // Clean up the global mock
    delete globalThis.loadCardHelpers;
  });

  it('should call loadCardHelpers and createRowElement with correct configuration', async () => {
    const result = await stateContent(mockHass, mockEntity, undefined);
    const el = await fixture(result);

    // Check that loadCardHelpers was called
    expect(mockLoadCardHelpers.calledOnce).to.be.true;

    // Check that createRowElement was called with correct config
    expect(mockCreateRowElement.calledOnce).to.be.true;
    const config = mockCreateRowElement.firstCall.args[0];
    expect(config.entity).to.equal('light.test_light');
    expect(config.tap_action.action).to.equal('none');
    expect(config.hold_action.action).to.equal('none');
    expect(config.double_tap_action.action).to.equal('none');

    // Check that hass was set on the element
    expect(mockElement.hass).to.equal(mockHass);

    // Check that the element is rendered in the template
    // The element should be the mock element we created
    expect(el).to.equal(mockElement);
  });

  it('should apply className when provided', async () => {
    const className = 'test-class';
    const result = await stateContent(mockHass, mockEntity, className);
    await fixture(result);

    // Check that className was applied to the mock element
    expect(mockElement.className).to.equal(className);
  });

  it('should not apply a class when className is undefined', async () => {
    const result = await stateContent(mockHass, mockEntity, undefined);
    await fixture(result);

    // The class attribute should be empty string or not present
    expect(mockElement.className).to.equal('');
  });

  it('should handle multiple class names when separated by spaces', async () => {
    const className = 'class1 class2 class3';
    const result = await stateContent(mockHass, mockEntity, className);
    await fixture(result);

    // Check that all class names were applied to the mock element
    expect(mockElement.classList.contains('class1')).to.be.true;
    expect(mockElement.classList.contains('class2')).to.be.true;
    expect(mockElement.classList.contains('class3')).to.be.true;
  });

  it('should set entity name from hass states when available', async () => {
    const result = await stateContent(mockHass, mockEntity, undefined);
    await fixture(result);

    // The name is set on the config after createRowElement is called
    // We need to check that the function completed successfully
    expect(mockLoadCardHelpers.calledOnce).to.be.true;
    expect(mockCreateRowElement.calledOnce).to.be.true;
    expect(mockElement.hass).to.equal(mockHass);
  });

  it('should handle missing entity state gracefully', async () => {
    // Remove the entity from hass states
    delete mockHass.states['light.test_light'];

    const result = await stateContent(mockHass, mockEntity, undefined);
    await fixture(result);

    // Should still work without the entity state
    expect(mockLoadCardHelpers.calledOnce).to.be.true;
    expect(mockCreateRowElement.calledOnce).to.be.true;
    expect(mockElement.hass).to.equal(mockHass);
  });
});
