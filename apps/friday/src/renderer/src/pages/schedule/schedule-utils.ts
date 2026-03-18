export interface ParsedSchedule {
    frequency: 'daily' | 'weekly' | 'monthly' | 'once' | 'custom';
    time: string; // HH:mm format
    weekday?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    date?: Date; // for once
}

/**
 * Parse cron expression to human-readable format
 *
 * @param cronExpr - Cron expression (minute hour day month weekday)
 * @param startAt - Start timestamp
 * @returns Parsed schedule information
 */
export function parseCronExpression(cronExpr: string, startAt: number): ParsedSchedule {
    const parts = cronExpr.trim().split(/\s+/);
    if (parts.length !== 5) {
        return {
            frequency: 'custom',
            time: '00:00',
        };
    }

    const [minute, hour, day, month, weekday] = parts;

    const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    // Daily: * * * * * or specific time every day
    if (day === '*' && month === '*' && weekday === '*') {
        return {
            frequency: 'daily',
            time,
        };
    }

    // Weekly: * * * * 0-6
    if (day === '*' && month === '*' && weekday !== '*') {
        return {
            frequency: 'weekly',
            time,
            weekday: parseInt(weekday),
        };
    }

    // Monthly: * * 1-31 * *
    if (day !== '*' && month === '*' && weekday === '*') {
        return {
            frequency: 'monthly',
            time,
            dayOfMonth: parseInt(day),
        };
    }

    // Once: specific date (use startAt)
    if (day !== '*' && month !== '*') {
        return {
            frequency: 'once',
            time,
            date: new Date(startAt),
        };
    }

    return {
        frequency: 'custom',
        time,
    };
}

/**
 * Get frequency label for display
 *
 * @param parsed - Parsed schedule
 * @param t - Translation function
 * @returns Frequency label
 */
export function getFrequencyLabel(parsed: ParsedSchedule, t: (key: string) => string): string {
    switch (parsed.frequency) {
        case 'daily':
            return t('schedule.freqDaily');
        case 'weekly':
            return t('schedule.freqWeekly');
        case 'monthly':
            return t('schedule.freqMonthly');
        case 'once':
            return t('schedule.freqOnce');
        default:
            return 'Custom';
    }
}

/**
 * Get weekday name
 *
 * @param weekday - Weekday number (0-6)
 * @param t - Translation function
 * @returns Weekday name
 */
export function getWeekdayName(weekday: number, t: (key: string) => string): string {
    const days = [
        'schedule.weekdaySun',
        'schedule.weekdayMon',
        'schedule.weekdayTue',
        'schedule.weekdayWed',
        'schedule.weekdayThu',
        'schedule.weekdayFri',
        'schedule.weekdaySat',
    ];
    return t(days[weekday] || days[0]);
}
