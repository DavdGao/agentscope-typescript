import fs from 'fs';
import path from 'path';

import { Schedule } from '@shared/types/schedule';
import cron, { ScheduledTask } from 'node-cron';

import { readJSON, writeJSON, remove } from '../storage';
import { PATHS } from '../storage/paths';

interface ScheduledEntry {
    schedule: Schedule;
    task: ScheduledTask;
}

const entries = new Map<string, ScheduledEntry>();

/**
 * Load all schedules from the storage directory
 *
 * @returns Array of all loaded schedules
 */
function loadAllSchedules(): Schedule[] {
    const scheduleRoot = path.join(PATHS.root, 'schedule');
    if (!fs.existsSync(scheduleRoot)) {
        return [];
    }

    const schedules: Schedule[] = [];
    const eventDirs = fs.readdirSync(scheduleRoot);

    for (const eventId of eventDirs) {
        const eventPath = PATHS.scheduleEvent(eventId);
        if (fs.existsSync(eventPath)) {
            try {
                const schedule = readJSON<Schedule | null>(eventPath, null);
                if (schedule) {
                    schedules.push(schedule);
                }
            } catch (error) {
                console.error(`Failed to load schedule ${eventId}:`, error);
            }
        }
    }

    return schedules;
}

/**
 * Save a schedule to storage
 *
 * @param schedule - The schedule to save
 */
function saveSchedule(schedule: Schedule): void {
    writeJSON(PATHS.scheduleEvent(schedule.id), schedule);
}

/**
 * Trigger a scheduled task execution
 *
 * @param schedule - The schedule to trigger
 */
function triggerSchedule(schedule: Schedule): void {
    // TODO: invoke runAgent with schedule.sessionId and schedule.description
    console.log('trigger schedule', schedule);
}

/**
 * Initialize the scheduler by loading and starting all enabled schedules
 */
export async function initScheduler(): Promise<void> {
    const schedules = loadAllSchedules();

    for (const schedule of schedules) {
        if (schedule.enabled) {
            const task = cron.schedule(schedule.cronExpr, () => triggerSchedule(schedule));
            task.start();
            entries.set(schedule.id, { schedule, task });
        }
    }
}

/**
 * Shutdown the scheduler by stopping all scheduled tasks
 */
export async function shutdownScheduler(): Promise<void> {
    for (const entry of entries.values()) {
        entry.task.stop();
    }
    entries.clear();
}

/**
 * Create a new schedule and start its cron task
 *
 * @param params - Schedule parameters without ID
 * @returns The created schedule with generated ID
 */
export function createSchedule(params: Omit<Schedule, 'id'>): Schedule {
    const schedule: Schedule = { id: crypto.randomUUID(), ...params };

    const task = cron.schedule(schedule.cronExpr, () => triggerSchedule(schedule));
    if (schedule.enabled) task.start();

    entries.set(schedule.id, { schedule, task });
    saveSchedule(schedule);

    return schedule;
}

/**
 * Delete a schedule by ID, stopping its task and removing from storage
 *
 * @param id - The schedule ID to delete
 * @returns True if deleted successfully, false if not found
 */
export function deleteSchedule(id: string): boolean {
    const entry = entries.get(id);
    if (!entry) return false;

    entry.task.stop();
    entries.delete(id);

    // Delete schedule directory (cascade delete)
    remove(PATHS.scheduleDir(id));

    return true;
}

/**
 * Get a schedule by ID
 *
 * @param id - The schedule ID to retrieve
 * @returns The schedule if found, undefined otherwise
 */
export function getSchedule(id: string): Schedule | undefined {
    return entries.get(id)?.schedule;
}

/**
 * List all schedules
 *
 * @returns Array of all schedules
 */
export function listSchedules(): Schedule[] {
    return Array.from(entries.values()).map(e => e.schedule);
}

/**
 * Update a schedule with partial changes, restarting task if needed
 *
 * @param id - The schedule ID to update
 * @param patch - Partial schedule updates to apply
 * @returns The updated schedule if found, null otherwise
 */
export function updateSchedule(id: string, patch: Partial<Omit<Schedule, 'id'>>): Schedule | null {
    const entry = entries.get(id);
    if (!entry) return null;

    const updated: Schedule = { ...entry.schedule, ...patch };

    // If cronExpr or enabled changed, restart the task
    if (patch.cronExpr !== undefined || patch.enabled !== undefined) {
        entry.task.stop();
        const task = cron.schedule(updated.cronExpr, () => triggerSchedule(updated));
        if (updated.enabled) task.start();
        entries.set(id, { schedule: updated, task });
    } else {
        entries.set(id, { schedule: updated, task: entry.task });
    }

    saveSchedule(updated);

    return updated;
}
