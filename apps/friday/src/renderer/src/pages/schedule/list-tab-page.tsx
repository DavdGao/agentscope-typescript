import type { ScheduleWithStatus } from '@shared/types/schedule';
import { CronExpressionParser } from 'cron-parser';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useTranslation } from '@/i18n/useI18n';
import { EmptyState } from '@/pages/schedule/empty-state';
import { ScheduleCard } from '@/pages/schedule/schedule-card';
import { ScheduleDetailDrawer } from '@/pages/schedule/schedule-detail-drawer';

/**
 * Check if a schedule has any occurrences within a date range
 *
 * @param schedule - Schedule to check
 * @param rangeStart - Start of date range
 * @param rangeEnd - End of date range
 * @returns True if schedule has occurrences in range
 */
function scheduleHasOccurrencesInRange(
    schedule: ScheduleWithStatus,
    rangeStart: Date,
    rangeEnd: Date
): boolean {
    try {
        const interval = CronExpressionParser.parse(schedule.cronExpr, {
            currentDate: rangeStart,
            endDate: rangeEnd,
        });

        // Check if there's at least one occurrence
        while (interval.hasNext()) {
            const date = interval.next().toDate();
            const ts = date.getTime();

            // Skip if before schedule start
            if (ts < schedule.startAt) continue;

            // Stop if after schedule end
            if (schedule.endAt && ts > schedule.endAt) break;

            // Found an occurrence in range
            return true;
        }

        return false;
    } catch {
        // Invalid cron expression, include by default
        return true;
    }
}

/**
 * The list tab page component that displays schedules in a list view
 *
 * @returns A ListTabPage component
 */
export function ListTabPage() {
    const { t } = useTranslation();
    const { schedules, loading } = useSchedule();
    const [selectedSchedule, setSelectedSchedule] = React.useState<ScheduleWithStatus | null>(null);
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

    // Filter schedules by date range if set
    const filteredSchedules = React.useMemo(() => {
        if (!dateRange?.from) {
            // No date range set, show all schedules
            return schedules;
        }

        const rangeStart = dateRange.from;
        const rangeEnd = dateRange.to || dateRange.from;

        // Filter schedules that have events within the date range
        return schedules.filter(schedule =>
            scheduleHasOccurrencesInRange(schedule, rangeStart, rangeEnd)
        );
    }, [schedules, dateRange]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col size-full">
            <div className="flex flex-row w-full p-4 justify-between">
                <Field className="flex flex-row w-fit">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date-picker-range"
                                className="justify-start px-2.5 font-normal"
                                size="sm"
                            >
                                <CalendarIcon />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, 'LLL dd, y')} -{' '}
                                            {format(dateRange.to, 'LLL dd, y')}
                                        </>
                                    ) : (
                                        format(dateRange.from, 'LLL dd, y')
                                    )
                                ) : (
                                    <span className="text-muted-foreground">
                                        {t('schedule.pickDate')}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </Field>
            </div>
            <div className="size-full overflow-y-auto p-4">
                {filteredSchedules.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-3">
                        {filteredSchedules.map(schedule => (
                            <ScheduleCard
                                key={schedule.id}
                                schedule={schedule}
                                onClick={() => setSelectedSchedule(schedule)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ScheduleDetailDrawer
                schedule={selectedSchedule}
                open={!!selectedSchedule}
                onOpenChange={open => !open && setSelectedSchedule(null)}
            />
        </div>
    );
}
