import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { Tool } from './base';
import { Grep } from './grep';

describe('Grep', () => {
    let tmpDir: string;
    let grep: Tool;

    beforeEach(() => {
        grep = Grep();
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'grep-test-'));
        fs.writeFileSync(path.join(tmpDir, 'a.ts'), 'function hello() {}\nconst world = 1;');
        fs.writeFileSync(path.join(tmpDir, 'b.ts'), 'function greet() {}\nconst hello = "hi";');
        fs.writeFileSync(path.join(tmpDir, 'c.js'), 'var hello = true;');
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('returns files_with_matches by default', () => {
        const result = grep.call!({ pattern: 'hello', path: tmpDir });
        expect(result).toContain('a.ts');
        expect(result).toContain('b.ts');
        expect(result).toContain('c.js');
    });

    it('filters by type', () => {
        const result = grep.call!({ pattern: 'hello', path: tmpDir, type: 'ts' });
        expect(result).toContain('a.ts');
        expect(result).toContain('b.ts');
        expect(result).not.toContain('c.js');
    });

    it('returns content with matching lines', () => {
        const result = grep.call!({
            pattern: 'function',
            path: tmpDir,
            output_mode: 'content',
            type: 'ts',
        });
        expect(result).toContain('function hello');
        expect(result).toContain('function greet');
    });

    it('returns count mode', () => {
        const result = grep.call!({ pattern: 'hello', path: tmpDir, output_mode: 'count' });
        expect(result).toMatch(/\d+/);
    });

    it('is case insensitive when flag set', () => {
        const result = grep.call!({ pattern: 'HELLO', path: tmpDir, case_insensitive: true });
        expect(result).toContain('a.ts');
    });

    it('returns no matches message when nothing found', () => {
        const result = grep.call!({ pattern: 'zzznomatch', path: tmpDir });
        expect(result).toContain('No matches found');
    });

    it('respects head_limit', () => {
        const result = grep.call!({ pattern: 'hello', path: tmpDir, head_limit: 1 });
        expect((result as string).split('\n').length).toBe(1);
    });

    it('searches a single file directly', () => {
        const filePath = path.join(tmpDir, 'a.ts');
        const result = grep.call!({ pattern: 'hello', path: filePath });
        expect(result).toContain('a.ts');
    });
});
