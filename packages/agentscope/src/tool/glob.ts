import * as fs from 'fs';
import * as path from 'path';

import { z } from 'zod';

/**
 * Tool for fast file pattern matching across a codebase.
 * Supports glob patterns and returns results sorted by modification time.
 *
 * @returns A Tool object with a call method that performs glob matching based on the provided pattern and path.
 */
export function Glob() {
    /**
     * Matches files against a glob pattern starting from the given base directory.
     * @param pattern - The glob pattern to match against.
     * @param baseDir - The base directory to search from.
     * @returns An array of matched file paths.
     */
    const globMatch = (pattern: string, baseDir: string): string[] => {
        const results: string[] = [];
        const parts = pattern.split('/');
        matchParts(parts, 0, baseDir, results);
        return results;
    };

    /**
     * Recursively matches path parts against directory entries.
     * @param parts - The split glob pattern parts.
     * @param partIndex - The current index in the parts array.
     * @param currentDir - The current directory being traversed.
     * @param results - The accumulator array for matched file paths.
     */
    const matchParts = (
        parts: string[],
        partIndex: number,
        currentDir: string,
        results: string[]
    ): void => {
        if (partIndex >= parts.length) return;

        const part = parts[partIndex];
        const isLast = partIndex === parts.length - 1;

        if (part === '**') {
            if (isLast) {
                collectAll(currentDir, results);
            } else {
                matchParts(parts, partIndex + 1, currentDir, results);
                try {
                    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
                    for (const entry of entries) {
                        if (entry.isDirectory()) {
                            const subDir = path.join(currentDir, entry.name);
                            matchParts(parts, partIndex, subDir, results);
                        }
                    }
                } catch {
                    // skip unreadable dirs
                }
            }
        } else {
            const regex = globPartToRegex(part);
            try {
                const entries = fs.readdirSync(currentDir, { withFileTypes: true });
                for (const entry of entries) {
                    if (regex.test(entry.name)) {
                        const fullPath = path.join(currentDir, entry.name);
                        if (isLast) {
                            if (entry.isFile()) results.push(fullPath);
                        } else if (entry.isDirectory()) {
                            matchParts(parts, partIndex + 1, fullPath, results);
                        }
                    }
                }
            } catch {
                // skip unreadable dirs
            }
        }
    };

    /**
     * Recursively collects all files under a directory.
     * @param dir - The directory to collect files from.
     * @param results - The accumulator array for collected file paths.
     */
    const collectAll = (dir: string, results: string[]): void => {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isFile()) {
                    results.push(fullPath);
                } else if (entry.isDirectory()) {
                    collectAll(fullPath, results);
                }
            }
        } catch {
            // skip unreadable dirs
        }
    };

    /**
     * Converts a single glob pattern part to a RegExp.
     * @param part - The glob pattern part to convert.
     * @returns A RegExp that matches the pattern part.
     */
    const globPartToRegex = (part: string): RegExp => {
        const escaped = part
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp(`^${escaped}$`);
    };

    return {
        name: 'Glob',
        description: `Fast file pattern matching tool that works with any codebase size.
- Supports glob patterns like "**/*.js" or "src/**/*.ts"
- Returns matching file paths sorted by modification time
- Use this tool when you need to find files by name patterns
- When you are doing an open ended search that may require multiple rounds of globbing and grepping, use the Agent tool instead
- You can call multiple tools in a single response. It is always better to speculatively perform multiple searches in parallel if they are potentially useful.`,
        inputSchema: z.object({
            pattern: z.string().describe('The glob pattern to match files against'),
            path: z
                .string()
                .optional()
                .describe(
                    'The directory to search in. If not specified, the current working directory will be used. IMPORTANT: Omit this field to use the default directory. DO NOT enter "undefined" or "null" - simply omit it for the default behavior. Must be a valid directory path if provided.'
                ),
        }),
        requireUserConfirm: true,

        /**
         * Finds files matching a glob pattern under the given directory.
         *
         * @param root0 - The parameters object
         * @param root0.pattern - The glob pattern to match files against
         * @param root0.path - The base directory to search in; defaults to cwd
         * @returns A newline-separated list of matching file paths sorted by modification time,
         *          or a no-matches message if nothing is found
         * @throws If the base directory does not exist
         */
        call({ pattern, path: searchPath }: { pattern: string; path?: string }): string {
            const baseDir = searchPath ? searchPath : process.cwd();

            if (!fs.existsSync(baseDir)) {
                throw new Error(`Directory not found: ${baseDir}`);
            }

            const matches = globMatch(pattern, baseDir);

            matches.sort((a, b) => {
                const statA = fs.statSync(a);
                const statB = fs.statSync(b);
                return statB.mtimeMs - statA.mtimeMs;
            });

            if (matches.length === 0) {
                return `No files found matching pattern: ${pattern}`;
            }

            return matches.join('\n');
        },
    };
}
