/**
 * @file show-more.ts
 * @description UI components for expandable section toggling in the device card
 * This file contains components for the chevron icon and "show more" buttons that
 * allow sections to be expanded and collapsed.
 */

import type { Expansions } from '@device/types';
import type { EntityInformation } from '@type/config';
import { html, nothing } from 'lit';

/**
 * Toggles the expanded state of a section in the device card.
 * Must use the same default as {@link renderSection} when the section key is unset.
 *
 * @param {Expansions} expansions - The expansion state of the card
 * @param {string} sectionTitle - The title of the section to toggle
 * @param updateExpansions - Callback to persist the new expansion state
 * @param defaultSectionExpanded - Same as `expanded` feature default in section rendering
 */
const toggleSection = (
  expansions: Expansions,
  sectionTitle: string,
  updateExpansions: (expansion: Expansions) => void,
  defaultSectionExpanded: boolean,
) => {
  const expandedSections = expansions.expandedSections;
  const effective =
    expandedSections[sectionTitle] ?? defaultSectionExpanded;
  const next = !effective;

  updateExpansions({
    ...expansions,
    expandedSections: {
      ...expandedSections,
      [sectionTitle]: next,
    },
  });
};

/**
 * Renders a chevron (up/down arrow) for expanding/collapsing a section
 *
 * @param {Expansions} expansions - The expansion state of the card
 * @param {string} title - The title of the section the chevron controls
 * @param {boolean} isExpanded - Whether the section is currently expanded
 * @param defaultSectionExpanded - When no explicit toggle is stored, matches `expanded` feature
 * @returns {TemplateResult} A lit-html template for the chevron button
 */
export const chevron = (
  expansions: Expansions,
  title: string,
  isExpanded: boolean,
  updateExpansions: (expansion: Expansions) => void,
  defaultSectionExpanded: boolean,
) =>
  html`<div
    class="section-chevron ${isExpanded ? 'expanded' : ''}"
    @click=${() =>
      toggleSection(
        expansions,
        title,
        updateExpansions,
        defaultSectionExpanded,
      )}
  >
    <ha-icon icon="mdi:chevron-${isExpanded ? 'up' : 'down'}"></ha-icon>
  </div>`;

/**
 * Renders the "Show more" footer for a section with hidden entities
 *
 * @param {Expansions} expansions - The expansion state of the card
 * @param {string} title - The title of the section
 * @param {EntityInformation[]} entities - All entities in the section
 * @param {boolean} isExpanded - Whether the section is currently expanded
 * @param {number} size - The number of entities currently displayed
 * @param defaultSectionExpanded - When no explicit toggle is stored, matches `expanded` feature
 * @returns {TemplateResult} A lit-html template for the show more footer
 */
export const showMore = (
  expansion: Expansions,
  title: string,
  entities: EntityInformation[],
  isExpanded: boolean,
  size: number,
  updateExpansions: (expansion: Expansions) => void,
  defaultSectionExpanded: boolean,
) =>
  html`<div class="section-footer">
    ${isExpanded
      ? nothing
      : html`
          <div
            class="show-more"
            @click=${() =>
              toggleSection(
                expansion,
                title,
                updateExpansions,
                defaultSectionExpanded,
              )}
          >
            Show ${entities.length - size} more...
          </div>
        `}
  </div>`;
