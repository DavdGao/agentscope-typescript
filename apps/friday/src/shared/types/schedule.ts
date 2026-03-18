export interface Schedule {
    id: string;
    name: string;
    enabled: boolean;
    description: string;
    sessionId?: string;
    cronExpr: string;
    startAt: number; // timestamp ms, cron occurrences before this are ignored
    endAt?: number; // optional expiry timestamp ms
    agentKey: string; // the agent to execute the schedule
}

// Schedule with runtime status
export interface ScheduleWithStatus extends Schedule {
    runningExecution?: {
        executionId: string;
        startTime: number;
    };
}

// Schedule execution instance
export interface ScheduleExecution {
    executionId: string;
    scheduleId: string;
    startTime: number;
    endTime?: number;
    status: 'running' | 'completed' | 'failed';
    error?: string;
}

// Execution started event
export interface ExecutionStartedEvent {
    scheduleId: string;
    executionId: string;
    startTime: number;
}

// Execution finished event
export interface ExecutionFinishedEvent {
    scheduleId: string;
    executionId: string;
    status: 'completed' | 'failed';
    endTime: number;
    error?: string;
}
