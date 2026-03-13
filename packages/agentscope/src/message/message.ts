import { JSONSerializableObject } from '../type';
import {
    ContentBlock,
    TextBlock,
    ThinkingBlock,
    ToolResultBlock,
    ToolCallBlock,
    DataBlock,
} from './block';

/** A chat message exchanged between agents or between an agent and a model. */
export interface Msg {
    /** Unique identifier for the message. */
    id: string;
    /** Display name of the message sender. */
    name: string;
    /** Conversation role of the sender. */
    role: 'user' | 'assistant' | 'system';
    /** Message body. */
    content: ContentBlock[];
    /** Arbitrary key-value metadata attached to the message. */
    metadata: Record<string, JSONSerializableObject>;
    /** ISO-8601 creation timestamp. */
    timestamp: string;
    /** Usage information for the message, such as token counts. */
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}

/**
 * Create a new {@link Msg} object, filling in `id` and `timestamp` when omitted.
 *
 * @param root0
 * @param root0.name
 * @param root0.content
 * @param root0.role
 * @param root0.metadata
 * @param root0.id
 * @param root0.timestamp
 * @param root0.usage
 * @returns A fully-populated {@link Msg} object.
 */
export function createMsg({
    name,
    content,
    role,
    metadata = {},
    id = crypto.randomUUID(),
    timestamp = new Date().toISOString(),
    usage,
}: Omit<Msg, 'id' | 'timestamp' | 'metadata'> &
    Partial<Pick<Msg, 'id' | 'timestamp' | 'metadata'>>): Msg {
    return { id, name, role, content, metadata, timestamp, usage } as Msg;
}

/**
 * Extract the plain-text content from a message.
 *
 * When `content` is a string it is returned as-is. When it is an array of
 * content blocks, all {@link TextBlock} texts are joined with `separator`.
 *
 * @param msg - The message to read.
 * @param separator - String inserted between consecutive text blocks. Defaults to `'\n'`.
 * @returns The concatenated text, or `null` when no text blocks are present.
 */
export function getTextContent(msg: Msg, separator: string = '\n'): string | null {
    const textBlocks = msg.content.filter(block => block.type === 'text');
    if (textBlocks.length === 0) {
        return null;
    }
    return textBlocks.map(block => (block as TextBlock).text).join(separator);
}

/**
 * Return all content blocks from a message, regardless of type.
 *
 * When `content` is a plain string it is wrapped in a single {@link TextBlock}.
 *
 * @param msg - The message to read.
 * @returns An array of all {@link ContentBlock} objects.
 */
export function getContentBlocks(msg: Msg): ContentBlock[];
/**
 * Return all {@link TextBlock} objects from a message.
 *
 * @param msg - The message to read.
 * @param blockType - `'text'`
 * @returns An array of {@link TextBlock} objects.
 */
export function getContentBlocks(msg: Msg, blockType: 'text'): TextBlock[];
/**
 * Return all {@link ThinkingBlock} objects from a message.
 *
 * @param msg - The message to read.
 * @param blockType - `'thinking'`
 * @returns An array of {@link ThinkingBlock} objects.
 */
export function getContentBlocks(msg: Msg, blockType: 'thinking'): ThinkingBlock[];
/**
 * Return all {@link DataBlock} objects from a message.
 *
 * @param msg - The message to read.
 * @param blockType - `'video'`
 * @returns An array of {@link DataBlock} objects.
 */
export function getContentBlocks(msg: Msg, blockType: 'data'): DataBlock[];
/**
 * Return all {@link ToolCallBlock} objects from a message.
 *
 * @param msg - The message to read.
 * @param blockType - `'tool_call'`
 * @returns An array of {@link ToolCallBlock} objects.
 */
export function getContentBlocks(msg: Msg, blockType: 'tool_call'): ToolCallBlock[];
/**
 * Return all {@link ToolResultBlock} objects from a message.
 *
 * @param msg - The message to read.
 * @param blockType - `'tool_result'`
 * @returns An array of {@link ToolResultBlock} objects.
 */
export function getContentBlocks(msg: Msg, blockType: 'tool_result'): ToolResultBlock[];
export function getContentBlocks(
    msg: Msg,
    blockType?: 'text' | 'thinking' | 'data' | 'tool_call' | 'tool_result'
): ContentBlock[] {
    if (!blockType) return msg.content;
    return msg.content.filter(block => block.type === blockType);
}
