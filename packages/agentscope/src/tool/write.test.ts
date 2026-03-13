import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { Tool } from './base';
import { Write } from './write';

describe('Write', () => {
    let tmpDir: string;
    let write: Tool;

    beforeEach(() => {
        write = Write();
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'write-test-'));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('writes a new file', () => {
        const filePath = path.join(tmpDir, 'hello.txt');
        const result = write.call!({ file_path: filePath, content: 'hello world' });
        expect(fs.readFileSync(filePath, 'utf-8')).toBe('hello world');
        expect(result).toContain('written successfully');
    });

    it('overwrites an existing file', () => {
        const filePath = path.join(tmpDir, 'existing.txt');
        fs.writeFileSync(filePath, 'old content');
        write.call!({ file_path: filePath, content: 'new content' });
        expect(fs.readFileSync(filePath, 'utf-8')).toBe('new content');
    });

    it('creates intermediate directories', () => {
        const filePath = path.join(tmpDir, 'a', 'b', 'c.txt');
        write.call!({ file_path: filePath, content: 'nested' });
        expect(fs.readFileSync(filePath, 'utf-8')).toBe('nested');
    });

    it('throws on relative path', () => {
        expect(() => write.call!({ file_path: 'relative/path.txt', content: 'x' })).toThrow(
            'absolute path'
        );
    });

    it('reports correct line count', () => {
        const filePath = path.join(tmpDir, 'lines.txt');
        const result = write.call!({ file_path: filePath, content: 'line1\nline2\nline3' });
        expect(result).toContain('3 lines');
    });
});
