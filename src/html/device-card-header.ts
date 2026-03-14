import { hasFeature } from '@config/feature';
import type { Config } from '@device/types';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { Device } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';

export interface DeviceCardHeaderParams {
  config: Config;
  device: Device;
  hass: HomeAssistant;
  collapse: boolean;
  onCollapseToggle: () => void;
  entity: TemplateResult | typeof nothing;
}

/**
 * Renders the device card header (title, model, icon, pinned entity).
 * Returns nothing when both title and model are hidden and no entity to show.
 */
export const deviceCardHeader = (
  params: DeviceCardHeaderParams,
): TemplateResult | typeof nothing => {
  const { config, device, hass, collapse, onCollapseToggle, entity } = params;
  const hideTitle = hasFeature(config, 'hide_title');
  const hideDeviceModel = hasFeature(config, 'hide_device_model');
  const hideHeader = hideTitle && hideDeviceModel;

  if (!hideHeader) {
    return renderFullHeader({
      config,
      device,
      hass,
      collapse,
      onCollapseToggle,
      entity,
      hideTitle,
      hideDeviceModel,
      hideIcon: hasFeature(config, 'hide_icon'),
    });
  }

  if (entity && entity !== nothing) {
    return html`<div class="entity-state-only">${entity}</div>`;
  }

  return nothing;
};

function renderFullHeader(
  params: DeviceCardHeaderParams & {
    hideTitle: boolean;
    hideDeviceModel: boolean;
    hideIcon: boolean;
  },
): TemplateResult {
  const {
    config,
    device,
    hass,
    collapse,
    onCollapseToggle,
    entity,
    hideTitle,
    hideDeviceModel,
    hideIcon,
  } = params;

  const titleContent = hideTitle
    ? nothing
    : html`<span>${config.title ?? device.name}</span>`;

  const modelContent = hideDeviceModel
    ? nothing
    : html`<span class="model">${device.model}</span>`;

  let iconContent: TemplateResult | typeof nothing;
  if (hideIcon) {
    iconContent = nothing;
  } else if (device.entity) {
    iconContent = html`<ha-state-icon
      .hass=${hass}
      .stateObj=${device.entity}
      .icon=${config.icon}
    ></ha-state-icon>`;
  } else if (config.icon) {
    iconContent = html`<ha-icon .icon=${config.icon}></ha-icon>`;
  } else {
    iconContent = nothing;
  }

  const collapseLabel = collapse
    ? localize(hass, 'card.expand')
    : localize(hass, 'card.collapse');

  return html`
    <div
      class="card-header ${collapse ? 'collapsed' : ''}"
      @click="${onCollapseToggle}"
      title="${collapseLabel}"
    >
      <div class="title">
        ${iconContent}
        <div class="title-stack">${titleContent} ${modelContent}</div>
      </div>
      ${entity}
    </div>
  `;
}
