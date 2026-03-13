import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * A navigation component that displays the current page's location within a navigational hierarchy.
 *
 * @param root0
 * @returns A styled breadcrumb navigation element.
 */
function Breadcrumb({ ...props }: React.ComponentProps<'nav'>) {
    return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/**
 * A container for breadcrumb items displayed as an ordered list.
 *
 * @param root0
 * @param root0.className
 * @returns A styled breadcrumb list element.
 */
function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
    return (
        <ol
            data-slot="breadcrumb-list"
            className={cn(
                'text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5',
                className
            )}
            {...props}
        />
    );
}

/**
 * A single item in the breadcrumb navigation.
 *
 * @param root0
 * @param root0.className
 * @returns A styled breadcrumb item element.
 */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
    return (
        <li
            data-slot="breadcrumb-item"
            className={cn('inline-flex items-center gap-1.5', className)}
            {...props}
        />
    );
}

/**
 * A clickable link within a breadcrumb item.
 *
 * @param root0
 * @param root0.asChild
 * @param root0.className
 * @returns A styled breadcrumb link element.
 */
function BreadcrumbLink({
    asChild,
    className,
    ...props
}: React.ComponentProps<'a'> & {
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot.Root : 'a';

    return (
        <Comp
            data-slot="breadcrumb-link"
            className={cn('hover:text-foreground transition-colors', className)}
            {...props}
        />
    );
}

/**
 * Represents the current page in the breadcrumb navigation.
 *
 * @param root0
 * @param root0.className
 * @returns A styled breadcrumb page element.
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot="breadcrumb-page"
            role="link"
            aria-disabled="true"
            aria-current="page"
            className={cn('text-foreground font-normal', className)}
            {...props}
        />
    );
}

/**
 * A visual separator between breadcrumb items.
 *
 * @param root0
 * @param root0.children
 * @param root0.className
 * @returns A styled breadcrumb separator element.
 */
function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
    return (
        <li
            data-slot="breadcrumb-separator"
            role="presentation"
            aria-hidden="true"
            className={cn('[&>svg]:size-3.5', className)}
            {...props}
        >
            {children ?? <ChevronRight />}
        </li>
    );
}

/**
 * An ellipsis indicator for collapsed breadcrumb items.
 *
 * @param root0
 * @param root0.className
 * @returns A styled breadcrumb ellipsis element.
 */
function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot="breadcrumb-ellipsis"
            role="presentation"
            aria-hidden="true"
            className={cn('flex size-9 items-center justify-center', className)}
            {...props}
        >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">More</span>
        </span>
    );
}

export {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
};
