import type { ScheduleWithStatus } from '@shared/types/schedule';
import { Pause, Calendar, ArrowRight, Bot, ClipboardClock, BotOff } from 'lucide-react';

import { parseCronExpression, getFrequencyLabel } from './schedule-utils';
import { Badge } from '@/components/ui/badge';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/i18n/useI18n';

interface ScheduleCardProps {
    schedule: ScheduleWithStatus;
    onClick: () => void;
}

/**
 * Schedule card component for displaying schedule information
 *
 * @param root0 - Component props
 * @param root0.schedule - Schedule data
 * @param root0.onClick - Click handler
 * @returns ScheduleCard component
 */
export function ScheduleCard({ schedule, onClick }: ScheduleCardProps) {
    const { t } = useTranslation();
    const isRunning = schedule.runningExecution !== undefined;
    const parsed = parseCronExpression(schedule.cronExpr, schedule.startAt);

    const getScheduleDetails = () => parsed.time;

    return (
        <Item className="cursor-pointer hover:shadow-md" variant="outline" onClick={onClick}>
            <ItemMedia variant="icon">
                {schedule.enabled ? (
                    isRunning ? (
                        <Spinner className="text-green-700" />
                    ) : (
                        <Bot />
                    )
                ) : (
                    <BotOff />
                )}
            </ItemMedia>
            <ItemContent>
                <ItemTitle className="font-[550] truncate max-w-full">{schedule.name}</ItemTitle>
                <ItemDescription className="flex gap-x-2 items-center text-xs truncate overflow-hidden">
                    {/* Disabled Status */}
                    {!schedule.enabled && (
                        <Badge variant="secondary" className="gap-1">
                            <Pause className="h-3 w-3" />
                            {t('common.disabled')}
                        </Badge>
                    )}
                    <Badge variant="link" className="pl-0">
                        <Calendar data-icon="inline-start" />
                        {new Date(schedule.startAt).toLocaleDateString()}
                        {schedule.endAt && (
                            <div className="flex items-center gap-1">
                                <ArrowRight className="size-3 text-muted-foreground" />
                                {new Date(schedule.endAt).toLocaleDateString()}
                            </div>
                        )}
                        <div>{getScheduleDetails()}</div>
                    </Badge>
                    <Badge variant="link">
                        <ClipboardClock data-icon="inline-start" />
                        {getFrequencyLabel(parsed, t)}
                    </Badge>
                </ItemDescription>
            </ItemContent>
        </Item>
    );
}
