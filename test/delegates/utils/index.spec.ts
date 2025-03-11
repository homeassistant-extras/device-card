import cardEntitiesSpec from './card-entities.spec';
import hasProblemSpec from './has-problem.spec';
import deviceSpec from './petkit-unit.spec';

export default () => {
  describe('utils', () => {
    cardEntitiesSpec();
    hasProblemSpec();
    deviceSpec();
  });
};
