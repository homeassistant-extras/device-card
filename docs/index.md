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

## Overview

This project provides two custom cards for Home Assistant:

- **[Device Card](device-card/index.md)** – Displays a comprehensive overview of any single device, organizing entities into expandable sections (Controls, Sensors, Configuration, Diagnostics).
- **[Integration Card](integration-card/index.md)** – Automatically finds and displays all devices from a selected integration domain (e.g., zwave_js, hue).

## Installation

See the [Installation](installation.md) guide for HACS and manual installation instructions.

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

## Documentation

- [Device Card](device-card/index.md) – Overview, configuration, examples
- [Integration Card](integration-card/index.md) – Overview, configuration, examples
- [Installation](installation.md) – HACS and manual setup
- [Build & Code Quality](BUILD.md) – CI/CD and SonarCloud badges
- [Troubleshooting](TROUBLESHOOTING.md) – Common issues
