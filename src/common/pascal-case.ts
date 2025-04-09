import { capitalizeFirstLetter } from '@hass/common/string/capitalize-first-letter';

/**
 * Converts a string to PascalCase
 * @param str - The string to be converted to PascalCase
 * @returns The PascalCase version of the input string
 */
export const pascalCase = (str: string): string =>
  str
    .split('_')
    .map((s) => capitalizeFirstLetter(s))
    .join(' ');
