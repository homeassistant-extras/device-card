import { stateColor } from '@delegates/utils/state-color';
import type { BaseConfig, EntityState } from '@type/config';
import { expect } from 'chai';

describe('state-color.ts', () => {
  const entity = (state: string): EntityState => ({
    entity_id: 'sensor.container_state',
    state,
    attributes: {},
  });

  const config: BaseConfig = {
    state_colors: [
      { state: 'dead', color: 'red' },
      { state: 'paused', color: '#ffd101' },
      { state: 'exited*', color: 'var(--warning-color)' },
    ],
  };

  it('should return undefined when there is no entity', () => {
    expect(stateColor(config, undefined)).to.be.undefined;
  });

  it('should return undefined when no state matches', () => {
    expect(stateColor(config, entity('running'))).to.be.undefined;
  });

  it('should return undefined when no colors are configured', () => {
    expect(stateColor({}, entity('dead'))).to.be.undefined;
  });

  it('should map color tokens to their theme variable', () => {
    expect(stateColor(config, entity('dead'))).to.equal(
      'var(--red-color, red)',
    );
  });

  it('should pass css colors through untouched', () => {
    expect(stateColor(config, entity('paused'))).to.equal('#ffd101');
    expect(stateColor(config, entity('exited (1)'))).to.equal(
      'var(--warning-color)',
    );
  });

  it('should use the first matching color', () => {
    const multi: BaseConfig = {
      state_colors: [
        { state: '*', color: 'blue' },
        { state: 'dead', color: 'red' },
      ],
    };
    expect(stateColor(multi, entity('dead'))).to.equal(
      'var(--blue-color, blue)',
    );
  });
});
