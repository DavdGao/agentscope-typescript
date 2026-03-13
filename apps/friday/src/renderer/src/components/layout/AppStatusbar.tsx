import { useTranslation } from '@/i18n/useI18n';

/**
 * The application status bar component that displays token usage and status information.
 *
 * @returns An AppStatusbar component.
 */
export function AppStatusbar() {
    const { t } = useTranslation();

    // Placeholder: actual status should be obtained from state management
    const isRunning = false;

    return (
        <footer className="flex items-center justify-end px-4 h-9 border-t bg-background text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                    <span className="font-medium">Token:</span>
                    <span>0 / 10,000</span>
                </span>
                <span className="flex items-center gap-2">
                    <span className="font-medium">{t('common.status')}:</span>
                    <span className="flex items-center gap-1.5">
                        <span
                            className={`w-2 h-2 rounded-full ${
                                isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                            }`}
                        />
                        <span>{isRunning ? t('common.active') : t('common.inactive')}</span>
                    </span>
                </span>
            </div>
        </footer>
    );
}
