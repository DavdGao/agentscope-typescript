import { ContentBlock, Msg, ToolCallBlock } from '@agentscope-ai/agentscope/message';
import React from 'react';
import { useRef, useEffect } from 'react';

import { MessageBubble } from '@/components/chat/MessageBubble';
import { TextInput } from '@/components/input/TextInput';

interface ChatContentProps {
    msgs: Msg[];
    sending: boolean;
    onSend: (content: ContentBlock[]) => void;
    onUserConfirm: (toolCall: ToolCallBlock, confirm: boolean, replyId: string) => void;
    autoComplete?: (input: string) => string | null;
}

const ChatContentComponent: React.FC<ChatContentProps> = ({
    msgs,
    sending,
    onSend,
    onUserConfirm,
    autoComplete,
}) => {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const prevMsgCountRef = useRef<number>(0);
    const wasNearBottomRef = useRef<boolean>(true);

    // Auto-scroll to bottom only if user is already near the bottom
    useEffect(() => {
        const currentCount = msgs.length;
        const prevCount = prevMsgCountRef.current;

        const shouldCheck =
            (currentCount > prevCount && prevCount > 0) || (sending && prevCount > 0);

        if (shouldCheck && scrollAreaRef.current) {
            const { scrollHeight } = scrollAreaRef.current;

            // Check if user was near bottom before content changed
            const isNearBottom = wasNearBottomRef.current;

            if (isNearBottom) {
                scrollAreaRef.current.scrollTo({
                    top: scrollHeight,
                    behavior: 'smooth',
                });
            }
        }

        prevMsgCountRef.current = currentCount;
    }, [msgs, sending]);

    // Track if user is near bottom whenever they scroll
    useEffect(() => {
        const scrollArea = scrollAreaRef.current;
        if (!scrollArea) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollArea;
            wasNearBottomRef.current = scrollTop + clientHeight >= scrollHeight - 50;
        };

        scrollArea.addEventListener('scroll', handleScroll);
        return () => scrollArea.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="flex flex-col h-full items-center p-2 gap-4">
            <div
                ref={scrollAreaRef}
                className="flex-1 w-full max-w-[700px] overflow-y-auto [&_[data-slot='scroll-area-scrollbar']]:hidden"
            >
                {/**/}
                <div className="flex flex-col gap-4 pr-4 w-full max-w-full">
                    {msgs.map(message => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            onUserConfirm={onUserConfirm}
                        />
                    ))}
                </div>
            </div>
            <TextInput
                className="min-w-[700px] max-w-[700px]"
                onSend={onSend}
                disabled={sending}
                autoComplete={autoComplete}
            />
        </div>
    );
};

export const ChatContent = React.memo(ChatContentComponent);
