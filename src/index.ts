/**
 * Device Card Registration Module
 *
 * This module handles the registration of the Device Card custom element
 * with the browser and Home Assistant's custom card registry. It makes the
 * component available for use in Home Assistant dashboards.
 */

import { DeviceCardEditor } from '@cards/editor';
import { DeviceCard } from './cards/card';

// Register the custom element with the browser
customElements.define('device-card', DeviceCard);
customElements.define('device-card-editor', DeviceCardEditor);

// Ensure the customCards array exists on the window object
window.customCards = window.customCards || [];

// Register the card with Home Assistant's custom card registry
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
