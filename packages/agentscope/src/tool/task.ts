import { z } from 'zod';

import { createToolResponse, ToolResponse } from './response';

// Task type definitions
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'deleted';

export interface Task {
    id: string;
    subject: string;
    description: string;
    status: TaskStatus;
    activeForm?: string;
    owner?: string;
    metadata?: Record<string, unknown>;
    blocks: string[];
    blockedBy: string[];
    createdAt: string;
    updatedAt: string;
}

// Module-level storage
const taskStore = new Map<string, Task>();
let nextId = 1;

/**
 * Generate a unique task ID
 * @returns A unique task ID as a string
 */
function generateId(): string {
    return String(nextId++);
}

/**
 * Reset task store for testing purposes
 * @internal
 */
export function _resetTaskStore(): void {
    taskStore.clear();
    nextId = 1;
}

/**
 * Tool for creating tasks
 * @returns A Tool object for creating tasks
 */
export function TaskCreate() {
    return {
        name: 'TaskCreate',
        description: `Use this tool to create a structured task list for your current coding session. This helps you track progress, organize complex tasks, and demonstrate thoroughness to the user.
It also helps the user understand the progress of the task and overall progress of their requests.

## When to Use This Tool

Use this tool proactively in these scenarios:

- Complex multi-step tasks - When a task requires 3 or more distinct steps or actions
- Non-trivial and complex tasks - Tasks that require careful planning or multiple operations
- User explicitly requests todo list - When the user directly asks you to use the todo list
- User provides multiple tasks - When users provide a list of things to be done (numbered or comma-separated)

All tasks are created with status 'pending'.`,
        inputSchema: z.object({
            subject: z
                .string()
                .describe(
                    'A brief, actionable title in imperative form (e.g., "Fix authentication bug in login flow")'
                ),
            description: z
                .string()
                .describe(
                    'Detailed description of what needs to be done, including context and acceptance criteria'
                ),
            activeForm: z
                .string()
                .optional()
                .describe(
                    'Present continuous form shown in the spinner when the task is in_progress (e.g., "Fixing authentication bug"). If omitted, the spinner shows the subject instead.'
                ),
            metadata: z
                .record(z.string(), z.unknown())
                .optional()
                .describe('Arbitrary metadata to attach to the task'),
        }),
        requireUserConfirm: false,

        call({
            subject,
            description,
            activeForm,
            metadata,
        }: {
            subject: string;
            description: string;
            activeForm?: string;
            metadata?: Record<string, unknown>;
        }): ToolResponse {
            const id = generateId();
            const now = new Date().toISOString();

            const task: Task = {
                id,
                subject,
                description,
                status: 'pending',
                activeForm,
                metadata,
                blocks: [],
                blockedBy: [],
                createdAt: now,
                updatedAt: now,
            };

            taskStore.set(id, task);

            return createToolResponse({
                content: [
                    {
                        id: crypto.randomUUID(),
                        type: 'text',
                        text: `Task #${id} created successfully: ${subject}`,
                    },
                ],
                state: 'success',
            });
        },
    };
}

/**
 * Tool for updating tasks
 * @returns A Tool object for updating tasks
 */
export function TaskUpdate() {
    return {
        name: 'TaskUpdate',
        description: `Use this tool to update a task in the task list.

## When to Use This Tool

**Mark tasks as resolved:**
- When you have completed the work described in a task
- When a task is no longer needed or has been superseded
- IMPORTANT: Always mark your assigned tasks as resolved when you finish them

**Delete tasks:**
- When a task is no longer relevant or was created in error
- Setting status to 'deleted' permanently removes the task

**Update task details:**
- When requirements change or become clearer
- When establishing dependencies between tasks`,
        inputSchema: z.object({
            taskId: z.string().describe('The ID of the task to update'),
            status: z
                .enum(['pending', 'in_progress', 'completed', 'deleted'])
                .optional()
                .describe('New status for the task'),
            subject: z.string().optional().describe('New subject for the task'),
            description: z.string().optional().describe('New description for the task'),
            activeForm: z
                .string()
                .optional()
                .describe(
                    'Present continuous form shown in spinner when in_progress (e.g., "Running tests")'
                ),
            owner: z.string().optional().describe('New owner for the task'),
            metadata: z
                .record(z.string(), z.unknown())
                .optional()
                .describe('Metadata keys to merge into the task. Set a key to null to delete it.'),
            addBlocks: z.array(z.string()).optional().describe('Task IDs that this task blocks'),
            addBlockedBy: z.array(z.string()).optional().describe('Task IDs that block this task'),
        }),
        requireUserConfirm: false,

        call({
            taskId,
            status,
            subject,
            description,
            activeForm,
            owner,
            metadata,
            addBlocks,
            addBlockedBy,
        }: {
            taskId: string;
            status?: TaskStatus;
            subject?: string;
            description?: string;
            activeForm?: string;
            owner?: string;
            metadata?: Record<string, unknown>;
            addBlocks?: string[];
            addBlockedBy?: string[];
        }): ToolResponse {
            const task = taskStore.get(taskId);
            if (!task) {
                throw new Error(`Task not found: ${taskId}`);
            }

            // Validate dependencies exist
            if (addBlocks) {
                for (const depId of addBlocks) {
                    if (!taskStore.has(depId)) {
                        throw new Error(`Cannot add dependency: task ${depId} does not exist`);
                    }
                }
            }
            if (addBlockedBy) {
                for (const depId of addBlockedBy) {
                    if (!taskStore.has(depId)) {
                        throw new Error(`Cannot add dependency: task ${depId} does not exist`);
                    }
                }
            }

            // Update fields
            if (subject !== undefined) task.subject = subject;
            if (description !== undefined) task.description = description;
            if (activeForm !== undefined) task.activeForm = activeForm;
            if (owner !== undefined) task.owner = owner;

            // Merge metadata
            if (metadata !== undefined) {
                if (!task.metadata) {
                    task.metadata = {};
                }
                for (const [key, value] of Object.entries(metadata)) {
                    if (value === null) {
                        delete task.metadata[key];
                    } else {
                        task.metadata[key] = value;
                    }
                }
            }

            // Add dependencies with deduplication
            if (addBlocks) {
                task.blocks = [...new Set([...task.blocks, ...addBlocks])];
            }
            if (addBlockedBy) {
                task.blockedBy = [...new Set([...task.blockedBy, ...addBlockedBy])];
            }

            task.updatedAt = new Date().toISOString();

            // Handle status change
            if (status !== undefined) {
                if (status === 'deleted') {
                    taskStore.delete(taskId);
                    return createToolResponse({
                        content: [
                            {
                                id: crypto.randomUUID(),
                                type: 'text',
                                text: `Task #${taskId} deleted successfully`,
                            },
                        ],
                        state: 'success',
                    });
                }
                task.status = status;
            }

            return createToolResponse({
                content: [
                    {
                        id: crypto.randomUUID(),
                        type: 'text',
                        text: `Task #${taskId} updated successfully`,
                    },
                ],
                state: 'success',
            });
        },
    };
}

