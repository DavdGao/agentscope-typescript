import { cva, type VariantProps } from 'class-variance-authority';
import { useMemo } from 'react';

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * A container for grouping multiple related fields.
 *
 * @param root0
 * @param root0.className
 * @returns A styled field set element.
 */
function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
    return (
        <fieldset
            data-slot="field-set"
            className={cn(
                'flex flex-col gap-6',
                'has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
                className
            )}
            {...props}
        />
    );
}

/**
 * A legend element for labeling a field set.
 *
 * @param root0
 * @param root0.className
 * @param root0.variant
 * @returns A styled field legend element.
 */
function FieldLegend({
    className,
    variant = 'legend',
    ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
    return (
        <legend
            data-slot="field-legend"
            data-variant={variant}
            className={cn(
                'mb-1.5 font-medium',
                'data-[variant=legend]:text-base',
                'data-[variant=label]:text-sm',
                className
            )}
            {...props}
        />
    );
}

/**
 * A container for grouping related fields together.
 *
 * @param root0
 * @param root0.className
 * @returns A styled field group element.
 */
function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field-group"
            className={cn(
                'group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
                className
            )}
            {...props}
        />
    );
}

const fieldVariants = cva('group/field flex w-full gap-2 data-[invalid=true]:text-destructive', {
    variants: {
        orientation: {
            vertical: ['flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
            horizontal: [
                'flex-row items-center',
                '[&>[data-slot=field-label]]:flex-auto',
                'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
            ],
            responsive: [
                'flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto',
                '@md/field-group:[&>[data-slot=field-label]]:flex-auto',
                '@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
            ],
        },
    },
    defaultVariants: {
        orientation: 'vertical',
    },
});

/**
 * A single form field with label and input.
 *
 * @param root0
 * @param root0.className
 * @param root0.orientation
 * @returns A styled field element.
 */
function Field({
    className,
    orientation = 'vertical',
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
    return (
        <div
            role="group"
            data-slot="field"
            data-orientation={orientation}
            className={cn(fieldVariants({ orientation }), className)}
            {...props}
        />
    );
}

/**
 * A container for the field's input and description.
 *
 * @param root0
 * @param root0.className
 * @returns A styled field content element.
 */
function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field-content"
            className={cn(
                'group/field-content flex flex-1 flex-col gap-0.5 leading-snug',
                className
            )}
            {...props}
        />
    );
}

/**
 * A label for the field's input element.
 *
 * @param root0
 * @param root0.className
 * @returns A styled field label element.
 */
function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
    return (
        <Label
            data-slot="field-label"
            className={cn(
                'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50',
                'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4',
                'has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10',
                className
            )}
            {...props}
        />
    );
}

/**
 * A title element for the field.
 *
 * @param root0
 * @param root0.className
 * @returns A styled field title element.
 */
function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field-label"
            className={cn(
                'flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50',
                className
            )}
            {...props}
        />
    );
}

/**
 * A description text providing additional context for the field.
 *
 * @param root0
 * @param root0.className
 * @returns A styled field description element.
 */
function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
    return (
        <p
            data-slot="field-description"
            className={cn(
                'text-muted-foreground text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance',
                'last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5',
                '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
                className
            )}
            {...props}
        />
    );
}

/**
 * A visual separator between fields with optional label text.
 *
 * @param root0
 * @param root0.children
 * @param root0.className
 * @returns A styled field separator element.
 */
function FieldSeparator({
    children,
    className,
    ...props
}: React.ComponentProps<'div'> & {
    children?: React.ReactNode;
}) {
    return (
        <div
            data-slot="field-separator"
            data-content={!!children}
            className={cn(
                'relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2',
                className
            )}
            {...props}
        >
            <Separator className="absolute inset-0 top-1/2" />
            {children && (
                <span
                    className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
                    data-slot="field-separator-content"
                >
                    {children}
                </span>
            )}
        </div>
    );
}

/**
 * An error message display for field validation errors.
 *
 * @param root0
 * @param root0.className
 * @param root0.children
 * @param root0.errors
 * @returns A styled field error element.
 */
function FieldError({
    className,
    children,
    errors,
    ...props
}: React.ComponentProps<'div'> & {
    errors?: Array<{ message?: string } | undefined>;
}) {
    const content = useMemo(() => {
        if (children) {
            return children;
        }

        if (!errors?.length) {
            return null;
        }

        const uniqueErrors = [...new Map(errors.map(error => [error?.message, error])).values()];

        if (uniqueErrors?.length == 1) {
            return uniqueErrors[0]?.message;
        }

        return (
            <ul className="ml-4 flex list-disc flex-col gap-1">
                {uniqueErrors.map(
                    (error, index) => error?.message && <li key={index}>{error.message}</li>
                )}
            </ul>
        );
    }, [children, errors]);

    if (!content) {
        return null;
    }

    return (
        <div
            role="alert"
            data-slot="field-error"
            className={cn('text-destructive text-sm font-normal', className)}
            {...props}
        >
            {content}
        </div>
    );
}

export {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldContent,
    FieldTitle,
};
