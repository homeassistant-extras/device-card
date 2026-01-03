/**
 * @file section.ts
 * @description Section rendering for the device card
 * This file handles the rendering of collapsible sections within the device card,
 * organizing entities by their type (sensors, controls, etc.) and managing
 * expandable/collapsible behavior.
 */

import type { Config, Expansions } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { Device, EntityInformation } from '@type/config';
import { nothing, type TemplateResult } from 'lit';
import { renderSection } from './section';

/**
 * Renders sections in the order specified by config or in default order
 * @param {HTMLElement} element - The card component instance
 * @param {Expansions} expansions - The expansions object for managing section states
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The card configuration
 * @param {Device} device - The device information
 * @returns {Promise<TemplateResult[]>} Array of section templates
 */
export const renderSections = async (
  element: HTMLElement,
  expansions: Expansions,
  hass: HomeAssistant,
  config: Config,
  device: Device,
  updateExpansions: (expansion: Expansions) => void,
): Promise<TemplateResult[]> => {
  const sectionConfig = [
    {
      name: localize(hass, 'sections.controls'),
      key: 'controls',
      entities: device.controls,
    },
    {
      name: localize(hass, 'sections.configuration'),
      key: 'configurations',
      entities: device.configurations,
    },
    {
      name: localize(hass, 'sections.sensors'),
      key: 'sensors',
      entities: device.sensors,
    },
    {
      name: localize(hass, 'sections.diagnostic'),
      key: 'diagnostics',
      entities: device.diagnostics,
    },
  ];

  let orderedSections: {
    key: string;
    name: string;
    entities: EntityInformation[];
  }[] = [];

  // if custom order is provided, reorder the sections
  if (config.section_order && config.section_order.length > 0) {
    orderedSections = config.section_order
      .map((section) => sectionConfig.find((s) => s.key === section))
      .filter((section) => section !== undefined);

    sectionConfig.forEach((section) => {
      if (!orderedSections.some((s) => s?.key === section.key)) {
        orderedSections.push(section);
      }
    });
  } else {
    // default order
    orderedSections = sectionConfig;
  }

  const sectionPromises = orderedSections.map((section) =>
    renderSection(
      element,
      expansions,
      hass,
      config,
      section.name,
      section.entities,
      updateExpansions,
    ),
  );

  const sectionResults = await Promise.all(sectionPromises);
  return sectionResults.filter((result) => result !== nothing);
};
