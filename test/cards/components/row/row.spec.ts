import { DeviceCardRow } from '@cards/components/row/row';
import type { Config } from '@device/types';
import * as entityRowModule from '@homeassistant-extras/hass/html/entity-row';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import * as attributesModule from '@html/attributes';
import * as percentBarModule from '@html/percent';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation } from '@type/config';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('device-card-row.ts', () => {
  let el: DeviceCardRow;
  let hass: HomeAssistant;
  let config: Config;
  let entity: EntityInformation;

  let entityRowStub: sinon.SinonStub;
  let percentBarStub: sinon.SinonStub;
  let attributesStub: sinon.SinonStub;

  beforeEach(() => {
    entityRowStub = stub(entityRowModule, 'entityRow');
    entityRowStub.returns(html`<div class="mocked-entity-row"></div>`);

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
    entityRowStub.restore();
    percentBarStub.restore();
    attributesStub.restore();
  });

  describe('render()', () => {
    it('should render row content and percent bar', async () => {
      const root = await fixture(el.render() as TemplateResult);

      expect(root.classList.contains('row')).to.be.true;
      expect(root.querySelector('.row-content')).to.exist;
      expect(entityRowStub.calledOnce).to.be.true;
      expect(percentBarStub.calledOnce).to.be.true;
    });

    it('should render a percentage bar for entities with % unit variations like "% available"', async () => {
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
      el.entity = {
        ...entity,
        attributes: { ...entity.attributes, unit_of_measurement: '°C' },
      };

      await fixture(el.render() as TemplateResult);

      expect(percentBarStub.called).to.be.false;
    });

    it('should not render a percentage bar for entities with % unit but non-numeric state', async () => {
      el.entity = {
        ...entity,
        state: 'unknown',
        attributes: { ...entity.attributes, unit_of_measurement: '%' },
      };

      await fixture(el.render() as TemplateResult);

      expect(percentBarStub.called).to.be.false;
    });

    it('should apply status-error class for active problem entities', async () => {
      el.entity = { ...entity, isProblemEntity: true, isActive: true };

      const root = await fixture(el.render() as TemplateResult);

      expect(root.classList.contains('status-error')).to.be.true;
      expect(entityRowStub.calledOnce).to.be.true;
      expect(entityRowStub.firstCall.args[2]).to.equal('status-error');
    });

    it('should apply status-ok class for inactive problem entities', async () => {
      el.entity = { ...entity, isProblemEntity: true, isActive: false };

      const root = await fixture(el.render() as TemplateResult);

      expect(root.classList.contains('status-ok')).to.be.true;
      expect(entityRowStub.calledOnce).to.be.true;
      expect(entityRowStub.firstCall.args[2]).to.equal('status-ok');
    });

    it('should pass inverse_percent and percent_colors to percentBar when configured', async () => {
      const percentColors = { 'sensor.*': 'blue' };
      el.config = {
        ...config,
        inverse_percent: ['sensor.test', 'sensor.other_sensor'],
        percent_colors: percentColors,
      };

      await fixture(el.render() as TemplateResult);

      expect(percentBarStub.calledOnce).to.be.true;
      expect(percentBarStub.firstCall.args[0]).to.equal(entity);
      expect(percentBarStub.firstCall.args[1]).to.deep.equal([
        'sensor.test',
        'sensor.other_sensor',
      ]);
      expect(percentBarStub.firstCall.args[2]).to.equal(percentColors);
    });

    it('should pass empty array to percentBar when inverse_percent is not configured', async () => {
      await fixture(el.render() as TemplateResult);

      expect(percentBarStub.calledOnce).to.be.true;
      expect(percentBarStub.firstCall.args[1]).to.deep.equal([]);
    });

    it('should not show attributes when entity is collapsed', async () => {
      (el as any)._expanded = false;

      await fixture(el.render() as TemplateResult);

      expect(attributesStub.called).to.be.false;
    });

    it('should show attributes when entity is expanded', async () => {
      (el as any)._expanded = true;

      const root = await fixture(el.render() as TemplateResult);

      expect(root.classList.contains('expanded-row')).to.be.true;
      expect(attributesStub.calledOnce).to.be.true;
      expect(attributesStub.firstCall.args[0]).to.equal(entity);
    });
  });

  describe('_handleLLCustomEvent', () => {
    it('should toggle expanded for matching entity_id', () => {
      (el as any)._expanded = false;

      const ev = new CustomEvent('ll-custom', {
        detail: {
          device_card: { expand: true, entity_id: 'sensor.test' },
        },
        cancelable: true,
      });
      const stopStub = stub(ev, 'stopPropagation');

      (el as any)._handleLLCustomEvent(ev);

      expect((el as any)._expanded).to.be.true;
      expect(stopStub.calledOnce).to.be.true;
    });

    it('should ignore events for other entities or without expand', () => {
      (el as any)._expanded = false;

      (el as any)._handleLLCustomEvent(
        new CustomEvent('ll-custom', {
          detail: {
            device_card: { expand: true, entity_id: 'sensor.other' },
          },
        }),
      );
      expect((el as any)._expanded).to.be.false;

      (el as any)._handleLLCustomEvent(
        new CustomEvent('ll-custom', {
          detail: { device_card: { expand: false, entity_id: 'sensor.test' } },
        }),
      );
      expect((el as any)._expanded).to.be.false;
    });
  });
});
