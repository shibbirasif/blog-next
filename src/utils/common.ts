export function getBaseUrl(): string {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

export function getPlatformName(): string {
    return process.env.PLATFORM_NAME || 'Blog Next';
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Utility function to omit specific keys from an object
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    ...keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
}