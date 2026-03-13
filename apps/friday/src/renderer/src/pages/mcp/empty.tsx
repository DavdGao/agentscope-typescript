import { Plug, Search } from 'lucide-react';
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
 * Empty state component for the MCP servers page when no servers are configured.
 * @param root0 - The component props
 * @param root0.importTrigger - Optional trigger element for importing servers
 * @returns An empty state component for MCP servers
 */
export function EmptyMCP({ importTrigger }: { importTrigger?: ReactNode }) {
    const { t } = useTranslation();

    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Plug className="size-5" />
                </EmptyMedia>
                <EmptyTitle>{t('mcp.noServers')}</EmptyTitle>
                <EmptyDescription>{t('mcp.noServersDesc')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>{importTrigger}</EmptyContent>
        </Empty>
    );
}

/**
 * Empty state component for MCP search results when no matches are found.
 * @returns An empty state component for search results
 */
export function EmptySearch() {
    const { t } = useTranslation();
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Search className="size-5" />
                </EmptyMedia>
                <EmptyTitle>{t('mcp.noResults')}</EmptyTitle>
                <EmptyDescription>{t('mcp.noResultsDesc')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent></EmptyContent>
        </Empty>
    );
}
