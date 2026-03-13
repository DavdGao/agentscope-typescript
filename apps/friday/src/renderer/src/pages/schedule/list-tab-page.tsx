import { addDays, format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslation } from '@/i18n/useI18n';
import { ScheduleEvent } from '@/pages/schedule/event';

interface Props {
    events: ScheduleEvent[];
    onEventClick: (event: ScheduleEvent) => void;
}

/**
 * The list tab page component that displays events in a list view grouped by date.
 *
 * @param root0 - The component props.
 * @param root0.events - Array of schedule events to display.
 * @param root0.onEventClick - Callback when an event is clicked.
 * @returns A ListTabPage component.
 */
export function ListTabPage({ events, onEventClick }: Props) {
    const { t } = useTranslation();
    // Group events by date for list view
    const groupedEvents = React.useMemo(() => {
        const grouped = new Map<string, ScheduleEvent[]>();
        events.forEach(event => {
            if (!grouped.has(event.date)) {
                grouped.set(event.date, []);
            }
            grouped.get(event.date)!.push(event);
        });
        // Sort by date
        return Array.from(grouped.entries())
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, events]) => ({
                date,
                events: events.sort((a, b) => a.time.localeCompare(b.time)),
            }));
    }, [events]);

    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 20),
        to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
    });

    return (
        <div className="flex flex-col size-full">
            <div className="flex flex-row w-full p-4 justify-between">
                <Field className="flex flex-row w-fit">
                    {/*<Label>Range: </Label>*/}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date-picker-range"
                                className="justify-start px-2.5 font-normal"
                                size="sm"
                            >
                                <CalendarIcon />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, 'LLL dd, y')} -{' '}
                                            {format(date.to, 'LLL dd, y')}
                                        </>
                                    ) : (
                                        format(date.from, 'LLL dd, y')
                                    )
                                ) : (
                                    <span>{t('schedule.pickDate')}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </Field>
            </div>
            <div className="size-full overflow-y-auto p-4">
                {groupedEvents.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        {t('schedule.noEventsScheduled')}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {groupedEvents.map(({ date, events }) => {
                            const dateObj = new Date(date + 'T00:00:00');
                            const isToday =
                                dateObj.getDate() === new Date().getDate() &&
                                dateObj.getMonth() === new Date().getMonth() &&
                                dateObj.getFullYear() === new Date().getFullYear();

                            return (
                                <div key={date} className="space-y-2">
                                    {/* Date header */}
                                    <div
                                        className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}
                                    >
                                        {dateObj.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                        {isToday && ` (${t('schedule.today')})`}
                                    </div>
                                    {/* Events list */}
                                    <div className="space-y-2 pl-4">
                                        {events.map(event => (
                                            <Card
                                                key={event.id}
                                                className="cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => onEventClick(event)}
                                            >
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <CardTitle className="text-base">
                                                                {event.title}
                                                            </CardTitle>
                                                            <CardDescription className="flex items-center gap-1 mt-1">
                                                                <Clock className="h-3 w-3" />
                                                                {event.time}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                {event.content && (
                                                    <CardContent className="pt-0">
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {event.content}
                                                        </p>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
