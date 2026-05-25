import { css } from 'lit';

/**
 * Styles for `device-card-section`.
 *
 * Note: this component renders its own shadow root, so styles previously on the
 * parent card need to live here to style section + row markup.
 */
export const styles = css`
  :host {
    --icon-color: var(--primary-text-color);
    --section-color: var(--secondary-text-color);
    --row-height: 40px;
  }

  /* Section header with expand/collapse functionality */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .section-title {
    font-weight: 500;
    color: var(--section-color);
    padding: 4px 0 4px 0;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }

  .section-chevron {
    cursor: pointer;
    transition: transform 0.3s ease;
    color: var(--secondary-text-color);
    display: flex;
    align-items: center;
  }

  .section-footer {
    text-align: center;
    padding: 4px 0;
  }

  .show-more {
    color: var(--primary-color);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 4px 0;
  }

  .show-more:hover {
    text-decoration: underline;
  }

  /* Base section spacing */
  .section {
    margin-bottom: 16px;
  }

  /* Apply larger margin only to expanded sections or those with fewer than 5 items */
  .section.expanded:not(:last-child):not(.compact),
  .section.few-items:not(:last-child):not(.compact) {
    margin-bottom: 40px;
  }
`;
