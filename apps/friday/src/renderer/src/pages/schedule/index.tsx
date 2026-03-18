import type { Schedule, ScheduleWithStatus } from '@shared/types/schedule';
import { CronExpressionParser } from 'cron-parser';
import { Calendar, List, Plus } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useTranslation } from '@/i18n/useI18n';
import { CalendarTabPage } from '@/pages/schedule/calendar-tab-page';
import { CreateScheduleDialog } from '@/pages/schedule/create-schedule-dialog';
import { ScheduleEvent } from '@/pages/schedule/event';
import { ListTabPage } from '@/pages/schedule/list-tab-page';
import { ScheduleDetailDrawer } from '@/pages/schedule/schedule-detail-drawer';

/**
 * Expands a schedule into individual events within a date range.
 *
 * @param schedule - The schedule to expand.
 * @param rangeStart - The start date of the range.
 * @param rangeEnd - The end date of the range.
 * @returns An array of schedule events.
 */
function expandScheduleToEvents(
    schedule: Schedule,
    rangeStart: Date,
    rangeEnd: Date
): ScheduleEvent[] {
    const events: ScheduleEvent[] = [];
    try {
        const interval = CronExpressionParser.parse(schedule.cronExpr, {
            currentDate: rangeStart,
            endDate: rangeEnd,
        });
        while (interval.hasNext()) {
            const date = interval.next().toDate();
            const ts = date.getTime();
            if (ts < schedule.startAt) continue;
            if (schedule.endAt && ts > schedule.endAt) break;
            const iso = date.toISOString();
            events.push({
                id: `${schedule.id}:${ts}`,
                title: schedule.name,
                date: iso.slice(0, 10),
                time: iso.slice(11, 16),
                content: schedule.description,
            });
        }
    } catch {
        // invalid cron expr — skip
    }
    return events;
}

/**
 * The schedule page component that displays schedules in calendar or list view.
 *
 * @returns A SchedulePage component.
 */
export function SchedulePage() {
    const { t } = useTranslation();
    const { schedules } = useSchedule();
    const [viewMode, setViewMode] = React.useState<'calendar' | 'list'>('calendar');
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [selectedSchedule, setSelectedSchedule] = React.useState<ScheduleWithStatus | null>(null);
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);

    const rangeStart = React.useMemo(
        () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        [currentDate]
    );
    const rangeEnd = React.useMemo(
        () => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59),
        [currentDate]
    );

    const events = React.useMemo(() => {
        return schedules
            .filter(s => s.enabled)
            .flatMap(s => expandScheduleToEvents(s, rangeStart, rangeEnd));
    }, [schedules, rangeStart, rangeEnd]);

    // event.id is `${schedule.id}:${ts}`, extract schedule and open drawer
    const handleEventClick = (event: ScheduleEvent) => {
        const scheduleId = event.id.split(':')[0];
        const schedule = schedules.find(s => s.id === scheduleId);
        if (schedule) setSelectedSchedule(schedule);
    };

    return (
        <div className="w-full h-full flex flex-col bg-sidebar overflow-hidden">
            {/* Header - View Mode Toggle */}
            <div className="flex items-center justify-between p-4 flex-shrink-0">
                <h1 className="text-2xl font-semibold">{t('common.schedule')}</h1>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        {t('common.create')}
                    </Button>
                    <Tabs
                        value={viewMode}
                        onValueChange={value => setViewMode(value as 'calendar' | 'list')}
                    >
                        <TabsList>
                            <TabsTrigger value="calendar" className="border-none w-[100px]">
                                <Calendar className="h-4 w-4" />
                                <span>{t('schedule.calendar')}</span>
                            </TabsTrigger>
                            <TabsTrigger value="list" className="border-none w-[100px]">
                                <List className="h-4 w-4" />
                                <span>{t('schedule.list')}</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-t-3xl bg-white">
                {viewMode === 'calendar' && (
                    <CalendarTabPage
                        events={events}
                        onEventClick={handleEventClick}
                        currentDate={currentDate}
                        onMonthChange={setCurrentDate}
                    />
                )}
                {viewMode === 'list' && <ListTabPage />}
            </div>

            <ScheduleDetailDrawer
                schedule={selectedSchedule}
                open={!!selectedSchedule}
                onOpenChange={open => !open && setSelectedSchedule(null)}
            />

            <CreateScheduleDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>
    );
}
