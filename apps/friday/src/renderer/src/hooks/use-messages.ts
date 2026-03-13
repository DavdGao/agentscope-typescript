import {
    EventType,
    type AgentEvent,
    UserConfirmResultEvent,
} from '@agentscope-ai/agentscope/event';
import {
    ContentBlock,
    createMsg,
    Msg,
    ToolCallBlock,
    ToolResultBlock,
} from '@agentscope-ai/agentscope/message';
import { useState, useEffect, useRef, startTransition } from 'react';

interface StreamingMsg extends Msg {
    streaming?: boolean;
}

/**
 * A custom hook for managing chat messages within a session.
 *
 * @param sessionId - The ID of the current chat session.
 * @returns An object containing messages, sending state, and message sending function.
 */
export function useMessages(sessionId: string | null) {
    const [messages, setMessages] = useState<StreamingMsg[]>([]);
    const [sending, setSending] = useState(false);
    const prevSessionIdRef = useRef<string | null>(null);

    // Load historical messages and check running state when switching sessions
    useEffect(() => {
        if (!sessionId) {
            startTransition(() => {
                setMessages([]);
                setSending(false);
            });
            prevSessionIdRef.current = null;
            return;
        }

        // Clear messages only when switching from one session to another.
        // If switching from null to a value (creating a new session), do not clear messages to preserve optimistic updates.
        if (prevSessionIdRef.current !== null && prevSessionIdRef.current !== sessionId) {
            startTransition(() => {
                setMessages([]);
            });
        }
        prevSessionIdRef.current = sessionId;

        Promise.all([
            window.api.chat.getMessages(sessionId),
            window.api.chat.isRunning(sessionId),
        ]).then(([msgs, running]) => {
            startTransition(() => {
                setMessages(prev => {
                    // Positive update
                    const msgIds = new Set(msgs.map(m => m.id));
                    const localMsgs = prev.filter(m => !msgIds.has(m.id));
                    return [...msgs, ...localMsgs];
                });
                setSending(running);
            });
        });
    }, [sessionId]);

    // Subscribe to agent streaming events by sessionId, and automatically unsubscribe when switching sessions
    useEffect(() => {
        if (!sessionId) return;
        return window.api.agent.subscribe(sessionId, (event: AgentEvent) => {
            switch (event.type) {
                case EventType.RUN_STARTED: {
                    setSending(true);

                    // Check if the message for this run already exists (in case of historical messages)
                    setMessages(prev => {
                        const existingMsg = prev.find(m => m.id === event.replyId);
                        if (existingMsg) {
                            // Label the existing message as streaming
                            return prev.map(m =>
                                m.id === event.replyId ? { ...m, streaming: true } : m
                            );
                        } else {
                            // Create new message for this run
                            const newMsg: StreamingMsg = {
                                ...createMsg({
                                    id: event.replyId,
                                    role: event.role,
                                    name: event.name,
                                    content: [],
                                }),
                                streaming: true,
                            };
                            return [...prev, newMsg];
                        }
                    });
                    break;
                }

                case EventType.RUN_FINISHED: {
                    setSending(false);
                    setMessages(prev =>
                        prev.map(m => (m.id === event.replyId ? { ...m, streaming: false } : m))
                    );
                    break;
                }

                case EventType.MODEL_CALL_STARTED:
                    break;
                case EventType.MODEL_CALL_ENDED: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId) return m;

                            const currentUsage = m.usage || {
                                inputTokens: 0,
                                outputTokens: 0,
                            };

                            return {
                                ...m,
                                usage: {
                                    inputTokens: currentUsage.inputTokens + event.inputTokens,
                                    outputTokens: currentUsage.outputTokens + event.outputTokens,
                                },
                            };
                        });
                    });
                    break;
                }

                case EventType.TEXT_BLOCK_START: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId || !Array.isArray(m.content)) return m;

                            const existingBlock = m.content.find(
                                b => b.type === 'text' && b.id === event.blockId
                            );
                            if (existingBlock) return m;

                            return {
                                ...m,
                                content: [
                                    ...m.content,
                                    {
                                        type: 'text',
                                        id: event.blockId,
                                        text: '',
                                    },
                                ],
                            };
                        });
                    });
                    break;
                }

                case EventType.TEXT_BLOCK_DELTA: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId || !Array.isArray(m.content)) return m;

                            return {
                                ...m,
                                content: m.content.map(b => {
                                    if (b.type === 'text' && b.id === event.blockId) {
                                        return { ...b, text: b.text + event.delta };
                                    }
                                    return b;
                                }),
                            };
                        });
                    });
                    break;
                }

                case EventType.TEXT_BLOCK_END:
                    break;

                case EventType.THINKING_BLOCK_START: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId || !Array.isArray(m.content)) return m;

                            const existingBlock = m.content.find(
                                b => b.type === 'thinking' && b.id === event.blockId
                            );
                            if (existingBlock) return m;

                            return {
                                ...m,
                                content: [
                                    ...m.content,
                                    {
                                        type: 'thinking',
                                        id: event.blockId,
                                        thinking: '',
                                    },
                                ],
                            };
                        });
                    });
                    break;
                }

                case EventType.THINKING_BLOCK_DELTA: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId || !Array.isArray(m.content)) return m;

                            return {
                                ...m,
                                content: m.content.map(b => {
                                    if (b.type === 'thinking' && b.id === event.blockId) {
                                        return { ...b, thinking: b.thinking + event.delta };
                                    }
                                    return b;
                                }),
                            };
                        });
                    });
                    break;
                }

                case EventType.THINKING_BLOCK_END:
                    break;

                case EventType.BINARY_BLOCK_START: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId || !Array.isArray(m.content)) return m;

                            const existingBlock = m.content.find(
                                b => b.type === 'data' && b.id === event.blockId
                            );
                            if (existingBlock) return m;

                            return {
                                ...m,
                                content: [
                                    ...m.content,
                                    {
                                        type: 'data',
                                        id: event.blockId,
                                        source: {
                                            type: 'base64',
                                            data: '',
                                            mediaType: event.mediaType,
                                        },
                                    },
                                ],
                            };
                        });
                    });
                    break;
                }

                case EventType.BINARY_BLOCK_DELTA: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId || !Array.isArray(m.content)) return m;

                            return {
                                ...m,
                                content: m.content.map(b => {
                                    if (
                                        b.type === 'data' &&
                                        b.id === event.blockId &&
                                        b.source.type === 'base64'
                                    ) {
                                        return {
                                            ...b,
                                            source: {
                                                ...b.source,
                                                data: b.source.data + event.data,
                                            },
                                        };
                                    }
                                    return b;
                                }),
                            };
                        });
                    });
                    break;
                }

                case EventType.BINARY_BLOCK_END:
                    break;

                case EventType.TOOL_CALL_START: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId || !Array.isArray(m.content)) return m;

                            const existingBlock = m.content.find(
                                b => b.type === 'tool_call' && b.id === event.toolCallId
                            );
                            if (existingBlock) return m;

                            return {
                                ...m,
                                content: [
                                    ...m.content,
                                    {
                                        type: 'tool_call',
                                        id: event.toolCallId,
                                        name: event.toolCallName,
                                        input: '',
                                    },
                                ],
                            };
                        });
                    });
                    break;
                }

                case EventType.TOOL_CALL_DELTA: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId || !Array.isArray(m.content)) return m;

                            return {
                                ...m,
                                content: m.content.map(b => {
                                    if (
                                        b.type === 'tool_call' &&
                                        b.id === event.toolCallId &&
                                        typeof b.input === 'string'
                                    ) {
                                        return { ...b, input: b.input + event.delta };
                                    }
                                    return b;
                                }),
                            };
                        });
                    });
                    break;
                }

                case EventType.TOOL_CALL_END:
                    break;

                case EventType.TOOL_RESULT_START: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId || !Array.isArray(m.content)) return m;

                            const existingBlock = m.content.find(
                                b => b.type === 'tool_result' && b.id === event.toolCallId
                            );
                            if (existingBlock) return m;

                            return {
                                ...m,
                                content: [
                                    ...m.content,
                                    {
                                        type: 'tool_result',
                                        id: event.toolCallId,
                                        name: event.toolCallName,
                                        output: [],
                                        state: 'running',
                                    },
                                ],
                            };
                        });
                    });
                    break;
                }

                case EventType.TOOL_RESULT_TEXT_DELTA: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId || !Array.isArray(m.content)) return m;

                            return {
                                ...m,
                                content: m.content.map(b => {
                                    if (b.type === 'tool_result' && b.id === event.toolCallId) {
                                        const output = Array.isArray(b.output) ? b.output : [];
                                        const lastOutput = output[output.length - 1];

                                        if (lastOutput && lastOutput.type === 'text') {
                                            return {
                                                ...b,
                                                output: [
                                                    ...output.slice(0, -1),
                                                    {
                                                        ...lastOutput,
                                                        text: lastOutput.text + event.delta,
                                                    },
                                                ],
                                            };
                                        } else {
                                            return {
                                                ...b,
                                                output: [
                                                    ...output,
                                                    {
                                                        type: 'text',
                                                        id: crypto.randomUUID(),
                                                        text: event.delta,
                                                    },
                                                ],
                                            };
                                        }
                                    }
                                    return b;
                                }),
                            };
                        });
                    });
                    break;
                }

                case EventType.TOOL_RESULT_BINARY_DELTA: {
                    setMessages(prev => {
                        return prev.map(m => {
                            if (m.id !== event.replyId || !Array.isArray(m.content)) return m;

                            return {
                                ...m,
                                content: m.content.map(b => {
                                    if (b.type === 'tool_result' && b.id === event.toolCallId) {
                                        const output = Array.isArray(b.output) ? b.output : [];
                                        return {
                                            ...b,
                                            output: [
                                                ...output,
                                                {
                                                    type: 'data',
                                                    id: crypto.randomUUID(),
                                                    source: event.url
                                                        ? {
                                                              type: 'url',
                                                              url: event.url,
                                                              mediaType: event.mediaType,
                                                          }
                                                        : {
                                                              type: 'base64',
                                                              data: event.data || '',
                                                              mediaType: event.mediaType,
                                                          },
                                                },
                                            ],
                                        };
                                    }
                                    return b;
                                }),
                            };
                        });
                    });
                    break;
                }

                case EventType.TOOL_RESULT_END:
                    // Update the state of the tool result block to 'success' if it is still 'running'
                    console.error('Tool result end', event);
                    setMessages(prev => {
                        const msg = prev.find(m => m.id === event.replyId);
                        if (!msg || !Array.isArray(msg.content)) return prev;

                        const newContent = msg.content.map(b => {
                            if (b.type === 'tool_result' && b.id === event.toolCallId) {
                                if (b.state === 'running') {
                                    return { ...b, state: event.state } as ToolResultBlock;
                                }
                            }
                            return b;
                        });

                        return prev.map(m =>
                            m.id === event.replyId ? { ...m, content: newContent } : m
                        );
                    });
                    break;

                case EventType.REQUIRE_USER_CONFIRM:
                    // Set the awaitingConfirm state of the corresponding toolcall to true, and the frontend displays the confirmation button based on this state
                    setMessages(prev => {
                        const msg = prev.find(m => m.id === event.replyId);
                        if (!msg || !Array.isArray(msg.content)) return prev;

                        const toolCallIds = event.toolCalls.map(tc => tc.id);

                        const newContent = msg.content.map(b => {
                            if (b.type === 'tool_call' && toolCallIds.includes(b.id)) {
                                return { ...b, awaitUserConfirmation: true }; // ✅ 返回新对象
                            }
                            return b;
                        });

                        return prev.map(m =>
                            m.id === event.replyId
                                ? { ...m, content: newContent } // ✅ 返回新的 msg 对象
                                : m
                        );
                    });
            }
        });
    }, [sessionId]);

    const sendMessage = async (content: ContentBlock[], sessionId: string, agentKey: string) => {
        if (content.length === 0) return;
        setSending(true);
        const message = createMsg({
            id: crypto.randomUUID(),
            role: 'user',
            name: 'user',
            content,
        });
        // Positive update for user message
        setMessages(prev => [...prev, message]);
        await window.api.chat.sendMessage(sessionId, agentKey, message);
    };

    const sendUserConfirm = async (
        toolCall: ToolCallBlock,
        confirm: boolean,
        replyId: string,
        sessionId: string,
        agentKey: string
    ) => {
        await window.api.chat.sendMessage(sessionId, agentKey, undefined, {
            type: EventType.USER_CONFIRM_RESULT,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            replyId: replyId,
            confirmResults: [
                {
                    confirmed: confirm,
                    toolCall: toolCall,
                },
            ],
        } as UserConfirmResultEvent);
    };

    return { messages, sending, sendMessage, sendUserConfirm };
}
