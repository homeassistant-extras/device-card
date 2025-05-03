// src/delegates/utils/sort-entities.ts
import { computeDomain } from '@hass/common/entity/compute_domain';
import type { EntityInformation, SortConfig } from '@type/config';

/**
 * Sorts an array of entities based on the provided sort configuration
 *
 * @param {EntityInformation[]} entities - The entities to sort
 * @param {SortConfig} sortConfig - The sort configuration
 * @returns {EntityInformation[]} The sorted entities
 */
export const sortEntities = (
  entities: EntityInformation[],
  sortConfig?: SortConfig,
): EntityInformation[] => {
  if (!sortConfig || !entities.length) {
    return entities;
  }

  const { type, direction = 'asc' } = sortConfig;
  const isReverse = direction === 'desc';

  // Create a copy to avoid mutating the original array
  const result = [...entities];

  // Apply the sorting
  result.sort((a, b) => {
    let valueA: any;
    let valueB: any;

    switch (type) {
      case 'domain':
        valueA = computeDomain(a.entity_id);
        valueB = computeDomain(b.entity_id);
        break;
      case 'entity_id':
        valueA = a.entity_id;
        valueB = b.entity_id;
        break;
      case 'name':
        valueA = a.attributes.friendly_name || a.entity_id;
        valueB = b.attributes.friendly_name || b.entity_id;
        break;
      case 'state':
        valueA = a.state;
        valueB = b.state;
        break;
      default:
        return 0;
    }

    // Handle null or undefined values
    if (valueA === undefined || valueA === null) valueA = '';
    if (valueB === undefined || valueB === null) valueB = '';

    // Standard string comparison
    if (valueA < valueB) return isReverse ? 1 : -1;
    if (valueA > valueB) return isReverse ? -1 : 1;
    return 0;
  });

  return result;
};
