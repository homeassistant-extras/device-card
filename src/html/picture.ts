import type { Device } from '@type/config';
import { html } from 'lit';

export const picture = (device: Device) => {
  const entity = device.sensors.find(
    (sensor) => sensor.attributes.entity_picture !== undefined,
  );

  if (!entity) {
    return html`<ha-alert alert-type="error"
      >No entity picture found!</ha-alert
    >`;
  }

  return html`<ha-card class="portrait">
    <img src=${entity.attributes.entity_picture} />
    <div class="title">
      <span>${device.name}</span>
    </div>
  </ha-card>`;
};
