import type { HomeAssistant } from '@hass/types';
import { stateContent } from '@html/state-content';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation, EntityState } from '@type/config';
import type { CardHelpers } from '@type/lovelace';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

interface MockRowElement extends HTMLElement {
  hass?: unknown;
}

describe('stateContent.ts', () => {
  let mockHass: HomeAssistant;
  let mockEntity: EntityInformation;
  let mockState: EntityState;
  let mockCreateRowElement: sinon.SinonStub;
  let mockElement: MockRowElement;

  beforeEach(() => {
    mockElement = document.createElement('div') as MockRowElement;
    mockElement.dataset.entity = 'light.test_light';
    mockElement.hass = undefined;

    mockCreateRowElement = stub().returns(mockElement);

    const helpers: CardHelpers = {
      createRowElement: mockCreateRowElement,
    };
    globalThis.poatCardHelpers = helpers;

    mockState = {
      entity_id: 'light.test_light',
      state: 'on',
      attributes: {
        friendly_name: 'Test Light',
        icon: 'mdi:lightbulb',
      },
    };

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
      config: {
        tap_action: {
          action: 'none',
        },
        hold_action: {
          action: 'none',
        },
        double_tap_action: {
          action: 'none',
        },
      },
    } as EntityInformation;

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
    Reflect.deleteProperty(globalThis, 'poatCardHelpers');
  });

  it('should return nothing when card helpers are not resolved', () => {
    Reflect.deleteProperty(globalThis, 'poatCardHelpers');

    const result = stateContent(mockHass, mockEntity, undefined);

    expect(result).to.equal(nothing);
    expect(mockCreateRowElement.called).to.be.false;
  });

  it('should call createRowElement with correct configuration', async () => {
    const result = stateContent(mockHass, mockEntity, undefined);
    const el = await fixture(result as unknown as TemplateResult);

    expect(mockCreateRowElement.calledOnce).to.be.true;
    const config = mockCreateRowElement.firstCall.args[0];
    expect(config.entity).to.equal('light.test_light');
    expect(config.name).to.equal('Test Light');
    expect(config.tap_action.action).to.equal('none');
    expect(config.hold_action.action).to.equal('none');
    expect(config.double_tap_action.action).to.equal('none');

    expect(mockElement.hass).to.equal(mockHass);

    expect(el).to.equal(mockElement);
  });

  it('should apply className when provided', async () => {
    const className = 'test-class';
    const result = stateContent(mockHass, mockEntity, className);
    await fixture(result as unknown as TemplateResult);

    expect(mockElement.className).to.equal(className);
  });

  it('should not apply a class when className is undefined', async () => {
    const result = stateContent(mockHass, mockEntity, undefined);
    await fixture(result as unknown as TemplateResult);

    expect(mockElement.className).to.equal('');
  });

  it('should handle multiple class names when separated by spaces', async () => {
    const className = 'class1 class2 class3';
    const result = stateContent(mockHass, mockEntity, className);
    await fixture(result as unknown as TemplateResult);

    expect(mockElement.classList.contains('class1')).to.be.true;
    expect(mockElement.classList.contains('class2')).to.be.true;
    expect(mockElement.classList.contains('class3')).to.be.true;
  });

  it('should wire hass onto the row element', async () => {
    const result = stateContent(mockHass, mockEntity, undefined);
    await fixture(result as unknown as TemplateResult);

    expect(mockCreateRowElement.calledOnce).to.be.true;
    expect(mockElement.hass).to.equal(mockHass);
  });

  it('should handle missing entity state gracefully', async () => {
    delete mockHass.states['light.test_light'];

    const result = stateContent(mockHass, mockEntity, undefined);
    await fixture(result as unknown as TemplateResult);

    expect(mockCreateRowElement.calledOnce).to.be.true;
    expect(mockElement.hass).to.equal(mockHass);
  });
});
