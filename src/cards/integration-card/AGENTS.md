# AGENTS.md - Integration Card

The `custom:integration-card` Lovelace card: a grid of device cards for every device belonging to a Home Assistant integration domain.

## Files

- **`card.ts`** — `IntegrationCard` (`<integration-card>`). Plain `LitElement` (does NOT use `HassUpdateMixin`; it owns its own re-render path). Resolves device list via `computeIntegrationDevices` from `@delegates/integration-devices`, optionally narrowed by a live Jinja template through `TemplateSubscription`. Renders each device by composing a `<device-card>` and forwards `hass-update` events via `fireEvent` so children re-evaluate.
- **`editor.ts`** — `IntegrationCardEditor` (`<integration-card-editor>`). Same `<ha-form>` pattern as the device-card editor.
- **`styles.ts`** — grid styles; column count is set with `styleMap` from `config.columns`.
- **`template-subscription.ts`** — `TemplateSubscription`. Wraps `subscribeRenderTemplate` over the HA WS connection. `connect(connection, template)` is a no-op if the template string is unchanged; on change it tears down the previous subscription. Resolved values are delivered through the constructor callback.
- **`types.ts`** — `Config` for the card and `IntegrationData` for the resolved state.

## Conventions

- Use the same `fast-deep-equal` setter check as `DeviceCard` to keep config-driven re-subscription cheap.
- All include/exclude/wildcard semantics belong in `@delegates/integration-devices` — keep the card render side data-driven.
- When changing template-subscription lifecycle, ensure `disconnect()` runs on `disconnectedCallback` AND on every template change to avoid orphaned WS subscriptions.
