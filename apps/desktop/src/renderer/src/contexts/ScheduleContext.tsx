import type { AgentEvent } from '@agentscope-ai/agentscope/event';
import type { Msg } from '@agentscope-ai/agentscope/message';
import type {
    Schedule,
    ScheduleWithStatus,
    ScheduleExecution,
    ExecutionStartedEvent,
    ExecutionFinishedEvent,
} from '@shared/types/schedule';
import * as React from 'react';
import { toast } from 'sonner';

interface ScheduleContextValue {
    // State
    schedules: ScheduleWithStatus[];
    loading: boolean;

    // Methods
    refreshSchedules: () => Promise<void>;
    createSchedule: (params: Omit<Schedule, 'id'>) => Promise<Schedule>;
    updateSchedule: (id: string, patch: Partial<Omit<Schedule, 'id'>>) => Promise<Schedule | null>;
    deleteSchedule: (id: string) => Promise<void>;
    getExecutions: (scheduleId: string) => Promise<ScheduleExecution[]>;
    getExecutionMessages: (scheduleId: string, executionId: string) => Promise<Msg[]>;
    subscribeExecutionAgentEvents: (
        scheduleId: string,
        callback: (event: AgentEvent) => void
    ) => () => void;
}

const ScheduleContext = React.createContext<ScheduleContextValue | null>(null);

/**
 * Schedule provider component that manages global schedule state and events
 *
 * @param root0 - Component props
 * @param root0.children - Child components
 * @returns ScheduleProvider component
 */
export function ScheduleProvider({ children }: { children: React.ReactNode }) {
    const [schedules, setSchedules] = React.useState<ScheduleWithStatus[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Refresh schedules from backend
    const refreshSchedules = React.useCallback(async () => {
        setLoading(true);
        try {
            const list = await window.api.schedule.list();
            setSchedules(list);
        } catch (error) {
            console.error('Failed to load schedules:', error);
            toast.error('Failed to load schedules', {
                position: 'top-center',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize: load schedules
    React.useEffect(() => {
        refreshSchedules();
    }, [refreshSchedules]);

    // Listen to execution events
    React.useEffect(() => {
        const unsubscribeStarted = window.api.schedule.subscribeExecutionStarted(
            (event: ExecutionStartedEvent) => {
                setSchedules(prev =>
                    prev.map(s =>
                        s.id === event.scheduleId
                            ? {
                                  ...s,
                                  runningExecution: {
                                      executionId: event.executionId,
                                      startTime: event.startTime,
                                  },
                              }
                            : s
                    )
                );

                const schedule = schedules.find(s => s.id === event.scheduleId);
                if (schedule) {
                    toast.info(`Schedule started: ${schedule.name}`, {
                        position: 'top-center',
                    });
                }
            }
        );

        const unsubscribeFinished = window.api.schedule.subscribeExecutionFinished(
            (event: ExecutionFinishedEvent) => {
                setSchedules(prev =>
                    prev.map(s =>
                        s.id === event.scheduleId ? { ...s, runningExecution: undefined } : s
                    )
                );

                const schedule = schedules.find(s => s.id === event.scheduleId);
                if (schedule) {
                    if (event.status === 'completed') {
                        toast.success(`Schedule completed: ${schedule.name}`, {
                            position: 'top-center',
                        });
                    } else {
                        toast.error(
                            `Schedule failed: ${schedule.name}${event.error ? ` - ${event.error}` : ''}`,
                            {
                                position: 'top-center',
                            }
                        );
                    }
                }
            }
        );

        return () => {
            unsubscribeStarted();
            unsubscribeFinished();
        };
    }, [schedules]);

    // CRUD methods
    const createSchedule = React.useCallback(
        async (params: Omit<Schedule, 'id'>) => {
            try {
                const schedule = await window.api.schedule.create(params);
                await refreshSchedules();
                toast.success('Schedule created successfully', {
                    position: 'top-center',
                });
                return schedule;
            } catch (error) {
                console.error('Failed to create schedule:', error);
                toast.error('Failed to create schedule', {
                    position: 'top-center',
                });
                throw error;
            }
        },
        [refreshSchedules]
    );

    const updateSchedule = React.useCallback(
        async (id: string, patch: Partial<Omit<Schedule, 'id'>>) => {
            try {
                const schedule = await window.api.schedule.update(id, patch);
                await refreshSchedules();
                toast.success('Schedule updated successfully', {
                    position: 'top-center',
                });
                return schedule;
            } catch (error) {
                console.error('Failed to update schedule:', error);
                toast.error('Failed to update schedule', {
                    position: 'top-center',
                });
                throw error;
            }
        },
        [refreshSchedules]
    );

    const deleteSchedule = React.useCallback(
        async (id: string) => {
            try {
                await window.api.schedule.delete(id);
                await refreshSchedules();
                toast.success('Schedule deleted successfully', {
                    position: 'top-center',
                });
            } catch (error) {
                console.error('Failed to delete schedule:', error);
                toast.error('Failed to delete schedule', {
                    position: 'top-center',
                });
                throw error;
            }
        },
        [refreshSchedules]
    );

    const getExecutions = React.useCallback(async (scheduleId: string) => {
        try {
            return await window.api.schedule.getExecutions(scheduleId);
        } catch (error) {
            console.error('Failed to load executions:', error);
            toast.error('Failed to load execution history', {
                position: 'top-center',
            });
            return [];
        }
    }, []);

    const getExecutionMessages = React.useCallback(
        async (scheduleId: string, executionId: string) => {
            try {
                return await window.api.schedule.getExecutionMessages(scheduleId, executionId);
            } catch (error) {
                console.error('Failed to load execution messages:', error);
                return [];
            }
        },
        []
    );

    const subscribeExecutionAgentEvents = React.useCallback(
        (scheduleId: string, callback: (event: AgentEvent) => void) => {
            return window.api.schedule.subscribeAgentEvents(scheduleId, callback);
        },
        []
    );

    return (
        <ScheduleContext.Provider
            value={{
                schedules,
                loading,
                refreshSchedules,
                createSchedule,
                updateSchedule,
                deleteSchedule,
                getExecutions,
                getExecutionMessages,
                subscribeExecutionAgentEvents,
            }}
        >
            {children}
        </ScheduleContext.Provider>
    );
}

/**
 * Hook to access schedule context
 *
 * @returns Schedule context value
 */
export function useSchedule() {
    const context = React.useContext(ScheduleContext);
    if (!context) {
        throw new Error('useSchedule must be used within ScheduleProvider');
    }
    return context;
}
