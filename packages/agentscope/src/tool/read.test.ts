import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { Tool } from './base';
import { Read } from './read';
import { ToolResponse } from './response';

describe('Read', () => {
    let tmpDir: string;
    let read: Tool;

    beforeEach(() => {
        read = Read();
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'read-test-'));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    const getTextFromResponse = (response: ToolResponse): string => {
        const textBlock = response.content.find(block => block.type === 'text');
        return textBlock && 'text' in textBlock ? textBlock.text : '';
    };

    it('reads a file with line numbers', () => {
        const filePath = path.join(tmpDir, 'test.txt');
        fs.writeFileSync(filePath, 'line1\nline2\nline3');
        const response = read.call!({ file_path: filePath }) as ToolResponse;
        const result = getTextFromResponse(response);
        expect(result).toContain('1\tline1');
        expect(result).toContain('2\tline2');
        expect(result).toContain('3\tline3');
    });

    it('respects offset and limit', () => {
        const filePath = path.join(tmpDir, 'test.txt');
        fs.writeFileSync(filePath, 'a\nb\nc\nd\ne');
        const response = read.call!({ file_path: filePath, offset: 2, limit: 2 }) as ToolResponse;
        const result = getTextFromResponse(response);
        expect(result).toContain('2\tb');
        expect(result).toContain('3\tc');
        expect(result).not.toContain('1\ta');
        expect(result).not.toContain('4\td');
    });

    it('throws on relative path', () => {
        expect(() => read.call!({ file_path: 'relative.txt' })).toThrow('absolute path');
    });

    it('throws on non-existent file', () => {
        expect(() => read.call!({ file_path: path.join(tmpDir, 'nope.txt') })).toThrow(
            'File not found'
        );
    });

    it('throws on directory', () => {
        expect(() => read.call!({ file_path: tmpDir })).toThrow('directory');
    });

    it('returns warning for empty file', () => {
        const filePath = path.join(tmpDir, 'empty.txt');
        fs.writeFileSync(filePath, '');
        const response = read.call!({ file_path: filePath }) as ToolResponse;
        const result = getTextFromResponse(response);
        expect(result).toBe('');
    });

    it('truncates lines longer than 2000 characters', () => {
        const filePath = path.join(tmpDir, 'long.txt');
        fs.writeFileSync(filePath, 'x'.repeat(2100));
        const response = read.call!({ file_path: filePath }) as ToolResponse;
        const result = getTextFromResponse(response);
        expect(result).toContain('[truncated]');
    });
});
