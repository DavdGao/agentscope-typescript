import * as fs from 'fs';
import * as path from 'path';

import { z } from 'zod';

/**
 * Tool for writing files to the local filesystem.
 * Creates parent directories as needed and overwrites existing files.
 *
 * @returns A Tool object for writing files, with a call method that performs the write operation.
 */
export function Write() {
    return {
        name: 'Write',
        description: `Writes a file to the local filesystem.

Usage:
- This tool will overwrite the existing file if there is one at the provided path.
- If this is an existing file, you MUST use the Read tool first to read the file's contents. This tool will fail if you did not read the file first.
- ALWAYS prefer editing existing files in the codebase. NEVER write new files unless explicitly required.
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
- Only use emojis if the user explicitly requests it. Avoid writing emojis to files unless asked.`,
        inputSchema: z.object({
            file_path: z
                .string()
                .describe(
                    'The absolute path to the file to write (must be absolute, not relative)'
                ),
            content: z.string().describe('The content to write to the file'),
        }),
        requireUserConfirm: true,

        /**
         * Writes content to a file, creating parent directories if necessary.
         *
         * @param root0 - The parameters object
         * @param root0.file_path - Absolute path to the file to write
         * @param root0.content - The content to write to the file
         * @returns A success message including the number of lines written
         * @throws If the path is not absolute
         */
        call({ file_path, content }: { file_path: string; content: string }): string {
            if (!path.isAbsolute(file_path)) {
                throw new Error(`file_path must be an absolute path, got: ${file_path}`);
            }

            const dir = path.dirname(file_path);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(file_path, content, 'utf-8');
            const lineCount = content.split('\n').length;
            return `The file ${file_path} has been written successfully (${lineCount} lines).`;
        },
    };
}
