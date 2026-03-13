import { cn } from '@/lib/utils';

/**
 * Skeleton component that renders a loading placeholder element.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @returns A styled skeleton element
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="skeleton"
            className={cn('bg-accent animate-pulse rounded-md', className)}
            {...props}
        />
    );
}

export { Skeleton };
