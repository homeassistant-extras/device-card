/**
 * @file section.ts
 * @description Section rendering for the device card
 * This file handles the rendering of collapsible sections within the device card,
 * organizing entities by their type (sensors, controls, etc.) and managing
 * expandable/collapsible behavior.
 */

import { sortEntities } from '@common/sort';
import { hasFeature } from '@config/feature';
import type { Config, Expansions } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import type { EntityInformation } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';
import { row } from './row';
import { chevron, showMore } from './show-more';

/**
 * Renders a section of entities with collapsible functionality
 *
 * @param {HTMLElement} element - The card component instance
 * @param {Expansions} expansions - The expansion state of the card
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The card configuration
 * @param {string} title - The title of the section
 * @param {EntityInformation[]} entities - The entities to display in this section
 * @param {function} updateExpansions - Function to update the expansion state
 * @returns {TemplateResult|typeof nothing} A lit-html template for the section or nothing if empty
 */
export const renderSection = (
  element: HTMLElement,
  expansions: Expansions,
  hass: HomeAssistant,
  config: Config,
  title: string,
  entities: EntityInformation[],
  updateExpansions: (expansion: Expansions) => void,
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
  const isExpanded = expansions.expandedSections[title] || false;

  // Sort and filter entities based on expanded state
  const sortedEntities = sortEntities(entities, config.sort);
  const displayEntities =
    needsExpansion && !isExpanded
      ? sortedEntities.slice(0, size)
      : sortedEntities;

  // Determine section class based on expanded state, number of items, and compact feature
  const isCompact = hasFeature(config, 'compact');
  const sectionClass = `section ${isExpanded ? 'expanded' : ''} ${!needsExpansion ? 'few-items' : ''} ${isCompact ? 'compact' : ''}`;

  return html`<div class="${sectionClass}">
    <div class="section-header">
      <div class="section-title">${title}</div>
      ${needsExpansion
        ? chevron(expansions, title, isExpanded, updateExpansions)
        : nothing}
    </div>
    ${displayEntities.map((entity) =>
      row(hass, entity, element, expansions, updateExpansions),
    )}
    ${needsExpansion && !isCompact
      ? showMore(
          expansions,
          title,
          entities,
          isExpanded,
          size,
          updateExpansions,
        )
      : nothing}
  </div>`;
};
