/**
 * @file section.ts
 * @description Section rendering for the device card
 * This file handles the rendering of collapsible sections within the device card,
 * organizing entities by their type (sensors, controls, etc.) and managing
 * expandable/collapsible behavior.
 */

import type { OrderedSection } from '@/helpers/device-section';
import '@cards/components/row/row';
import { sortEntities } from '@common/sort';
import { hasFeature } from '@config/feature';
import type { Config } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import { html, nothing, type TemplateResult } from 'lit';
import { chevron, showMore } from './show-more';

/**
 * Renders a section of entities with collapsible functionality.
 * Section open/closed state is owned by the caller ({@link DeviceCardSection});
 * entity attribute expansion is owned by each {@link DeviceCardRow}.
 */
export const renderSection = (
  hass: HomeAssistant,
  config: Config,
  section: OrderedSection,
  sectionExpanded: boolean,
  onToggleSection: () => void,
): TemplateResult | typeof nothing => {
  const { name, entities } = section;

  // Don't render anything if there are no entities to display
  if (!entities || entities.length === 0) {
    return nothing;
  }

  // Determine how many entities to preview based on config
  const size = config.preview_count ?? 3;

  // Check if this section needs collapsible functionality
  const needsExpansion = entities.length > size;

  // Sort and filter entities based on expanded state
  const sortedEntities = sortEntities(entities, config.sort);
  const displayEntities =
    needsExpansion && !sectionExpanded
      ? sortedEntities.slice(0, size)
      : sortedEntities;

  // Determine section class based on expanded state, number of items, and compact feature
  const isCompact = hasFeature(config, 'compact');
  const sectionClass = `section ${sectionExpanded ? 'expanded' : ''} ${needsExpansion ? '' : 'few-items'} ${isCompact ? 'compact' : ''}`;

  const rowTemplates = displayEntities.map(
    (entity) =>
      html`<device-card-row
        .hass=${hass}
        .entity=${entity}
        .config=${config}
      ></device-card-row>`,
  );

  return html`<div class="${sectionClass}">
    <div class="section-header">
      <div class="section-title">${name}</div>
      ${needsExpansion ? chevron(sectionExpanded, onToggleSection) : nothing}
    </div>
    ${rowTemplates}
    ${needsExpansion && !isCompact
      ? showMore(entities, sectionExpanded, size, onToggleSection)
      : nothing}
  </div>`;
};
