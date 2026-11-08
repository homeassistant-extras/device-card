import {
  collapseAction,
  deviceNavigateAction,
  devicePagePath,
  headerActions,
} from '@delegates/utils/header-actions';
import { expect } from 'chai';

describe('header-actions.ts', () => {
  it('should build the device page path', () => {
    expect(devicePagePath('abc')).to.equal('/config/devices/device/abc');
  });

  it('should build a fire-dom-event collapse action', () => {
    expect(collapseAction()).to.deep.equal({
      action: 'fire-dom-event',
      device_card: { collapse: true },
    });
  });

  it('should build a navigate action to the device page', () => {
    expect(deviceNavigateAction('abc')).to.deep.equal({
      action: 'navigate',
      navigation_path: '/config/devices/device/abc',
    });
  });

  it('should tap to collapse and hold to navigate', () => {
    expect(headerActions('abc')).to.deep.equal({
      tap_action: collapseAction(),
      hold_action: deviceNavigateAction('abc'),
    });
  });

  it('should omit hold_action without a device id', () => {
    expect(headerActions()).to.deep.equal({ tap_action: collapseAction() });
  });
});
