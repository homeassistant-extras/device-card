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
    cursor: pointer;
    transition: background-color 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Remove bottom border when collapsed */
  .card-header.collapsed {
    border-bottom: none;
    margin-bottom: 0;
  }

  .card-header:hover {
    background-color: var(--secondary-background-color);
  }

  .title {
    font-size: 1.5rem;
    font-weight: 500;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .title-stack {
    display: flex;
    flex-direction: column;
  }

  /* Entity state in header */
  .entity-state {
    font-size: 1.5rem;
    font-weight: 500;
    margin-right: 16px;
    display: flex;
    align-items: center;
  }

  /* For when header is hidden but entity state is shown */
  .entity-state-only {
    font-size: 1.5rem;
    font-weight: 500;
    text-align: right;
    margin-right: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--divider-color);
    margin-bottom: 8px;
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

  .model {
    font-size: 0.9rem;
    color: var(--secondary-text-color);
  }

  ha-icon {
    color: var(--icon-color);
    width: 22px;
    height: 22px;
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
