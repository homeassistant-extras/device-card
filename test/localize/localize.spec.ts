import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { TranslationKey } from '@type/locale';
import { expect } from 'chai';
import * as sinon from 'sinon';

// These are actual translation keys we know exist in the app
const VALID_KEYS: TranslationKey[] = [
  'card.device_name',
  'card.expand',
  'card.collapse',
  'card.loading',
  'card.no_devices_found',
  'card.device_card_name',
  'card.device_card_description',
  'card.integration_card_name',
  'card.integration_card_description',
  'sections.controls',
  'sections.configuration',
  'sections.sensors',
  'sections.diagnostic',
];

// A key that doesn't exist
const INVALID_KEY = 'this.key.does.not.exist' as TranslationKey;

describe('localize.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    // Create a mock HomeAssistant instance for testing
    mockHass = {
      language: 'en',
    } as HomeAssistant;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('language selection', () => {
    it('should use the language specified in hass object', () => {
      // Testing with a key that exists in the English translations
      const result = localize(mockHass, VALID_KEYS[0]!, '', '');
      expect(result).to.be.a('string');
      expect(result).to.not.equal(VALID_KEYS[0]!); // Should not return the key itself
    });

    it('should fall back to English when specified language is not supported', () => {
      // Set an unsupported language
      mockHass.language = 'unsupported-language';

      // Still should get a valid translation from English
      const result = localize(mockHass, VALID_KEYS[0]!, '', '');
      expect(result).to.be.a('string');
      expect(result).to.not.equal(VALID_KEYS[0]!); // Should not return the key itself
    });

    it('should fall back to English when no language is specified', () => {
      // Set language to undefined
      // @ts-ignore
      mockHass.language = undefined;

      // Should get the English translation
      const result = localize(mockHass, VALID_KEYS[0]!, '', '');
      expect(result).to.be.a('string');
      expect(result).to.not.equal(VALID_KEYS[0]!); // Should not return the key itself
    });
  });

  describe('key resolution', () => {
    it('should correctly resolve various translation keys', () => {
      // Check all valid keys
      for (const key of VALID_KEYS) {
        const result = localize(mockHass, key, '', '');
        expect(result).to.be.a('string');
        expect(result).to.not.equal(key); // Should not return the key itself
      }
    });

    it('should return the key itself when the key does not exist', () => {
      const result = localize(mockHass, INVALID_KEY, '', '');
      expect(result).to.equal(INVALID_KEY);
    });

    it('should handle partial path resolution', () => {
      // This is a key where part of the path exists but not the full path
      const partialKey = 'card.stats.non_existent_subkey' as TranslationKey;
      const result = localize(mockHass, partialKey, '', '');
      expect(result).to.equal(partialKey);
    });
  });

  describe('string replacement', () => {
    it('should replace placeholders in the localized string', () => {
      // Use a key that exists and test basic replacement functionality
      const key = 'card.no_devices_found';
      const originalText = localize(mockHass, key, '', '');

      // Now with replacement - replace "integration" with "test integration"
      const result = localize(mockHass, key, 'integration', 'test integration');

      // The result should be different from the original if replacement occurred
      expect(result).to.not.equal(originalText);
      expect(result).to.include('test integration');
    });

    it('should not modify the string when search parameter is empty', () => {
      const result = localize(mockHass, VALID_KEYS[0]!, '', 'replacement');
      const original = localize(mockHass, VALID_KEYS[0]!, '', '');
      expect(result).to.equal(original);
    });

    it('should not modify the string when replace parameter is empty', () => {
      const result = localize(mockHass, VALID_KEYS[0]!, 'search', '');
      const original = localize(mockHass, VALID_KEYS[0]!, '', '');
      expect(result).to.equal(original);
    });

    it('should not modify the string when the search term is not found', () => {
      const original = localize(mockHass, VALID_KEYS[0]!, '', '');
      const result = localize(
        mockHass,
        VALID_KEYS[0]!,
        'non-existent-term',
        'replacement',
      );
      expect(result).to.equal(original);
    });
  });

  describe('edge cases', () => {
    it('should handle empty keys gracefully', () => {
      const emptyKey = '' as TranslationKey;
      const result = localize(mockHass, emptyKey, '', '');
      expect(result).to.equal(emptyKey);
    });
  });
});
