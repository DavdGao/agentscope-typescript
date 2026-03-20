import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Card component that renders a styled card container.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @returns A styled card element
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card"
            className={cn(
                'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
                className
            )}
            {...props}
        />
    );
}

/**
 * CardHeader component that renders the header section of a card.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @returns A styled card header element
 */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
                className
            )}
            {...props}
        />
    );
}

/**
 * CardTitle component that renders the title of a card.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @returns A styled card title element
 */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-title"
            className={cn('leading-none font-semibold', className)}
            {...props}
        />
    );
}

/**
 * CardDescription component that renders the description of a card.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @returns A styled card description element
 */
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-description"
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

/**
 * CardAction component that renders the action section of a card.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @returns A styled card action element
 */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-action"
            className={cn(
                'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
                className
            )}
            {...props}
        />
    );
}

/**
 * CardContent component that renders the content section of a card.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @returns A styled card content element
 */
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

/**
 * CardFooter component that renders the footer section of a card.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @returns A styled card footer element
 */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-footer"
            className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
            {...props}
        />
    );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
