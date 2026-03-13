import type {
    SkillConfig,
    WatchDir,
    SkillImportResult,
    WatchDirAddResult,
} from '@shared/types/skill';
import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook for managing skills and watch directories.
 *
 * @returns An object containing skill data, watch directories, and management functions.
 */
export function useSkills() {
    const [skills, setSkills] = useState<SkillConfig[]>([]);
    const [watchDirs, setWatchDirs] = useState<WatchDir[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const [s, d] = await Promise.all([
                window.api.skill.getAll(),
                window.api.skill.getWatchDirs(),
            ]);
            setSkills(s);
            setWatchDirs(d);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const setActive = useCallback(async (name: string, isActive: boolean) => {
        const updated = await window.api.skill.setActive(name, isActive);
        setSkills(prev => prev.map(s => (s.name === name ? updated : s)));
    }, []);

    const remove = useCallback(
        async (name: string) => {
            await window.api.skill.remove(name);
            await load();
        },
        [load]
    );

    const importSkill = useCallback(async (): Promise<SkillImportResult> => {
        const dirPath = await window.api.dialog.openDirectory();
        if (!dirPath) {
            return { success: false, error: 'No directory selected' };
        }
        const result = await window.api.skill.import(dirPath);
        if (result.success) {
            await load();
        }
        return result;
    }, [load]);

    const addWatchDir = useCallback(async (): Promise<WatchDirAddResult> => {
        const dirPath = await window.api.dialog.openDirectory();
        if (!dirPath) {
            return { success: false, skillsAdded: 0, errors: ['No directory selected'] };
        }
        const result = await window.api.skill.addWatchDir(dirPath);
        if (result.success) {
            await load();
        }
        return result;
    }, [load]);

    const removeWatchDir = useCallback(
        async (id: string) => {
            await window.api.skill.removeWatchDir(id);
            setWatchDirs(prev => prev.filter(d => d.id !== id));
            await load();
        },
        [load]
    );

    return {
        skills,
        watchDirs,
        loading,
        error,
        setActive,
        remove,
        importSkill,
        addWatchDir,
        removeWatchDir,
        reload: load,
    };
}
