import { FolderCode, Search } from 'lucide-react';
import type { ReactNode } from 'react';

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { useTranslation } from '@/i18n/useI18n';

/**
 * Empty state component for the skills page when no skills are available.
 * @param root0 - The component props
 * @param root0.addTrigger - Optional trigger element for adding skills
 * @returns An empty state component for skills
 */
export function EmptySkill({ addTrigger }: { addTrigger?: ReactNode }) {
    const { t } = useTranslation();

    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <FolderCode className="size-5" />
                </EmptyMedia>
                <EmptyTitle>{t('skill.noSkills')}</EmptyTitle>
                <EmptyDescription>{t('skill.noSkillsDesc')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>{addTrigger}</EmptyContent>
        </Empty>
    );
}

/**
 * The empty state component for search results on the skill page.
 * @returns An EmptySearch component.
 */
export function EmptySearch() {
    const { t } = useTranslation();
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Search className="size-5" />
                </EmptyMedia>
                <EmptyTitle>{t('skill.noResults')}</EmptyTitle>
                <EmptyDescription>{t('skill.noResultsDesc')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent></EmptyContent>
        </Empty>
    );
}
