import { FieldSet } from '@/components/ui/field';
import { useTranslation } from '@/i18n/useI18n';

/**
 * Feature settings component for managing chat and editor configurations.
 * @returns The feature settings UI component
 */
export function FeatureSettings() {
    const { t } = useTranslation();

    return (
        <div className="w-full max-w-lg space-y-8">
            {/* Main Title */}
            <div className="font-bold text-2xl">{t('setting.features')}</div>

            {/* Chat Subsection */}
            <FieldSet>
                <div className="font-semibold text-lg">{t('chat.chat')}</div>
                <div className="text-sm text-muted-foreground mt-4">
                    Chat settings coming soon...
                </div>
            </FieldSet>

            {/* Editor Subsection */}
            <FieldSet>
                <div className="font-semibold text-lg">{t('editor.editor')}</div>
                <div className="text-sm text-muted-foreground mt-4">
                    Editor settings coming soon...
                </div>
            </FieldSet>
        </div>
    );
}
