import { createCardEslintConfig } from '@homeassistant-extras/config/eslint/card';

export default createCardEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  ignores: [
    // todo remove once we import homeassistant-extras/hass
    // Vendored Home Assistant frontend surface — keep aligned with upstream, not our lint bar.
    'src/hass/**',
  ],
});
