import type { Schedule } from '@shared/types/schedule';
import { CronExpressionParser } from 'cron-parser';
import * as React from 'react';

import type { ScheduleEvent } from '@/pages/schedule/event';

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
 * A custom hook for managing schedules and their events within a date range.
 *
 * @param rangeStart - The start date of the range to fetch schedules for.
 * @param rangeEnd - The end date of the range to fetch schedules for.
 * @returns An object containing schedule events, schedules, loading state, and management functions.
 */
export function useSchedules(rangeStart: Date, rangeEnd: Date) {
    const [schedules, setSchedules] = React.useState<Schedule[]>([]);
    const [loading, setLoading] = React.useState(true);

    const refresh = React.useCallback(() => {
        setLoading(true);
        window.api.schedule.list().then(data => {
            setSchedules(data.filter(s => s.enabled));
            setLoading(false);
        });
    }, []);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    const events = React.useMemo<ScheduleEvent[]>(() => {
        return schedules.flatMap(s => expandScheduleToEvents(s, rangeStart, rangeEnd));
    }, [schedules, rangeStart, rangeEnd]);

    return { events, schedules, loading, setSchedules, refresh };
}
