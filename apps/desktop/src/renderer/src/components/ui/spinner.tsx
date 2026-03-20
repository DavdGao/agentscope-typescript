import { Loader2Icon } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * A spinner component that displays a loading animation.
 * @param root0
 * @param root0.className
 * @returns A Spinner component.
 */
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
    return (
        <Loader2Icon
            role="status"
            aria-label="Loading"
            className={cn('size-4 animate-spin', className)}
            {...props}
        />
    );
}

export { Spinner };
