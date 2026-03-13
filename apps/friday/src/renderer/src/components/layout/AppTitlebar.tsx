import React from 'react';

import { Button } from '@/components/ui/button';

/**
 * The application title bar component that displays the app name.
 *
 * @returns An AppTitlebar component.
 */
export function AppTitlebar() {
    return (
        <header
            className="sticky top-0 z-50 flex w-full items-center pl-16 border-b border-border!"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
            <div className="flex h-(--header-height) w-full items-center gap-2 px-4 text-sm">
                <Button variant="ghost"></Button>
            </div>
        </header>
    );
}
