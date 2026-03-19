import type { MCPServerConfig } from '@shared/types/mcp';
import type { IpcMain } from 'electron';

import {
    mcpGetAll,
    mcpAdd,
    mcpRemove,
    mcpConnect,
    mcpDisconnect,
    mcpListTools,
} from './mcpService';

/**
 * Register IPC handlers for MCP (Model Context Protocol) operations
 *
 * @param ipcMain - The Electron IPC main instance
 */
export function registerMcpHandlers(ipcMain: IpcMain): void {
    ipcMain.handle('mcp:getAll', () => mcpGetAll());

    ipcMain.handle('mcp:add', (_e, config: Omit<MCPServerConfig, 'id' | 'createdAt'>) =>
        mcpAdd(config)
    );

    ipcMain.handle('mcp:remove', (_e, id: string) => mcpRemove(id));

    ipcMain.handle('mcp:connect', (_e, id: string) => mcpConnect(id));

    ipcMain.handle('mcp:disconnect', (_e, id: string) => mcpDisconnect(id));

    ipcMain.handle('mcp:listTools', (_e, id: string) => mcpListTools(id));
}
