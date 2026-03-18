import React from 'react';

import { useTitlebar } from '@/contexts/LayoutContext';

/**
 * The application title bar component that displays custom content from pages.
 *
 * @returns An AppTitlebar component.
 */
export function AppTitlebar() {
    const { titlebarContent } = useTitlebar();

    return (
        <header
            className="sticky top-0 z-50 flex w-full items-center pl-16 border-b border-border! h-9"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
            <div className="flex h-full w-full items-center gap-2 pl-6 pr-4 text-sm">
                {titlebarContent}
            </div>
        </header>
    );
}
