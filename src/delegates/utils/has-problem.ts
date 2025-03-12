import { stateActive } from '@hass/common/entity/state_active';
import type { Device } from '@type/config';

export const hasProblem = (unit: Device): boolean =>
  unit ? unit.problemEntities.some((entity) => stateActive(entity)) : false;
