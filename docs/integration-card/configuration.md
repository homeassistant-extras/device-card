# Integration Card Configuration

Most configuration options from the Device Card are supported. Integration-specific options are listed below.

## Configuration Options

| Name                   | Type        | Default      | Description                                                                 |
| ---------------------- | ----------- | ------------ | --------------------------------------------------------------------------- |
| integration            | string      | **Required** | The Home Assistant integration domain (e.g., zwave_js, hue)                 |
| title                  | string      | Device name  | Optional custom title for the card                                          |
| hide_integration_title | boolean     | False        | Optional flag to hide the integration card title                             |
| preview_count          | number      | All items    | Number of items to preview before showing "Show More" button                 |
| columns                | number      | _responsive_ | Fix the number of columns for device cards (1–6)                             |
| include_devices        | list/string | _none_       | Include only specific devices                                                |
| exclude_devices        | list/string | _none_       | Devices to exclude from the display                                         |
| exclude_sections       | list        | _none_       | Sections of entities to exclude                                             |
| exclude_entities       | list        | _none_       | Entities to remove from the card                                           |
| inverse_percent        | list        | _none_       | Entity IDs with inverted percent colors                                     |
| section_order          | list        | _none_       | Custom order for displaying sections                                        |
| features               | list        | See Device Card | Optional flags to toggle different features                              |
| tap_action             | object      | none         | Action to perform when tapping the card                                     |
| hold_action            | object      | none         | Action to perform when holding the card                                     |
| double_tap_action      | object      | none         | Action when double-tapping the card                                        |

!!! note
    `include_devices` and `exclude_devices` can each be a list or a Jinja template. Both accept device IDs or names, with or without wildcards (`*`) and regex.
