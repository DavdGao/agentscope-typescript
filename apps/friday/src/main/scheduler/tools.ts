import { Tool } from '@agentscope-ai/agentscope/tool';
import { z } from 'zod';

import {
    createSchedule,
    deleteSchedule,
    listSchedules,
    getSchedule,
    updateSchedule,
} from './index';

/**
 * Create a scheduled task with a cron expression to run periodically.
 *
 * Use this tool to schedule recurring tasks that should execute automatically at specified times.
 * The task will be persisted and survive application restarts.
 * @param sessionId
 * @returns A Tool definition for creating scheduled tasks
 */
export function ScheduleCreate(sessionId: string) {
    return {
        name: 'ScheduleCreate',
        description: `Create a scheduled task with a cron expression to run periodically.

## When to Use This Tool

Use this tool when you need to:
- Schedule recurring tasks (daily reports, periodic checks, automated reminders)
- Set up time-based automation (backups, cleanups, notifications)
- Create tasks that run at specific times or intervals

## Usage Notes

- **Cron Expression**: Use standard cron syntax (e.g., "0 9 * * *" for daily at 9 AM, "*/5 * * * *" for every 5 minutes)
- **Description**: Provide detailed context about what should happen when the task runs. This description will be used to execute the task, so include all necessary information.
- **Start Time**: Tasks will only trigger after the startAt timestamp. Use this to delay the first execution.
- **End Time** (optional): Tasks will stop triggering after the endAt timestamp. Use this for temporary schedules.
- **Enabled**: Set to false to create a paused schedule that can be enabled later.

## Cron Expression Examples

- \`0 9 * * *\` - Every day at 9:00 AM
- \`*/15 * * * *\` - Every 15 minutes
- \`0 0 * * 0\` - Every Sunday at midnight
- \`0 12 * * 1-5\` - Weekdays at noon
- \`0 */2 * * *\` - Every 2 hours

IMPORTANT: Provide enough detail in the 'description' field to allow the task to be executed independently when it triggers. Include context, expected actions, and desired outcomes.`,
        inputSchema: z.object({
            name: z.string().describe('The name of the scheduled task (short, descriptive)'),
            enabled: z
                .boolean()
                .describe('Whether the scheduled task is enabled (true) or paused (false)'),
            description: z
                .string()
                .describe(
                    'Detailed task description with full context about what should happen when it runs, including expected actions and outcomes'
                ),
            cronExpr: z
                .string()
                .describe(
                    'Cron expression defining when the task runs (e.g., "0 9 * * *" for daily at 9 AM)'
                ),
            startAt: z
                .number()
                .describe(
                    'Start timestamp in milliseconds - task will not trigger before this time'
                ),
            endAt: z
                .number()
                .optional()
                .describe(
                    'Optional end timestamp in milliseconds - task will stop triggering after this time'
                ),
        }),

        /**
         * Create a new scheduled task
         *
         * @param params - Schedule creation parameters
         * @param params.name - The name of the scheduled task
         * @param params.enabled - Whether the scheduled task is enabled or not
         * @param params.description - The task description with full context
         * @param params.cronExpr - The cron expression
         * @param params.startAt - The start timestamp in milliseconds
         * @param params.endAt - Optional end timestamp in milliseconds
         * @returns Success message with schedule details or error message
         */
        call({
            name,
            enabled,
            description,
            cronExpr,
            startAt,
            endAt,
        }: {
            name: string;
            enabled: boolean;
            description: string;
            cronExpr: string;
            startAt: number;
            endAt?: number;
        }): string {
            try {
                const schedule = createSchedule({
                    name,
                    enabled,
                    description,
                    startAt,
                    endAt,
                    cronExpr,
                    sessionId,
                });
                return `Scheduled task created successfully: ${JSON.stringify(schedule, null, 2)}`;
            } catch (error) {
                return `Failed to create schedule: ${error instanceof Error ? error.message : String(error)}`;
            }
        },
    } as Tool;
}

/**
 * Delete a scheduled task by its ID.
 *
 * Use this tool to permanently remove a scheduled task. The task will be stopped and removed from storage.
 * @returns A Tool definition for deleting scheduled tasks
 */
export function ScheduleDelete() {
    return {
        name: 'ScheduleDelete',
        description: `Delete a scheduled task by its ID.

## When to Use This Tool

Use this tool when you need to:
- Remove a scheduled task that is no longer needed
- Clean up obsolete or incorrect schedules
- Stop a recurring task permanently

## Important Notes

- This action **cannot be undone**
- The task will be stopped immediately and removed from storage
- Make sure you have the correct schedule ID before deleting
- Use ScheduleUpdate to disable a task temporarily instead of deleting it

IMPORTANT: Verify the schedule ID before deletion. Consider using ScheduleGet to confirm the schedule details first.`,
        inputSchema: z.object({
            id: z.string().describe('The ID of the scheduled task to delete'),
        }),

        /**
         * Delete a scheduled task by ID
         *
         * @param params - Deletion parameters
         * @param params.id - The ID of the scheduled task to delete
         * @returns Success or error message
         */
        call({ id }: { id: string }): string {
            const success = deleteSchedule(id);
            return success
                ? `Scheduled task ${id} deleted successfully`
                : `Scheduled task ${id} not found`;
        },
    } as Tool;
}

