import * as fs from 'fs';
import * as path from 'path';

import { z } from 'zod';

type OutputMode = 'content' | 'files_with_matches' | 'count';

const TYPE_EXTENSIONS: Record<string, string[]> = {
    js: ['.js', '.mjs', '.cjs'],
    ts: ['.ts', '.mts', '.cts'],
    tsx: ['.tsx'],
    jsx: ['.jsx'],
    py: ['.py'],
    rust: ['.rs'],
    go: ['.go'],
    java: ['.java'],
    cpp: ['.cpp', '.cc', '.cxx', '.h', '.hpp'],
    c: ['.c', '.h'],
    css: ['.css'],
    html: ['.html', '.htm'],
    json: ['.json'],
    md: ['.md', '.markdown'],
    yaml: ['.yaml', '.yml'],
    toml: ['.toml'],
    sh: ['.sh', '.bash'],
};

/**
 * Tool for searching file contents using regular expressions.
 * Supports multiple output modes, file type filtering, and multiline matching.
 *
 * @returns A Tool object for performing regex searches across files, with a call method that executes the search and returns results based on the specified output mode.
 */
export function Grep() {
    /**
     * Collects all files under a base directory, optionally filtered by glob or type.
     * @param baseDir - The base directory to search from.
     * @param glob - Optional glob pattern to filter files by name.
     * @param type - Optional file type key to filter by extension.
     * @returns An array of matching file paths.
     */
    const collectFiles = (baseDir: string, glob?: string, type?: string): string[] => {
        const results: string[] = [];
        const extensions = type ? TYPE_EXTENSIONS[type] : undefined;

        const walk = (dir: string): void => {
            let entries: fs.Dirent[];
            try {
                entries = fs.readdirSync(dir, { withFileTypes: true });
            } catch {
                return;
            }

            for (const entry of entries) {
                if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walk(fullPath);
                } else if (entry.isFile()) {
                    if (extensions) {
                        const ext = path.extname(entry.name);
                        if (extensions.includes(ext)) results.push(fullPath);
                    } else if (glob) {
                        if (matchGlob(glob, entry.name)) results.push(fullPath);
                    } else {
                        results.push(fullPath);
                    }
                }
            }
        };

        if (fs.existsSync(baseDir) && fs.statSync(baseDir).isFile()) {
            results.push(baseDir);
        } else {
            walk(baseDir);
        }

        return results;
    };

    /**
     * Tests whether a filename matches a glob pattern.
     * @param pattern - The glob pattern to match against.
     * @param filename - The filename to test.
     * @returns True if the filename matches the pattern, false otherwise.
     */
    const matchGlob = (pattern: string, filename: string): boolean => {
        const braceMatch = pattern.match(/\*\.\\{(.+)\\}/);
        if (braceMatch) {
            const exts = braceMatch[1].split(',').map(e => `.${e.trim()}`);
            return exts.includes(path.extname(filename));
        }
        const escaped = pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp(`^${escaped}$`).test(filename);
    };

    return {
        name: 'Grep',
        description: `A powerful search tool built on regular expressions.

Usage:
- ALWAYS use Grep for search tasks. NEVER invoke \`grep\` or \`rg\` as a Bash command. The Grep tool has been optimized for correct permissions and access.
- Supports full regex syntax (e.g., "log.*Error", "function\\s+\\w+")
- Filter files with glob parameter (e.g., "*.js", "**/*.tsx") or type parameter (e.g., "js", "py", "rust")
- Output modes: "content" shows matching lines, "files_with_matches" shows only file paths (default), "count" shows match counts
- Use Task tool for open-ended searches requiring multiple rounds
- Pattern syntax: Uses ripgrep-style regex - literal braces need escaping (use \`interface\\{\\}\` to find \`interface{}\` in Go code)
- Multiline matching: By default patterns match within single lines only. For cross-line patterns, use \`multiline: true\``,
        inputSchema: z.object({
            pattern: z
                .string()
                .describe('The regular expression pattern to search for in file contents'),
            path: z
                .string()
                .optional()
                .describe('File or directory to search in. Defaults to current working directory.'),
            glob: z
                .string()
                .optional()
                .describe('Glob pattern to filter files (e.g. "*.js", "*.{ts,tsx}")'),
            type: z
                .string()
                .optional()
                .describe(
                    'File type to search (e.g., "js", "ts", "py"). More efficient than glob for standard file types.'
                ),
            output_mode: z
                .enum(['content', 'files_with_matches', 'count'])
                .optional()
                .describe(
                    'Output mode: "content" | "files_with_matches" | "count". Defaults to "files_with_matches".'
                ),
            multiline: z
                .boolean()
                .optional()
                .describe(
                    'Enable multiline mode where . matches newlines and patterns can span lines. Default: false.'
                ),
            case_insensitive: z
                .boolean()
                .optional()
                .describe('Case insensitive search. Default: false.'),
            context: z
                .number()
                .int()
                .optional()
                .describe(
                    'Number of lines to show before and after each match. Requires output_mode: "content".'
                ),
            head_limit: z
                .number()
                .int()
                .optional()
                .describe('Limit output to first N lines/entries.'),
        }),
        requireUserConfirm: true,

        /**
         * Searches files for a regex pattern and returns results in the specified output mode.
         *
         * @param root0 - The parameters object
         * @param root0.pattern - The regular expression pattern to search for
         * @param root0.path - File or directory to search in; defaults to cwd
         * @param root0.glob - Glob pattern to filter which files are searched
         * @param root0.type - File type shorthand (e.g. "ts", "py") to filter files
         * @param root0.output_mode - How to format results: "content", "files_with_matches", or "count"
         * @param root0.multiline - Whether the pattern can span multiple lines
         * @param root0.case_insensitive - Whether the search is case-insensitive
         * @param root0.context - Number of surrounding lines to include with each match
         * @param root0.head_limit - Maximum number of result entries to return
         * @returns A newline-separated string of results, or a no-matches message
         */
        call({
            pattern,
            path: searchPath,
            glob,
            type,
            output_mode = 'files_with_matches',
            multiline = false,
            case_insensitive = false,
            context,
            head_limit,
        }: {
            pattern: string;
            path?: string;
            glob?: string;
            type?: string;
            output_mode?: OutputMode;
            multiline?: boolean;
            case_insensitive?: boolean;
            context?: number;
            head_limit?: number;
        }): string {
            const baseDir = searchPath ? searchPath : process.cwd();

            let flags = multiline ? 'gms' : 'gm';
            if (case_insensitive) flags += 'i';

            const regex = new RegExp(pattern, flags);
            const files = collectFiles(baseDir, glob, type);

            if (files.length === 0) {
                return 'No files found to search.';
            }

            const results: string[] = [];

            for (const file of files) {
                try {
                    const content = fs.readFileSync(file, 'utf-8');

                    if (output_mode === 'files_with_matches') {
                        if (regex.test(content)) {
                            results.push(file);
                        }
                        regex.lastIndex = 0;
                    } else if (output_mode === 'count') {
                        const matches = content.match(regex);
                        if (matches) {
                            results.push(`${file}: ${matches.length}`);
                        }
                        regex.lastIndex = 0;
                    } else if (output_mode === 'content') {
                        const lines = content.split('\n');
                        for (let i = 0; i < lines.length; i++) {
                            const lineRegex = new RegExp(pattern, case_insensitive ? 'i' : '');
                            if (lineRegex.test(lines[i])) {
                                const start = context !== undefined ? Math.max(0, i - context) : i;
                                const end =
                                    context !== undefined
                                        ? Math.min(lines.length - 1, i + context)
                                        : i;
                                for (let j = start; j <= end; j++) {
                                    results.push(`${file}:${j + 1}:${lines[j]}`);
                                }
                            }
                        }
                    }
                } catch {
                    // skip unreadable files
                }
            }

            if (results.length === 0) {
                return `No matches found for pattern: ${pattern}`;
            }

            const output = head_limit !== undefined ? results.slice(0, head_limit) : results;
            return output.join('\n');
        },
    };
}
