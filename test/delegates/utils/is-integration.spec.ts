import { isInIntegration } from '@delegates/utils/is-integration';
import type { DeviceRegistryEntry } from '@hass/data/device_registry';
import { expect } from 'chai';
import { describe, it } from 'mocha';

export default () => {
  describe('integration.ts', () => {
    describe('isInIntegration', () => {
      it('should return true when integration is found in identifiers', () => {
        // Arrange
        const device = {
          identifiers: [
            ['zwave_js', 'node-123'],
            ['zigbee', 'device-456'],
          ],
        } as DeviceRegistryEntry;

        // Act & Assert
        expect(isInIntegration(device, 'zwave_js')).to.be.true;
        expect(isInIntegration(device, 'zigbee')).to.be.true;
      });

      it('should return false when integration is not found in identifiers', () => {
        // Arrange
        const device = {
          identifiers: [
            ['zwave_js', 'node-123'],
            ['zigbee', 'device-456'],
          ],
        } as DeviceRegistryEntry;

        // Act & Assert
        expect(isInIntegration(device, 'mqtt')).to.be.false;
        expect(isInIntegration(device, 'hue')).to.be.false;
      });

      it('should return false when identifiers is undefined', () => {
        // Arrange
        const device = {} as DeviceRegistryEntry;

        // Act & Assert
        expect(isInIntegration(device, 'zwave_js')).to.be.false;
      });

      it('should return false when identifiers is an empty array', () => {
        // Arrange
        const device = {
          identifiers: [],
        } as any as DeviceRegistryEntry;

        // Act & Assert
        expect(isInIntegration(device, 'zwave_js')).to.be.false;
      });

      it('should handle integration name as the second part of an identifier', () => {
        // Arrange
        const device = {
          identifiers: [
            ['domain', 'zwave_js'],
            ['other', 'value'],
          ],
        } as DeviceRegistryEntry;

        // Act & Assert
        expect(isInIntegration(device, 'zwave_js')).to.be.true;
      });

      it('should handle complex identifiers with multiple parts', () => {
        // Arrange
        const device = {
          identifiers: [
            ['domain', 'value1', 'value2', 'zwave_js'],
            ['other', 'value3', 'value4'],
          ],
        } as any as DeviceRegistryEntry;

        // Act & Assert
        expect(isInIntegration(device, 'zwave_js')).to.be.true;
        expect(isInIntegration(device, 'value2')).to.be.true;
        expect(isInIntegration(device, 'value4')).to.be.true;
      });

      it('should handle case sensitivity correctly', () => {
        // Arrange
        const device = {
          identifiers: [
            ['zwave_js', 'node-123'],
            ['zigbee', 'device-456'],
          ],
        } as DeviceRegistryEntry;

        // Act & Assert
        expect(isInIntegration(device, 'ZWAVE_JS')).to.be.false;
        expect(isInIntegration(device, 'ZigBee')).to.be.false;
      });

      it('should match complete identifiers, not partial string matches', () => {
        // Arrange
        const device = {
          identifiers: [
            ['zwave_js_extended', 'node-123'],
            ['zigbee2mqtt', 'device-456'],
          ],
        } as DeviceRegistryEntry;

        // Act & Assert
        expect(isInIntegration(device, 'zwave_js')).to.be.false;
        expect(isInIntegration(device, 'zigbee')).to.be.false;
      });

      it('should handle special characters in integration names', () => {
        // Arrange
        const device = {
          identifiers: [
            ['integration-with-dashes', 'node-123'],
            ['integration.with.dots', 'device-456'],
            ['integration_with_underscores', 'device-789'],
          ],
        } as DeviceRegistryEntry;

        // Act & Assert
        expect(isInIntegration(device, 'integration-with-dashes')).to.be.true;
        expect(isInIntegration(device, 'integration.with.dots')).to.be.true;
        expect(isInIntegration(device, 'integration_with_underscores')).to.be
          .true;
      });
    });
  });
};
