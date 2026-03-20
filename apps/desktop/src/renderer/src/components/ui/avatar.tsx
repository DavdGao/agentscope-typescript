import { Avatar as AvatarPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Avatar component that displays a user's profile picture or fallback.
 *
 * @param root0 - The component props.
 * @param root0.className - Optional CSS class name.
 * @param root0.size - Size variant of the avatar (default, sm, or lg).
 * @returns An Avatar component.
 */
function Avatar({
    className,
    size = 'default',
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
    size?: 'default' | 'sm' | 'lg';
}) {
    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            data-size={size}
            className={cn(
                'group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6',
                className
            )}
            {...props}
        />
    );
}

/**
 * Avatar image component that displays the actual image.
 *
 * @param root0 - The component props.
 * @param root0.className - Optional CSS class name.
 * @returns An AvatarImage component.
 */
function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
    return (
        <AvatarPrimitive.Image
            data-slot="avatar-image"
            className={cn('aspect-square size-full', className)}
            {...props}
        />
    );
}

/**
 * Avatar fallback component that displays when the image fails to load.
 *
 * @param root0 - The component props.
 * @param root0.className - Optional CSS class name.
 * @returns An AvatarFallback component.
 */
function AvatarFallback({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
    return (
        <AvatarPrimitive.Fallback
            data-slot="avatar-fallback"
            className={cn(
                'flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs',
                className
            )}
            {...props}
        />
    );
}

/**
 * Avatar badge component that displays a status indicator on the avatar.
 *
 * @param root0 - The component props.
 * @param root0.className - Optional CSS class name.
 * @returns An AvatarBadge component.
 */
function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot="avatar-badge"
            className={cn(
                'absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none',
                'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
                'group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2',
                'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
                className
            )}
            {...props}
        />
    );
}

/**
 * Avatar group component that displays multiple avatars in a row.
 *
 * @param root0 - The component props.
 * @param root0.className - Optional CSS class name.
 * @returns An AvatarGroup component.
 */
function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="avatar-group"
            className={cn(
                'group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
                className
            )}
            {...props}
        />
    );
}

/**
 * Avatar group count component that displays the number of additional avatars.
 *
 * @param root0 - The component props.
 * @param root0.className - Optional CSS class name.
 * @returns An AvatarGroupCount component.
 */
function AvatarGroupCount({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="avatar-group-count"
            className={cn(
                'relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3',
                className
            )}
            {...props}
        />
    );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount };
