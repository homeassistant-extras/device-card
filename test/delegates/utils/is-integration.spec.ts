import { isInIntegration } from '@delegates/utils/is-integration';
import type { DeviceRegistryEntry } from '@hass/data/device_registry';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('integration.ts', () => {
  describe('isInIntegration', () => {
    it('should return true when config_entries contains any of the provided entryIds', () => {
      // Arrange
      const device = {
        config_entries: ['config_entry_1', 'config_entry_2', 'config_entry_3'],
      } as DeviceRegistryEntry;

      // Act & Assert
      expect(isInIntegration(device, ['config_entry_1'])).to.be.true;
      expect(isInIntegration(device, ['config_entry_2'])).to.be.true;
      expect(isInIntegration(device, ['config_entry_1', 'config_entry_3'])).to
        .be.true;
    });

    it('should return false when config_entries does not contain any of the provided entryIds', () => {
      // Arrange
      const device = {
        config_entries: ['config_entry_1', 'config_entry_2', 'config_entry_3'],
      } as DeviceRegistryEntry;

      // Act & Assert
      expect(isInIntegration(device, ['config_entry_4'])).to.be.false;
      expect(isInIntegration(device, ['config_entry_5', 'config_entry_6'])).to
        .be.false;
    });

    it('should return undefined when config_entries is undefined', () => {
      // Arrange
      const device = {} as DeviceRegistryEntry;

      // Act & Assert
      expect(isInIntegration(device, ['config_entry_1'])).to.be.false;
    });

    it('should return false when config_entries is an empty array', () => {
      // Arrange
      const device = {
        config_entries: [],
      } as any as DeviceRegistryEntry;

      // Act & Assert
      expect(isInIntegration(device, ['config_entry_1'])).to.be.false;
    });

    it('should return false when entryIds is an empty array', () => {
      // Arrange
      const device = {
        config_entries: ['config_entry_1', 'config_entry_2'],
      } as DeviceRegistryEntry;

      // Act & Assert
      expect(isInIntegration(device, [])).to.be.false;
    });

    it('should handle case sensitivity correctly', () => {
      // Arrange
      const device = {
        config_entries: ['config_entry_1', 'Config_Entry_2'],
      } as DeviceRegistryEntry;

      // Act & Assert
      expect(isInIntegration(device, ['CONFIG_ENTRY_1'])).to.be.false;
      expect(isInIntegration(device, ['config_entry_2'])).to.be.false;
      expect(isInIntegration(device, ['Config_Entry_2'])).to.be.true;
    });

    it('should handle partial matches correctly', () => {
      // Arrange
      const device = {
        config_entries: ['prefix_config_entry_1', 'config_entry_2_suffix'],
      } as DeviceRegistryEntry;

      // Act & Assert
      expect(isInIntegration(device, ['config_entry_1'])).to.be.false;
      expect(isInIntegration(device, ['config_entry_2'])).to.be.false;
      expect(isInIntegration(device, ['prefix_config_entry_1'])).to.be.true;
    });
  });
});
