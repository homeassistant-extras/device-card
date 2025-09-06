<p align="center">
    <img src="assets/cards.png" align="center" width="50%">
</p>
<p align="center"><h1 align="center">Device Card</h1></p>
<p align="center">
	<em>A comprehensive card to display and organize your Home Assistant device entities</em>
</p>

![Home Assistant](https://img.shields.io/badge/home%20assistant-%2341BDF5.svg?style=for-the-badge&logo=home-assistant&logoColor=white)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

![GitHub Release](https://img.shields.io/github/v/release/homeassistant-extras/device-card?style=for-the-badge&logo=github)
![GitHub Pre-Release](https://img.shields.io/github/v/release/homeassistant-extras/device-card?include_prereleases&style=for-the-badge&logo=github&label=PRERELEASE)
![GitHub Tag](https://img.shields.io/github/v/tag/homeassistant-extras/device-card?style=for-the-badge&color=yellow)
![GitHub branch status](https://img.shields.io/github/checks-status/homeassistant-extras/device-card/main?style=for-the-badge)

![stars](https://img.shields.io/github/stars/homeassistant-extras/device-card.svg?style=for-the-badge)
![home](https://img.shields.io/github/last-commit/homeassistant-extras/device-card.svg?style=for-the-badge)
![commits](https://img.shields.io/github/commit-activity/y/homeassistant-extras/device-card?style=for-the-badge)
![license](https://img.shields.io/github/license/homeassistant-extras/device-card?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=0080ff)

<p align="center">Built with the tools and technologies:</p>
<p align="center">
	<img src="https://img.shields.io/badge/npm-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="npm">
	<img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=for-the-badge&logo=Prettier&logoColor=black" alt="Prettier">
	<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white" alt="TypeScript">
	<img src="https://img.shields.io/badge/GitHub%20Actions-2088FF.svg?style=for-the-badge&logo=GitHub-Actions&logoColor=white" alt="GitHub%20Actions">
	<img src="https://img.shields.io/badge/Lit-324FFF.svg?style=for-the-badge&logo=Lit&logoColor=white" alt="Lit">
</p>
<br>

# Table of Contents

- [Overview](#overview)
  - [Device Card](#device-card)
  - [Integration Card](#integration-card)
- [Features](#features)
  - [Device Information Display](#device-information-display)
  - [Problem Detection](#problem-detection)
  - [Entity Pictures](#entity-pictures)
  - [Expandable Sections](#expandable-sections)
  - [Entity Attributes](#entity-attributes)
  - [Pinned Entity State](#pinned-entity-state)
  - [Percent Gauges](#percent-gauges)
  - [Collapsible Card](#collapsible-card)
  - [Compact Mode](#compact-mode)
  - [Advanced Sorting](#advanced-sorting)
  - [Pattern Matching](#pattern-matching)
  - [Entity Interactions](#entity-interactions)
  - [Visual Styling](#visual-styling)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration Options](#configuration-options)
- [Example Configurations](#example-configurations)
- [Project Roadmap](#project-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Code Quality](#code-quality)
- [Build Status](#build-status)

## Overview

### Device Card

A custom card for Home Assistant that provides a comprehensive overview of any device in your system. The card organizes device information into expandable sections, displaying sensors, controls, configuration options, and diagnostic data in a clean, user-friendly interface.

### Integration Card

The Integration Card automatically finds and displays all devices from a selected integration domain. This is useful for:

- Viewing all your lights, sensors, or switches from a specific brand or system
- Creating dedicated dashboards for specific systems in your home
- Monitoring the status of all devices in an integration at once

## Features

### Device Information Display

- Shows device name and model information
- Organizes entities into logical categories:
  - Controls - for interactive elements like buttons and switches
  - Sensors - for data readings and status information
  - Configuration - for device settings
  - Diagnostic - for troubleshooting information

![device-sections](assets/cards.png)

### Problem Detection

- Automatically detects entities labeled as "problem" in the device based on their `device_class`
- Visual indication when problems are detected (card border turns red)
- Easy identification of issues requiring attention
- Problem entities show a green or red indicator to their left

![problem-detection](assets/problems.png)

### Entity Pictures

With an optional flag, you can showcase entity pictures when available. There must exist an entity with an `entity_picture` attribute.

![entity-pictures](assets/portraits.png)

### Expandable Sections

- Collapsible sections for better organization of information
- Preview counts for sensors to reduce visual clutter
- Ability to expand sections to see all entities

![expanded](assets/expanded.png)

### Entity Attributes

- Click an entity to expand it and show it's attributes
- This behavior can be disabled by setting `tap_action` to "none"

![attributes](assets/attributes.png)

### Pinned Entity State

Display a specific entity's state prominently in the card header, providing instant visibility for your most important information. Perfect for temperature sensors, battery levels, or any critical value you want to monitor at a glance.

![pinned-entity-state](assets/pinned-entity-state.png)

### Percent Gauges

Visual percentage indicators for entities with percentage values. Gauges automatically change color based on the value (red for low, yellow for medium, green for high), making it easy to visually assess battery levels, sensor readings, and more.

![percent-gauges](assets/percent-gauges.png)

### Collapsible Card

Cards can be configured to start in a collapsed state, allowing you to keep dashboards clean while still having quick access to detailed information when needed. Simply click the header to expand and reveal all sections.

![collapsible-card](assets/collapsible-card.png)

### Compact Mode

A space-efficient layout option that reduces padding and margins, allowing you to fit more information in the same space. Ideal for information-dense dashboards or smaller screens.

![compact-mode](assets/compact-mode.png)

### Advanced Sorting

Customize how entities are sorted within each section. Sort by domain, entity ID, name, or state value in either ascending or descending order. This makes it easier to prioritize the most relevant information for your needs.

### Pattern Matching

Use wildcards and regular expressions in your entity and device exclusion patterns. This powerful feature allows for more flexible configuration, making it easy to include or exclude groups of entities based on naming patterns.

### Entity Interactions

- Configure custom actions for tap, hold, and double tap interactions
- Actions include navigating to other views, calling services, or opening more-info dialogs
- Setting a `tap_action` disables the entity attribute expansion behavior
- Actions can be configured in both YAML and the visual editor

### Visual Styling

- Consistent with Home Assistant design language
- Responsive layout that works on both desktop and mobile
- Clear visual hierarchy for easy reading

## Supported Languages

This card supports multiple languages:

- **English** (en) - Default
- **French** (fr) - Français
- **Portuguese** (pt) - Português

The card will automatically detect your Home Assistant language setting and display the appropriate translations. If your language is not supported, it will fall back to English.

## Installation

### HACS (Recommended)

[![HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=homeassistant-extras&repository=device-card&category=dashboard)

1. Open HACS in your Home Assistant instance
2. Click the menu icon in the top right and select "Custom repositories"
3. Add this repository URL and select "Dashboard" as the category
   - `https://github.com/homeassistant-extras/device-card`
4. Click "Install"

### Manual Installation

1. Download the `device-card.js` file from the latest release in the Releases tab.
2. Copy it to your `www/community/device-card/` folder
3. Add the following to your `configuration.yaml` (or add as a resource in dashboards menu)

```yaml
lovelace:
  resources:
    - url: /local/community/device-card/device-card.js
      type: module
```

## Usage

Add the card to your dashboard using the UI editor or YAML:

### Card Editor

> [!CAUTION]
> The editor may delete advanced settings, such as regex or wildcards. Make a copy of the card config prior to using the UI editor.

The card is fully configurable in the UI editor. Simply select "Custom: Device Card" when adding a new card to your dashboard, then select your device from the dropdown.

![editor](assets/editor.png)

You can also add the integration card via the UI editor. It will accept mostly the same configuration as the device card.

![integration-editor](assets/integration-picker.png)

### YAML

This is the most minimal configuration needed to get started on the device card:

```yaml
type: custom:device-card
device_id: YOUR_DEVICE_ID
```

Alternatively, you can use an entity ID and the card will automatically determine the device:

```yaml
type: custom:device-card
entity_id: sensor.your_entity_id
```

The card will automatically:

- Display the device name and model information
- Organize all entities related to the device into appropriate sections
- Show collapsible sections for Controls, Configuration, Sensors, and Diagnostics
- Highlight any detected problems

This is the most minimal configuration needed for the integration card:

```yaml
type: custom:integration-card
integration: zwave_js
```

The card will automatically:

- Display a device card for each device in the integration

## Configuration Options

### Device Card

| Name              | Type   | Default     | Description                                                  |
| ----------------- | ------ | ----------- | ------------------------------------------------------------ |
| device_id         | string | Optional\*  | The Home Assistant device ID for your device                 |
| entity_id         | string | Optional\*  | Entity ID - card will automatically determine the device     |
| title             | string | Device name | Optional custom title for the card                           |
| preview_count     | number | All items   | Number of items to preview before showing "Show More" button |
| exclude_sections  | list   | _none_      | Sections of entities to exclude. See below.                  |
| exclude_entities  | list   | _none_      | Entities to remove from the card.                            |
| section_order     | list   | _none_      | Custom order for displaying sections. See below.             |
| sort              | object | See below   | Sort options for entities                                    |
| features          | list   | See below   | Optional flags to toggle different features                  |
| tap_action        | object | _none_      | Action to perform when tapping the card                      |
| hold_action       | object | _none_      | Action to perform when holding the card                      |
| double_tap_action | object | _none_      | Action when double-tapping the card                          |

\*Either `device_id` or `entity_id` is required. If `entity_id` is provided, the card will automatically determine the device.

#### Feature Options

| Name              | Type | Description                              |
| ----------------- | ---- | ---------------------------------------- |
| entity_picture    | flag | Show entity picture when available       |
| hide_device_model | flag | Hides the device model information       |
| hide_title        | flag | Hides the device card title              |
| hide_entity_state | flag | Hides the entity state display in header |
| compact           | flag | Uses compact layout with reduced spacing |
| collapse          | flag | Initially displays the card collapsed    |

#### Sorting Options

Here's the markdown table for the sorting feature:

| Option    | Type   | Default  | Description                                               |
| --------- | ------ | -------- | --------------------------------------------------------- |
| type      | string | Required | Sorting method: `domain`, `entity_id`, `name`, or `state` |
| direction | string | asc      | Sort direction: `asc` (ascending) or `desc` (descending)  |

#### Section Options

The following section names can be used with both `exclude_sections` and `section_order`:

- controls
- configurations
- sensors
- diagnostics

For `section_order`, the default order is: Controls, Configuration, Sensors, Diagnostic. Any sections not specified in your custom order will be displayed after the specified ones.

### Integration Card

Most configuration options from the Device Card are supported:

| Name                   | Type    | Default      | Description                                                  |
| ---------------------- | ------- | ------------ | ------------------------------------------------------------ |
| integration            | string  | **Required** | The Home Assistant integration domain (e.g., zwave_js, hue)  |
| title                  | string  | Device name  | Optional custom title for the card                           |
| hide_integration_title | boolean | False        | Optional flag to hide the integration card title.            |
| preview_count          | number  | All items    | Number of items to preview before showing "Show More" button |
| columns                | number  | _responsive_ | Fix the number of columns for device cards (1-6)             |
| include_devices        | list    | _none_       | Include only specific devices for the integration            |
| exclude_devices        | list    | _none_       | Specific devices to exclude from the integration display     |
| exclude_sections       | list    | _none_       | Sections of entities to exclude. See below.                  |
| section_order          | list    | _none_       | Custom order for displaying sections. See below.             |
| features               | list    | See above    | Optional flags to toggle different features                  |
| tap_action             | object  | none         | Action to perform when tapping the card                      |
| hold_action            | object  | none         | Action to perform when holding the card                      |
| double_tap_action      | object  | none         | Action when double-tapping the card                          |

**Note** - `include_devices`, `exclude_devices` and `exclude_entities` accepts wildcards (\*) and Regex

## Example Configurations

### Device Card

#### Basic Configuration

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
```

#### Custom Title and Preview Count

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
title: Living Room Thermostat
preview_count: 3
```

#### With Entity Picture

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
features:
  - entity_picture
```

#### With Pinned Entity State

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
entity_id: sensor.octoprint_print_progress
```

#### With Collapsed as Default

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
features:
  - collapse
```

#### Using Entity ID Instead of Device ID

```yaml
type: custom:device-card
entity_id: sensor.living_room_temperature
```

#### With Hidden Entity State

```yaml
type: custom:device-card
entity_id: sensor.octoprint_print_progress
features:
  - hide_entity_state
```

#### Excluding some entities and sections

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
exclude_sections:
  - controls
  - configurations
  - diagnostics
exclude_entities:
  - update.home_assistant_core_update # Exclude by id
  - '*_uptime' # Exclude all uptime sensors
  - sensor.esp_* # Exclude all ESP sensors
  - /.*_(wired|wireless)/ # Regex match ending in wired or wireless
```

#### Custom section order

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
section_order:
  - sensors # Show sensors first
  - controls
  - configurations
  - diagnostics
```

#### With custom actions

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
tap_action:
  action: more-info
hold_action:
  action: call-service
  service: light.turn_on
  service_data:
    entity_id: light.living_room
double_tap_action:
  action: navigate
  navigation_path: /lovelace/0
```

#### With compact layout

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
features:
  - compact
```

#### With custom action

Set hold action as more-info to keep attribute exansion for `tap_action`

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
hold_action:
  action: more-info
```

#### With `sort` configuration

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
sort:
  type: name
  direction: asc
```

### Integration Card

#### Basic Configuration

```yaml
type: custom:integration-card
integration: zwave_js
```

#### Custom Title and Compact Layout

```yaml
type: custom:integration-card
integration: hue
title: Philips Hue Devices
features:
  - compact
  - hide_device_model
```

#### Excluding Sections

```yaml
type: custom:integration-card
integration: matter
title: Matter Devices
exclude_sections:
  - diagnostics
  - configurations
```

#### Custom Actions for All Device Cards

```yaml
type: custom:integration-card
integration: esphome
tap_action:
  action: more-info
hold_action:
  action: navigate
  navigation_path: /config/devices
```

#### Basic Configuration with Excluded Devices

You can use wildcard patterns with `*` to include, exclude devices or entities:

```yaml
type: custom:integration-card
integration: zwave_js
exclude_devices:
  - b30c9bb17b44450d99ed41c6167e5c92 # Z-Wave Hub
  - 99f45623df8146e8a446f17e92d38272 # Guest Room Switch
  - esp_*_airfresh # Exclude all ESP air fresh devices
  - nous* # Exclude all devices starting with "nous"
  - /.*([Ss]upervisor)/ # Exclude devices ending in supervisor
```

In this example we would include only `device_1`

```yaml
type: custom:integration-card
integration: zwave_js
include_devices:
  - device_1
  - device_2
  - device_3
exclude_devices:
  - device_2
  - device_3
  - device_4
```

In this example we would include only these 2 devices

```yaml
type: custom:integration-card
integration: zwave_js
include_devices:
  - device_1
  - device_2
```

## Project Roadmap

- [x] **`Initial design`**: Create initial card design
- [x] **`Enhanced customization`**: Add more customization options
- [x] **`Custom section order and exclusions`**: Set the order in which sections are displayed & exclude things - thanks @andrewjswan
- [x] **`Entity interactions`**: Configure tap, hold, and double-tap actions - thanks @andrewjswan
- [x] **`Status badges`**: Quick status badges for device state
- [x] **`Entity filtering`**: Filter specific entities from display - thanks @andrewjswan
- [x] **`Integration Card`**: Rollup to see all devices - thanks @andrewjswan
- [x] **`Hide device model`**: Option to hide device model information - thanks @andrewjswan
- [x] **`Compact layout`**: Space-efficient layout option - thanks @andrewjswan
- [x] **`Column control`**: Ability to define column count for integration card - thanks @andrewjswan
- [x] **`Device exclusion`**: Ability to exclude devices from integration card - thanks @andrewjswan
- [x] **`Wildcard/regex filtering`**: Exclude devices/entities by wildcard or regex patterns - thanks @andrewjswan
- [x] **`Device inclusion`**: Include only specific devices option - thanks @andrewjswan
- [x] **`Entity sorting`**: Add ability to sort entities - thanks @andrewjswan
- [x] **`Card expansion`**: Ability to expand/collapse the device card - thanks @fgamache1
- [x] **`Pinned entity state`**: Add pinned state entity display - thanks @fgamache1
- [x] **`Integration title control`**: Modify/hide integration card title - thanks @andrewjswan
- [x] **`Hide title feature`**: Device card can remove title
- [x] **`Section exclusion`**: Add ability to exclude sections - thanks @ctallc
- [x] **`Entity ID support`**: Alternative to device_id - card automatically determines device - thanks @potat0man
- [x] **`Random bugs`**: pointing out issues to improve card - thanks @PedroKTFC!
- [x] **`Translations / Localization`**: support for multiple languages and localized text - thanks @Bsector

## Contributing

- **💬 [Join the Discussions](https://github.com/homeassistant-extras/device-card/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/homeassistant-extras/device-card/issues)**: Submit bugs found or log feature requests for the `device-card` project.
- **💡 [Submit Pull Requests](https://github.com/homeassistant-extras/device-card/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.
- **📣 [Check out discord](https://discord.gg/NpH4Pt8Jmr)**: Need further help, have ideas, want to chat?
- **🃏 [Check out my other cards!](https://github.com/orgs/homeassistant-extras/repositories)** Maybe you have an integration that I made cards for.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/homeassistant-extras/device-card
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

## License

This project is protected under the MIT License. For more details, refer to the [LICENSE](LICENSE) file.

## Acknowledgments

- Built using [LitElement](https://lit.dev/)
- Inspired by Home Assistant's chip design
- Thanks to all contributors!

[![contributors](https://contrib.rocks/image?repo=homeassistant-extras/device-card)](https://github.com{/homeassistant-extras/device-card/}graphs/contributors)

[![ko-fi](https://img.shields.io/badge/buy%20me%20a%20coffee-72A5F2?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/N4N71AQZQG)

## Code Quality

Forgive me and my badges..

Stats

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_device-card&metric=bugs)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_device-card)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_device-card&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_device-card)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_device-card&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_device-card)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_device-card&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_device-card)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_device-card&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_device-card)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_device-card&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_device-card)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_device-card&metric=coverage)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_device-card)

Ratings

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_device-card&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_device-card)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_device-card&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_device-card)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_device-card&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_device-card)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_device-card&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_device-card)

## Build Status

### Main

[![CodeQL](https://github.com/homeassistant-extras/device-card/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/homeassistant-extras/device-card/actions/workflows/github-code-scanning/codeql)
[![Dependabot Updates](https://github.com/homeassistant-extras/device-card/actions/workflows/dependabot/dependabot-updates/badge.svg?branch=main)](https://github.com/homeassistant-extras/device-card/actions/workflows/dependabot/dependabot-updates)
[![Main Branch CI](https://github.com/homeassistant-extras/device-card/actions/workflows/main-ci.yaml/badge.svg?branch=main)](https://github.com/homeassistant-extras/device-card/actions/workflows/main-ci.yaml)
[![Fast Forward Check](https://github.com/homeassistant-extras/device-card/actions/workflows/pull_request.yaml/badge.svg?branch=main)](https://github.com/homeassistant-extras/device-card/actions/workflows/pull_request.yaml)

### Release

[![Release & Deploy](https://github.com/homeassistant-extras/device-card/actions/workflows/release-cd.yaml/badge.svg)](https://github.com/homeassistant-extras/device-card/actions/workflows/release-cd.yaml)
[![Merge](https://github.com/homeassistant-extras/device-card/actions/workflows/merge.yaml/badge.svg)](https://github.com/homeassistant-extras/device-card/actions/workflows/merge.yaml)

### Other

[![Issue assignment](https://github.com/homeassistant-extras/device-card/actions/workflows/assign.yaml/badge.svg)](https://github.com/homeassistant-extras/device-card/actions/workflows/assign.yaml)
[![Manual Release](https://github.com/homeassistant-extras/device-card/actions/workflows/manual-release.yaml/badge.svg)](https://github.com/homeassistant-extras/device-card/actions/workflows/manual-release.yaml)
