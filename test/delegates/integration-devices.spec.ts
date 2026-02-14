import { computeIntegrationDevices } from '@delegates/integration-devices';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('integration-devices', () => {
  describe('computeIntegrationDevices', () => {
    it('returns integration name and device IDs from config entries', async () => {
      const mockHass = {
        callWS: async () => [{ entry_id: 'entry_1' }],
        devices: {
          dev1: {
            id: 'dev1',
            config_entries: ['entry_1'],
            name: 'Device 1',
          },
          dev2: {
            id: 'dev2',
            config_entries: ['other_entry'],
            name: 'Device 2',
          },
        },
      } as unknown as HomeAssistant;

      const result = await computeIntegrationDevices(mockHass, {
        integration: 'zwave_js',
      });

      expect(result.name).to.equal('Zwave Js');
      expect(result.devices).to.deep.equal(['dev1']);
    });

    it('applies include filter', async () => {
      const mockHass = {
        callWS: async () => [{ entry_id: 'entry_1' }],
        devices: {
          dev1: { id: 'dev1', config_entries: ['entry_1'], name: 'Device 1' },
          dev2: { id: 'dev2', config_entries: ['entry_1'], name: 'Device 2' },
        },
      } as unknown as HomeAssistant;

      const result = await computeIntegrationDevices(mockHass, {
        integration: 'test',
        includeDevices: ['dev1'],
      });

      expect(result.devices).to.deep.equal(['dev1']);
    });

    it('applies exclude filter', async () => {
      const mockHass = {
        callWS: async () => [{ entry_id: 'entry_1' }],
        devices: {
          dev1: { id: 'dev1', config_entries: ['entry_1'], name: 'Device 1' },
          dev2: { id: 'dev2', config_entries: ['entry_1'], name: 'Device 2' },
        },
      } as unknown as HomeAssistant;

      const result = await computeIntegrationDevices(mockHass, {
        integration: 'test',
        excludeDevices: ['dev2'],
      });

      expect(result.devices).to.deep.equal(['dev1']);
    });
  });
});
