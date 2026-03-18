import { ModelProvider } from '@shared/types/config';

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

/**
 * Returns a display name for a model provider.
 * @param provider - The model provider identifier.
 * @returns A human-readable provider name.
 */
export function formatProviderName(provider: ModelProvider) {
    switch (provider) {
        case 'dashscope':
            return 'DashScope';
        case 'openai':
            return 'OpenAI';
        case 'ollama':
            return 'Ollama';
        case 'deepseek':
            return 'DeepSeek';
        default:
            return provider;
    }
}

export const formatDuration = (startTime: number, endTime?: number) => {
    if (!endTime) return '-';
    const duration = endTime - startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
};
