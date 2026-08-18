/**
 * Utility to convert database snake_case keys to camelCase keys for JSON responses.
 */
export function toCamelCase(data) {
  if (data === null || data === undefined) return data;
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(toCamelCase);
  }
  if (typeof data === 'object' && data.constructor === Object) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      const camelKey = key.replace(/_([a-z0-9])/g, (_, g) => g.toUpperCase());
      result[camelKey] = toCamelCase(value);
    }
    return result;
  }
  return data;
}
