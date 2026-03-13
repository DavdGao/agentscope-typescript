import type { Config } from './config';

export const DEFAULT_CONFIG: Config = {
    username: 'User',
    language: 'en',
    onboardingCompleted: false,
    tourCompleted: false,
    models: {},
    agents: {
        friday: {
            name: 'friday',
            type: 'builtin',
            avatar: 'friday',
            modelKey: '', // Empty by default, user needs to configure in agent settings
            instruction: '',
            maxIters: 20,
            compressionTrigger: 10000,
            compressionKeepRecent: 5,
        },
    },
    chat: {},
    editor: {
        autoSave: true,
        autoSaveIntervalMs: 3000,
    },
    skills: {
        dirs: [],
    },
    telemetry: {
        enabled: true,
    },
};
