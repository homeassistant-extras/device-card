import { createLocalize } from '@homeassistant-extras/hass/localize/create-localize';
import type { TranslationKeysFrom } from '@homeassistant-extras/hass/localize/types';

import * as en from '../translations/en.json';
import * as fr from '../translations/fr.json';
import * as pt from '../translations/pt.json';
import * as ru from '../translations/ru.json';
// Import other languages as needed above this line and in order

/** Translation keys derived from the English source JSON. */
export type TranslationKey = TranslationKeysFrom<typeof en>;

export const localize = createLocalize<TranslationKey>({
  en,
  fr,
  pt,
  ru,
  // Add more languages here in order
});
