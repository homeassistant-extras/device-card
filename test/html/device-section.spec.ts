import type { HomeAssistant } from '@hass/types';
import { renderSections } from '@html/device-section';
import * as rowModule from '@html/row';
import * as sectionModule from '@html/section';
import * as showMoreModule from '@html/show-more';
import type { Config, Device, EntityInformation } from '@type/config';
import { expect } from 'chai';
import { html } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('device-section.ts', () => {
    // Common test variables
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let mockElement: any;
    let mockEntities: EntityInformation[];

    // Stubs for extracted components
    let rowStub: sinon.SinonStub;
    let chevronStub: sinon.SinonStub;
    let showMoreStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock entities
      mockEntities = [
        {
          entity_id: 'sensor.test_1',
          state: '50',
          translation_key: undefined,
          attributes: { friendly_name: 'Test 1' },
          isActive: false,
          isProblemEntity: false,
        } as EntityInformation,
        {
          entity_id: 'sensor.test_2',
          state: '75',
          translation_key: undefined,
          attributes: { friendly_name: 'Test 2' },
          isActive: false,
          isProblemEntity: false,
        } as EntityInformation,
        {
          entity_id: 'sensor.test_3',
          state: '25',
          translation_key: undefined,
          attributes: { friendly_name: 'Test 3' },
          isActive: false,
          isProblemEntity: false,
        } as EntityInformation,
      ];

      // Mock Home Assistant
      mockHass = {} as HomeAssistant;

      // Mock config
      mockConfig = {
        preview_count: 3, // Default preview count
      } as Config;

      // Mock element with expandedSections property
      mockElement = {
        expandedSections: {},
        expandedEntities: {},
      };

      // Create stubs for the extracted components
      rowStub = stub(rowModule, 'row');
      rowStub.returns(html`<div class="mocked-row"></div>`);

      chevronStub = stub(showMoreModule, 'chevron');
      chevronStub.returns(html`<div class="mocked-chevron"></div>`);

      showMoreStub = stub(showMoreModule, 'showMore');
      showMoreStub.returns(html`<div class="mocked-show-more"></div>`);
    });

    afterEach(() => {
      // Restore all stubs
      rowStub.restore();
      chevronStub.restore();
      showMoreStub.restore();
    });

    describe('renderSections', () => {
      let mockDevice: Device;
      let renderSectionStub: sinon.SinonStub;

      beforeEach(() => {
        // Create mock device with sample entities for each section
        mockDevice = {
          controls: [{ entity_id: 'light.test' } as EntityInformation],
          configurations: [{ entity_id: 'config.test' } as EntityInformation],
          sensors: [{ entity_id: 'sensor.test' } as EntityInformation],
          diagnostics: [{ entity_id: 'diagnostic.test' } as EntityInformation],
        };

        // Stub renderSection function
        renderSectionStub = stub(sectionModule, 'renderSection');
        renderSectionStub.returns(html`<div class="mocked-section"></div>`);
      });

      afterEach(() => {
        // Restore the original renderSection function
        renderSectionStub.restore();
      });

      it('should render sections in default order when no custom order is specified', () => {
        // Call the function with default config (no section_order)
        const result = renderSections(
          mockElement,
          mockHass,
          mockConfig,
          mockDevice,
        );

        // Verify renderSection was called in the expected order
        expect(renderSectionStub.callCount).to.equal(4);
        expect(renderSectionStub.getCall(0).args[3]).to.equal('Controls');
        expect(renderSectionStub.getCall(1).args[3]).to.equal('Configuration');
        expect(renderSectionStub.getCall(2).args[3]).to.equal('Sensors');
        expect(renderSectionStub.getCall(3).args[3]).to.equal('Diagnostic');

        // Verify return value
        expect(result).to.have.length(4);
      });

      it('should render sections in custom order when section_order is specified', () => {
        // Set custom section order
        mockConfig.section_order = [
          'sensors',
          'controls',
          'diagnostics',
          'configurations',
        ];

        // Call the function with custom order config
        const result = renderSections(
          mockElement,
          mockHass,
          mockConfig,
          mockDevice,
        );

        // Verify renderSection was called in the expected custom order
        expect(renderSectionStub.callCount).to.equal(4);
        expect(renderSectionStub.getCall(0).args[3]).to.equal('Sensors');
        expect(renderSectionStub.getCall(1).args[3]).to.equal('Controls');
        expect(renderSectionStub.getCall(2).args[3]).to.equal('Diagnostic');
        expect(renderSectionStub.getCall(3).args[3]).to.equal('Configuration');

        // Verify return value
        expect(result).to.have.length(4);
      });

      it('should handle partial section ordering and include remaining sections at the end', () => {
        // Set custom section order with only some sections
        mockConfig.section_order = ['sensors'];

        // Call the function with partial custom order
        const result = renderSections(
          mockElement,
          mockHass,
          mockConfig,
          mockDevice,
        );

        // Verify renderSection was called with specified section first, then others
        expect(renderSectionStub.callCount).to.equal(4);
        expect(renderSectionStub.getCall(0).args[3]).to.equal('Sensors');

        // Other sections should still be included
        const remainingCalls = [
          renderSectionStub.getCall(1).args[3],
          renderSectionStub.getCall(2).args[3],
          renderSectionStub.getCall(3).args[3],
        ];

        expect(remainingCalls).to.include('Controls');
        expect(remainingCalls).to.include('Configuration');
        expect(remainingCalls).to.include('Diagnostic');

        // Verify return value
        expect(result).to.have.length(4);
      });

      it('should handle empty section_order array and use default order', () => {
        // Set empty section_order array
        mockConfig.section_order = [];

        // Call the function
        const result = renderSections(
          mockElement,
          mockHass,
          mockConfig,
          mockDevice,
        );

        // Verify renderSection was called in default order
        expect(renderSectionStub.callCount).to.equal(4);
        expect(renderSectionStub.getCall(0).args[3]).to.equal('Controls');
        expect(renderSectionStub.getCall(1).args[3]).to.equal('Configuration');
        expect(renderSectionStub.getCall(2).args[3]).to.equal('Sensors');
        expect(renderSectionStub.getCall(3).args[3]).to.equal('Diagnostic');

        // Verify return value
        expect(result).to.have.length(4);
      });

      it('should ignore invalid section keys in section_order', () => {
        // Set custom section order with an invalid section key
        mockConfig.section_order = ['sensors', 'invalid_section', 'controls'];

        // Call the function
        const result = renderSections(
          mockElement,
          mockHass,
          mockConfig,
          mockDevice,
        );

        // Verify renderSection was called correctly, skipping invalid section
        expect(renderSectionStub.callCount).to.equal(4);
        expect(renderSectionStub.getCall(0).args[3]).to.equal('Sensors');
        expect(renderSectionStub.getCall(1).args[3]).to.equal('Controls');

        // Other sections should be included at the end
        const remainingCalls = [
          renderSectionStub.getCall(2).args[3],
          renderSectionStub.getCall(3).args[3],
        ];

        expect(remainingCalls).to.include('Configuration');
        expect(remainingCalls).to.include('Diagnostic');

        // Verify return value
        expect(result).to.have.length(4);
      });
    });
  });
};
