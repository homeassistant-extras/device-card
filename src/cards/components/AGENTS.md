# AGENTS.md - Card Components

Reusable Lit sub-components used inside `<device-card>`. Each subfolder defines its own custom element with co-located styles.

- **`section/`** — `<device-card-section>`: one collapsible section (controls, sensors, configuration, diagnostic, …). Owns its own expand/collapse state so toggling does not re-render sibling sections. Defaults to `hasFeature(config, 'expanded')`.
- **`row/`** — `<device-card-row>`: one entity row. Owns its own attribute-detail expansion state. Listens for `ll-custom` events with `detail.device_card.expand` and `entity_id` matching this row to toggle. Resolves HA `loadCardHelpers` once before rendering.

## Conventions

- Both components use `HassConfigMixin` (not `HassUpdateMixin`) — `hass` and `config` arrive as plain assigned fields from the parent card, not Lit reactive properties.
- Keep per-component expansion state **local**. The pattern across this folder is: parent passes data down, children own their own UI toggle state.
- Each component co-locates its styles in `styles.ts` and registers itself with `@customElement` plus a `HTMLElementTagNameMap` declaration.
