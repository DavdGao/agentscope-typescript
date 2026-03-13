import fs from 'fs';
import path from 'path';

import type {
    SkillConfig,
    WatchDir,
    SkillImportResult,
    WatchDirAddResult,
} from '@shared/types/skill';
import matter from 'gray-matter';

import { readJSON, writeJSON, remove } from '../storage';
import { PATHS } from '../storage/paths';

/**
 * Find SKILL.md in a directory, case-insensitive
 *
 * @param dirPath - Directory to search in
 * @returns Absolute path to the SKILL.md file, or null if not found
 */
function findSkillMd(dirPath: string): string | null {
    const entries = fs.readdirSync(dirPath);
    const found = entries.find(e => e.toLowerCase() === 'skill.md');
    return found ? path.join(dirPath, found) : null;
}

/**
 * Parse SKILL.md and extract name and description from YAML front matter
 *
 * @param skillMdPath - Path to SKILL.md
 * @returns Parsed name and description, or null if invalid
 */
function parseSkillMd(skillMdPath: string): { name: string; description: string } | null {
    try {
        const content = fs.readFileSync(skillMdPath, 'utf-8');
        const { data } = matter(content);
        if (!data.name || !data.description) return null;
        return { name: String(data.name), description: String(data.description) };
    } catch {
        return null;
    }
}

/**
 * Load watch directories from storage
 *
 * @returns Array of watch directories
 */
function loadWatchDirs(): WatchDir[] {
    const dirs = readJSON<WatchDir[]>(PATHS.skillWatchDirs, []);
    // Ensure default dir exists
    if (dirs.length === 0) {
        const defaultDir: WatchDir = {
            id: 'default',
            path: PATHS.skills,
            addedAt: Date.now(),
            isDefault: true,
        };
        dirs.push(defaultDir);
        saveWatchDirs(dirs);
    }
    return dirs;
}

/**
 * Save watch directories to storage
 *
 * @param dirs - Array of watch directories to save
 */
function saveWatchDirs(dirs: WatchDir[]): void {
    writeJSON(PATHS.skillWatchDirs, dirs);
}

/**
 * Load skill active states from storage
 *
 * @returns Map of skill names to their active states
 */
function loadSkillStates(): Map<string, boolean> {
    const states = readJSON<Record<string, boolean>>(PATHS.skillStates, {});
    return new Map(Object.entries(states));
}

/**
 * Save skill active states to storage
 *
 * @param states - Map of skill states to save
 */
function saveSkillStates(states: Map<string, boolean>): void {
    const obj = Object.fromEntries(states);
    writeJSON(PATHS.skillStates, obj);
}

const skillStates = loadSkillStates();

// Scan all watch directories for skills
/**
 * Scan all watch directories and load skill configurations
 *
 * @returns Array of skill configurations
 */
