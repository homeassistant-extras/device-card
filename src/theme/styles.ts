import { css } from 'lit';

/**
 * Static CSS styles for the Device Card
 * Defines the grid layout and styling for all card elements
 */
export const styles = css`
  :host {
    --icon-color: var(--primary-text-color);
    --section-color: var(--secondary-text-color);
    --row-height: 40px;
  }

  ha-card {
    padding: 16px;
    position: relative;
    z-index: 1;
  }

  .card-header {
    padding: 0px 0px 10px 16px;
    line-height: 35px;
    border-bottom: 1px solid var(--divider-color);
    margin-bottom: 8px;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 500;
    display: flex;
    flex-direction: column;
  }

  /* Style for when card is on fire */
  .problem::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: var(--ha-card-border-radius, 12px);
    background: var(--error-color);
    opacity: 0.08;
    z-index: -1;
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
    padding: 4px 0 4px 0; /* Reduced top padding for all sections */
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

  .model {
    font-size: 0.9rem;
    color: var(--secondary-text-color);
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

  ha-icon {
    color: var(--icon-color);
    width: 22px;
    height: 22px;
  }

  /* Container for a row */
  .row {
    position: relative;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .row:hover {
    background-color: var(--secondary-background-color);
  }

  .row.expanded-row {
    margin-bottom: 8px;
  }

  /* Style for the status colors */
  .row.status-ok {
    border-left: 2px solid var(--success-color);
  }
  .status-ok {
    --primary-text-color: var(--success-color);
  }

  .row.status-warning {
    border-left: 2px solid var(--warning-color);
  }
  .status-warning {
    --primary-text-color: var(--warning-color);
  }

  .row.status-error {
    border-left: 2px solid var(--error-color);
  }
  .status-error {
    --primary-text-color: var(--error-color);
  }

  /* Style for the percentage bar that goes below the state-card-content */
  .percent-gauge {
    position: absolute;
    bottom: 1px;
    left: 10px;
    width: 98%;
    height: 4px;
    background-color: var(--divider-color, #333);
    overflow: hidden;
    border-radius: 0 0 4px 4px;
  }

  /* The colored fill part of the gauge */
  .percent-gauge-fill {
    height: 100%;
    background-color: var(--primary-color);
    transition:
      width 0.3s ease,
      background-color 0.3s ease;
  }

  /* Color variations based on percentage */
  .percent-gauge-fill.high {
    background-color: var(--success-color, #4caf50);
  }

  .percent-gauge-fill.medium {
    background-color: var(--warning-color, #ffc107);
  }

  .percent-gauge-fill.low {
    background-color: var(--error-color, #f44336);
  }

  /* Entity attributes section */
  .entity-attributes {
    padding: 4px 16px 8px;
    margin: 0 0 4px 50px;
    font-size: 0.9rem;
    border-left: 1px solid var(--divider-color);
  }

  .entity-attributes-empty {
    padding: 4px 16px 8px;
    margin: 0 0 4px 50px;
    color: var(--secondary-text-color);
    font-style: italic;
    font-size: 0.9rem;
  }

  .attribute-row {
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
    border-bottom: 1px dotted var(--divider-color);
  }

  .attribute-row:last-child {
    border-bottom: none;
  }

  .attribute-key {
    font-weight: 500;
    color: var(--secondary-text-color);
    flex: 1;
  }

  .attribute-value {
    color: var(--primary-text-color);
    flex: 2;
    text-align: right;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  /* Kitty pics */
  .portrait {
    background: none;
  }

  .portrait img {
    width: 100%;
    border-radius: var(--ha-card-border-radius, 12px);
  }

  .portrait .title {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
