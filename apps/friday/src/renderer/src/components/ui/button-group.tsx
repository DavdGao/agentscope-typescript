import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const buttonGroupVariants = cva(
    "flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md has-[>[data-slot=button-group]]:gap-2",
    {
        variants: {
            orientation: {
                horizontal:
                    '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
                vertical:
                    'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
            },
        },
        defaultVariants: {
            orientation: 'horizontal',
        },
    }
);

/**
 * ButtonGroup component that renders a group of buttons with various orientations.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @param root0.orientation - Orientation of the button group (horizontal or vertical)
 * @returns A styled button group element
 */
function ButtonGroup({
    className,
    orientation,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
    return (
        <div
            role="group"
            data-slot="button-group"
            data-orientation={orientation}
            className={cn(buttonGroupVariants({ orientation }), className)}
            {...props}
        />
    );
}

/**
 * ButtonGroupText component that renders text content within a button group.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @param root0.asChild - Whether to render as a child component
 * @returns A styled button group text element
 */
function ButtonGroupText({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<'div'> & {
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot.Root : 'div';

    return (
        <Comp
            className={cn(
                "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        />
    );
}

/**
 * ButtonGroupSeparator component that renders a separator within a button group.
 *
 * @param root0 - Component props
 * @param root0.className - Additional CSS classes
 * @param root0.orientation - Orientation of the separator (horizontal or vertical)
 * @returns A styled button group separator element
 */
function ButtonGroupSeparator({
    className,
    orientation = 'vertical',
    ...props
}: React.ComponentProps<typeof Separator>) {
    return (
        <Separator
            data-slot="button-group-separator"
            orientation={orientation}
            className={cn(
                'bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto',
                className
            )}
            {...props}
        />
    );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants };
