# Integration Card Overview

The Integration Card automatically finds and displays all devices from a selected integration domain. This is useful for:

- Viewing all your lights, sensors, or switches from a specific brand or system
- Creating dedicated dashboards for specific systems in your home
- Monitoring the status of all devices in an integration at once

![Integration picker](../assets/integration-picker.png)

## Quick Start

```yaml
type: custom:integration-card
integration: zwave_js
```

The card will automatically display a device card for each device in the integration.

## Card Editor

You can also add the integration card via the UI editor. It will accept mostly the same configuration as the device card.

## Features

Most Device Card configuration options are supported, plus integration-specific options:

- **Column control** – Fix the number of columns for device cards (1–6)
- **Device filtering** – Include or exclude specific devices with wildcards and regex
- **Jinja templates** – Dynamic device filtering based on entity states
- **Integration title** – Customize or hide the integration card title

See [Configuration](configuration.md) for the full list of options.
