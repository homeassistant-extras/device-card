import { shouldIncludeDevice } from '@integration/include-devices';
import type { Config } from '@integration/types';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('include-devices.ts', () => {
  describe('shouldIncludeDevice', () => {
    it('should return true when device ID matches an inclusion pattern', () => {
      // Arrange
      const config = {
        include_devices: ['device_*', 'other_*'],
      } as Config;

      // Act & Assert
      expect(shouldIncludeDevice(config, 'device_id', 'Device Name')).to.be
        .true;
      expect(shouldIncludeDevice(config, 'device_123', 'Some Device')).to.be
        .true;
    });

    it('should return true when device name matches an inclusion pattern', () => {
      // Arrange
      const config = {
        include_devices: ['*Test*'],
      } as Config;

      // Act & Assert
      expect(shouldIncludeDevice(config, 'device_id', 'Test Device')).to.be
        .true;
      expect(shouldIncludeDevice(config, 'id_123', 'Testing Unit')).to.be.true;
    });

    it('should return true when device name matches case-insensitive inclusion pattern', () => {
      // Arrange
      const config = {
        include_devices: ['*test*'],
      } as Config;

      // Act & Assert
      expect(shouldIncludeDevice(config, 'device_id', 'test Device')).to.be
        .true;
      expect(shouldIncludeDevice(config, 'id_123', 'Testing Unit')).to.be.true;
    });

    it('should return false when neither device ID nor name matches any inclusion pattern', () => {
      // Arrange
      const config = {
        include_devices: ['nous*', '*lamp*'],
      } as Config;

      // Act & Assert
      expect(shouldIncludeDevice(config, 'device_id', 'Device Name')).to.be
        .false;
      expect(shouldIncludeDevice(config, 'socket_123', 'Socket')).to.be.false;
    });

    it('should return false when include_devices is not specified', () => {
      // Arrange
      const config = {} as Config;

      // Act & Assert
      expect(shouldIncludeDevice(config, 'device_id', 'Device Name')).to.be
        .false;
    });

    it('should return false when include_devices is empty', () => {
      // Arrange
      const config = {
        include_devices: [],
      } as any as Config;

      // Act & Assert
      expect(shouldIncludeDevice(config, 'device_id', 'Device Name')).to.be
        .false;
    });

    it('should support regex patterns in include_devices', () => {
      // Arrange
      const config = {
        include_devices: ['/nous.*/', '/device_[0-9]+/'],
      } as Config;

      // Act & Assert
      expect(shouldIncludeDevice(config, 'nous123', 'Nous Device')).to.be.true;
      expect(shouldIncludeDevice(config, 'device_123', 'Number Device')).to.be
        .true;
      expect(shouldIncludeDevice(config, 'device_abc', 'Letter Device')).to.be
        .false;
    });

    it('should handle null device name', () => {
      // Arrange
      const config = {
        include_devices: ['device_*'],
      } as Config;

      // Act & Assert
      expect(shouldIncludeDevice(config, 'device_id', null)).to.be.true;
      expect(shouldIncludeDevice(config, 'other_id', null)).to.be.false;
    });
  });
});
