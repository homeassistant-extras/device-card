# Integration Card Examples

## Basic Configuration

```yaml
type: custom:integration-card
integration: zwave_js
```

## Custom Title and Compact Layout

```yaml
type: custom:integration-card
integration: hue
title: Philips Hue Devices
features:
  - compact
  - hide_device_model
```

## Excluding Sections

```yaml
type: custom:integration-card
integration: matter
title: Matter Devices
exclude_sections:
  - diagnostics
  - configurations
```

## Custom Actions for All Device Cards

```yaml
type: custom:integration-card
integration: esphome
tap_action:
  action: more-info
hold_action:
  action: navigate
  navigation_path: /config/devices
```

## Excluding Devices with Wildcards

You can use wildcard patterns with `*` to include or exclude devices:

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

## Include Only Specific Devices

In this example we would include only `device_1`:

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

## Include Only These 2 Devices

```yaml
type: custom:integration-card
integration: zwave_js
include_devices:
  - device_1
  - device_2
```

## Dynamic Device Filtering with Jinja Templates

Both `include_devices` and `exclude_devices` can be a list or a Jinja template. The template should return a list/array. The card automatically updates when entities referenced in the template change.

### include_devices – show only matching devices

```yaml
type: custom:integration-card
integration: zwave_js
include_devices: |
  {{ expand(integration_entities('zwave_js'))
    | selectattr('state', 'in', ['dead'])
    | map(attribute='entity_id')
    | map('device_attr', 'id')
    | reject('match', 'None')
    | unique
    | list
    | sort
  }}
```

### exclude_devices – hide matching devices

```yaml
type: custom:integration-card
integration: zwave_js
exclude_devices: |
  {{ expand(integration_entities('zwave_js'))
    | selectattr('state', 'in', ['dead', 'unknown'])
    | map(attribute='entity_id')
    | map('device_attr', 'id')
    | reject('match', 'None')
    | unique
    | list
  }}
```
