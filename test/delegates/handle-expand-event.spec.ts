import { handleExpandEvent } from '@delegates/handle-expand-event';
import type { Expansions } from '@device/types';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('handle-expand-event.ts', () => {
  const entityId = 'sensor.test_sensor';

  it('should toggle expansion when event has expand and entity_id', () => {
    const expansions: Expansions = {
      expandedSections: {},
      expandedEntities: { [entityId]: false },
    };
    let updated: Expansions | undefined;
    const updateExpansions = (e: Expansions) => {
      updated = e;
    };

    const ev = new CustomEvent('ll-custom', {
      detail: { device_card: { expand: true, entity_id: entityId } },
    }) as CustomEvent;

    handleExpandEvent(ev, expansions, updateExpansions);

    expect(updated).to.exist;
    expect(updated!.expandedEntities[entityId]).to.be.true;
  });

  it('should not update when device_card.expand is missing', () => {
    const expansions: Expansions = {
      expandedSections: {},
      expandedEntities: {},
    };
    let updated: Expansions | undefined;
    const updateExpansions = (e: Expansions) => {
      updated = e;
    };

    const ev = new CustomEvent('ll-custom', {
      detail: { device_card: { entity_id: entityId } },
    }) as CustomEvent;

    handleExpandEvent(ev, expansions, updateExpansions);

    expect(updated).to.be.undefined;
  });
});
