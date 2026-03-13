import { ToolCallBlock, ToolResultBlock } from '../message';

export enum EventType {
    RUN_STARTED = 'RUN_STARTED',
    RUN_FINISHED = 'RUN_FINISHED',

    MODEL_CALL_STARTED = 'MODEL_CALL_STARTED',
    MODEL_CALL_ENDED = 'MODEL_CALL_ENDED',

    TEXT_BLOCK_START = 'TEXT_BLOCK_START',
    TEXT_BLOCK_DELTA = 'TEXT_BLOCK_DELTA',
    TEXT_BLOCK_END = 'TEXT_BLOCK_END',

    BINARY_BLOCK_START = 'BINARY_BLOCK_START',
    BINARY_BLOCK_DELTA = 'BINARY_BLOCK_DELTA',
    BINARY_BLOCK_END = 'BINARY_BLOCK_END',

    THINKING_BLOCK_START = 'THINKING_BLOCK_START',
    THINKING_BLOCK_DELTA = 'THINKING_BLOCK_DELTA',
    THINKING_BLOCK_END = 'THINKING_BLOCK_END',

    TOOL_CALL_START = 'TOOL_CALL_START',
    TOOL_CALL_DELTA = 'TOOL_CALL_DELTA',
    TOOL_CALL_END = 'TOOL_CALL_END',

    TOOL_RESULT_START = 'TOOL_RESULT_START',
    TOOL_RESULT_TEXT_DELTA = 'TOOL_RESULT_TEXT_DELTA',
    TOOL_RESULT_BINARY_DELTA = 'TOOL_RESULT_BINARY_DELTA',
    TOOL_RESULT_END = 'TOOL_RESULT_END',

    EXCEED_MAX_ITERS = 'EXCEED_MAX_ITERS',

    REQUIRE_USER_CONFIRM = 'REQUIRE_USER_CONFIRM',
    REQUIRE_EXTERNAL_EXECUTION = 'REQUIRE_EXTERNAL_EXECUTION',

    USER_CONFIRM_RESULT = 'USER_CONFIRM_RESULT',
    EXTERNAL_EXECUTION_RESULT = 'EXTERNAL_EXECUTION_RESULT',
}

export interface EventBase {
    id: string;
    createdAt: string;
}

export interface RunStartedEvent extends EventBase {
    type: EventType.RUN_STARTED;
    sessionId: string;
    replyId: string;

    // Extra fields for AG-UI protocol
    name: string;
    role: 'user' | 'assistant' | 'system';
}

export interface RunFinishedEvent extends EventBase {
    type: EventType.RUN_FINISHED;
    sessionId: string;
    replyId: string;
}

export interface ModelCallStartedEvent extends EventBase {
    type: EventType.MODEL_CALL_STARTED;
    replyId: string;
    modelName: string;
}

export interface ModelCallEndedEvent extends EventBase {
    type: EventType.MODEL_CALL_ENDED;
    replyId: string;
    inputTokens: number;
    outputTokens: number;
}

export interface TextBlockStartEvent extends EventBase {
    type: EventType.TEXT_BLOCK_START;
    blockId: string;
    replyId: string;
}

export interface TextBlockDeltaEvent extends EventBase {
    type: EventType.TEXT_BLOCK_DELTA;
    replyId: string;
    blockId: string;
    delta: string;
}

export interface TextBlockEndEvent extends EventBase {
    type: EventType.TEXT_BLOCK_END;
    replyId: string;
    blockId: string;
}

export interface BinaryBlockStartEvent extends EventBase {
    type: EventType.BINARY_BLOCK_START;
    replyId: string;
    blockId: string;
    mediaType: string;
}

export interface BinaryBlockDeltaEvent extends EventBase {
    type: EventType.BINARY_BLOCK_DELTA;
    replyId: string;
    blockId: string;
    data: string;
    mediaType: string;
}

export interface BinaryBlockEndEvent extends EventBase {
    type: EventType.BINARY_BLOCK_END;
    replyId: string;
    blockId: string;
}

