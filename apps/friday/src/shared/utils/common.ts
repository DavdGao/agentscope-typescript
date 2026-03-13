/**
 * Format a number to a human-readable string with commas and suffixes
 * @param num - The number to format
 * @returns Formatted string (e.g., "1,000", "10.2k", "1.5M")
 */
export function formatNumber(num: number): string {
    if (num < 1000) {
        return num.toLocaleString();
    }

    const units = [
        { value: 1e9, suffix: 'B' },
        { value: 1e6, suffix: 'M' },
        { value: 1e3, suffix: 'k' },
    ];

    for (const { value, suffix } of units) {
        if (num >= value) {
            const formatted = num / value;
            // Keep 1-2 decimal places, remove trailing zeros
            const decimals = formatted >= 10 ? 1 : 2;
            return formatted.toFixed(decimals).replace(/\.0+$/, '') + suffix;
        }
    }

    return num.toLocaleString();
}
