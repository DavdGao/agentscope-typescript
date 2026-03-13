import { Popover as PopoverPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * A popover component that displays floating content anchored to an element.
 *
 * @param root0
 * @returns A styled popover element.
 */
function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
    return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

/**
 * A button that triggers the popover to open.
 *
 * @param root0
 * @returns A styled popover trigger element.
 */
function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/**
 * The main content container for the popover.
 *
 * @param root0
 * @param root0.className
 * @param root0.align
 * @param root0.sideOffset
 * @returns A styled popover content element.
 */
function PopoverContent({
    className,
    align = 'center',
    sideOffset = 4,
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                data-slot="popover-content"
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
                    className
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
}

/**
 * An anchor element for positioning the popover.
 *
 * @param root0
 * @returns A styled popover anchor element.
 */
function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
    return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

/**
 * A header section for the popover.
 *
 * @param root0
 * @param root0.className
 * @returns A styled popover header element.
 */
function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="popover-header"
            className={cn('flex flex-col gap-1 text-sm', className)}
            {...props}
        />
    );
}

/**
 * A title text for the popover.
 *
 * @param root0
 * @param root0.className
 * @returns A styled popover title element.
 */
function PopoverTitle({ className, ...props }: React.ComponentProps<'h2'>) {
    return <div data-slot="popover-title" className={cn('font-medium', className)} {...props} />;
}

/**
 * A description text for the popover providing additional context.
 *
 * @param root0
 * @param root0.className
 * @returns A styled popover description element.
 */
function PopoverDescription({ className, ...props }: React.ComponentProps<'p'>) {
    return (
        <p
            data-slot="popover-description"
            className={cn('text-muted-foreground', className)}
            {...props}
        />
    );
}

export {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverAnchor,
    PopoverHeader,
    PopoverTitle,
    PopoverDescription,
};
