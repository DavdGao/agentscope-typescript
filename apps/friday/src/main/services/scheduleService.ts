import type { Msg } from '@agentscope-ai/agentscope/message';
import type { Schedule, ScheduleWithStatus, ScheduleExecution } from '@shared/types/schedule';
import type { IpcMain, WebContents } from 'electron';

import {
    createSchedule,
    deleteSchedule,
    getSchedule,
    listSchedules,
    updateSchedule,
    getExecutions,
    getExecutionMessages,
    initScheduler,
} from '../scheduler';

/**
 * Register IPC handlers for schedule-related operations
 *
 * @param ipcMain - The Electron IPC main instance
 * @param webContents - The web contents for sending events
 */
export async function registerScheduleHandlers(
    ipcMain: IpcMain,
    webContents: WebContents
): Promise<void> {
    // Initialize scheduler with webContents
    await initScheduler(webContents);

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

    ipcMain.handle('schedule:getExecutions', (_event, scheduleId: string) => {
        return service.getExecutions(scheduleId);
    });

    ipcMain.handle(
        'schedule:getExecutionMessages',
        (_event, scheduleId: string, executionId: string) => {
            return service.getExecutionMessages(scheduleId, executionId);
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
     * List all schedules with runtime status
     *
     * @returns Array of all schedules with running execution info
     */
    list(): ScheduleWithStatus[] {
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

    /**
     * Get all executions for a schedule
     *
     * @param scheduleId - The schedule ID
     * @returns Array of all executions
     */
    getExecutions(scheduleId: string): ScheduleExecution[] {
        return getExecutions(scheduleId);
    }

    /**
     * Retrieves all messages for a specific schedule execution.
     * @param scheduleId - The schedule ID.
     * @param executionId - The execution ID.
     * @returns Array of messages for the execution.
     */
    getExecutionMessages(scheduleId: string, executionId: string): Msg[] {
        return getExecutionMessages(scheduleId, executionId);
    }
}
