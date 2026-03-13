export type Platform = 'darwin' | 'win32' | 'linux';

/**
 * Gets the current platform (darwin, win32, or linux).
 *
 * @returns The platform identifier.
 */
export function getPlatform(): Platform {
    if (typeof window !== 'undefined') {
        // Browser environment
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('mac')) return 'darwin';
        if (userAgent.includes('win')) return 'win32';
        return 'linux';
    }

    // Node.js environment
    if (typeof process !== 'undefined' && process.platform) {
        return process.platform as Platform;
    }

    return 'linux';
}

/**
 * Checks if the current platform is macOS.
 *
 * @returns True if the platform is macOS, false otherwise.
 */
export function isMac(): boolean {
    return getPlatform() === 'darwin';
}

/**
 * Checks if the current platform is Windows.
 *
 * @returns True if the platform is Windows, false otherwise.
 */
export function isWindows(): boolean {
    return getPlatform() === 'win32';
}

/**
 * Checks if the current platform is Linux.
 *
 * @returns True if the platform is Linux, false otherwise.
 */
export function isLinux(): boolean {
    return getPlatform() === 'linux';
}
