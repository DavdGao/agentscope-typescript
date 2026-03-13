import { Field, FieldDescription, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/i18n/useI18n';

interface DataSettingsProps {
    dataDirectory?: string;
    onDataDirectoryChange?: (value: string) => void;
}

/**
 * Data settings component for managing data directory configuration.
 * @param root0 - Component props
 * @param root0.dataDirectory - Current data directory path
 * @param root0.onDataDirectoryChange - Callback when data directory changes
 * @returns The data settings UI component
 */
export function DataSettings({ dataDirectory, onDataDirectoryChange }: DataSettingsProps) {
    const { t } = useTranslation();

    return (
        <div className="w-full max-w-lg space-y-8">
            {/* Directory Subsection */}
            <FieldSet>
                <div className="font-semibold text-lg">{t('common.directory')}</div>
                <Field className="h-full">
                    <FieldLabel>{t('setting.dataDirectory')}</FieldLabel>
                    <FieldDescription>{t('setting.dataDirectoryDesc')}</FieldDescription>
                    <Input
                        className="h-8 text-sm px-2"
                        name="dataDir"
                        value={dataDirectory}
                        onChange={e => onDataDirectoryChange?.(e.target.value)}
                    />
                </Field>
            </FieldSet>
        </div>
    );
}
