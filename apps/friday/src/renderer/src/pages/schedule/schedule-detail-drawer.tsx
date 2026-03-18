import type { ScheduleWithStatus, ScheduleExecution } from '@shared/types/schedule';
import { formatDuration } from '@shared/utils/common';
import { Trash2 } from 'lucide-react';
import * as React from 'react';

import { parseCronExpression, getFrequencyLabel } from './schedule-utils';
import { StatusBadge } from '@/components/badge/StatusBadge';
import { DeleteDialog } from '@/components/dialog/DeleteDialog';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useTranslation } from '@/i18n/useI18n';
import { EmptyState } from '@/pages/schedule/empty-state';
import { ExecutionLogDrawer } from '@/pages/schedule/execution-log-drawer';

interface ScheduleDetailDrawerProps {
    schedule: ScheduleWithStatus | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Schedule detail drawer component that displays schedule information and execution history
 *
 * @param root0 - Component props
 * @param root0.schedule - Schedule data
 * @param root0.open - Drawer open state
 * @param root0.onOpenChange - Drawer open state change handler
 * @returns ScheduleDetailDrawer component
 */
export function ScheduleDetailDrawer({ schedule, open, onOpenChange }: ScheduleDetailDrawerProps) {
    const { t } = useTranslation();
    const { getExecutions, deleteSchedule } = useSchedule();
    const [executions, setExecutions] = React.useState<ScheduleExecution[]>([]);
    const [loadingExecutions, setLoadingExecutions] = React.useState(false);
    const [selectedExecution, setSelectedExecution] = React.useState<ScheduleExecution | null>(
        null
    );
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);

    const handleDelete = async () => {
        if (!schedule) return;
        await deleteSchedule(schedule.id);
        onOpenChange(false);
    };

    // Load executions when drawer opens
    React.useEffect(() => {
        if (schedule && open) {
            setLoadingExecutions(true);
            getExecutions(schedule.id)
                .then(setExecutions)
                .finally(() => setLoadingExecutions(false));
        }
    }, [schedule, open, getExecutions]);

    if (!schedule) return null;

    const parsed = parseCronExpression(schedule.cronExpr, schedule.startAt);

    const scheduleInfoItems = [
        {
            title: t('schedule.frequency'),
            content: getFrequencyLabel(parsed, t),
        },
        {
            title: t('common.time'),
            content: parsed.time,
        },
        {
            title: t('schedule.startAt'),
            content: new Date(schedule.startAt).toLocaleString(),
        },
        {
            title: t('schedule.endAt'),
            content: schedule.endAt
                ? new Date(schedule.endAt).toLocaleString()
                : t('common.noData'),
        },
        {
            title: t('common.agent'),
            content: schedule.agentKey,
        },
    ];

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange} direction="right">
                <DrawerContent className="max-h-full h-full min-w-[30rem] ml-auto border-none ring-none! shadow-none!">
                    <DrawerHeader>
                        <DrawerTitle>{schedule.name}</DrawerTitle>
                        <DrawerDescription>{schedule.description}</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-1 flex-col overflow-hidden gap-y-4 p-4">
                        {/* Execution Information */}
                        <div className="flex flex-col space-y-2">
                            <h3 className="text-sm font-semibold text-secondary-foreground">
                                {t('common.information')}
                            </h3>
                            <div className="flex flex-col gap-2">
                                {scheduleInfoItems.map(item => (
                                    <div
                                        key={item.title}
                                        className="flex flex-row justify-between text-xs px-2.5 py-2 font-mono rounded-md ring ring-border items-center"
                                    >
                                        <span className="font-medium">
                                            {item.title.toUpperCase()}
                                        </span>
                                        <span className="ml-auto text-muted-foreground">
                                            {item.content}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Separator />
                        {/* Execution History */}
                        <div className="space-y-2 flex flex-col flex-1 overflow-hidden">
                            <h3 className="text-sm font-semibold">
                                {t('schedule.executionHistory')}
                            </h3>
                            {loadingExecutions ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {t('common.loading')}
                                </div>
                            ) : executions.length === 0 ? (
                                <EmptyState
                                    title={t('schedule.noExecutions')}
                                    description={t('schedule.noExecutionsDescription')}
                                />
                            ) : (
                                <div className="font-mono text-xs">
                                    <div className="grid grid-cols-4 items-center h-8 px-2 text-muted-foreground">
                                        <div className="text-start">Time</div>
                                        <div className="text-start">Status</div>
                                        <div className="text-start">Duration</div>
                                        <div className="text-start">Tokens</div>
                                    </div>
                                    {executions.map(execution => (
                                        <div
                                            key={execution.scheduleId}
                                            className="grid grid-cols-4 justify-between items-center hover:bg-accent h-8 rounded-md px-2 cursor-pointer"
                                            onClick={() => setSelectedExecution(execution)}
                                        >
                                            <div className="font-[100] col-span-1">
                                                {
                                                    new Date(execution.startTime)
                                                        .toLocaleString()
                                                        .split(' ')[0]
                                                }
                                            </div>
                                            <StatusBadge
                                                className="overflow-hidden"
                                                status={execution.status}
                                            />
                                            <div className="font-medium col-span-1">
                                                {formatDuration(
                                                    execution.startTime,
                                                    execution.endTime
                                                )}
                                            </div>
                                            <div className="font-medium">14</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={e => {
                                e.preventDefault();
                                setOpenDeleteDialog(true);
                            }}
                        >
                            <Trash2 className="size-3" />
                            {t('common.delete')}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Second level drawer: Execution Log */}
            <ExecutionLogDrawer
                scheduleId={schedule.id}
                execution={selectedExecution}
                open={!!selectedExecution}
                onOpenChange={open => !open && setSelectedExecution(null)}
            />

            <DeleteDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                title={t('schedule.deleteSchedule.title')}
                description={t('schedule.deleteSchedule.description')}
                onConfirm={handleDelete}
                successToast={t('schedule.deleteSchedule.successToast')}
            />
        </>
    );
}
