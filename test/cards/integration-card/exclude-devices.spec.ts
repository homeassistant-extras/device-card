import { shouldExcludeDevice } from '@integration/exclude-devices';
import type { Config } from '@integration/types';
import { expect } from 'chai';
import { describe, it } from 'mocha';

export default () => {
  describe('exclude-devices.ts', () => {
    describe('shouldExcludeDevice', () => {
      it('should return false when exclude_devices is not specified', () => {
        // Arrange
        const config = {} as Config;

        // Act & Assert
        expect(shouldExcludeDevice(config, 'device_id', 'Device Name')).to.be
          .false;
      });

      it('should return false when exclude_devices is empty', () => {
        // Arrange
        const config = {
          exclude_devices: [],
        } as any as Config;

        // Act & Assert
        expect(shouldExcludeDevice(config, 'device_id', 'Device Name')).to.be
          .false;
      });

      it('should return true when device ID matches an exclusion pattern', () => {
        // Arrange
        const config = {
          exclude_devices: ['device_*', 'other_*'],
        } as Config;

        // Act & Assert
        expect(shouldExcludeDevice(config, 'device_id', 'Device Name')).to.be
          .true;
        expect(shouldExcludeDevice(config, 'device_123', 'Some Device')).to.be
          .true;
        expect(shouldExcludeDevice(config, 'different_id', 'Different Device'))
          .to.be.false;
      });

      it('should return true when device name matches an exclusion pattern', () => {
        // Arrange
        const config = {
          exclude_devices: ['*socket*'],
        } as Config;

        // Act & Assert
        expect(shouldExcludeDevice(config, 'device_id', 'Socket Device')).to.be
          .true;
        expect(shouldExcludeDevice(config, 'id_123', 'Wall Socket')).to.be.true;
        expect(shouldExcludeDevice(config, 'device_id', 'Light Bulb')).to.be
          .false;
      });

      it('should return false when neither device ID nor name matches any exclusion pattern', () => {
        // Arrange
        const config = {
          exclude_devices: ['socket*', '*lamp*'],
        } as Config;

        // Act & Assert
        expect(shouldExcludeDevice(config, 'device_id', 'Device Name')).to.be
          .false;
        expect(shouldExcludeDevice(config, 'thermo_123', 'Thermostat')).to.be
          .false;
      });

      it('should support regex patterns in exclude_devices', () => {
        // Arrange
        const config = {
          exclude_devices: ['/socket_[0-9]+/', '/^device_[a-z]+$/'],
        } as Config;

        // Act & Assert
        expect(shouldExcludeDevice(config, 'socket_123', 'Socket')).to.be.true;
        expect(shouldExcludeDevice(config, 'device_abc', 'Device')).to.be.true;
        expect(shouldExcludeDevice(config, 'socket_abc', 'Socket Alpha')).to.be
          .false;
        expect(shouldExcludeDevice(config, 'mydevice_abc', 'Another Device')).to
          .be.false;
      });

      it('should handle null device name', () => {
        // Arrange
        const config = {
          exclude_devices: ['device_*'],
        } as Config;

        // Act & Assert
        expect(shouldExcludeDevice(config, 'device_id', null)).to.be.true;
        expect(shouldExcludeDevice(config, 'other_id', null)).to.be.false;
      });
    });
  });
};
