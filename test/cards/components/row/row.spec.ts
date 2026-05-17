import * as cardHelpersModule from '@/helpers/card-helpers';
import { DeviceCardRow } from '@cards/components/row/row';
import type { Config } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import * as attributesModule from '@html/attributes';
import * as percentBarModule from '@html/percent';
import * as stateContentModule from '@html/state-content';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation } from '@type/config';
import type { CardHelpers } from '@type/lovelace';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('device-card-row.ts', () => {
  let el: DeviceCardRow;
  let hass: HomeAssistant;
  let config: Config;
  let entity: EntityInformation;

  let resolvePoatCardHelpersStub: sinon.SinonStub;
  let stateContentStub: sinon.SinonStub;
  let percentBarStub: sinon.SinonStub;
  let attributesStub: sinon.SinonStub;

  beforeEach(() => {
    resolvePoatCardHelpersStub = stub(
      cardHelpersModule,
      'resolvePoatCardHelpers',
    );

    stateContentStub = stub(stateContentModule, 'stateContent');
    stateContentStub.returns(html`<div class="mocked-state-content"></div>`);

    percentBarStub = stub(percentBarModule, 'percentBar');
    percentBarStub.returns(html`<div class="mocked-percent-bar"></div>`);

    attributesStub = stub(attributesModule, 'attributes');
    attributesStub.returns(html`<div class="mocked-attributes"></div>`);

    hass = {} as HomeAssistant;
    config = { device_id: 'device_1' };
    entity = {
      entity_id: 'sensor.test',
      state: '75',
      translation_key: undefined,
      attributes: { unit_of_measurement: '%' },
      name: 'Test',
      isActive: false,
      isProblemEntity: false,
    };

    el = new DeviceCardRow();
    el.hass = hass;
    el.config = config;
    el.entity = entity;
  });

  afterEach(() => {
    resolvePoatCardHelpersStub.restore();
    stateContentStub.restore();
    percentBarStub.restore();
    attributesStub.restore();
  });

  describe('connectedCallback', () => {
    it('should resolve and store card helpers', async () => {
      (el as any)._cardHelpers = undefined;
      const helpers = {} as CardHelpers;
      resolvePoatCardHelpersStub.resolves(helpers);
      (globalThis as any).loadCardHelpers = () => Promise.resolve(helpers);

      // Avoid Lit style adoption in jsdom; test only helper resolution.
      (el as any).createRenderRoot = () => document.createElement('div');
      el.connectedCallback();
      await Promise.resolve();

      expect(resolvePoatCardHelpersStub.calledOnce).to.be.true;
      expect((el as any)._cardHelpers).to.equal(helpers);
    });
  });

  describe('render()', () => {
    it('should render nothing if card helpers are not resolved yet', () => {
      (el as any)._cardHelpers = undefined;
      expect(el.render()).to.equal(nothing);
    });

    it('should render row content and percent bar', async () => {
      (el as any)._cardHelpers = {} as CardHelpers;
      const root = await fixture(el.render() as TemplateResult);

      expect(root.classList.contains('row')).to.be.true;
      expect(root.querySelector('.row-content')).to.exist;
      expect(stateContentStub.calledOnce).to.be.true;
      expect(percentBarStub.calledOnce).to.be.true;
    });

    it('should render a percentage bar for entities with % unit variations like "% available"', async () => {
      (el as any)._cardHelpers = {} as CardHelpers;
      el.entity = {
        ...entity,
        attributes: {
          ...entity.attributes,
          unit_of_measurement: '% available',
        },
      };

      await fixture(el.render() as TemplateResult);

      expect(percentBarStub.calledOnce).to.be.true;
      expect(percentBarStub.firstCall.args[0]).to.equal(el.entity);
      expect(percentBarStub.firstCall.args[1]).to.deep.equal([]);
    });

    it('should not render a percentage bar for non-percentage entities', async () => {
      (el as any)._cardHelpers = {} as CardHelpers;
      el.entity = {
        ...entity,
        attributes: { ...entity.attributes, unit_of_measurement: '°C' },
      };

      await fixture(el.render() as TemplateResult);

      expect(percentBarStub.called).to.be.false;
    });

    it('should not render a percentage bar for entities with % unit but non-numeric state', async () => {
      (el as any)._cardHelpers = {} as CardHelpers;
      el.entity = {
        ...entity,
        state: 'unknown',
        attributes: { ...entity.attributes, unit_of_measurement: '%' },
      };

      await fixture(el.render() as TemplateResult);

      expect(percentBarStub.called).to.be.false;
    });

    it('should apply status-error class for active problem entities', async () => {
      (el as any)._cardHelpers = {} as CardHelpers;
      el.entity = { ...entity, isProblemEntity: true, isActive: true };

      const root = await fixture(el.render() as TemplateResult);

      expect(root.classList.contains('status-error')).to.be.true;
      expect(stateContentStub.calledOnce).to.be.true;
      expect(stateContentStub.firstCall.args[2]).to.equal('status-error');
    });

    it('should apply status-ok class for inactive problem entities', async () => {
      (el as any)._cardHelpers = {} as CardHelpers;
      el.entity = { ...entity, isProblemEntity: true, isActive: false };

      const root = await fixture(el.render() as TemplateResult);

      expect(root.classList.contains('status-ok')).to.be.true;
      expect(stateContentStub.calledOnce).to.be.true;
      expect(stateContentStub.firstCall.args[2]).to.equal('status-ok');
    });

    it('should pass inverse_percent entities to percentBar when configured', async () => {
      (el as any)._cardHelpers = {} as CardHelpers;
      el.config = {
        ...config,
        inverse_percent: ['sensor.test', 'sensor.other_sensor'],
      };

      await fixture(el.render() as TemplateResult);

      expect(percentBarStub.calledOnce).to.be.true;
      expect(percentBarStub.firstCall.args[0]).to.equal(entity);
      expect(percentBarStub.firstCall.args[1]).to.deep.equal([
        'sensor.test',
        'sensor.other_sensor',
      ]);
    });

    it('should pass empty array to percentBar when inverse_percent is not configured', async () => {
      (el as any)._cardHelpers = {} as CardHelpers;

      await fixture(el.render() as TemplateResult);

      expect(percentBarStub.calledOnce).to.be.true;
      expect(percentBarStub.firstCall.args[1]).to.deep.equal([]);
    });

    it('should not show attributes when entity is collapsed', async () => {
      (el as any)._cardHelpers = {} as CardHelpers;
      (el as any)._expanded = false;

      await fixture(el.render() as TemplateResult);

      expect(attributesStub.called).to.be.false;
    });

    it('should show attributes when entity is expanded', async () => {
      (el as any)._cardHelpers = {} as CardHelpers;
      (el as any)._expanded = true;

      const root = await fixture(el.render() as TemplateResult);

      expect(root.classList.contains('expanded-row')).to.be.true;
      expect(attributesStub.calledOnce).to.be.true;
      expect(attributesStub.firstCall.args[0]).to.equal(entity);
    });
  });
});
