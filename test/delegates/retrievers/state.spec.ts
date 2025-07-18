import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import type { EntityState } from '@type/config';
import { expect } from 'chai';

/**
 * Creats a fake state entity
 * @param domain
 * @param name
 * @param state
 * @param attributes
 * @returns
 */
export const e = (
  domain: string,
  name: string,
  state: string = 'on',
  attributes = {},
): EntityState => {
  return {
    entity_id: `${domain}.${name}`,
    state: state,
    attributes: attributes,
  };
};

describe('state.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      states: {
        'light.test': e('light', 'test'),
        'light.test_room_light': e('light', 'test_room_light', 'on'),
        'switch.test_room_fan': e('switch', 'test_room_fan', 'off'),
      },
      entities: {
        'light.test': {
          device_id: 'device_1',
          area_id: 'area_1',
          labels: [],
        },
        'light.test_room_light': {
          device_id: 'device_2',
          area_id: 'test_room',
          labels: [],
        },
        'switch.test_room_fan': {
          device_id: 'device_3',
          area_id: 'test_room',
          labels: [],
        },
      },
      devices: {
        device_1: {
          area_id: 'area_1',
        },
        device_2: {
          area_id: 'test_room',
        },
        device_3: {
          area_id: 'test_room',
        },
      },
      areas: {
        area_1: {
          area_id: 'area_1',
          icon: 'mdi:home',
        },
        test_room: {
          area_id: 'test_room',
          icon: 'mdi:room',
        },
      },
    } as any as HomeAssistant;
  });

  describe('getState', () => {
    it('should return undefined for missing entity', () => {
      expect(getState(mockHass, 'light.missing')).to.be.undefined;
    });

    it('should return undefined for missing entity id', () => {
      expect(getState(mockHass, undefined)).to.be.undefined;
    });

    it('should return state for existing entity', () => {
      const state = getState(mockHass, 'light.test');
      expect(state).to.exist;
      expect(state?.state).to.equal('on');
    });

    it('should create fake state when requested', () => {
      const state = getState(mockHass, 'light.fake', true);
      expect(state).to.exist;
      expect(state?.entity_id).to.equal('light.fake');
    });
  });
});
