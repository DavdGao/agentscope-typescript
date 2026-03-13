import type { Schedule } from '@shared/types/schedule';
import type { IpcMain } from 'electron';

import {
    createSchedule,
    deleteSchedule,
    getSchedule,
    listSchedules,
    updateSchedule,
} from '../scheduler';

/**
 * Register IPC handlers for schedule-related operations
 *
 * @param ipcMain - The Electron IPC main instance
 */
export function registerScheduleHandlers(ipcMain: IpcMain): void {
    const service = new ScheduleService();

    ipcMain.handle('schedule:create', (_event, params: Omit<Schedule, 'id'>) => {
        return service.create(params);
    });

    ipcMain.handle('schedule:delete', (_event, id: string) => {
        return service.delete(id);
    });

    ipcMain.handle('schedule:get', (_event, id: string) => {
        return service.get(id);
    });

    ipcMain.handle('schedule:list', () => {
        return service.list();
    });

    ipcMain.handle(
        'schedule:update',
        (_event, id: string, patch: Partial<Omit<Schedule, 'id'>>) => {
            return service.update(id, patch);
        }
    );
}

/**
 * Service class for managing schedules
 */
export class ScheduleService {
    /**
     * Create a new schedule
     *
     * @param params - Schedule parameters without ID
     * @returns The created schedule
     */
    create(params: Omit<Schedule, 'id'>): Schedule {
        return createSchedule(params);
    }

    /**
     * Delete a schedule by ID
     *
     * @param id - The schedule ID to delete
     * @returns True if deleted successfully, false if not found
     */
    delete(id: string): boolean {
        return deleteSchedule(id);
    }

    /**
     * Get a schedule by ID
     *
     * @param id - The schedule ID
     * @returns The schedule if found, undefined otherwise
     */
    get(id: string): Schedule | undefined {
        return getSchedule(id);
    }

    /**
     * List all schedules
     *
     * @returns Array of all schedules
     */
    list(): Schedule[] {
        return listSchedules();
    }

    /**
     * Update a schedule with partial changes
     *
     * @param id - The schedule ID to update
     * @param patch - Partial schedule updates to apply
     * @returns The updated schedule if found, null otherwise
     */
    update(id: string, patch: Partial<Omit<Schedule, 'id'>>): Schedule | null {
        return updateSchedule(id, patch);
    }
}
