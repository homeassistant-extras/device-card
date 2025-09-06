/**
 * Translation keys for the application.
 */
export type TranslationKey =
  | 'card.device_name'
  | 'card.expand'
  | 'card.collapse'
  | 'card.loading'
  | 'card.no_devices_found'
  | 'card.device_card_name'
  | 'card.device_card_description'
  | 'card.integration_card_name'
  | 'card.integration_card_description'
  | 'sections.controls'
  | 'sections.configuration'
  | 'sections.sensors'
  | 'sections.diagnostic';

export interface Translation {
  /** The translation key */
  key: TranslationKey;

  /** The translation string */
  search: string;

  /** The string to replace the search string with */
  replace: string;
}
