import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@/lib/utils';

/**
 * A drawer component that slides in from the edge of the screen.
 *
 * @param root0
 * @returns A styled drawer element.
 */
function Drawer({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
    return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

/**
 * A button that triggers the drawer to open.
 *
 * @param root0
 * @returns A styled drawer trigger element.
 */
function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
    return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

/**
 * A portal component that renders drawer content in a different part of the DOM.
 *
 * @param root0
 * @returns A styled drawer portal element.
 */
function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
    return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

/**
 * A button that closes the drawer.
 *
 * @param root0
 * @returns A styled drawer close element.
 */
function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
    return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

/**
 * An overlay that dims the background content when the drawer is open.
 *
 * @param root0
 * @param root0.className
 * @returns A styled drawer overlay element.
 */
function DrawerOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
    return (
        <DrawerPrimitive.Overlay
            data-slot="drawer-overlay"
            className={cn(
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
                className
            )}
            {...props}
        />
    );
}

/**
 * The main content container for the drawer.
 *
 * @param root0
 * @param root0.className
 * @param root0.children
 * @returns A styled drawer content element.
 */
function DrawerContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
    return (
        <DrawerPortal data-slot="drawer-portal">
            <DrawerOverlay />
            <DrawerPrimitive.Content
                data-slot="drawer-content"
                className={cn(
                    'group/drawer-content bg-background fixed z-50 flex h-auto flex-col',
                    'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b',
                    'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t',
                    'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm',
                    'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm',
                    className
                )}
                {...props}
            >
                <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
                {children}
            </DrawerPrimitive.Content>
        </DrawerPortal>
    );
}

/**
 * A header section for the drawer containing title and description.
 *
 * @param root0
 * @param root0.className
 * @returns A styled drawer header element.
 */
function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="drawer-header"
            className={cn(
                'flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left',
                className
            )}
            {...props}
        />
    );
}

/**
 * A footer section for the drawer containing action buttons.
 *
 * @param root0
 * @param root0.className
 * @returns A styled drawer footer element.
 */
function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="drawer-footer"
            className={cn('mt-auto flex flex-col gap-2 p-4', className)}
            {...props}
        />
    );
}

/**
 * The title text for the drawer.
 *
 * @param root0
 * @param root0.className
 * @returns A styled drawer title element.
 */
function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
    return (
        <DrawerPrimitive.Title
            data-slot="drawer-title"
            className={cn('text-foreground font-semibold', className)}
            {...props}
        />
    );
}

/**
 * A description text for the drawer providing additional context.
 *
 * @param root0
 * @param root0.className
 * @returns A styled drawer description element.
 */
function DrawerDescription({
    className,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
    return (
        <DrawerPrimitive.Description
            data-slot="drawer-description"
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

export {
    Drawer,
    DrawerPortal,
    DrawerOverlay,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
};
