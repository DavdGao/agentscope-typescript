import { useTranslation } from '@/i18n/useI18n';

/**
 * The news page component that displays news content.
 *
 * @returns A NewsPage component.
 */
export function NewsPage() {
    const { t } = useTranslation();
    return (
        <div className="size-full p-4">
            <div>{t('news.title')}</div>
        </div>
    );
}
