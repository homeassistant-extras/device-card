import cardEntitiesSpec from './card-entities.spec';
import editorSchema from './editor-schema.spec';
import deviceSpec from './get-device.spec';
import hasProblemSpec from './has-problem.spec';
import isIntegrationSpec from './is-integration.spec';

export default () => {
  describe('utils', () => {
    cardEntitiesSpec();
    hasProblemSpec();
    deviceSpec();
    isIntegrationSpec();
    editorSchema();
  });
};
