import * as featureModule from '@config/feature';
import type { Config } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import { deviceCardHeader } from '@html/device-card-header';
import * as localizeModule from '@localize/localize';
import { fixture } from '@open-wc/testing-helpers';
import type { Device } from '@type/config';
import { expect } from 'chai';
import type { TemplateResult } from 'lit';
import { html, nothing } from 'lit';
import { stub } from 'sinon';

describe('device-card-header.ts', () => {
  let mockHass: HomeAssistant;
  let mockDevice: Device;
  let mockConfig: Config;
  let hasFeatureStub: sinon.SinonStub;
  let localizeStub: sinon.SinonStub;

  const defaultParams = () => ({
    config: mockConfig,
    device: mockDevice,
    hass: mockHass,
    collapse: false,
    onCollapseToggle: () => {},
    entity: nothing as TemplateResult | typeof nothing,
  });

  beforeEach(() => {
    mockHass = { language: 'en' } as HomeAssistant;
    mockDevice = {
      name: 'Test Device',
      model: 'Model X',
      sensors: [],
      controls: [],
      diagnostics: [],
      configurations: [],
    };
    mockConfig = { device_id: 'device_1' };

    hasFeatureStub = stub(featureModule, 'hasFeature');
    localizeStub = stub(localizeModule, 'localize');
    hasFeatureStub.returns(false);
    localizeStub.callsFake((_, key: string) =>
      key === 'card.expand' ? 'Expand' : 'Collapse',
    );
  });

  afterEach(() => {
    hasFeatureStub.restore();
    localizeStub.restore();
  });

  describe('full header', () => {
    it('should render title from config when available', async () => {
      mockConfig = { device_id: 'device_1', title: 'Custom Title' };
      const result = deviceCardHeader(defaultParams());
      const el = await fixture(result as TemplateResult);
      const titleEl = el.querySelector('.title span:not(.model)');
      expect(titleEl?.textContent).to.equal('Custom Title');
    });

    it('should use device name when no title in config', async () => {
      const result = deviceCardHeader(defaultParams());
      const el = await fixture(result as TemplateResult);
      const titleEl = el.querySelector('.title span:not(.model)');
      expect(titleEl?.textContent).to.equal('Test Device');
    });

    it('should display model information', async () => {
      const result = deviceCardHeader(defaultParams());
      const el = await fixture(result as TemplateResult);
      const modelEl = el.querySelector('.model');
      expect(modelEl?.textContent).to.equal('Model X');
    });

    it('should not display model when hide_device_model is set', async () => {
      hasFeatureStub.withArgs(mockConfig, 'hide_device_model').returns(true);
      hasFeatureStub.withArgs(mockConfig, 'hide_title').returns(false);
      const result = deviceCardHeader(defaultParams());
      const el = await fixture(result as TemplateResult);
      const modelEl = el.querySelector('.model');
      expect(modelEl).to.be.null;
    });

    it('should not display title when hide_title is set', async () => {
      hasFeatureStub.withArgs(mockConfig, 'hide_title').returns(true);
      hasFeatureStub.withArgs(mockConfig, 'hide_device_model').returns(false);
      const result = deviceCardHeader(defaultParams());
      const el = await fixture(result as TemplateResult);
      const titleEl = el.querySelector('.title span:not(.model)');
      expect(titleEl).to.be.null;
      const modelEl = el.querySelector('.model');
      expect(modelEl?.textContent).to.equal('Model X');
    });

    it('should render ha-state-icon when device has entity', async () => {
      mockDevice = {
        ...mockDevice,
        entity: {
          entity_id: 'sensor.test',
          state: '75',
          attributes: {},
        },
      };
      const result = deviceCardHeader(defaultParams());
      const el = await fixture(result as TemplateResult);
      const icon = el.querySelector('ha-state-icon');
      expect(icon).to.exist;
    });

    it('should render ha-icon when config.icon is set and no entity', async () => {
      mockConfig = { device_id: 'device_1', icon: 'mdi:thermometer' };
      const result = deviceCardHeader(defaultParams());
      const el = await fixture(result as TemplateResult);
      const icon = el.querySelector('ha-icon');
      expect(icon).to.exist;
      expect((icon as any).icon).to.equal('mdi:thermometer');
    });

    it('should not display icon when hide_icon feature is set', async () => {
      mockDevice = {
        ...mockDevice,
        entity: {
          entity_id: 'sensor.test',
          state: '75',
          attributes: {},
        },
      };
      mockConfig = { device_id: 'device_1', icon: 'mdi:thermometer' };
      hasFeatureStub.withArgs(mockConfig, 'hide_icon').returns(true);
      const result = deviceCardHeader(defaultParams());
      const el = await fixture(result as TemplateResult);
      expect(el.querySelector('ha-state-icon')).to.be.null;
      expect(el.querySelector('ha-icon')).to.be.null;
    });

    it('should pass config.icon to ha-state-icon when both entity and icon set', async () => {
      mockDevice = {
        ...mockDevice,
        entity: {
          entity_id: 'sensor.test',
          state: '75',
          attributes: {},
        },
      };
      mockConfig = { device_id: 'device_1', icon: 'mdi:custom-icon' };
      const result = deviceCardHeader(defaultParams());
      const el = await fixture(result as TemplateResult);
      const icon = el.querySelector('ha-state-icon');
      expect(icon).to.exist;
      expect((icon as any).icon).to.equal('mdi:custom-icon');
    });

    it('should show Collapse tooltip when not collapsed', async () => {
      const result = deviceCardHeader(defaultParams());
      const el = await fixture(result as TemplateResult);
      expect(el.getAttribute('title')).to.equal('Collapse');
    });

    it('should show Expand tooltip when collapsed', async () => {
      const result = deviceCardHeader({
        ...defaultParams(),
        collapse: true,
      });
      const el = await fixture(result as TemplateResult);
      expect(el.getAttribute('title')).to.equal('Expand');
    });

    it('should add collapsed class when collapse is true', async () => {
      const result = deviceCardHeader({
        ...defaultParams(),
        collapse: true,
      });
      const el = await fixture(result as TemplateResult);
      expect(el.classList.contains('collapsed')).to.be.true;
    });

    it('should call onCollapseToggle when header is clicked', async () => {
      let toggled = false;
      const result = deviceCardHeader({
        ...defaultParams(),
        onCollapseToggle: () => (toggled = true),
      });
      const el = await fixture(result as TemplateResult);
      (el as HTMLElement).click();
      expect(toggled).to.be.true;
    });

    it('should include entity in header', async () => {
      const entityContent = html`<span class="pinned-state">75%</span>`;
      const result = deviceCardHeader({
        ...defaultParams(),
        entity: entityContent,
      });
      const el = await fixture(result as TemplateResult);
      const pinned = el.querySelector('.pinned-state');
      expect(pinned?.textContent).to.equal('75%');
    });
  });

  describe('entity-state-only (header hidden)', () => {
    it('should render entity-state-only when both hide_title and hide_device_model', async () => {
      hasFeatureStub.withArgs(mockConfig, 'hide_title').returns(true);
      hasFeatureStub.withArgs(mockConfig, 'hide_device_model').returns(true);

      const entityContent = html`<span class="pinned-state">75%</span>`;
      const result = deviceCardHeader({
        ...defaultParams(),
        entity: entityContent,
      });

      const el = await fixture(result as TemplateResult);
      expect(el.classList.contains('entity-state-only')).to.be.true;
      const pinned = el.querySelector('.pinned-state');
      expect(pinned?.textContent).to.equal('75%');
    });

    it('should return nothing when header hidden and no entity', () => {
      hasFeatureStub.withArgs(mockConfig, 'hide_title').returns(true);
      hasFeatureStub.withArgs(mockConfig, 'hide_device_model').returns(true);

      const result = deviceCardHeader(defaultParams());
      expect(result).to.equal(nothing);
    });
  });
});
