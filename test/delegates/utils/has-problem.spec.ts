import { hasProblem } from '@delegates/utils/has-problem';
import type { Device, EntityInformation } from '@type/config';
import { expect } from 'chai';

describe('has-problem.ts', () => {
  let mockUnit: Device;

  beforeEach(() => {
    // Create mock entity with problem status
    const problemEntity1 = {
      entity_id: 'binary_sensor.problem1',
      state: 'on',
      translation_key: undefined,
      isProblemEntity: true,
      isActive: true,
      attributes: {
        device_class: 'problem',
        friendly_name: 'Problem 1',
      },
    } as any as EntityInformation;

    const regularEntity1 = {
      entity_id: 'sensor.temperature',
      state: '25',
      translation_key: undefined,
      isProblemEntity: false,
      isActive: false,
      attributes: {
        device_class: 'temperature',
        friendly_name: 'Temperature',
      },
    } as any as EntityInformation;

    const problemEntityInactive = {
      entity_id: 'binary_sensor.problem2',
      state: 'off',
      translation_key: undefined,
      isProblemEntity: true,
      isActive: false,
      attributes: {
        device_class: 'problem',
        friendly_name: 'Problem 2',
      },
    } as any as EntityInformation;

    // Create mock device with different entity categories
    mockUnit = {
      name: 'Mock Device',
      model: 'TestModel 123',
      sensors: [regularEntity1],
      controls: [problemEntity1],
      diagnostics: [problemEntityInactive],
      configurations: [],
    };
  });

  it('should return true when at least one entity is a problem and active', () => {
    const result = hasProblem(mockUnit);
    expect(result).to.be.true;
  });

  it('should return false when all problem entities are inactive', () => {
    // Make all problem entities inactive
    mockUnit.controls[0]!.isActive = false;

    const result = hasProblem(mockUnit);
    expect(result).to.be.false;
  });

  it('should return false when there are no problem entities', () => {
    // Remove problem property from all entities
    mockUnit.controls[0]!.isProblemEntity = false;
    mockUnit.diagnostics[0]!.isProblemEntity = false;

    const result = hasProblem(mockUnit);
    expect(result).to.be.false;
  });

  it('should check across all entity categories', () => {
    // Add problem entities to different categories
    const configProblem = {
      entity_id: 'switch.config_problem',
      state: 'on',
      translation_key: undefined,
      isProblemEntity: true,
      isActive: true,
      attributes: {
        device_class: 'problem',
        friendly_name: 'Config Problem',
      },
    } as any as EntityInformation;

    mockUnit.controls[0]!.isActive = false; // Deactivate the existing problem
    mockUnit.configurations.push(configProblem);

    const result = hasProblem(mockUnit);
    expect(result).to.be.true;
  });

  it('should handle undefined unit gracefully', () => {
    const result = hasProblem(undefined as unknown as Device);
    expect(result).to.be.false;
  });

  it('should handle empty entity arrays gracefully', () => {
    mockUnit.controls = [];
    mockUnit.sensors = [];
    mockUnit.diagnostics = [];
    mockUnit.configurations = [];

    const result = hasProblem(mockUnit);
    expect(result).to.be.false;
  });

  it('should handle mixed entity states correctly', () => {
    // Create a complex mix of entities
    const activeProblem = {
      entity_id: 'binary_sensor.active_problem',
      state: 'on',
      translation_key: undefined,
      isProblemEntity: true,
      isActive: true,
      attributes: {
        device_class: 'problem',
        friendly_name: 'Active Problem',
      },
    } as any as EntityInformation;

    const activeNonProblem = {
      entity_id: 'switch.active_non_problem',
      state: 'on',
      translation_key: undefined,
      isProblemEntity: false,
      isActive: true,
      attributes: {
        friendly_name: 'Active Non-Problem',
      },
    } as any as EntityInformation;

    const inactiveProblem = {
      entity_id: 'binary_sensor.inactive_problem',
      state: 'off',
      translation_key: undefined,
      isProblemEntity: true,
      isActive: false,
      attributes: {
        device_class: 'problem',
        friendly_name: 'Inactive Problem',
      },
    } as any as EntityInformation;

    // Reset the unit and add our test entities
    mockUnit.controls = [activeProblem];
    mockUnit.sensors = [activeNonProblem];
    mockUnit.diagnostics = [inactiveProblem];

    const result = hasProblem(mockUnit);
    expect(result).to.be.true;

    // Now make the problem inactive
    mockUnit.controls[0]!.isActive = false;

    const updatedResult = hasProblem(mockUnit);
    expect(updatedResult).to.be.false;
  });
});
