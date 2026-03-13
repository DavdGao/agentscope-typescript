import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { Glob } from './glob';

describe('Glob', () => {
    let tmpDir: string;
    let glob: ReturnType<typeof Glob>;

    beforeEach(() => {
        glob = Glob();
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'glob-test-'));
        fs.writeFileSync(path.join(tmpDir, 'a.ts'), '');
        fs.writeFileSync(path.join(tmpDir, 'b.ts'), '');
        fs.writeFileSync(path.join(tmpDir, 'c.js'), '');
        fs.mkdirSync(path.join(tmpDir, 'src'));
        fs.writeFileSync(path.join(tmpDir, 'src', 'd.ts'), '');
        fs.writeFileSync(path.join(tmpDir, 'src', 'e.tsx'), '');
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('matches *.ts files in root', () => {
        const result = glob.call!({ pattern: '*.ts', path: tmpDir });
        expect(result).toContain('a.ts');
        expect(result).toContain('b.ts');
        expect(result).not.toContain('c.js');
        expect(result).not.toContain('d.ts');
    });

    it('matches **/*.ts recursively', () => {
        const result = glob.call!({ pattern: '**/*.ts', path: tmpDir });
        expect(result).toContain('a.ts');
        expect(result).toContain('b.ts');
        expect(result).toContain('d.ts');
        expect(result).not.toContain('c.js');
    });

    it('matches **/*.tsx recursively', () => {
        const result = glob.call!({ pattern: '**/*.tsx', path: tmpDir });
        expect(result).toContain('e.tsx');
        expect(result).not.toContain('a.ts');
    });

    it('returns message when no files match', () => {
        const result = glob.call!({ pattern: '*.py', path: tmpDir });
        expect(result).toContain('No files found');
    });

    it('throws on non-existent directory', () => {
        expect(() => glob.call!({ pattern: '*.ts', path: '/nonexistent/path' })).toThrow(
            'Directory not found'
        );
    });

    it('uses cwd when path is not specified', () => {
        const result = glob.call!({ pattern: '*.json' });
        expect(typeof result).toBe('string');
    });
});
