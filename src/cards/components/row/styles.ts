import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
  }

  ha-icon {
    color: var(--icon-color, var(--primary-text-color));
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

  /* Style for the percentage bar that goes below the hui-generic-entity-row */
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
`;
