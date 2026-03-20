export interface SkillConfig {
    id: string; // same as name, used as unique key
    name: string;
    description: string;
    author: string;
    version?: string;
    importedAt: number;
    createdAt: number;
    isActive: boolean;
    dirPath: string; // absolute path to the skill directory
}

export interface WatchDir {
    id: string;
    path: string;
    addedAt: number;
    isDefault: boolean; // default dir cannot be removed
}

export interface SkillImportResult {
    success: boolean;
    skill?: SkillConfig;
    error?: string;
}

export interface WatchDirAddResult {
    success: boolean;
    watchDir?: WatchDir;
    skillsAdded: number;
    errors: string[];
}
