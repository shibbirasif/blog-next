export function getBaseUrl(): string {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

export function getPlatformName(): string {
    return process.env.PLATFORM_NAME || 'Blog Next';
}