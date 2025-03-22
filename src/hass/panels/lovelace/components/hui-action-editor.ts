/**
 * https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/components/hui-action-editor.ts
 */

import type { ActionConfig } from '../../../data/lovelace/config/action';

export type UiAction = Exclude<ActionConfig['action'], 'fire-dom-event'>;
