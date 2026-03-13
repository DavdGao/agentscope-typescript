import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { Tool } from './base';
import { Edit } from './edit';

describe('Edit', () => {
    let tmpDir: string;
    let edit: Tool;

    beforeEach(() => {
        edit = Edit();
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edit-test-'));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('replaces a unique string', () => {
        const filePath = path.join(tmpDir, 'test.ts');
        fs.writeFileSync(filePath, 'const x = 1;\nconst y = 2;');
        edit.call!({
            file_path: filePath,
            old_string: 'const x = 1;',
            new_string: 'const x = 42;',
        });
        expect(fs.readFileSync(filePath, 'utf-8')).toBe('const x = 42;\nconst y = 2;');
    });

    it('throws when old_string not found', () => {
        const filePath = path.join(tmpDir, 'test.ts');
        fs.writeFileSync(filePath, 'hello world');
        expect(() =>
            edit.call!({ file_path: filePath, old_string: 'not here', new_string: 'x' })
        ).toThrow('not found');
    });

    it('throws when old_string is not unique and replace_all is false', () => {
        const filePath = path.join(tmpDir, 'test.ts');
        fs.writeFileSync(filePath, 'foo foo foo');
        expect(() =>
            edit.call!({ file_path: filePath, old_string: 'foo', new_string: 'bar' })
        ).toThrow('not unique');
    });

    it('replaces all occurrences when replace_all is true', () => {
        const filePath = path.join(tmpDir, 'test.ts');
        fs.writeFileSync(filePath, 'foo foo foo');
        edit.call!({
            file_path: filePath,
            old_string: 'foo',
            new_string: 'bar',
            replace_all: true,
        });
        expect(fs.readFileSync(filePath, 'utf-8')).toBe('bar bar bar');
    });

    it('throws when old_string equals new_string', () => {
        const filePath = path.join(tmpDir, 'test.ts');
        fs.writeFileSync(filePath, 'hello');
        expect(() =>
            edit.call!({ file_path: filePath, old_string: 'hello', new_string: 'hello' })
        ).toThrow('must be different');
    });

    it('throws on relative path', () => {
        expect(() =>
            edit.call!({ file_path: 'relative.ts', old_string: 'a', new_string: 'b' })
        ).toThrow('absolute path');
    });

    it('throws on non-existent file', () => {
        expect(() =>
            edit.call!({
                file_path: path.join(tmpDir, 'nope.ts'),
                old_string: 'a',
                new_string: 'b',
            })
        ).toThrow('File not found');
    });
});
