import { EventType, type AgentEvent } from '@agentscope-ai/agentscope/event';
import { createMsg, Msg, ToolResultBlock } from '@agentscope-ai/agentscope/message';
import type { Dispatch, SetStateAction } from 'react';

export interface StreamingMsg extends Msg {
    streaming?: boolean;
}

/**
 * Applies an agent event to update message and sending state.
 * @param event
 * @param setMessages
 * @param setSending
 */
export function applyAgentEvent(
    event: AgentEvent,
    setMessages: Dispatch<SetStateAction<StreamingMsg[]>>,
    setSending: Dispatch<SetStateAction<boolean>>
) {
    switch (event.type) {
        case EventType.RUN_STARTED: {
            setSending(true);
            setMessages(prev => {
                const existingMsg = prev.find(m => m.id === event.replyId);
                if (existingMsg) {
                    return prev.map(m => (m.id === event.replyId ? { ...m, streaming: true } : m));
                }
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
            setMessages(prev =>
                prev.map(m => {
                    if (m.id !== event.replyId) return m;
                    const currentUsage = m.usage || { inputTokens: 0, outputTokens: 0 };
                    return {
                        ...m,
                        usage: {
                            inputTokens: currentUsage.inputTokens + event.inputTokens,
                            outputTokens: currentUsage.outputTokens + event.outputTokens,
                        },
                    };
                })
            );
            break;
        }

        case EventType.TEXT_BLOCK_START: {
            setMessages(prev =>
                prev.map(m => {
                    if (m.id !== event.replyId || !Array.isArray(m.content)) return m;
                    if (m.content.find(b => b.type === 'text' && b.id === event.blockId)) return m;
                    return {
                        ...m,
                        content: [...m.content, { type: 'text', id: event.blockId, text: '' }],
                    };
                })
            );
            break;
        }

        case EventType.TEXT_BLOCK_DELTA: {
            setMessages(prev =>
                prev.map(m => {
                    if (m.id !== event.replyId || !Array.isArray(m.content)) return m;
                    return {
                        ...m,
                        content: m.content.map(b =>
                            b.type === 'text' && b.id === event.blockId
                                ? { ...b, text: b.text + event.delta }
                                : b
                        ),
                    };
                })
            );
            break;
        }

        case EventType.TEXT_BLOCK_END:
            break;

        case EventType.THINKING_BLOCK_START: {
            setMessages(prev =>
                prev.map(m => {
                    if (m.id !== event.replyId || !Array.isArray(m.content)) return m;
                    if (m.content.find(b => b.type === 'thinking' && b.id === event.blockId))
                        return m;
                    return {
                        ...m,
                        content: [
                            ...m.content,
                            { type: 'thinking', id: event.blockId, thinking: '' },
                        ],
                    };
                })
            );
            break;
        }

        case EventType.THINKING_BLOCK_DELTA: {
            setMessages(prev =>
                prev.map(m => {
                    if (m.id !== event.replyId || !Array.isArray(m.content)) return m;
                    return {
                        ...m,
                        content: m.content.map(b =>
                            b.type === 'thinking' && b.id === event.blockId
                                ? { ...b, thinking: b.thinking + event.delta }
                                : b
                        ),
                    };
                })
            );
            break;
        }

        case EventType.THINKING_BLOCK_END:
            break;

        case EventType.BINARY_BLOCK_START: {
            setMessages(prev =>
                prev.map(m => {
                    if (m.id !== event.replyId || !Array.isArray(m.content)) return m;
                    if (m.content.find(b => b.type === 'data' && b.id === event.blockId)) return m;
                    return {
                        ...m,
                        content: [
                            ...m.content,
                            {
                                type: 'data',
                                id: event.blockId,
                                source: { type: 'base64', data: '', mediaType: event.mediaType },
                            },
                        ],
                    };
                })
            );
            break;
        }

        case EventType.BINARY_BLOCK_DELTA: {
            setMessages(prev =>
                prev.map(m => {
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
                                    source: { ...b.source, data: b.source.data + event.data },
                                };
                            }
                            return b;
                        }),
                    };
                })
            );
            break;
        }

        case EventType.BINARY_BLOCK_END:
            break;

        case EventType.TOOL_CALL_START: {
            setMessages(prev =>
                prev.map(m => {
                    if (m.id !== event.replyId || !Array.isArray(m.content)) return m;
                    if (m.content.find(b => b.type === 'tool_call' && b.id === event.toolCallId))
                        return m;
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
                })
            );
            break;
        }

        case EventType.TOOL_CALL_DELTA: {
            setMessages(prev =>
                prev.map(m => {
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
                })
            );
            break;
        }

        case EventType.TOOL_CALL_END:
            break;

        case EventType.TOOL_RESULT_START: {
            setMessages(prev =>
                prev.map(m => {
                    if (m.id !== event.replyId || !Array.isArray(m.content)) return m;
                    if (m.content.find(b => b.type === 'tool_result' && b.id === event.toolCallId))
                        return m;
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
                })
            );
            break;
        }

        case EventType.TOOL_RESULT_TEXT_DELTA: {
            setMessages(prev =>
                prev.map(m => {
                    if (m.id !== event.replyId || !Array.isArray(m.content)) return m;
                    return {
                        ...m,
                        content: m.content.map(b => {
                            if (b.type === 'tool_result' && b.id === event.toolCallId) {
                                const output = Array.isArray(b.output) ? b.output : [];
                                const last = output[output.length - 1];
                                if (last && last.type === 'text') {
                                    return {
                                        ...b,
                                        output: [
                                            ...output.slice(0, -1),
                                            { ...last, text: last.text + event.delta },
                                        ],
                                    };
                                }
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
                            return b;
                        }),
                    };
                })
            );
            break;
        }

        case EventType.TOOL_RESULT_BINARY_DELTA: {
            setMessages(prev =>
                prev.map(m => {
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
                })
            );
            break;
        }

        case EventType.TOOL_RESULT_END: {
            setMessages(prev => {
                const msg = prev.find(m => m.id === event.replyId);
                if (!msg || !Array.isArray(msg.content)) return prev;
                const newContent = msg.content.map(b => {
                    if (
                        b.type === 'tool_result' &&
                        b.id === event.toolCallId &&
                        b.state === 'running'
                    ) {
                        return { ...b, state: event.state } as ToolResultBlock;
                    }
                    return b;
                });
                return prev.map(m => (m.id === event.replyId ? { ...m, content: newContent } : m));
            });
            break;
        }

        case EventType.REQUIRE_USER_CONFIRM: {
            setMessages(prev => {
                const msg = prev.find(m => m.id === event.replyId);
                if (!msg || !Array.isArray(msg.content)) return prev;
                const toolCallIds = event.toolCalls.map(tc => tc.id);
                const newContent = msg.content.map(b => {
                    if (b.type === 'tool_call' && toolCallIds.includes(b.id)) {
                        return { ...b, awaitUserConfirmation: true };
                    }
                    return b;
                });
                return prev.map(m => (m.id === event.replyId ? { ...m, content: newContent } : m));
            });
            break;
        }
    }
}
