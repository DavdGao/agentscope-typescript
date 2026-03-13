import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/i18n/useI18n';

interface GeneralSettingsProps {
    username: string;
    language: string;
    onUsernameChange: (value: string) => void;
    onLanguageChange: (value: string) => void;
}

/**
 * General settings component for managing user profile and language preferences.
 * @param root0 - Component props
 * @param root0.username - Current username
 * @param root0.language - Current language setting
 * @param root0.onUsernameChange - Callback when username changes
 * @param root0.onLanguageChange - Callback when language changes
 * @returns The general settings UI component
 */
export function GeneralSettings({
    username,
    language,
    onUsernameChange,
    onLanguageChange,
}: GeneralSettingsProps) {
    const { t } = useTranslation();

    return (
        <div className="w-full max-w-lg space-y-8">
            {/* Main Title */}
            <div className="font-bold text-2xl">{t('setting.general')}</div>

            {/* User Info Subsection */}
            <FieldSet>
                <FieldGroup>
                    <Field>
                        <FieldLabel>{t('common.username')}</FieldLabel>
                        <Input
                            placeholder={t('setting.namePlaceholder') || 'Enter your name'}
                            value={username}
                            onChange={e => onUsernameChange(e.target.value)}
                            className="h-8 text-sm px-2"
                        />
                    </Field>
                    <Field>
                        <FieldLabel>{t('common.language')}</FieldLabel>
                        <Tabs value={language} onValueChange={onLanguageChange}>
                            <TabsList>
                                <TabsTrigger value="en" className="border-none w-20">
                                    {t('common.english')}
                                </TabsTrigger>
                                <TabsTrigger value="zh" className="border-none w-20">
                                    {t('common.chinese')}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </Field>

                    <Field>
                        <FieldLabel>Version</FieldLabel>
                        <div className="text-sm text-muted-foreground">1.0.0</div>
                    </Field>
                </FieldGroup>
            </FieldSet>
        </div>
    );
}
