# Device Card Examples

## Basic Configuration

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
```

## Custom Title and Preview Count

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
title: Living Room Thermostat
preview_count: 3
```

## With Entity Picture

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
features:
  - entity_picture
```

## With Pinned Entity State

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
entity_id: sensor.octoprint_print_progress
```

## With Collapsed as Default

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
features:
  - collapse
```

## Using Entity ID Instead of Device ID

```yaml
type: custom:device-card
entity_id: sensor.living_room_temperature
```

## With Hidden Entity State

```yaml
type: custom:device-card
entity_id: sensor.octoprint_print_progress
features:
  - hide_entity_state
```

## Excluding Entities and Sections

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

## With Inverted Percent Colors

Useful for metrics like disk usage where low values are good and high values are bad:

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
inverse_percent:
  - sensor.disk_usage_core
  - sensor.disk_usage_supervisor
  - sensor.memory_usage_percent
```

## Custom Section Order

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
section_order:
  - sensors # Show sensors first
  - controls
  - configurations
  - diagnostics
```

## With Custom Actions

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

## With Compact Layout

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
features:
  - compact
```

## With Hold Action as More-Info

Set hold action as more-info to keep attribute expansion for `tap_action`:

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
hold_action:
  action: more-info
```

## With Sort Configuration

```yaml
type: custom:device-card
device_id: 1a2b3c4d5e6f7g8h9i0j
sort:
  type: name
  direction: asc
```
