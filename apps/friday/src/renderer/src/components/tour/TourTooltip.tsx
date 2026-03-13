import { TooltipRenderProps } from 'react-joyride';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

/**
 * Custom tooltip component for the application tour.
 *
 * @param root0 - The tooltip render props from react-joyride.
 * @param root0.continuous - Whether the tour is continuous.
 * @param root0.index - Current step index.
 * @param root0.step - Current step data.
 * @param root0.backProps - Props for the back button.
 * @param root0.closeProps - Props for the close button.
 * @param root0.primaryProps - Props for the primary action button.
 * @param root0.skipProps - Props for the skip button.
 * @param root0.tooltipProps - Props for the tooltip container.
 * @param root0.size - Total number of steps.
 * @returns A custom tour tooltip component.
 */
export function TourTooltip({
    continuous,
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    tooltipProps,
    size,
}: TooltipRenderProps) {
    return (
        <Card {...tooltipProps} className="max-w-sm border-none! shadow-none! ring-0!">
            <CardHeader>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>
                    Step {index + 1} of {size}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="text-sm text-muted-foreground">{step.content}</div>
            </CardContent>

            <CardFooter className="flex justify-between items-center">
                <div className="flex gap-2">
                    {index > 0 && (
                        <Button {...backProps} variant="ghost" size="sm">
                            Back
                        </Button>
                    )}
                </div>

                <div className="flex gap-2 items-center">
                    <Button {...skipProps} variant="ghost" size="sm">
                        Skip
                    </Button>

                    {continuous && (
                        <Button {...primaryProps} size="sm">
                            {index === size - 1 ? 'Finish' : 'Next'}
                        </Button>
                    )}

                    {!continuous && (
                        <Button {...closeProps} size="sm">
                            Close
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
