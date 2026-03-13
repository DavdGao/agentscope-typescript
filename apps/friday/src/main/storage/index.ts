import fs from 'fs';
import path from 'path';

import { PATHS } from './paths';

/**
 * Ensure all required directories exist
 */
export async function ensureDirectories(): Promise<void> {
    const dirs = [
        PATHS.root,
        path.join(PATHS.root, 'chat'),
        path.join(PATHS.root, 'schedule'),
        path.join(PATHS.root, 'editor'),
        PATHS.skills,
        PATHS.workspace,
        PATHS.telemetry,
        path.join(PATHS.telemetry, 'daily'),
    ];

    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
}

/**
 * Read JSON file with default value fallback
 *
 * @param filePath - Path to the JSON file
 * @param defaultValue - Default value if file doesn't exist or parsing fails
 * @returns The parsed JSON data or default value
 */
export function readJSON<T>(filePath: string, defaultValue: T): T {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data) as T;
        }
    } catch (error) {
        console.error(`Failed to read JSON from ${filePath}:`, error);
    }
    return defaultValue;
}

/**
 * Write JSON file
 * @param filePath
 * @param data
 */
export function writeJSON(filePath: string, data: unknown): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Append a line to JSONL file
 * @param filePath
 * @param data
 */
export function appendJSONL(filePath: string, data: unknown): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(filePath, JSON.stringify(data) + '\n', 'utf-8');
}

/**
 * Read JSONL file and parse all lines
 *
 * @param filePath - Path to the JSONL file
 * @returns Array of parsed objects
 */
export function readJSONL<T>(filePath: string): T[] {
    try {
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return content
            .trim()
            .split('\n')
            .filter(Boolean)
            .map(line => JSON.parse(line) as T);
    } catch (error) {
        console.error(`Failed to read JSONL from ${filePath}:`, error);
        return [];
    }
}

/**
 * Delete a file or directory recursively
 * @param targetPath
 */
export function remove(targetPath: string): void {
    if (!fs.existsSync(targetPath)) {
        return;
    }

    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
        const files = fs.readdirSync(targetPath);
        for (const file of files) {
            remove(path.join(targetPath, file));
        }
        fs.rmdirSync(targetPath);
    } else {
        fs.unlinkSync(targetPath);
    }
}