export interface ThinkingBlockStartEvent extends EventBase {
    type: EventType.THINKING_BLOCK_START;
    replyId: string;
    blockId: string;
}

export interface ThinkingBlockDeltaEvent extends EventBase {
    type: EventType.THINKING_BLOCK_DELTA;
    replyId: string;
    blockId: string;
    delta: string;
}

export interface ThinkingBlockEndEvent extends EventBase {
    type: EventType.THINKING_BLOCK_END;
    replyId: string;
    blockId: string;
}

export interface ToolCallStartEvent extends EventBase {
    type: EventType.TOOL_CALL_START;
    replyId: string;
    toolCallId: string;
    toolCallName: string;
}

export interface ToolCallDeltaEvent extends EventBase {
    type: EventType.TOOL_CALL_DELTA;
    replyId: string;
    toolCallId: string;
    delta: string;
}

export interface ToolCallEndEvent extends EventBase {
    type: EventType.TOOL_CALL_END;
    replyId: string;
    toolCallId: string;
}

export interface ToolResultStartEvent extends EventBase {
    type: EventType.TOOL_RESULT_START;
    replyId: string;
    toolCallId: string;
    toolCallName: string;
}

export interface ToolResultTextDeltaEvent extends EventBase {
    type: EventType.TOOL_RESULT_TEXT_DELTA;
    replyId: string;
    toolCallId: string;
    delta: string;
}

export interface ToolResultBinaryDeltaEvent extends EventBase {
    type: EventType.TOOL_RESULT_BINARY_DELTA;
    replyId: string;
    toolCallId: string;
    mediaType: string;
    data?: string;
    url?: string;
}

export interface ToolResultEndEvent extends EventBase {
    type: EventType.TOOL_RESULT_END;
    replyId: string;
    toolCallId: string;
    state: ToolResultBlock['state'];
}

export interface ExceedMaxItersEvent extends EventBase {
    type: EventType.EXCEED_MAX_ITERS;

    replyId: string;
    agentId: string;
    name: string;
}

export interface RequireUserConfirmEvent extends EventBase {
    type: EventType.REQUIRE_USER_CONFIRM;

    replyId: string;
    toolCalls: ToolCallBlock[];
}

export interface RequireExternalExecutionEvent extends EventBase {
    type: EventType.REQUIRE_EXTERNAL_EXECUTION;

    replyId: string;
    toolCalls: ToolCallBlock[];
}

export interface UserConfirmResultEvent extends EventBase {
    type: EventType.USER_CONFIRM_RESULT;

    replyId: string;
    confirmResults: {
        confirmed: boolean;
        toolCall: ToolCallBlock;
    }[];
}

export interface ExternalExecutionResultEvent extends EventBase {
    type: EventType.EXTERNAL_EXECUTION_RESULT;

    replyId: string;
    executionResults: ToolResultBlock[];
}

export type AgentEvent =
    // The control events for the whole run
    | RunStartedEvent
    | RunFinishedEvent
    | ExceedMaxItersEvent
    | RequireUserConfirmEvent
    | RequireExternalExecutionEvent
    | ModelCallStartedEvent
    | ModelCallEndedEvent
    // The data events for different block types
    | TextBlockStartEvent
    | TextBlockDeltaEvent
    | TextBlockEndEvent
    | BinaryBlockStartEvent
    | BinaryBlockDeltaEvent
    | BinaryBlockEndEvent
    | ThinkingBlockStartEvent
    | ThinkingBlockDeltaEvent
    | ThinkingBlockEndEvent
    | ToolCallStartEvent
    | ToolCallDeltaEvent
    | ToolCallEndEvent
    | ToolResultStartEvent
    | ToolResultTextDeltaEvent
    | ToolResultBinaryDeltaEvent
    | ToolResultEndEvent
    // The events from the external execution or user confirmation
    | UserConfirmResultEvent
    | ExternalExecutionResultEvent;
