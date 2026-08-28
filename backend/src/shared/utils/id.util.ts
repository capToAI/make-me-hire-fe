/**
 * Generates a collision-resistant unique ID with a specified prefix.
 *
 * @param {string} prefix - Optional prefix for the ID (e.g., 'section', 'entry').
 * @returns {string} Unique identifier.
 */
export function makeId(prefix: string = 'id'): string {
  const randomPart = Math.random().toString(36).substring(2, 9);
  const timePart = Date.now().toString(36);
  return `${prefix}-${timePart}-${randomPart}`;
}
