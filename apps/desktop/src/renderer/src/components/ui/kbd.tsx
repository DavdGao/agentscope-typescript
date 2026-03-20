import { cn } from '@/lib/utils';

/**
 * Kbd component that renders a keyboard key element.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @returns A styled kbd element
 */
function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
    return (
        <kbd
            data-slot="kbd"
            className={cn(
                'bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium select-none',
                "[&_svg:not([class*='size-'])]:size-3",
                '[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10',
                className
            )}
            {...props}
        />
    );
}

/**
 * KbdGroup component that renders a group of keyboard key elements.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @returns A styled kbd group element
 */
function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <kbd
            data-slot="kbd-group"
            className={cn('inline-flex items-center gap-1', className)}
            {...props}
        />
    );
}

export { Kbd, KbdGroup };
