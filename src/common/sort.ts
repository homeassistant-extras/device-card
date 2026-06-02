// src/delegates/utils/sort-entities.ts
import { computeDomain } from '@homeassistant-extras/hass/common/entity/compute_domain';
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
    let valueA: string | number;
    let valueB: string | number;

    switch (type) {
      case 'domain':
        valueA = computeDomain(a.entity_id);
        valueB = computeDomain(b.entity_id);
        break;
      case 'entity_id':
        valueA = a.entity_id;
        valueB = b.entity_id;
        break;
      case 'name': {
        const nameA = a.attributes.friendly_name;
        const nameB = b.attributes.friendly_name;
        valueA = typeof nameA === 'string' ? nameA : a.entity_id;
        valueB = typeof nameB === 'string' ? nameB : b.entity_id;
        break;
      }
      case 'state':
        valueA = a.state;
        valueB = b.state;
        break;
      default:
        return 0;
    }

    // Handle null or undefined values
    valueA ??= '';
    valueB ??= '';

    // Standard string comparison
    if (valueA < valueB) return isReverse ? 1 : -1;
    if (valueA > valueB) return isReverse ? -1 : 1;
    return 0;
  });

  return result;
};
