import cardEntitiesSpec from './card-entities.spec';
import deviceSpec from './get-device.spec';
import hasProblemSpec from './has-problem.spec';

export default () => {
  describe('utils', () => {
    cardEntitiesSpec();
    hasProblemSpec();
    deviceSpec();
  });
};
