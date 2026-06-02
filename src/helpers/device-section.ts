/**
 * @file device-section.ts
 * @description Section ordering for the device card
 */

import type { Config } from '@device/types';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { localize } from '@localize/localize';
import type { Device, EntityInformation } from '@type/config';

export interface OrderedSection {
  key: string;
  name: string;
  entities: EntityInformation[];
}

/**
 * Builds the ordered list of sections (controls, configuration, sensors, diagnostic)
 * for the given device and card configuration.
 */
export const getOrderedSections = (
  hass: HomeAssistant,
  config: Config,
  device: Device,
): OrderedSection[] => {
  const sectionConfig: OrderedSection[] = [
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

  let orderedSections: OrderedSection[] = [];

  if (config.section_order && config.section_order.length > 0) {
    orderedSections = config.section_order
      .map((section) => sectionConfig.find((s) => s.key === section))
      .filter((section): section is OrderedSection => section !== undefined);

    sectionConfig.forEach((section) => {
      if (!orderedSections.some((s) => s.key === section.key)) {
        orderedSections.push(section);
      }
    });
  } else {
    // default order
    orderedSections = sectionConfig;
  }

  return orderedSections.filter((s) => s.entities && s.entities.length > 0);
};
