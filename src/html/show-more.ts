/**
 * @file show-more.ts
 * @description UI components for expandable section toggling in the device card
 * This file contains components for the chevron icon and "show more" buttons that
 * allow sections to be expanded and collapsed.
 */

import type { EntityInformation } from '@type/config';
import { html, nothing } from 'lit';

/**
 * Renders a chevron (up/down arrow) for expanding/collapsing a section
 */
export const chevron = (isExpanded: boolean, onToggleSection: () => void) =>
  html`<div
    class="section-chevron ${isExpanded ? 'expanded' : ''}"
    @click=${onToggleSection}
  >
    <ha-icon icon="mdi:chevron-${isExpanded ? 'up' : 'down'}"></ha-icon>
  </div>`;

/**
 * Renders the "Show more" footer for a section with hidden entities
 */
export const showMore = (
  entities: EntityInformation[],
  isExpanded: boolean,
  size: number,
  onToggleSection: () => void,
) =>
  html`<div class="section-footer">
    ${isExpanded
      ? nothing
      : html`
          <div class="show-more" @click=${onToggleSection}>
            Show ${entities.length - size} more...
          </div>
        `}
  </div>`;
