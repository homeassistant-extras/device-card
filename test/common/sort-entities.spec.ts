import { sortEntities } from '@common/sort';
import type { EntityInformation, SortConfig } from '@type/config';
import { expect } from 'chai';

describe('sort-entities.ts', () => {
  let mockEntities: EntityInformation[];

  beforeEach(() => {
    // Create mock entities for testing
    mockEntities = [
      {
        entity_id: 'light.kitchen',
        state: '50',
        attributes: { friendly_name: 'Kitchen Light' },
        name: 'Kitchen Light',
        isActive: false,
        isProblemEntity: false,
        translation_key: undefined,
      } as EntityInformation,
      {
        entity_id: 'switch.living_room',
        state: 'on',
        attributes: { friendly_name: 'Living Room Switch' },
        name: 'Living Room Switch',
        isActive: true,
        isProblemEntity: false,
        translation_key: undefined,
      } as EntityInformation,
      {
        entity_id: 'sensor.temperature',
        state: '22.5',
        attributes: { friendly_name: 'Temperature' },
        name: 'Temperature',
        isActive: false,
        isProblemEntity: false,
        translation_key: undefined,
      } as EntityInformation,
    ];
  });

  describe('sortEntities', () => {
    it('should return the original array if no sort config is provided', () => {
      const result = sortEntities(mockEntities);
      expect(result).to.deep.equal(mockEntities);
    });

    it('should sort by domain in ascending order', () => {
      const sortConfig: SortConfig = { type: 'domain', direction: 'asc' };
      const result = sortEntities(mockEntities, sortConfig);

      expect(result[0]!.entity_id).to.equal('light.kitchen');
      expect(result[1]!.entity_id).to.equal('sensor.temperature');
      expect(result[2]!.entity_id).to.equal('switch.living_room');
    });

    it('should sort by domain in descending order', () => {
      const sortConfig: SortConfig = { type: 'domain', direction: 'desc' };
      const result = sortEntities(mockEntities, sortConfig);

      expect(result[0]!.entity_id).to.equal('switch.living_room');
      expect(result[1]!.entity_id).to.equal('sensor.temperature');
      expect(result[2]!.entity_id).to.equal('light.kitchen');
    });

    it('should sort by entity_id', () => {
      const sortConfig: SortConfig = { type: 'entity_id' };
      const result = sortEntities(mockEntities, sortConfig);

      expect(result[0]!.entity_id).to.equal('light.kitchen');
      expect(result[1]!.entity_id).to.equal('sensor.temperature');
      expect(result[2]!.entity_id).to.equal('switch.living_room');
    });

    it('should sort by name', () => {
      const sortConfig: SortConfig = { type: 'name' };
      const result = sortEntities(mockEntities, sortConfig);

      expect(result[0]!.attributes.friendly_name).to.equal('Kitchen Light');
      expect(result[1]!.attributes.friendly_name).to.equal(
        'Living Room Switch',
      );
      expect(result[2]!.attributes.friendly_name).to.equal('Temperature');
    });

    it('should sort by state', () => {
      const sortConfig: SortConfig = { type: 'state' };
      const result = sortEntities(mockEntities, sortConfig);

      expect(result[0]!.state).to.equal('22.5');
      expect(result[1]!.state).to.equal('50');
      expect(result[2]!.state).to.equal('on');
    });

    it('should use ascending order by default', () => {
      const sortConfig: SortConfig = { type: 'entity_id' };
      const result = sortEntities(mockEntities, sortConfig);

      expect(result[0]!.entity_id).to.equal('light.kitchen');
      expect(result[2]!.entity_id).to.equal('switch.living_room');
    });
  });
});
