import cardSpec from './device-card/card.spec';
import editorSpec from './device-card/editor.spec';
import integrationCardSpec from './integration-card/card.spec';
import integrationEditorSpec from './integration-card/editor.spec';
import {
  default as excludeDevicesSpec,
  default as includeDevicesSpec,
} from './integration-card/include-devices.spec';

describe('cards', () => {
  describe('device-card', () => {
    cardSpec();
    editorSpec();
  });
  describe('integration-card', () => {
    integrationCardSpec();
    integrationEditorSpec();
    excludeDevicesSpec();
    includeDevicesSpec();
  });
});
