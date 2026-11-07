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
| percent_colors    | map    | _none_      | Custom percent bar colors by entity pattern (YAML only). See [Percent Bar Colors](#percent-bar-colors).                  |
| section_order     | list   | _none_      | Custom order for displaying sections. See below.                                                                         |
| sort              | object | See below   | Sort options for entities                                                                                                |
| features          | list   | See below   | Optional flags to toggle different features                                                                              |
| tap_action        | object | _none_      | Action to perform when tapping the card                                                                                  |
| hold_action       | object | _none_      | Action to perform when holding the card                                                                                  |
| double_tap_action | object | _none_      | Action when double-tapping the card                                                                                      |

\*Either `device_id`, `entity_id`, or `entity` is required. If `entity_id` or `entity` is provided, the card will automatically determine the device.

## Percent Bar Colors

Entities measured in `%` get a small bar under their row. By default it uses a red / yellow / green scale (`inverse_percent` flips it). `percent_colors` lets you replace that scale per entity. It is YAML only (not in the visual editor).

Each **key** is an entity pattern, matched the same way as `exclude_entities`:

- Exact entity ID: `sensor.office_humidity`
- Wildcard: `sensor.*_humidity`
- Regex wrapped in slashes: `/sensor\.(disk|memory)_.*/`

Each **value** is either:

- **One color** – the bar is always this color (no scale). Any CSS color works, including theme variables like `var(--primary-color)`.
- **A list of thresholds** – each `{ value, color }` applies from `value` upward until the next threshold. Values below the lowest threshold use the lowest threshold's color.

```yaml
percent_colors:
  # No scale – always the theme's primary color
  sensor.*_battery: var(--primary-color)

  # Humidity comfort bands
  sensor.*_humidity:
    - value: 0
      color: '#ff9800' # dry
    - value: 30
      color: '#4caf50' # comfortable
    - value: 60
      color: '#03a9f4' # humid
```

!!! note

    If more than one key matches an entity, the first one listed wins. A matching `percent_colors` entry takes precedence over `inverse_percent`.

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
