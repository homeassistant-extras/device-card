# Device Card Configuration

## Configuration Options

| Name              | Type   | Default     | Description                                                                                                              |
| ----------------- | ------ | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| device_id         | string | Optional\*  | The Home Assistant device ID for your device                                                                             |
| entity_id         | string | Optional\*  | Entity ID – card will automatically determine the device                                                                 |
| entity            | string | Optional\*  | Alias for entity_id – convenience for [auto-entities](https://github.com/thomasloven/lovelace-auto-entities) integration |
| title             | string | Device name | Optional custom title for the card                                                                                       |
| icon              | string | _none_      | Optional icon next to the heading (e.g. `mdi:thermometer`). Overrides entity-derived icon when `entity_id` is also set.  |
| preview_count     | number | All items   | Number of items to preview before showing "Show More" button                                                             |
| exclude_sections  | list   | _none_      | Sections of entities to exclude. See below.                                                                              |
| exclude_entities  | list   | _none_      | Entities to remove from the card                                                                                         |
| inverse_percent   | list   | _none_      | Entity IDs with inverted percent colors (green for low, red for high)                                                    |
| section_order     | list   | _none_      | Custom order for displaying sections. See below.                                                                         |
| state_entity      | string | _none_      | Entity ID pattern picking the entity shown in the header. See below.                                                     |
| state_colors      | list   | _none_      | Colors applied to the card based on that entity's state. See below.                                                      |
| sort              | object | See below   | Sort options for entities                                                                                                |
| features          | list   | See below   | Optional flags to toggle different features                                                                              |
| tap_action        | object | _none_      | Action to perform when tapping the card                                                                                  |
| hold_action       | object | _none_      | Action to perform when holding the card                                                                                  |
| double_tap_action | object | _none_      | Action when double-tapping the card                                                                                      |

\*Either `device_id`, `entity_id`, or `entity` is required. If `entity_id` or `entity` is provided, the card will automatically determine the device.

## Feature Options

| Name                 | Type | Description                                                                                 |
| -------------------- | ---- | ------------------------------------------------------------------------------------------- |
| entity_picture       | flag | Show entity picture when available                                                          |
| hide_device_model    | flag | Hides the device model information                                                          |
| hide_title           | flag | Hides the device card title                                                                 |
| hide_entity_state    | flag | Hides the entity state display in header                                                    |
| hide_icon            | flag | Hides the icon next to the heading                                                          |
| compact              | flag | Uses compact layout with reduced spacing                                                    |
| expanded             | flag | Each section starts expanded (all entities visible; "Show more" not needed until collapsed) |
| collapse             | flag | Initially displays the card collapsed                                                       |
| show_hidden_entities | flag | Show entities marked as hidden in the entity registry                                       |

## Featured State

`state_entity` picks the entity whose state is shown in the header and used for the card icon. It accepts an exact entity ID, a wildcard (`sensor.*_state`), or a regex (`/sensor\.\w+_state/`), so a single pattern resolves per device on the Integration card. `entity_id` (or `entity`) wins when both are set.

`state_colors` tints the card and its icon based on that entity's state. Each entry takes a `state` (exact, wildcard, or regex) and a `color` - either a Home Assistant color name (`red`, `deep-purple`) or any CSS color (`#ffd101`, `var(--warning-color)`). The first match wins, and a matching color takes precedence over the problem styling.

```yaml
type: custom:device-card
device_id: 1b4a6cf3e0e3c3e4e3c3e4e3c3e4e3c3
state_entity: sensor.*_state
state_colors:
  - state: dead
    color: red
  - state: paused
    color: '#ffd101'
```

## Sorting Options

| Option    | Type   | Default  | Description                                               |
| --------- | ------ | -------- | --------------------------------------------------------- |
| type      | string | Required | Sorting method: `domain`, `entity_id`, `name`, or `state` |
| direction | string | asc      | Sort direction: `asc` (ascending) or `desc` (descending)  |

## Section Options

The following section names can be used with both `exclude_sections` and `section_order`:

- controls
- configurations
- sensors
- diagnostics

For `section_order`, the default order is: Controls, Configuration, Sensors, Diagnostic. Any sections not specified in your custom order will be displayed after the specified ones.
