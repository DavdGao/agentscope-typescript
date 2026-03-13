import * as fs from 'fs';
import * as path from 'path';

import { z } from 'zod';

/**
 * Tool for performing exact string replacements in files.
 * Requires the file to have been read at least once before editing.
 *
 * @returns A Tool object with a call method that performs the edit operation based on the provided parameters, ensuring uniqueness of the old_string unless replace_all is true.
 */
export function Edit() {
    return {
        name: 'Edit',
        description: `Performs exact string replacements in files.

Usage:
- You must use your Read tool at least once in the conversation before editing. This tool will error if you attempt an edit without reading the file.
- When editing text from Read tool output, ensure you preserve the exact indentation (tabs/spaces) as it appears AFTER the line number prefix. The line number prefix format is: spaces + line number + tab. Everything after that tab is the actual file content to match. Never include any part of the line number prefix in the old_string or new_string.
- ALWAYS prefer editing existing files in the codebase. NEVER write new files unless explicitly required.
- Only use emojis if the user explicitly requests it. Avoid adding emojis to files unless asked.
- The edit will FAIL if \`old_string\` is not unique in the file. Either provide a larger string with more surrounding context to make it unique or use \`replace_all\` to change every instance of \`old_string\`.
- Use \`replace_all\` for replacing and renaming strings across the file. This parameter is useful if you want to rename a variable for instance.`,
        inputSchema: z.object({
            file_path: z.string().describe('The absolute path to the file to modify'),
            old_string: z.string().describe('The text to replace'),
            new_string: z
                .string()
                .describe('The text to replace it with (must be different from old_string)'),
            replace_all: z
                .boolean()
                .optional()
                .default(false)
                .describe('Replace all occurrences of old_string (default false)'),
        }),
        requireUserConfirm: true,

        /**
         * Performs an exact string replacement in the specified file.
         *
         * @param root0 - The parameters object
         * @param root0.file_path - Absolute path to the file to modify
         * @param root0.old_string - The exact text to find and replace
         * @param root0.new_string - The text to replace old_string with
         * @param root0.replace_all - If true, replaces all occurrences; otherwise only the first
         * @returns A success message indicating the file was updated
         * @throws If the path is not absolute, file does not exist, strings are identical,
         *         old_string is not found, or old_string is not unique and replace_all is false
         */
        call({
            file_path,
            old_string,
            new_string,
            replace_all = false,
        }: {
            file_path: string;
            old_string: string;
            new_string: string;
            replace_all?: boolean;
        }): string {
            if (!path.isAbsolute(file_path)) {
                throw new Error(`file_path must be an absolute path, got: ${file_path}`);
            }

            if (!fs.existsSync(file_path)) {
                throw new Error(`File not found: ${file_path}`);
            }

            if (old_string === new_string) {
                throw new Error('old_string and new_string must be different');
            }

            const content = fs.readFileSync(file_path, 'utf-8');
            const occurrences = content.split(old_string).length - 1;

            if (occurrences === 0) {
                throw new Error(`old_string not found in file: ${file_path}`);
            }

            if (!replace_all && occurrences > 1) {
                throw new Error(
                    `old_string is not unique in the file (found ${occurrences} occurrences). ` +
                        `Provide more surrounding context to make it unique, or use replace_all=true.`
                );
            }

            const newContent = replace_all
                ? content.split(old_string).join(new_string)
                : content.replace(old_string, new_string);

            fs.writeFileSync(file_path, newContent, 'utf-8');
            return `The file ${file_path} has been updated successfully.`;
        },
    };
}
