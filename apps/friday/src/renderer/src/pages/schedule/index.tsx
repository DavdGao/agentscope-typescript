import { Calendar, List, Clock, MapPin, User, Plus } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchedules } from '@/hooks/use-schedules';
import { useTranslation } from '@/i18n/useI18n';
import { CalendarTabPage } from '@/pages/schedule/calendar-tab-page';
import { CreateScheduleDialog } from '@/pages/schedule/create-schedule-dialog';
import { ScheduleEvent } from '@/pages/schedule/event';
import { ListTabPage } from '@/pages/schedule/list-tab-page';

/**
 * The schedule page component that displays schedules in calendar or list view.
 *
 * @returns A SchedulePage component.
 */
export function SchedulePage() {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = React.useState<'calendar' | 'list'>('calendar');
    const [selectedEvent, setSelectedEvent] = React.useState<ScheduleEvent | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const rangeStart = React.useMemo(() => {
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }, [currentDate]);
    const rangeEnd = React.useMemo(() => {
        return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    }, [currentDate]);

    const { events, refresh } = useSchedules(rangeStart, rangeEnd);
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);

    // Handle event click
    const handleEventClick = (event: ScheduleEvent) => {
        setSelectedEvent(event);
        setIsDrawerOpen(true);
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
                {/* Calendar grid */}
                {viewMode === 'calendar' && (
                    <CalendarTabPage
                        events={events}
                        onEventClick={handleEventClick}
                        currentDate={currentDate}
                        onMonthChange={setCurrentDate}
                    />
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <ListTabPage events={events} onEventClick={handleEventClick} />
                )}
            </div>
            {/* Event Detail Drawer */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-2xl">
                        <DrawerHeader>
                            <DrawerTitle>{selectedEvent?.title}</DrawerTitle>
                            <DrawerDescription>
                                {selectedEvent &&
                                    new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString(
                                        'en-US',
                                        {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        }
                                    )}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 pb-0 space-y-4">
                            {/* Time */}
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="font-medium">{t('schedule.time')}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {selectedEvent?.time}
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            {selectedEvent?.location && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <div className="font-medium">{t('schedule.location')}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedEvent.location}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Attendees */}
                            {selectedEvent?.attendees && selectedEvent.attendees.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <div className="font-medium">{t('schedule.attendees')}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedEvent.attendees.join(', ')}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {selectedEvent?.content && (
                                <div className="flex items-start gap-3">
                                    <div className="h-5 w-5" /> {/* Spacer */}
                                    <div>
                                        <div className="font-medium">
                                            {t('schedule.description')}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {selectedEvent.content}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DrawerFooter>
                            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                                {t('common.close')}
                            </Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
            <CreateScheduleDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onCreated={refresh}
            />
        </div>
    );
}
