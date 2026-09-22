// test/html/pinned-entity.spec.ts

import type { Config } from '@device/types';
import * as featureModule from '@homeassistant-extras/hass/common/config/feature';
import * as stateRetrieverModule from '@homeassistant-extras/hass/delegates/retrievers/state';
import * as stateDisplayModule from '@homeassistant-extras/hass/render/state-display';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { pinnedEntity } from '@html/pinned-entity';
import type { Device } from '@type/config';
import { expect } from 'chai';
import { html, nothing } from 'lit';
import { stub } from 'sinon';

describe('pinned-entity.ts', () => {
  let mockHass: HomeAssistant;
  let mockDevice: Device;
  let getStateStub: sinon.SinonStub;
  let stateDisplayStub: sinon.SinonStub;
  let hasFeatureStub: sinon.SinonStub;

  beforeEach(() => {
    // Create mock HomeAssistant instance
    mockHass = {} as HomeAssistant;

    mockDevice = {
      sensors: [],
      controls: [],
      diagnostics: [],
      configurations: [],
    };

    // Create stubs for the dependencies
    getStateStub = stub(stateRetrieverModule, 'getState');
    stateDisplayStub = stub(stateDisplayModule, 'stateDisplay');
    hasFeatureStub = stub(featureModule, 'hasFeature');

    // Default stub behavior
    stateDisplayStub.returns(
      html`<div class="mocked-state-display">Mocked State</div>`,
    );
    hasFeatureStub.returns(false); // Default to not hiding the pinned state
  });

  afterEach(() => {
    // Restore all stubs
    getStateStub.restore();
    stateDisplayStub.restore();
    hasFeatureStub.restore();
  });

  it('should return nothing when the device has no featured entity', () => {
    const result = pinnedEntity(mockHass, {} as Config, mockDevice);

    expect(result).to.equal(nothing);
    expect(getStateStub.calledWith(mockHass, undefined)).to.be.true;
    expect(stateDisplayStub.called).to.be.false;
  });

  it('should render the state of the featured entity', () => {
    const mockState = {
      entity_id: 'sensor.test_entity',
      state: '50',
      attributes: { unit_of_measurement: '%' },
    };
    mockDevice.entity = mockState;
    getStateStub.returns(mockState);

    const result = pinnedEntity(mockHass, {} as Config, mockDevice);

    expect(getStateStub.calledWith(mockHass, 'sensor.test_entity')).to.be.true;
    expect(stateDisplayStub.calledOnceWith(mockHass, mockState)).to.be.true;
    expect(result).to.not.equal(nothing);
  });

  it('should return nothing when the state is no longer available', () => {
    mockDevice.entity = {
      entity_id: 'sensor.non_existent_entity',
      state: 'unknown',
      attributes: {},
    };
    getStateStub.returns(undefined);

    const result = pinnedEntity(mockHass, {} as Config, mockDevice);

    expect(result).to.equal(nothing);
    expect(stateDisplayStub.called).to.be.false;
  });

  it('should return nothing when hide_entity_state feature is enabled', () => {
    const config: Config = { features: ['hide_entity_state'] };
    mockDevice.entity = {
      entity_id: 'sensor.test_entity',
      state: '50',
      attributes: {},
    };
    hasFeatureStub.returns(true);

    const result = pinnedEntity(mockHass, config, mockDevice);

    expect(result).to.equal(nothing);
    expect(hasFeatureStub.calledOnceWith(config, 'hide_entity_state')).to.be
      .true;
    expect(getStateStub.called).to.be.false;
    expect(stateDisplayStub.called).to.be.false;
  });
});
