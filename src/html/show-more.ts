/**
 * @file show-more.ts
 * @description UI components for expandable section toggling in the device card
 * This file contains components for the chevron icon and "show more" buttons that
 * allow sections to be expanded and collapsed.
 */

import type { DeviceCard } from '@cards/card';
import type { EntityInformation } from '@type/config';
import { html, nothing } from 'lit';

/**
 * Toggles the expanded state of a section in the device card
 *
 * @param {DeviceCard} element - The device card component instance
 * @param {string} sectionTitle - The title of the section to toggle
 * @param {Event} e - The click event that triggered the toggle
 */
const toggleSection = (element: DeviceCard, sectionTitle: string, e: Event) => {
  const expandedSections = element.expandedSections;

  // Create a new expanded sections object with the toggled section
  element.expandedSections = {
    ...expandedSections,
    [sectionTitle]: !expandedSections[sectionTitle],
  };
};

/**
 * Renders a chevron (up/down arrow) for expanding/collapsing a section
 *
 * @param {DeviceCard} element - The device card component instance
 * @param {string} title - The title of the section the chevron controls
 * @param {boolean} isExpanded - Whether the section is currently expanded
 * @returns {TemplateResult} A lit-html template for the chevron button
 */
export const chevron = (
  element: DeviceCard,
  title: string,
  isExpanded: boolean,
) =>
  html`<div
    class="section-chevron ${isExpanded ? 'expanded' : ''}"
    @click=${(e: Event) => toggleSection(element, title, e)}
  >
    <ha-icon icon="mdi:chevron-${isExpanded ? 'up' : 'down'}"></ha-icon>
  </div>`;

/**
 * Renders the "Show more" footer for a section with hidden entities
 *
 * @param {DeviceCard} element - The device card component instance
 * @param {string} title - The title of the section
 * @param {EntityInformation[]} entities - All entities in the section
 * @param {boolean} isExpanded - Whether the section is currently expanded
 * @param {number} size - The number of entities currently displayed
 * @returns {TemplateResult} A lit-html template for the show more footer
 */
export const showMore = (
  element: DeviceCard,
  title: string,
  entities: EntityInformation[],
  isExpanded: boolean,
  size: number,
) =>
  html`<div class="section-footer">
    ${isExpanded
      ? nothing
      : html`
          <div
            class="show-more"
            @click=${(e: Event) => toggleSection(element, title, e)}
          >
            Show ${entities.length - size} more...
          </div>
        `}
  </div>`;
