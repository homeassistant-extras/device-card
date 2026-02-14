# Troubleshooting

## Common Issues

### Card not displaying

- Ensure the card resource is loaded in your Lovelace configuration
- Check that your `device_id` or `entity_id` is valid
- Verify the device exists in Home Assistant (Developer Tools → Entities)

### Editor deletes advanced settings

The UI editor may remove regex patterns, wildcards, or other advanced configuration. Make a copy of your card config before using the editor, or edit YAML directly.

### Images not loading

If entity pictures or device images don't appear, ensure the entity has an `entity_picture` attribute set.

## Getting Help

- [Join the Discussions](https://github.com/homeassistant-extras/device-card/discussions) – Share your insights, provide feedback, or ask questions
- [Report Issues](https://github.com/homeassistant-extras/device-card/issues) – Submit bugs or feature requests
- [Discord](https://discord.gg/NpH4Pt8Jmr) – Need further help, have ideas, want to chat?
