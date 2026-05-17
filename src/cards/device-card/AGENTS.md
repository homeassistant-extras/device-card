# AGENTS.md - Device Card

The `custom:device-card` Lovelace card: a single-device view that groups the device's entities into expandable sections.

## Files

- **`card.ts`** — `DeviceCard` (`<device-card>`). Extends `HassUpdateMixin(LitElement)`. Resolves the target device via `getDevice` (from `device_id`, `entity_id`, or `entity:` with Jinja support), drives section ordering through `getOrderedSections`, and keeps top-level collapse state (`collapse` feature) as local `@state`. Renders the picture, header, pinned entity, and one `<device-card-section>` per ordered section.
- **`editor.ts`** — `DeviceCardEditor` (`<device-card-editor>`). Thin wrapper around `<ha-form>` driven by `getDeviceSchema` from `@delegates/utils/editor-schema`. Emits `config-changed` via `fireEvent`.
- **`styles.ts`** — `CSSResult` for the card root.
- **`types.ts`** — `Config` shape persisted in the dashboard YAML.

## Conventions

- The `_config` setter does a `fast-deep-equal` check before reassigning to avoid spurious re-renders.
- `_hass` is **not** a Lit `@state` — updates flow through the mixin and are dispatched manually in `shouldUpdate`.
- Don't move section/row expansion state into the top-level card; it lives in the child components so toggling one row doesn't re-render the whole device.