/**
 * List all scheduled tasks.
 *
 * Use this tool to view all existing schedules, both enabled and disabled.
 * @returns A Tool definition for listing all scheduled tasks
 */
export function ScheduleList() {
    return {
        name: 'ScheduleList',
        description: `List all scheduled tasks.

## When to Use This Tool

Use this tool when you need to:
- View all existing scheduled tasks
- Check the status of schedules (enabled/disabled)
- Find a specific schedule by name or description
- Review all recurring tasks in the system

## Output Format

Returns a JSON array of all schedules with their details:
- id: Unique schedule identifier
- name: Schedule name
- enabled: Whether the schedule is active
- description: Task description
- cronExpr: Cron expression defining the schedule
- startAt: Start timestamp
- endAt: Optional end timestamp
- sessionId: Associated session ID (if any)

If no schedules exist, returns a message indicating no schedules found.`,
        inputSchema: z.object({}),

        /**
         * List all scheduled tasks
         *
         * @returns JSON string of all schedules or message if none found
         */
        call(): string {
            const schedules = listSchedules();
            if (schedules.length === 0) return 'No scheduled tasks found';
            return JSON.stringify(schedules, null, 2);
        },
    } as Tool;
}

/**
 * Get a specific scheduled task by its ID.
 *
 * Use this tool to retrieve detailed information about a single schedule.
 * @returns A Tool definition for getting a scheduled task by ID
 */
export function ScheduleGet() {
    return {
        name: 'ScheduleGet',
        description: `Get a specific scheduled task by its ID.

## When to Use This Tool

Use this tool when you need to:
- View details of a specific schedule
- Verify schedule configuration before updating or deleting
- Check the current state of a scheduled task

## Output Format

Returns the schedule object with all details, or an error message if not found.`,
        inputSchema: z.object({
            id: z.string().describe('The ID of the scheduled task to retrieve'),
        }),

        /**
         * Get a scheduled task by ID
         *
         * @param params - Get parameters
         * @param params.id - The ID of the scheduled task to retrieve
         * @returns JSON string of the schedule or error message
         */
        call({ id }: { id: string }): string {
            const schedule = getSchedule(id);
            if (!schedule) return `Scheduled task ${id} not found`;
            return JSON.stringify(schedule, null, 2);
        },
    } as Tool;
}

/**
 * Update a scheduled task with partial changes.
 *
 * Use this tool to modify an existing schedule's properties.
 * @returns A Tool definition for updating scheduled tasks
 */
export function ScheduleUpdate() {
    return {
        name: 'ScheduleUpdate',
        description: `Update a scheduled task with partial changes.

## When to Use This Tool

Use this tool when you need to:
- Modify schedule timing (change cron expression)
- Enable or disable a schedule
- Update task description or name
- Change start/end times

## Usage Notes

- Only provide the fields you want to change
- The schedule ID cannot be changed
- If you change the cron expression or enabled status, the task will be restarted automatically
- All other fields can be updated without restarting the task

## Update Examples

- Enable a disabled schedule: \`{ id: "abc", enabled: true }\`
- Change timing: \`{ id: "abc", cronExpr: "0 10 * * *" }\`
- Update description: \`{ id: "abc", description: "New task details" }\``,
        inputSchema: z.object({
            id: z.string().describe('The ID of the scheduled task to update'),
            name: z.string().optional().describe('New name for the scheduled task'),
            enabled: z
                .boolean()
                .optional()
                .describe('Whether the scheduled task should be enabled'),
            description: z.string().optional().describe('New task description'),
            cronExpr: z.string().optional().describe('New cron expression (will restart the task)'),
            startAt: z.number().optional().describe('New start timestamp in milliseconds'),
            endAt: z.number().optional().describe('New end timestamp in milliseconds'),
        }),

        /**
         * Update a scheduled task
         *
         * @param params - Update parameters
         * @param params.id - The ID of the scheduled task to update
         * @returns JSON string of updated schedule or error message
         */
        call({ id, ...patch }: { id: string; [key: string]: unknown }): string {
            const updated = updateSchedule(id, patch);
            if (!updated) return `Scheduled task ${id} not found`;
            return `Scheduled task updated successfully: ${JSON.stringify(updated, null, 2)}`;
        },
    } as Tool;
}
