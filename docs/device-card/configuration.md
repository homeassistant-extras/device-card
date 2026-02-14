# Device Card Configuration

## Configuration Options

| Name              | Type   | Default     | Description                                                                 |
| ----------------- | ------ | ----------- | --------------------------------------------------------------------------- |
| device_id         | string | Optional\*  | The Home Assistant device ID for your device                                |
| entity_id         | string | Optional\*  | Entity ID – card will automatically determine the device                     |
| entity            | string | Optional\*  | Alias for entity_id – convenience for [auto-entities](https://github.com/thomasloven/lovelace-auto-entities) integration |
| title             | string | Device name | Optional custom title for the card                                          |
| preview_count     | number | All items   | Number of items to preview before showing "Show More" button                 |
| exclude_sections  | list   | _none_      | Sections of entities to exclude. See below.                                 |
| exclude_entities  | list   | _none_      | Entities to remove from the card                                            |
| inverse_percent   | list   | _none_      | Entity IDs with inverted percent colors (green for low, red for high)        |
| section_order     | list   | _none_      | Custom order for displaying sections. See below.                             |
| sort              | object | See below   | Sort options for entities                                                    |
| features          | list   | See below   | Optional flags to toggle different features                                  |
| tap_action        | object | _none_      | Action to perform when tapping the card                                     |
| hold_action       | object | _none_      | Action to perform when holding the card                                     |
| double_tap_action | object | _none_      | Action when double-tapping the card                                         |

\*Either `device_id`, `entity_id`, or `entity` is required. If `entity_id` or `entity` is provided, the card will automatically determine the device.

## Feature Options

| Name              | Type | Description                              |
| ----------------- | ---- | ---------------------------------------- |
| entity_picture    | flag | Show entity picture when available       |
| hide_device_model | flag | Hides the device model information       |
| hide_title        | flag | Hides the device card title              |
| hide_entity_state | flag | Hides the entity state display in header |
| compact           | flag | Uses compact layout with reduced spacing |
| collapse          | flag | Initially displays the card collapsed    |

## Sorting Options

| Option    | Type   | Default  | Description                                               |
| --------- | ------ | -------- | --------------------------------------------------------- |
| type      | string | Required | Sorting method: `domain`, `entity_id`, `name`, or `state`   |
| direction | string | asc      | Sort direction: `asc` (ascending) or `desc` (descending)    |

## Section Options

The following section names can be used with both `exclude_sections` and `section_order`:

- controls
- configurations
- sensors
- diagnostics

For `section_order`, the default order is: Controls, Configuration, Sensors, Diagnostic. Any sections not specified in your custom order will be displayed after the specified ones.
