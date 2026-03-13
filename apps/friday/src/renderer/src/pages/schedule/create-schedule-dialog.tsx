import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/i18n/useI18n';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: () => void;
}

type FreqType = 'once' | 'daily' | 'weekly' | 'monthly';

/**
 * Gets the default form values for creating a new schedule.
 *
 * @returns An object containing default form values.
 */
function getDefaultForm() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return {
        name: '',
        description: '',
        freq: 'once' as FreqType,
        date: now,
        time: `${hh}:${mm}`,
        endDate: undefined as Date | undefined,
    };
}

/**
 * Builds a cron expression based on frequency, time, and date.
 *
 * @param freq - The frequency type (once, daily, weekly, monthly).
 * @param time - The time in HH:mm format.
 * @param date - The date for weekly or monthly schedules.
 * @returns A cron expression string.
 */
function buildCronExpr(freq: FreqType, time: string, date: Date | undefined): string {
    const [h, m] = time.split(':').map(Number);
    switch (freq) {
        case 'daily':
            return `${m} ${h} * * *`;
        case 'weekly': {
            const weekday = date ? date.getDay() : 1;
            return `${m} ${h} * * ${weekday}`;
        }
        case 'monthly': {
            const monthDay = date ? date.getDate() : 1;
            return `${m} ${h} ${monthDay} * *`;
        }
        default:
            return '';
    }
}

/**
 * A date picker button component for selecting dates.
 *
 * @param root0 - The component props.
 * @param root0.date - The currently selected date.
 * @param root0.onSelect - Callback when a date is selected.
 * @param root0.placeholder - Placeholder text when no date is selected.
 * @param root0.disabled - Whether the button is disabled.
 * @returns A DatePickerButton component.
 */
function DatePickerButton({
    date,
    onSelect,
    placeholder,
    disabled,
}: {
    date: Date | undefined;
    onSelect: (d: Date | undefined) => void;
    placeholder: string;
    disabled?: boolean;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    size="sm"
                    className="w-32 justify-between font-normal"
                >
                    {date ? format(date, 'PPP') : placeholder}
                    <ChevronDownIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    classNames={{
                        dropdown_root: 'border-none',
                    }}
                    mode="single"
                    selected={date}
                    onSelect={onSelect}
                    captionLayout="dropdown"
                />
            </PopoverContent>
        </Popover>
    );
}

/**
 * A dialog component for creating new schedules.
 *
 * @param root0 - The component props.
 * @param root0.open - Whether the dialog is open.
 * @param root0.onOpenChange - Callback when the dialog open state changes.
 * @param root0.onCreated - Callback when a schedule is successfully created.
 * @returns A CreateScheduleDialog component.
 */
export function CreateScheduleDialog({ open, onOpenChange, onCreated }: Props) {
    const { t } = useTranslation();
    const [form, setForm] = React.useState(getDefaultForm);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (open) {
            setForm(getDefaultForm());
            setError('');
        }
    }, [open]);

    const set = <K extends keyof ReturnType<typeof getDefaultForm>>(
        key: K,
        value: ReturnType<typeof getDefaultForm>[K]
    ) => setForm(prev => ({ ...prev, [key]: value }));

    const isValid = form.name.trim() && !!form.date && !!form.time;

    const handleSubmit = async () => {
        setError('');
        if (!isValid) return;
        setLoading(true);
        try {
            let cronExpr: string;

            const d = new Date(form.date!);
            const [h, m] = form.time.split(':').map(Number);
            d.setHours(h, m, 0, 0);
            const startAt = d.getTime();

            if (form.freq === 'once') {
                cronExpr = `${m} ${h} ${d.getDate()} ${d.getMonth() + 1} *`;
            } else {
                cronExpr = buildCronExpr(form.freq, form.time, form.date);
            }

            const endAt = form.endDate
                ? (() => {
                      const ed = new Date(form.endDate!);
                      ed.setHours(23, 59, 59, 999);
                      return ed.getTime();
                  })()
                : undefined;

            await window.api.schedule.create({
                name: form.name.trim(),
                enabled: true,
                description: form.description.trim(),
                cronExpr,
                startAt,
                endAt,
            });
            onCreated();
            onOpenChange(false);
        } catch (e) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[560px] max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>{t('schedule.createSchedule')}</DialogTitle>
                    <DialogDescription>{t('schedule.createScheduleDesc')}</DialogDescription>
                </DialogHeader>

                <div className="no-scrollbar -mx-4 max-h-[75vh] overflow-y-auto px-4">
                    <FieldGroup>
                        {/* Name */}
                        <Field>
                            <FieldLabel>{t('common.name')}</FieldLabel>
                            <Input
                                className="text-sm h-8"
                                value={form.name}
                                onChange={e => set('name', e.target.value)}
                                placeholder={t('schedule.titlePlaceholder')}
                            />
                        </Field>

                        {/* Description */}
                        <Field>
                            <FieldLabel>{t('schedule.description')}</FieldLabel>
                            <Textarea
                                value={form.description}
                                onChange={e => set('description', e.target.value)}
                                placeholder={t('schedule.scheduleDescPlaceholder')}
                                className="min-h-[150px]"
                            />
                        </Field>

                        {/* Date + Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <Field>
                                <FieldLabel>{t('common.date')}</FieldLabel>
                                <DatePickerButton
                                    date={form.date}
                                    onSelect={d => d && set('date', d)}
                                    placeholder={t('schedule.pickDate')}
                                />
                            </Field>
                            <Field>
                                <FieldLabel>{t('common.time')}</FieldLabel>
                                <Input
                                    type="time"
                                    value={form.time}
                                    onChange={e => set('time', e.target.value)}
                                    className="h-8 text-sm appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                            </Field>
                        </div>

                        {/* Frequency */}
                        <Field>
                            <FieldLabel>{t('schedule.frequency')}</FieldLabel>
                            <Select
                                value={form.freq}
                                onValueChange={v => set('freq', v as FreqType)}
                            >
                                <SelectTrigger className="w-full" size="sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="once">{t('schedule.freqOnce')}</SelectItem>
                                    <SelectItem value="daily">{t('schedule.freqDaily')}</SelectItem>
                                    <SelectItem value="weekly">
                                        {t('schedule.freqWeekly')}
                                    </SelectItem>
                                    <SelectItem value="monthly">
                                        {t('schedule.freqMonthly')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        {/* End At */}
                        <Field>
                            <FieldLabel
                                className={form.freq === 'once' ? 'text-muted-foreground' : ''}
                            >
                                {t('schedule.endAt')}
                            </FieldLabel>
                            <DatePickerButton
                                date={form.freq === 'once' ? undefined : form.endDate}
                                onSelect={d => set('endDate', d)}
                                placeholder={t('schedule.pickDate')}
                                disabled={form.freq === 'once'}
                            />
                        </Field>

                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </FieldGroup>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !isValid}>
                        {t('common.create')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
