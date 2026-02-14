# Installation

## HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click the menu icon in the top right and select "Custom repositories"
3. Add this repository URL and select "Dashboard" as the category
   - `https://github.com/homeassistant-extras/device-card`
4. Click "Install"

[![HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=homeassistant-extras&repository=device-card&category=dashboard)

## Manual Installation

1. Download the `device-card.js` file from the [latest release](https://github.com/homeassistant-extras/device-card/releases)
2. Copy it to your `www/community/device-card/` folder
3. Add the following to your `configuration.yaml` (or add as a resource in dashboards menu)

```yaml
lovelace:
  resources:
    - url: /local/community/device-card/device-card.js
      type: module
```
