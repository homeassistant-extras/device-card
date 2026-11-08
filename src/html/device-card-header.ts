import { headerActions } from '@delegates/utils/header-actions';
import type { Config } from '@device/types';
import { hasFeature } from '@homeassistant-extras/hass/common/config/feature';
import { fireEvent } from '@homeassistant-extras/hass/common/dom/fire_event';
import type { ActionHandlerEvent } from '@homeassistant-extras/hass/data/lovelace/action_handler';
import { actionHandler } from '@homeassistant-extras/hass/panels/lovelace/common/directives/action-handler-directive';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { localize } from '@localize/localize';
import type { Device } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';

export interface DeviceCardHeaderParams {
  config: Config;
  device: Device;
  hass: HomeAssistant;
  collapse: boolean;
  entity: TemplateResult | typeof nothing;
}

/**
 * Forwards an action-handler gesture to Home Assistant as a `hass-action`.
 */
const handleHeaderAction = (ev: ActionHandlerEvent, deviceId?: string) => {
  fireEvent(ev.currentTarget as HTMLElement, 'hass-action', {
    config: headerActions(deviceId),
    action: ev.detail.action,
  });
};

/**
 * Renders the device card header (title, model, icon, pinned entity).
 * Returns nothing when both title and model are hidden and no entity to show.
 */
export const deviceCardHeader = (
  params: DeviceCardHeaderParams,
): TemplateResult | typeof nothing => {
  const { config, device, hass, collapse, entity } = params;
  const hideTitle = hasFeature(config, 'hide_title');
  const hideDeviceModel = hasFeature(config, 'hide_device_model');
  const hideHeader = hideTitle && hideDeviceModel;

  if (!hideHeader) {
    return renderFullHeader({
      config,
      device,
      hass,
      collapse,
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
    entity,
    hideTitle,
    hideDeviceModel,
    hideIcon,
  } = params;

  const deviceId = device.id;

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
  // second tooltip line hints at the hold gesture when it's available
  const tooltip = deviceId
    ? `${collapseLabel}\n${localize(hass, 'card.hold_for_device')}`
    : collapseLabel;

  return html`
    <div
      class="card-header ${collapse ? 'collapsed' : ''}"
      @action=${(ev: ActionHandlerEvent) => handleHeaderAction(ev, deviceId)}
      .actionHandler=${actionHandler({ hasHold: !!deviceId })}
      title="${tooltip}"
    >
      <div class="title">
        ${iconContent}
        <div class="title-stack">${titleContent} ${modelContent}</div>
      </div>
      ${entity}
    </div>
  `;
}