/**
 * Tool for retrieving a single task
 * @returns A Tool object for retrieving a task by ID
 */
export function TaskGet() {
    return {
        name: 'TaskGet',
        description: `Use this tool to retrieve a task by its ID from the task list.

## When to Use This Tool

- When you need the full description and context before starting work on a task
- To understand task dependencies (what it blocks, what blocks it)
- After being assigned a task, to get complete requirements`,
        inputSchema: z.object({
            taskId: z.string().describe('The ID of the task to retrieve'),
        }),
        requireUserConfirm: false,

        call({ taskId }: { taskId: string }): ToolResponse {
            const task = taskStore.get(taskId);
            if (!task) {
                throw new Error(`Task not found: ${taskId}`);
            }

            let text = `Task #${task.id}: ${task.subject}\n`;
            text += `Status: ${task.status}\n`;
            text += `Description: ${task.description}\n`;

            if (task.activeForm) {
                text += `Active Form: ${task.activeForm}\n`;
            }
            if (task.owner) {
                text += `Owner: ${task.owner}\n`;
            }
            if (task.blocks.length > 0) {
                text += `Blocks: ${task.blocks.join(', ')}\n`;
            }
            if (task.blockedBy.length > 0) {
                text += `Blocked By: ${task.blockedBy.join(', ')}\n`;
            }
            if (task.metadata && Object.keys(task.metadata).length > 0) {
                text += `Metadata: ${JSON.stringify(task.metadata, null, 2)}\n`;
            }
            text += `Created: ${task.createdAt}\n`;
            text += `Updated: ${task.updatedAt}`;

            return createToolResponse({
                content: [
                    {
                        id: crypto.randomUUID(),
                        type: 'text',
                        text,
                    },
                ],
                state: 'success',
            });
        },
    };
}

/**
 * Tool for listing all active tasks
 * @returns A Tool object for listing all active tasks
 */
export function TaskList() {
    return {
        name: 'TaskList',
        description: `Use this tool to list all tasks in the task list.

## When to Use This Tool

- To see what tasks are available to work on (status: 'pending', no owner, not blocked)
- To check overall progress on the project
- To find tasks that are blocked and need dependencies resolved
- After completing a task, to check for newly unblocked work or claim the next available task`,
        inputSchema: z.object({}),
        requireUserConfirm: false,

        call(): ToolResponse {
            // Filter to only pending and in_progress tasks
            const activeTasks = Array.from(taskStore.values())
                .filter(task => task.status === 'pending' || task.status === 'in_progress')
                .sort((a, b) => Number(a.id) - Number(b.id));

            if (activeTasks.length === 0) {
                return createToolResponse({
                    content: [
                        {
                            id: crypto.randomUUID(),
                            type: 'text',
                            text: 'No active tasks found',
                        },
                    ],
                    state: 'success',
                });
            }

            const lines = activeTasks.map(task => {
                let line = `#${task.id} [${task.status}] ${task.subject}`;
                if (task.blockedBy.length > 0) {
                    line += ` (blocked by: #${task.blockedBy.join(', #')})`;
                }
                return line;
            });

            return createToolResponse({
                content: [
                    {
                        id: crypto.randomUUID(),
                        type: 'text',
                        text: lines.join('\n'),
                    },
                ],
                state: 'success',
            });
        },
    };
}
