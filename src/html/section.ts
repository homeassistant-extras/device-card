/**
 * @file section.ts
 * @description Section rendering for the device card
 * This file handles the rendering of collapsible sections within the device card,
 * organizing entities by their type (sensors, controls, etc.) and managing
 * expandable/collapsible behavior.
 */

import type { DeviceCard } from '@cards/card';
import type { HomeAssistant } from '@hass/types';
import type { Config, EntityInformation } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';
import { row } from './row';
import { chevron, showMore } from './show-more';

/**
 * Renders a section of entities with collapsible functionality
 *
 * @param {DeviceCard} element - The device card component instance
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The card configuration
 * @param {string} title - The title of the section
 * @param {EntityInformation[]} entities - The entities to display in this section
 * @returns {TemplateResult|typeof nothing} A lit-html template for the section or nothing if empty
 */
export const renderSection = (
  element: DeviceCard,
  hass: HomeAssistant,
  config: Config,
  title: string,
  entities: EntityInformation[],
): TemplateResult | typeof nothing => {
  // Don't render anything if there are no entities to display
  if (!entities || entities.length === 0) {
    return nothing;
  }

  // Determine how many entities to preview based on config
  const size = config.preview_count || 3;

  // Check if this section needs collapsible functionality
  const needsExpansion = entities.length > size;

  // Get the current expanded state from the element
  const isExpanded = element.expandedSections[title] || false;

  // Filter entities based on expanded state
  const displayEntities =
    needsExpansion && !isExpanded ? entities.slice(0, size) : entities;

  // Determine section class based on expanded state and number of items
  const sectionClass = `section ${isExpanded ? 'expanded' : ''} ${!needsExpansion ? 'few-items' : ''}`;

  // Initialize expandedEntities if it doesn't exist
  if (!element.expandedEntities) {
    element.expandedEntities = {};
  }

  return html`<div class="${sectionClass}">
    <div class="section-header">
      <div class="section-title">${title}</div>
      ${needsExpansion ? chevron(element, title, isExpanded) : nothing}
    </div>
    ${displayEntities.map((entity) => row(hass, entity, element))}
    ${needsExpansion
      ? showMore(element, title, entities, isExpanded, size)
      : nothing}
  </div>`;
};
