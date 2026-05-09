import { getOrderedSections } from '@/helpers/device-section';
import type { Config } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import type { Device, EntityInformation } from '@type/config';
import { expect } from 'chai';

describe('device-section.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let mockDevice: Device;

  beforeEach(() => {
    mockHass = { language: 'en' } as HomeAssistant;

    mockConfig = {
      preview_count: 3,
    } as Config;

    mockDevice = {
      controls: [{ entity_id: 'light.test' } as EntityInformation],
      configurations: [{ entity_id: 'config.test' } as EntityInformation],
      sensors: [{ entity_id: 'sensor.test' } as EntityInformation],
      diagnostics: [{ entity_id: 'diagnostic.test' } as EntityInformation],
    };
  });

  describe('getOrderedSections', () => {
    it('should return sections in default order when no custom order is specified', () => {
      const result = getOrderedSections(mockHass, mockConfig, mockDevice);

      expect(result).to.have.length(4);
      expect(result[0]!.key).to.equal('controls');
      expect(result[1]!.key).to.equal('configurations');
      expect(result[2]!.key).to.equal('sensors');
      expect(result[3]!.key).to.equal('diagnostics');
      expect(result[0]!.name).to.equal('Controls');
    });

    it('should return sections in custom order when section_order is specified', () => {
      mockConfig.section_order = [
        'sensors',
        'controls',
        'diagnostics',
        'configurations',
      ];

      const result = getOrderedSections(mockHass, mockConfig, mockDevice);

      expect(result).to.have.length(4);
      expect(result[0]!.key).to.equal('sensors');
      expect(result[1]!.key).to.equal('controls');
      expect(result[2]!.key).to.equal('diagnostics');
      expect(result[3]!.key).to.equal('configurations');
    });

    it('should handle partial section ordering and include remaining sections at the end', () => {
      mockConfig.section_order = ['sensors'];

      const result = getOrderedSections(mockHass, mockConfig, mockDevice);

      expect(result).to.have.length(4);
      expect(result[0]!.key).to.equal('sensors');

      const remainingKeys = result.slice(1).map((s) => s.key);
      expect(remainingKeys).to.include('controls');
      expect(remainingKeys).to.include('configurations');
      expect(remainingKeys).to.include('diagnostics');
    });

    it('should handle empty section_order array and use default order', () => {
      mockConfig.section_order = [];

      const result = getOrderedSections(mockHass, mockConfig, mockDevice);

      expect(result).to.have.length(4);
      expect(result[0]!.key).to.equal('controls');
      expect(result[1]!.key).to.equal('configurations');
      expect(result[2]!.key).to.equal('sensors');
      expect(result[3]!.key).to.equal('diagnostics');
    });

    it('should ignore invalid section keys in section_order', () => {
      mockConfig.section_order = ['sensors', 'invalid_section', 'controls'];

      const result = getOrderedSections(mockHass, mockConfig, mockDevice);

      expect(result).to.have.length(4);
      expect(result[0]!.key).to.equal('sensors');
      expect(result[1]!.key).to.equal('controls');

      const remainingKeys = result.slice(2).map((s) => s.key);
      expect(remainingKeys).to.include('configurations');
      expect(remainingKeys).to.include('diagnostics');
    });

    it('should omit sections with no entities', () => {
      mockDevice.diagnostics = [];

      const result = getOrderedSections(mockHass, mockConfig, mockDevice);

      expect(result).to.have.length(3);
      expect(result.map((s) => s.key)).to.not.include('diagnostics');
    });
  });
});
