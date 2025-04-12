import { DeviceCard } from '@device/card';
import { DeviceCardEditor } from '@device/editor';
import { IntegrationCard } from '@integration/card';
import { IntegrationCardEditor } from '@integration/editor';
import { version } from '../package.json';

// Register the custom elements with the browser
customElements.define('device-card', DeviceCard);
customElements.define('device-card-editor', DeviceCardEditor);
customElements.define('integration-card', IntegrationCard);
customElements.define('integration-card-editor', IntegrationCardEditor);

// Ensure the customCards array exists on the window object
window.customCards = window.customCards || [];

// Register the cards with Home Assistant's custom card registry
window.customCards.push({
  // Unique identifier for the card type
  type: 'device-card',

  // Display name in the UI
  name: 'Device Card',

  // Card description for the UI
  description: 'A card to summarize the status of a Device.',

  // Show a preview of the card in the UI
  preview: true,

  // URL for the card's documentation
  documentationURL: 'https://github.com/homeassistant-extras/device-card',
});

window.customCards.push({
  // Unique identifier for the card type
  type: 'integration-card',

  // Display name in the UI
  name: 'Integration Card',

  // Card description for the UI
  description: 'A card to display all devices from a specific integration.',

  // Show a preview of the card in the UI
  preview: true,

  // URL for the card's documentation
  documentationURL: 'https://github.com/homeassistant-extras/device-card',
});

console.info(`%c🐱 Poat's Tools: device-card - ${version}`, 'color: #CFC493;');
