<p align="center">
    <img src="docs/assets/cards.png" align="center" width="50%">
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

## Overview

A custom card for Home Assistant that provides a comprehensive overview of any device in your system. The card organizes device information into expandable sections. An Integration Card variant displays all devices from a selected integration domain.

## Documentation

**Full documentation is available at: [homeassistant-extras.github.io/device-card](https://homeassistant-extras.github.io/device-card/)**

## Quick Start

### Device Card

```yaml
type: custom:device-card
device_id: YOUR_DEVICE_ID
```

Or use an entity ID and the card will automatically determine the device:

```yaml
type: custom:device-card
entity_id: sensor.your_entity_id
```

### Integration Card

```yaml
type: custom:integration-card
integration: zwave_js
```

## Installation

### HACS (Recommended)

[![HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=homeassistant-extras&repository=device-card&category=dashboard)

1. Open HACS in your Home Assistant instance
2. Click the menu icon in the top right and select "Custom repositories"
3. Add: `https://github.com/homeassistant-extras/device-card`
4. Select "Dashboard" as the category
5. Click "Install"

### Manual Installation

1. Download `device-card.js` from the [latest release](https://github.com/homeassistant-extras/device-card/releases)
2. Copy to `www/community/device-card/`
3. Add to your `configuration.yaml`:

```yaml
lovelace:
  resources:
    - url: /local/community/device-card/device-card.js
      type: module
```

## Contributing

- [Join the Discussions](https://github.com/homeassistant-extras/device-card/discussions) - Share your insights, provide feedback, or ask questions
- [Report Issues](https://github.com/homeassistant-extras/device-card/issues) - Submit bugs or feature requests
- [Submit Pull Requests](https://github.com/homeassistant-extras/device-card/blob/main/CONTRIBUTING.md) - Review open PRs and submit your own
- [Check out Discord](https://discord.gg/NpH4Pt8Jmr) - Need further help, have ideas, want to chat?
- [Check out my other cards!](https://github.com/orgs/homeassistant-extras/repositories)

## License

This project is protected under the MIT License. For more details, refer to the [LICENSE](LICENSE) file.

## Acknowledgments

- Built using [LitElement](https://lit.dev/)
- Inspired by Home Assistant's chip design
- Thanks to all contributors!

[![contributors](https://contrib.rocks/image?repo=homeassistant-extras/device-card)](https://github.com/homeassistant-extras/device-card/graphs/contributors)

[![ko-fi](https://img.shields.io/badge/buy%20me%20a%20coffee-72A5F2?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/N4N71AQZQG)

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
- [x] **`Random bugs & improvements`**: pointing out issues to improve card - thanks @PedroKTFC, @misc-brabs!
- [x] **`Translations / Localization`**: support for multiple languages and localized text - thanks @Bsector
- [x] **`Inverse percent colors`**: Invert percent bar colors for entities like disk usage - thanks @misc-brabs
- [x] **`Jinja template support`**: Certain config properties support Jinja - thanks @LenirSantiago
- [x] **`Auto-entities support`**: `entity` config property for auto-entities integration - thanks @misc-brabs
