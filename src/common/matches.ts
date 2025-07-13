/**
 * Checks if a string matches a pattern which can be:
 * - Exact match
 * - Wildcard pattern with * (e.g., "sensor_*")
 * - Regex pattern enclosed in /.../ (e.g., "/sensor\\.(temp|humid)/")
 *
 * @param str - The string to check
 * @param pattern - The pattern to match against
 * @returns True if the string matches the pattern
 */
export const matchesPattern = (
  str: string | null,
  pattern: string,
): boolean => {
  if (str === null) {
    return false;
  }

  // Check if it's a regex pattern (enclosed in slashes)
  const regexPattern = /^\/(.+)\/$/;
  const regexMatch = regexPattern.exec(pattern);
  if (regexMatch) {
    try {
      const regex = new RegExp(regexMatch[1] as string);
      return regex.test(str);
    } catch (e) {
      // If regex is invalid, fall back to treating it as a literal string
      console.warn(`Invalid regex pattern: ${pattern}`, e);
      return str === pattern;
    }
  }

  // Check if it's a wildcard pattern (contains *)
  if (pattern.includes('*')) {
    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
      .replace(/\*/g, '.*'); // Convert * to .*

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(str);
  }

  // Default to exact match
  return str === pattern;
};
