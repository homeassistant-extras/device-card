import { sortDevices } from '@common/sort-devices';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';

describe('sort-devices.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      devices: {
        device_alpha: {
          id: 'device_alpha',
          name: 'Alpha Device',
          name_by_user: null,
          identifiers: [['test', 'alpha']],
          config_entries: [],
          manufacturer: null,
          model: null,
          model_id: null,
          area_id: '',
        },
        device_beta: {
          id: 'device_beta',
          name: 'Beta Device',
          name_by_user: 'Custom Beta',
          identifiers: [['test', 'beta']],
          config_entries: [],
          manufacturer: null,
          model: null,
          model_id: null,
          area_id: '',
        },
        device_gamma: {
          id: 'device_gamma',
          name: 'Gamma Device',
          name_by_user: null,
          identifiers: [['test', 'gamma']],
          config_entries: [],
          manufacturer: null,
          model: null,
          model_id: null,
          area_id: '',
        },
      },
      states: {},
      entities: {},
      language: 'en',
      connection: {} as any,
      callWS: async () => [],
    } as any as HomeAssistant;
  });

  describe('sortDevices', () => {
    it('should return the original array if no sort config is provided', () => {
      const deviceIds = ['device_beta', 'device_alpha', 'device_gamma'];
      const result = sortDevices(deviceIds, mockHass);
      expect(result).to.deep.equal(deviceIds);
    });

    it('should sort by name in ascending order', () => {
      const deviceIds = ['device_beta', 'device_alpha', 'device_gamma'];
      const result = sortDevices(deviceIds, mockHass, {
        type: 'name',
        direction: 'asc',
      });

      expect(result[0]).to.equal('device_alpha');
      expect(result[1]).to.equal('device_beta');
      expect(result[2]).to.equal('device_gamma');
    });

    it('should sort by name in descending order', () => {
      const deviceIds = ['device_alpha', 'device_beta', 'device_gamma'];
      const result = sortDevices(deviceIds, mockHass, {
        type: 'name',
        direction: 'desc',
      });

      expect(result[0]).to.equal('device_gamma');
      expect(result[1]).to.equal('device_beta');
      expect(result[2]).to.equal('device_alpha');
    });

    it('should use name_by_user when available for name sort', () => {
      const deviceIds = ['device_alpha', 'device_beta', 'device_gamma'];
      const result = sortDevices(deviceIds, mockHass, {
        type: 'name',
        direction: 'asc',
      });

      expect(result[0]).to.equal('device_alpha');
      expect(result[1]).to.equal('device_beta');
      expect(result[2]).to.equal('device_gamma');
    });

    it('should use ascending order by default', () => {
      const deviceIds = ['device_gamma', 'device_alpha', 'device_beta'];
      const result = sortDevices(deviceIds, mockHass, { type: 'name' });

      expect(result[0]).to.equal('device_alpha');
      expect(result[2]).to.equal('device_gamma');
    });

    it('should return empty array when given empty array', () => {
      const result = sortDevices([], mockHass, {
        type: 'name',
        direction: 'asc',
      });
      expect(result).to.deep.equal([]);
    });
  });
});
