import { resolvePoatCardHelpers } from '@/helpers/card-helpers';
import { HassConfigMixin } from '@cards/mixins/hass-config-mixin';
import { attributes } from '@html/attributes';
import { percentBar } from '@html/percent';
import { stateContent } from '@html/state-content';
import type { EntityInformation } from '@type/config';
import type { CardHelpers } from '@type/lovelace';
import {
  LitElement,
  html,
  nothing,
  type CSSResult,
  type TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './styles';

@customElement('device-card-row')
export class DeviceCardRow extends HassConfigMixin(LitElement) {
  @property({ attribute: false })
  public entity!: EntityInformation;

  /** Attribute-detail expansion for this row only (tap action `fire-dom-event`). */
  @state()
  private _expanded = false;

  /**
   * Resolved once from {@link globalThis.loadCardHelpers}; used via global helper accessor.
   */
  @state()
  private _cardHelpers?: CardHelpers;

  /**
   * Handles the ll-custom expand event to toggle entity attribute visibility.
   * Entity ID comes from ev.detail.device_card.entity_id.
   *
   * @param ev - The CustomEvent with detail.device_card.expand and detail.device_card.entity_id
   */
  private readonly _onLlCustom = (ev: Event): void => {
    const ce = ev as CustomEvent<{
      device_card?: { expand?: boolean; entity_id?: string };
    }>;
    const dc = ce.detail?.device_card;
    if (!dc?.expand || dc.entity_id !== this.entity?.entity_id) {
      return;
    }
    ev.stopPropagation();
    this._expanded = !this._expanded;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('ll-custom', this._onLlCustom);

    void resolvePoatCardHelpers(globalThis.loadCardHelpers).then((helpers) => {
      this._cardHelpers = helpers;
    });
  }

  override disconnectedCallback(): void {
    this.removeEventListener('ll-custom', this._onLlCustom);
    super.disconnectedCallback();
  }

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    // Avoid rendering sections until helpers are resolved; this keeps all downstream rendering sync.
    if (!this._cardHelpers) {
      return nothing;
    }

    let statusClassName: string | undefined;

    if (this.entity.isProblemEntity) {
      statusClassName = this.entity.isActive ? 'status-error' : 'status-ok';
    }

    const unitOfMeasurement = this.entity.attributes.unit_of_measurement;
    const showBar =
      typeof unitOfMeasurement === 'string' &&
      unitOfMeasurement.includes('%') &&
      !Number.isNaN(Number(this.entity.state));

    const inverseEntities = this.config?.inverse_percent || [];

    return html`<div
      class="${[
        'row',
        statusClassName,
        this._expanded ? 'expanded-row' : '',
      ].join(' ')}"
    >
      <div class="row-content">
        ${stateContent(this.hass, this.entity, statusClassName)}
        ${showBar ? percentBar(this.entity, inverseEntities) : nothing}
      </div>
      ${this._expanded ? attributes(this.entity) : nothing}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'device-card-row': DeviceCardRow;
  }
}
