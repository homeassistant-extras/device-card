import type { OrderedSection } from '@/helpers/device-section';
import type { Config } from '@device/types';
import * as featureModule from '@homeassistant-extras/hass/common/config/feature';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation } from '@type/config';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { DeviceCardSection } from '../../../../src/cards/components/section/section';
import * as sectionModule from '../../../../src/html/section';

describe('device-card-section.ts', () => {
  let el: DeviceCardSection;
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let mockSection: OrderedSection;

  let renderSectionStub: sinon.SinonStub;
  let hasFeatureStub: sinon.SinonStub;

  beforeEach(() => {
    mockHass = { language: 'en' } as HomeAssistant;

    mockConfig = {
      preview_count: 3,
    } as Config;

    mockSection = {
      key: 'controls',
      name: 'Controls',
      entities: [
        {
          entity_id: 'light.test',
          state: 'on',
          translation_key: undefined,
          attributes: {},
          name: 'Light',
          isActive: false,
          isProblemEntity: false,
        } as EntityInformation,
      ],
    };

    renderSectionStub = stub(sectionModule, 'renderSection');
    renderSectionStub.returns(html`<div class="stub-section"></div>`);

    hasFeatureStub = stub(featureModule, 'hasFeature');
    hasFeatureStub.returns(false);

    el = new DeviceCardSection();
    el.hass = mockHass;
    el.config = mockConfig;
    el.section = mockSection;
  });

  afterEach(() => {
    renderSectionStub.restore();
    hasFeatureStub.restore();
  });

  it('delegates to renderSection with section and collapsed state by default', async () => {
    await fixture(el.render() as TemplateResult);

    expect(renderSectionStub.calledOnce).to.be.true;
    expect(renderSectionStub.firstCall.args[0]).to.equal(mockHass);
    expect(renderSectionStub.firstCall.args[1]).to.equal(mockConfig);
    expect(renderSectionStub.firstCall.args[2]).to.equal(mockSection);
    expect(renderSectionStub.firstCall.args[3]).to.be.false;
    expect(renderSectionStub.firstCall.args[4]).to.be.a('function');
  });

  it('uses expanded feature default when hasFeature(expanded) is true', async () => {
    hasFeatureStub.callsFake((_c, f) => f === 'expanded');

    await fixture(el.render() as TemplateResult);

    expect(renderSectionStub.firstCall.args[3]).to.be.true;
  });

  it('toggle callback flips sectionExpanded on the next render', async () => {
    await fixture(el.render() as TemplateResult);

    expect(renderSectionStub.firstCall.args[3]).to.be.false;

    const onToggle = renderSectionStub.firstCall.args[4] as () => void;
    onToggle();
    await fixture(el.render() as TemplateResult);

    expect(renderSectionStub.calledTwice).to.be.true;
    expect(renderSectionStub.secondCall.args[3]).to.be.true;
  });
});
