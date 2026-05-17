# AGENTS.md - Card Mixins

Lit class mixins shared by the cards.

- **`hass-update-mixin.ts`** — `HassUpdateMixin`. Adds a `hass` getter/setter and a global `hass-update` event listener (registered on `connectedCallback`, removed on `disconnectedCallback`). When any descendant fires `hass-update` with `{ hass }` in detail, the mixed-in element updates its `hass` field. Used by `DeviceCard` so deeply-nested updates can request a refresh without prop drilling. Also exports `HassUpdateEvent`, `HassUpdateElement`, and the `Constructor<T>` helper used by the other mixin.
- **`hass-config-mixin.ts`** — `HassConfigMixin`. Adds plain `hass` and `config` fields. Intentionally **not** `@property()` — we don't want Lit's attribute reflection / reactive-property plumbing for these. Used by the inner components (`<device-card-row>`, `<device-card-section>`) that just receive these values from their parent.

## Conventions

- Pick the right mixin: a top-level card that needs to react to global `hass-update` events uses `HassUpdateMixin`; an inner component that just consumes the values its parent assigns uses `HassConfigMixin`.
- Don't convert the `HassConfigMixin` fields into `@property()` — the absence of reactivity here is deliberate, and changing it will trigger extra re-renders.
