import type { IpcMain } from 'electron';

import {
    skillGetAll,
    skillSetActive,
    skillRemove,
    skillImport,
    skillGetWatchDirs,
    skillAddWatchDir,
    skillRemoveWatchDir,
} from './skillService';

/**
 * Register IPC handlers for skill-related operations
 *
 * @param ipcMain - The Electron IPC main instance
 */
export function registerSkillHandlers(ipcMain: IpcMain): void {
    ipcMain.handle('skill:getAll', () => skillGetAll());

    ipcMain.handle('skill:setActive', (_e, name: string, isActive: boolean) =>
        skillSetActive(name, isActive)
    );

    ipcMain.handle('skill:remove', (_e, name: string) => skillRemove(name));

    ipcMain.handle('skill:import', (_e, srcPath: string) => skillImport(srcPath));

    ipcMain.handle('skill:getWatchDirs', () => skillGetWatchDirs());

    ipcMain.handle('skill:addWatchDir', (_e, path: string) => skillAddWatchDir(path));

    ipcMain.handle('skill:removeWatchDir', (_e, id: string) => skillRemoveWatchDir(id));
}
