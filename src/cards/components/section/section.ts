import type { OrderedSection } from '@/helpers/device-section';
import '@cards/components/row/row';
import type { Config } from '@device/types';
import { hasFeature } from '@homeassistant-extras/hass/common/config/feature';
import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import {
  type CSSResult,
  LitElement,
  type nothing,
  type TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { renderSection } from '../../../html/section';
import { styles } from './styles';
/**
 * One collapsible section (controls, sensors, etc.). Section expand/collapse is
 * local state so toggling does not re-render sibling sections. Entity attribute
 * expansion is local to each {@link DeviceCardRow}.
 */
@customElement('device-card-section')
export class DeviceCardSection extends HassConfigMixin<
  typeof LitElement,
  Config
>(LitElement) {
  /** Section metadata and entities (controls, sensors, etc.). */
  @property({ attribute: false })
  public section!: OrderedSection;

  /**
   * When set, overrides the default from the `expanded` feature for this section only.
   */
  @state()
  private _sectionExpandedUser?: boolean;

  private get _sectionExpanded(): boolean {
    const defaultExpanded = hasFeature(this.config, 'expanded');
    return this._sectionExpandedUser ?? defaultExpanded;
  }

  private readonly _toggleSection = () => {
    const next = !this._sectionExpanded;
    this._sectionExpandedUser = next;
  };

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
    return renderSection(
      this.hass,
      this.config,
      this.section,
      this._sectionExpanded,
      this._toggleSection,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'device-card-section': DeviceCardSection;
  }
}
