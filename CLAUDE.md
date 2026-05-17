# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Cross-agent instructions live in [AGENTS.md](./AGENTS.md). Subdirectories under `src/` and `test/` have their own scoped `AGENTS.md` — read the nearest one before editing.

## Package Manager

This is a **Yarn project**. Use `yarn`, not `npm`.

## Commands

- `yarn build` — Parcel production build (outputs `dist/device-card.js`)
- `yarn watch` — Parcel watch mode
- `yarn format` — Prettier write
- `yarn test` — Mocha + ts-node + JSDOM (see [test/AGENTS.md](test/AGENTS.md))
- `yarn test:coverage` — same, with NYC coverage
- `yarn test:watch` — mocha watch mode

Run a single test file:

```bash
TS_NODE_PROJECT='./tsconfig.test.json' npx mocha test/path/to/specific.spec.ts
```

If `yarn test` fails with `ERR_MODULE_NOT_FOUND` on an `@cards/*`/`@hass/*`/etc. import, **don't chase path-alias config**. It's almost always a TypeScript compile error in the imported file or a transitive import. Run `npx tsc -p tsconfig.test.json --noEmit` and fix what it reports.

## What this repo ships

Two Lit-based Home Assistant Lovelace cards, bundled into a single JS module:

- **`custom:device-card`** — comprehensive view of a single device's entities, organized into expandable sections (controls, configuration, diagnostic, sensors, etc.).
- **`custom:integration-card`** — rolls up every device belonging to a given Home Assistant integration domain into a grid of device cards.

Both cards have visual editors (`device-card-editor`, `integration-card-editor`) registered alongside them in [src/index.ts](src/index.ts).

## Architecture

### Entry and registration

[src/index.ts](src/index.ts) registers all four custom elements, pushes card metadata onto `globalThis.customCards` for the HA dashboard picker, and calls `resolvePoatCardHelpers(globalThis.loadCardHelpers)` so the HA card-helpers promise is captured once at bundle load.

### Cards

- [src/cards/device-card/](src/cards/device-card/) — `DeviceCard` (extends `HassUpdateMixin(LitElement)`), its editor, styles, and config `types.ts`.
- [src/cards/integration-card/](src/cards/integration-card/) — `IntegrationCard`, editor, styles, and a `TemplateSubscription` helper that subscribes to a HA `render_template` WS stream so Jinja-templated config reacts to state changes.
- [src/cards/components/](src/cards/components/) — reusable `row` and `section` sub-components used by `DeviceCard`.
- [src/cards/mixins/](src/cards/mixins/) — `HassUpdateMixin` (custom `shouldUpdate` + `hass-update` event so children can ask the card to re-evaluate) and `HassConfigMixin`.

### Delegates (business logic, no Lit)

[src/delegates/](src/delegates/) holds pure logic kept out of Lit components:

- `retrievers/` — read device/entity/state from the HA `HomeAssistant` object.
- `utils/` — `get-device`, `has-problem`, `is-integration`, `card-entities` (entity discovery + filtering + sort), `editor-schema` (ha-form schema).
- `integration-devices.ts` — resolves the device list for the integration card, honoring include/exclude/wildcard config.

### HASS vendored code

[src/hass/](src/hass/) is **copied/adapted from the Home Assistant frontend** (types, registries, WS helpers, DOM/array/string utilities). Treat it as upstream and prefer the smallest needed surface — see [src/hass/AGENTS.md](src/hass/AGENTS.md). The `hass-sync` skill can verify drift from upstream.

### HTML render helpers

[src/html/](src/html/) holds composable Lit-template helpers (`section`, `attributes`, `percent`, `picture`, `pinned-entity`, `device-card-header`, `show-more`, `state-content`, `state-display`). Business logic should sit in delegates/helpers; these stay declarative.

### Helpers

[src/helpers/card-helpers.ts](src/helpers/card-helpers.ts) wraps HA's `loadCardHelpers` so other modules can `await` it. [src/helpers/device-section.ts](src/helpers/device-section.ts) computes the ordered section list for a device, applying user-supplied section order and exclusions.

### Config

[src/types/config.ts](src/types/config.ts) defines the persisted dashboard config shapes. [src/config/feature.ts](src/config/feature.ts) provides `hasFeature(config, name)` for the `features:` array (e.g. `collapse`, `hide_title`, `compact`). Treat both as user-facing public surface — see [src/config/AGENTS.md](src/config/AGENTS.md).

### Localization

[src/localize/localize.ts](src/localize/localize.ts) reads JSON files from [src/translations/](src/translations/) (`en`, `fr`, `pt`, `ru`) and falls back to English. Keys must stay stable once shipped.

### Common utilities

[src/common/](src/common/) — `matches` (wildcard/regex string matching used by exclude filters), `sort` / `sort-devices`, `pascal-case`. Avoid importing card code from here to prevent cycles.

## TypeScript path aliases

Defined in [tsconfig.json](tsconfig.json), registered for tests via `tsconfig-paths/register` in [.mocharc.json](.mocharc.json):

- `@/*` → `./src/*`
- `@cards/*` → `./src/cards/*`
- `@device/*` → `./src/cards/device-card/*`
- `@integration/*` → `./src/cards/integration-card/*`
- `@delegates/*` → `./src/delegates/*`
- `@hass/*` → `./src/hass/*`
- `@html/*` → `./src/html/*`
- `@common/*` → `./src/common/*`
- `@config/*` → `./src/config/*`
- `@localize/*` → `./src/localize/*`
- `@type/*` → `./src/types/*`

(`@theme/*` is defined but the folder does not currently exist.)

## Build / test stack

- **Bundler:** Parcel 2 (single ESM bundle, `includeNodeModules: true`).
- **TypeScript:** strict, `noUncheckedIndexedAccess`, experimental decorators (Lit), `verbatimModuleSyntax`.
- **Tests:** Mocha + Chai + Sinon + `@open-wc/testing` under JSDOM. `tsconfig.test.json` is used for tests. [mocha.setup.ts](mocha.setup.ts) installs JSDOM globals before any spec runs.
