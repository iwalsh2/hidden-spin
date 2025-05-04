/**
 * Utility functions for Firebase operations
 */

/**
 * Safely gets a property from an object, with type checking
 * @param obj The object to get the property from
 * @param key The property key
 * @param defaultValue Default value if property is undefined
 * @returns The property value or default value
 */
export function safeGet(obj: any, key: string, defaultValue: any = null) {
  if (!obj || typeof obj !== "object") {
    return defaultValue
  }

  return obj[key] !== undefined ? obj[key] : defaultValue
}

/**
 * Safely gets a string property from an object
 * @param obj The object to get the property from
 * @param key The property key
 * @param defaultValue Default value if property is undefined or not a string
 * @returns The string property value or default value
 */
export function safeGetString(obj: any, key: string, defaultValue = ""): string {
  const value = safeGet(obj, key, defaultValue)
  return typeof value === "string" ? value : defaultValue
}

/**
 * Safely gets an array property from an object
 * @param obj The object to get the property from
 * @param key The property key
 * @param defaultValue Default value if property is undefined or not an array
 * @returns The array property value or default value
 */
export function safeGetArray(obj: any, key: string, defaultValue: any[] = []): any[] {
  const value = safeGet(obj, key, defaultValue)
  return Array.isArray(value) ? value : defaultValue
}

/**
 * Safely gets a boolean property from an object
 * @param obj The object to get the property from
 * @param key The property key
 * @param defaultValue Default value if property is undefined or not a boolean
 * @returns The boolean property value or default value
 */
export function safeGetBoolean(obj: any, key: string, defaultValue = false): boolean {
  const value = safeGet(obj, key, defaultValue)
  return typeof value === "boolean" ? value : defaultValue
}
