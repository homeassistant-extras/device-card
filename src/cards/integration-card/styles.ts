import { css } from 'lit';

/**
 * Static CSS styles for the Integration Card
 * Defines the layout and styling for the integration card container and device cards
 */
export const integrationStyles = css`
  :host {
    --card-padding: 16px;
    --title-font-size: 1.5rem;
    --title-font-weight: 500;
    --title-margin-bottom: 16px;
    --card-gap: 16px;
  }

  .integration-title {
    font-size: var(--title-font-size);
    font-weight: var(--title-font-weight);
    margin: 0 0 var(--title-margin-bottom) 0;
    color: var(--primary-text-color);
    border-bottom: 1px solid var(--divider-color);
    padding-bottom: 8px;
  }

  .devices-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--card-gap);
  }

  .no-devices {
    padding: 32px 16px;
    text-align: center;
    color: var(--secondary-text-color);
    font-style: italic;
  }

  /* For large screens, enable more columns */
  @media (min-width: 1200px) {
    .devices-container {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
  }
`;
