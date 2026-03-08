/**
 * @file handle-expand-event.ts
 * @description Handles expand/collapse events for entity rows in the device card
 */

import type { Expansions } from '@device/types';

/**
 * Handles the ll-custom expand event to toggle entity attribute visibility.
 * Entity ID comes from ev.detail.device_card.entity_id.
 *
 * @param ev - The CustomEvent with detail.device_card.expand and detail.device_card.entity_id
 * @param expansions - Current expansion state
 * @param updateExpansions - Callback to update expansion state
 */
export const handleExpandEvent = (
  ev: CustomEvent,
  expansions: Expansions,
  updateExpansions: (expansion: Expansions) => void,
): void => {
  const entityId = ev.detail?.device_card?.entity_id;
  if (ev.detail?.device_card?.expand && entityId) {
    ev.stopPropagation();

    updateExpansions({
      ...expansions,
      expandedEntities: {
        ...expansions.expandedEntities,
        [entityId]: !expansions.expandedEntities[entityId],
      },
    } as Expansions);
  }
};