function scanSkills(): SkillConfig[] {
    const watchDirs = loadWatchDirs();
    const skills: SkillConfig[] = [];

    for (const watchDir of watchDirs) {
        if (!fs.existsSync(watchDir.path)) {
            continue;
        }

        try {
            const entries = fs.readdirSync(watchDir.path, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isDirectory()) continue;

                const skillDir = path.join(watchDir.path, entry.name);
                const skillMdPath = findSkillMd(skillDir);

                if (skillMdPath) {
                    try {
                        const parsed = parseSkillMd(skillMdPath);
                        if (!parsed) continue;

                        const skill: SkillConfig = {
                            id: entry.name,
                            name: parsed.name,
                            description: parsed.description,
                            author: 'Unknown',
                            version: undefined,
                            importedAt: watchDir.addedAt,
                            createdAt: Date.now(),
                            isActive: skillStates.has(entry.name)
                                ? skillStates.get(entry.name)!
                                : false,
                            dirPath: skillDir,
                        };
                        skills.push(skill);
                    } catch (error) {
                        console.error(`Failed to load skill ${entry.name}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to scan watch dir ${watchDir.path}:`, error);
        }
    }

    return skills;
}

/**
 * Get all available skills
 *
 * @returns Array of all skill configurations
 */
export function skillGetAll(): SkillConfig[] {
    return scanSkills();
}

/**
 * Set the active state of a skill
 *
 * @param name - The skill name
 * @param isActive - Whether the skill should be active
 * @returns The updated skill configuration
 */
export function skillSetActive(name: string, isActive: boolean): SkillConfig {
    const skill = scanSkills().find(s => s.name === name);
    if (!skill) throw new Error(`Skill '${name}' not found`);
    skillStates.set(name, isActive);
    saveSkillStates(skillStates);
    return { ...skill, isActive };
}

/**
 * Remove a skill from the system
 *
 * @param name - The skill name to remove
 */
export function skillRemove(name: string): void {
    const skill = scanSkills().find(s => s.name === name);
    if (!skill) throw new Error(`Skill '${name}' not found`);

    // Delete skill directory from disk
    remove(skill.dirPath);
    skillStates.delete(name);
    saveSkillStates(skillStates);
}

/**
 * Import a skill from a source directory
 *
 * @param srcPath - The source directory path
 * @returns Import result with skill config or error
 */
export function skillImport(srcPath: string): SkillImportResult {
    if (!fs.existsSync(srcPath)) {
        return { success: false, error: `Source path does not exist: ${srcPath}` };
    }

    const stat = fs.statSync(srcPath);
    if (!stat.isDirectory()) {
        return { success: false, error: `Source path is not a directory: ${srcPath}` };
    }

    const skillMdPath = findSkillMd(srcPath);
    if (!skillMdPath) {
        return { success: false, error: `No SKILL.md found in: ${path.basename(srcPath)}` };
    }

    const parsed = parseSkillMd(skillMdPath);
    if (!parsed) {
        return {
            success: false,
            error: `Invalid SKILL.md: missing 'name' or 'description' in YAML front matter`,
        };
    }

    const skillName = path.basename(srcPath);
    const existing = scanSkills().find(s => s.id === skillName);
    if (existing) {
        return { success: false, error: `Skill '${skillName}' already exists` };
    }

    const targetPath = PATHS.skillDir(skillName);
    copyDirectory(srcPath, targetPath);

    const watchDirs = loadWatchDirs();
    const defaultDir = watchDirs.find(d => d.isDefault);

    const skill: SkillConfig = {
        id: skillName,
        name: parsed.name,
        description: parsed.description,
        author: 'Unknown',
        version: undefined,
        importedAt: defaultDir?.addedAt || Date.now(),
        createdAt: Date.now(),
        isActive: true,
        dirPath: targetPath,
    };

    // Set skill as active by default
    skillStates.set(skillName, true);
    saveSkillStates(skillStates);

    return { success: true, skill };
}

/**
 * Add a new watch directory (creates a symlink in the skills dir)
 *
 * @param dirPath - The directory path to watch
 * @returns Result with watch dir and count of valid skills found
 */
export function skillAddWatchDir(dirPath: string): WatchDirAddResult {
    if (!fs.existsSync(dirPath)) {
        return { success: false, skillsAdded: 0, errors: [`Directory does not exist: ${dirPath}`] };
    }

    const watchDirs = loadWatchDirs();
    if (watchDirs.find(d => d.path === dirPath)) {
        return {
            success: false,
            skillsAdded: 0,
            errors: [`Directory is already monitored: ${dirPath}`],
        };
    }

    // Scan subdirectories for valid skills
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const errors: string[] = [];
    let skillsAdded = 0;

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const subDir = path.join(dirPath, entry.name);
        const skillMd = findSkillMd(subDir);
        if (skillMd && parseSkillMd(skillMd)) {
            skillsAdded++;
        } else {
            errors.push(`No valid SKILL.md in: ${entry.name}`);
        }
    }

    // Create symlink in skills dir pointing to the watched directory
    const linkName = path.basename(dirPath);
    const linkTarget = path.join(PATHS.skills, `__monitor__${linkName}`);
    if (!fs.existsSync(linkTarget)) {
        fs.symlinkSync(dirPath, linkTarget, 'dir');
    }

    const dir: WatchDir = {
        id: crypto.randomUUID(),
        path: dirPath,
        addedAt: Date.now(),
        isDefault: false,
    };
    watchDirs.push(dir);
    saveWatchDirs(watchDirs);

    return { success: true, watchDir: dir, skillsAdded, errors };
}

/**
 * Copy a directory recursively
 *
 * @param src - Source directory path
 * @param dest - Destination directory path
 */
function copyDirectory(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Get all watch directories
 *
 * @returns Array of watch directories
 */
export function skillGetWatchDirs(): WatchDir[] {
    return loadWatchDirs();
}

/**
 * Remove a watch directory
 *
 * @param id - The watch directory ID to remove
 */
export function skillRemoveWatchDir(id: string): void {
    const watchDirs = loadWatchDirs();
    const idx = watchDirs.findIndex(d => d.id === id);
    if (idx === -1) throw new Error(`Watch dir '${id}' not found`);
    if (watchDirs[idx].isDefault) throw new Error('Cannot remove the default watch dir');

    watchDirs.splice(idx, 1);
    saveWatchDirs(watchDirs);
}
