/**
 * @file section.ts
 * @description Section rendering for the device card
 * This file handles the rendering of collapsible sections within the device card,
 * organizing entities by their type (sensors, controls, etc.) and managing
 * expandable/collapsible behavior.
 */

import type { DeviceCard } from '@device/card';
import type { Config } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import type { Device, EntityInformation } from '@type/config';
import { type TemplateResult } from 'lit';
import { renderSection } from './section';

/**
 * Renders sections in the order specified by config or in default order
 * @param {DeviceCard} element - The device card component instance
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The card configuration
 * @param {Device} device - The device information
 * @returns {TemplateResult[]} Array of section templates
 */
export const renderSections = (
  element: DeviceCard,
  hass: HomeAssistant,
  config: Config,
  device: Device,
): TemplateResult[] => {
  const sectionConfig = [
    { name: 'Controls', key: 'controls', entities: device.controls },
    {
      name: 'Configuration',
      key: 'configurations',
      entities: device.configurations,
    },
    { name: 'Sensors', key: 'sensors', entities: device.sensors },
    {
      name: 'Diagnostic',
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

  return orderedSections.map(
    (section) =>
      renderSection(
        element,
        hass,
        config,
        section.name,
        section.entities,
      ) as TemplateResult,
  );
};
