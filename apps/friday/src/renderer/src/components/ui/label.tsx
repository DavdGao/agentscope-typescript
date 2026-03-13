import { Label as LabelPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Label component that renders a styled label element.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @returns A styled label element
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
    return (
        <LabelPrimitive.Root
            data-slot="label"
            className={cn(
                'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
}

export { Label };
