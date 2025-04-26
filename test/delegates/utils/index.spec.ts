import cardEntitiesSpec from './card-entities.spec';
import deviceSpec from './get-device.spec';
import hasProblemSpec from './has-problem.spec';
import integrationSchemaSpec from './integration-schema.spec';
import isIntegrationSpec from './is-integration.spec';

export default () => {
  describe('utils', () => {
    cardEntitiesSpec();
    hasProblemSpec();
    deviceSpec();
    isIntegrationSpec();
    integrationSchemaSpec();
  });
};
