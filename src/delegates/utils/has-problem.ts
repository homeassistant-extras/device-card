import type { Device } from '@type/config';

export const hasProblem = (unit: Device): boolean =>
  unit
    ? [
        ...unit.controls,
        ...unit.sensors,
        ...unit.diagnostics,
        ...unit.configurations,
      ].some((entity) => entity.isProblemEntity && entity.isActive)
    : false;
