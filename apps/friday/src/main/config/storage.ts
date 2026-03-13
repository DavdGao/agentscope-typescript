import { Config } from '@shared/types/config';
import { DEFAULT_CONFIG } from '@shared/types/constants';

import { readJSON, writeJSON, ensureDirectories } from '../storage';
import { PATHS } from '../storage/paths';

/**
 * Load configuration from storage, returning default config if not found
 *
 * @returns The loaded or default configuration
 */
export function loadConfig(): Config {
    ensureDirectories();
    const config = readJSON(PATHS.config, null);
    if (!config) {
        saveConfig(DEFAULT_CONFIG as Config);
        return DEFAULT_CONFIG as Config;
    }
    return config as Config;
}

/**
 * Save configuration to storage
 *
 * @param config - The configuration object to save
 */
export function saveConfig(config: Config): void {
    writeJSON(PATHS.config, config);
}
