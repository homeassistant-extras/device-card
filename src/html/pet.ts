import type { Device } from '@type/config';
import { html } from 'lit';

export const pet = (unit: Device) => {
  const cat = unit.sensors.find(
    (sensor) => sensor.translation_key === 'pet_last_use_date',
  );
  return html`<ha-card class="portrait">
    <img src=${cat?.attributes.entity_picture} />
    <div class="title">
      <span>${unit.name}</span>
    </div>
  </ha-card>`;
};
