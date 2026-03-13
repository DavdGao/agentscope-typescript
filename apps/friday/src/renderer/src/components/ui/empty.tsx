import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Empty state container component that provides consistent styling for empty states.
 * @param root0 - The component props
 * @param root0.className - Additional CSS classes to apply
 * @returns A styled empty state container
 */
function Empty({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="empty"
            className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12',
                className
            )}
            {...props}
        />
    );
}

/**
 * Header section for empty state containing icon, title, and description.
 * @param root0 - The component props
 * @param root0.className - Additional CSS classes to apply
 * @returns A styled empty state header container
 */
function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="empty-header"
            className={cn('flex max-w-sm flex-col items-center gap-2 text-center', className)}
            {...props}
        />
    );
}

const emptyMediaVariants = cva(
    'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-transparent',
                icon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

/**
 * Media container for empty state icons with variant styling options.
 * @param root0 - The component props
 * @param root0.className - Additional CSS classes to apply
 * @param root0.variant - The visual variant (default or icon)
 * @returns A styled media container for empty state icons
 */
function EmptyMedia({
    className,
    variant = 'default',
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
    return (
        <div
            data-slot="empty-icon"
            data-variant={variant}
            className={cn(emptyMediaVariants({ variant, className }))}
            {...props}
        />
    );
}

/**
 * Title component for empty state with consistent typography.
 * @param root0 - The component props
 * @param root0.className - Additional CSS classes to apply
 * @returns A styled empty state title
 */
function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="empty-title"
            className={cn('text-lg font-medium tracking-tight', className)}
            {...props}
        />
    );
}

/**
 * Description component for empty state with muted styling.
 * @param root0 - The component props
 * @param root0.className - Additional CSS classes to apply
 * @returns A styled empty state description
 */
function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
    return (
        <div
            data-slot="empty-description"
            className={cn(
                'text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
                className
            )}
            {...props}
        />
    );
}

/**
 * Content area for empty state actions and additional information.
 * @param root0 - The component props
 * @param root0.className - Additional CSS classes to apply
 * @returns A styled empty state content container
 */
function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="empty-content"
            className={cn(
                'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance',
                className
            )}
            {...props}
        />
    );
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia };
