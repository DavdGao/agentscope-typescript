import { ToolCallBlock } from '@agentscope-ai/agentscope/message';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { useTranslation } from '@/i18n/useI18n';
import { cn } from '@/lib/utils';

/**
 * Returns a human-readable label for a tool name.
 * @param name - The tool name.
 * @returns A display string for the tool.
 */
function renderToolName(name: string) {
    switch (name.toLowerCase()) {
        case 'bash':
            return 'Bash command';
        case 'read':
            return 'Read file';
        default:
            return `${name} tool`;
    }
}

/**
 * Renders a formatted display of tool input based on tool type.
 * @param name - The tool name.
 * @param input - The raw input string (JSON).
 * @returns A React element or raw input string.
 */
function renderToolInput(name: string, input: string) {
    try {
        switch (name.toLowerCase()) {
            case 'bash': {
                const inputObj = JSON.parse(input);
                return (
                    <div className="w-full max-w-full overflow-hidden text-ellipsis truncate">
                        <div className="text-secondary-foreground">{inputObj.command}</div>
                        <div className="text-muted-foreground">{inputObj.description}</div>
                    </div>
                );
            }
            case 'read': {
                const inputObj = JSON.parse(input);
                return (
                    <div className="w-full max-w-full overflow-hidden text-ellipsis truncate">
                        <div className="text-secondary-foreground">{inputObj.file_path}</div>
                    </div>
                );
            }
            default:
                return input;
        }
    } catch {
        return input;
    }
}

/**
 * Card component for user confirmation of a pending tool call.
 * @param root0 - Component props.
 * @param root0.toolCall - The tool call block awaiting confirmation.
 * @param root0.onUserConfirm - Callback invoked with the user's decision.
 * @returns A confirmation card element.
 */
export function ConfirmCard({
    toolCall,
    onUserConfirm,
}: {
    toolCall: ToolCallBlock;
    onUserConfirm: (confirm: boolean) => void;
}) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<'yes' | 'no'>('yes');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                    e.preventDefault();
                    setSelected(prev => (prev === 'yes' ? 'no' : 'yes'));
                    break;
                case 'Enter':
                    e.preventDefault();
                    onUserConfirm(selected === 'yes');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onUserConfirm, selected]);

    return (
        <div className="ring ring-border rounded-xl w-full p-4 space-y-4 text-sm">
            <div className="flex flex-col gap-y-2">
                <strong className="text-secondary-foreground">
                    {renderToolName(toolCall.name)}
                </strong>
                <div className="px-4 py-2 bg-white rounded-sm">
                    {renderToolInput(toolCall.name, toolCall.input)}
                </div>
            </div>
            <div className="flex flex-col">
                <strong className="text-secondary-foreground mb-1">
                    {t('chat.confirmToolCall')}
                </strong>
                <Button
                    className={cn(
                        'flex justify-start cursor-pointer',
                        selected === 'yes' ? 'text-primary' : 'text-muted-foreground'
                    )}
                    size="sm"
                    variant="ghost"
                    onMouseEnter={() => setSelected('yes')}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        onUserConfirm(true);
                    }}
                >
                    <ChevronRight
                        className={cn('size-4', selected === 'yes' ? 'visible' : 'invisible')}
                    />
                    1. {t('common.yes')}
                    <div className={cn(selected === 'yes' ? 'text-muted-foreground' : 'invisible')}>
                        (<Kbd>Enter</Kbd> to confirm)
                    </div>
                </Button>
                <Button
                    className={cn(
                        'flex justify-start cursor-pointer',
                        selected === 'no' ? 'text-primary' : 'text-muted-foreground'
                    )}
                    size="sm"
                    variant="ghost"
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        onUserConfirm(false);
                    }}
                    onMouseEnter={() => setSelected('no')}
                >
                    <ChevronRight
                        className={cn('size-4', selected === 'no' ? 'visible' : 'invisible')}
                    />
                    2. {t('common.no')}
                    <div className={cn(selected === 'no' ? 'text-muted-foreground' : 'invisible')}>
                        (<Kbd>Enter</Kbd> to confirm)
                    </div>
                </Button>
            </div>
        </div>
    );
}
