import type { ScheduleExecution } from '@shared/types/schedule';

import { ChatContent } from '@/components/chat/ChatContent';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { useExecutionMessages } from '@/hooks/use-execution-messages';
import { useTranslation } from '@/i18n/useI18n';

interface ExecutionLogDrawerProps {
    scheduleId: string;
    execution: ScheduleExecution | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Execution log drawer component that displays real-time agent execution logs
 *
 * @param root0 - Component props
 * @param root0.scheduleId - Schedule ID
 * @param root0.execution - Execution data
 * @param root0.open - Drawer open state
 * @param root0.onOpenChange - Drawer open state change handler
 * @returns ExecutionLogDrawer component
 */
export function ExecutionLogDrawer({
    scheduleId,
    execution,
    open,
    onOpenChange,
}: ExecutionLogDrawerProps) {
    const { t } = useTranslation();
    const { messages, sending } = useExecutionMessages(
        open ? scheduleId : null,
        open ? execution : null
    );

    if (!execution) return null;

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent className="flex max-h-full h-full min-w-2xl ml-auto">
                <DrawerHeader className="flex">
                    <DrawerTitle>
                        {t('schedule.executionLog')} - {execution.executionId}
                    </DrawerTitle>
                    <DrawerDescription>
                        {new Date(execution.startTime).toLocaleString()}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-1 w-full max-w-full px-6 py-5 overflow-hidden">
                    <ChatContent
                        msgs={messages}
                        sending={sending}
                        onSend={() => {}}
                        onUserConfirm={() => {}}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
