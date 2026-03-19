import { Separator as SeparatorPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Separator component that renders a visual divider line.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @param root0.orientation - Orientation of the separator (horizontal or vertical)
 * @param root0.decorative - Whether the separator is decorative
 * @returns A styled separator element
 */
function Separator({
    className,
    orientation = 'horizontal',
    decorative = true,
    ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
    return (
        <SeparatorPrimitive.Root
            data-slot="separator"
            decorative={decorative}
            orientation={orientation}
            className={cn(
                'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
                className
            )}
            {...props}
        />
    );
}

export { Separator };
