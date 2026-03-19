import type { Config } from '@shared/types/config';
import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook for managing application configuration.
 *
 * @returns An object containing configuration data and management functions.
 */
export function useConfig() {
    const [config, setConfigState] = useState<Config | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchConfig = useCallback(async () => {
        try {
            setLoading(true);
            const result = await window.api.config.get();
            setConfigState(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const updateConfig = useCallback(async (updates: Partial<Config>): Promise<Config> => {
        const result = await window.api.config.set(updates);
        setConfigState(result);
        return result;
    }, []);

    return {
        config,
        loading,
        error,
        updateConfig,
        refetch: fetchConfig,
    };
}
