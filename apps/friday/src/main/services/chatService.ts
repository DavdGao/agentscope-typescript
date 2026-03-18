import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

import { AgentOptions } from '@agentscope-ai/agentscope/agent';
import {
    UserConfirmResultEvent,
    ExternalExecutionResultEvent,
} from '@agentscope-ai/agentscope/event';
import type { Msg } from '@agentscope-ai/agentscope/message';
import { createMsg } from '@agentscope-ai/agentscope/message';
import { LocalFileStorage } from '@agentscope-ai/agentscope/storage';
import type { Session, GetSessionsQuery, GetSessionsResult } from '@shared/types/chat';
import type { IpcMain, WebContents } from 'electron';

import { runAgent } from '../agent';
import { getConfig } from '../config';
import { readJSON, writeJSON, appendJSONL, readJSONL, remove } from '../storage';
import { getModel, getToolkit } from './utils';
import { PATHS } from '../storage/paths';

/**
 * Register IPC handlers for chat-related operations
 *
 * @param ipcMain - The Electron IPC main instance
 * @param webContents - The web contents for sending events
 */
export function registerChatHandlers(ipcMain: IpcMain, webContents: WebContents): void {
    const service = new ChatService();
    const runningSessions = new Set<string>();

    ipcMain.handle('chat:getSessions', (_event, query: GetSessionsQuery) => {
        return service.getSessions(query);
    });

    ipcMain.handle('chat:createSession', (_event, name?: string) => {
        return service.createSession(name);
    });

    ipcMain.handle('chat:renameSession', (_event, id: string, name: string) => {
        return service.renameSession(id, name);
    });

    ipcMain.handle('chat:pinSession', (_event, id: string, pinned: boolean) => {
        return service.pinSession(id, pinned);
    });

    ipcMain.handle('chat:deleteSession', (_event, id: string) => {
        return service.deleteSession(id);
    });

    ipcMain.handle('chat:getMessages', (_event, sessionId: string) => {
        return service.getMessages(sessionId);
    });

    ipcMain.handle('chat:isRunning', (_event, sessionId: string) => {
        return runningSessions.has(sessionId);
    });

    ipcMain.handle('chat:addMessage', (_event, sessionId: string, message: Msg) => {
        // IPC transmission loses object methods, need to recreate Msg object
        const msg = createMsg(message);
        return service.addMessage(sessionId, msg);
    });

    // User sends message → store user message → call agent → stream push AgentEvent → store assistant message
    ipcMain.handle(
        'chat:sendMessage',
        async (
            _event,
            sessionId: string,
            agentKey: string = 'friday',
            msg?: Msg,
            event?: UserConfirmResultEvent | ExternalExecutionResultEvent
        ) => {
            const config = getConfig();

            // Get agent configuration
            const agentConfig = config.agents?.[agentKey];
            if (!agentConfig) {
                throw new Error(`Agent configuration not found: ${agentKey}`);
            }

            // Get model configuration from agent's modelKey
            let modelConfig = config.models?.[agentConfig.modelKey];

            // Fallback: if the configured model doesn't exist, try to use the first available model
            if (!modelConfig && Object.keys(config.models || {}).length > 0) {
                const firstModelKey = Object.keys(config.models)[0];
                modelConfig = config.models[firstModelKey];
                console.warn(
                    `Model "${agentConfig.modelKey}" not found for agent "${agentConfig.name}". Using "${firstModelKey}" instead.`
                );
            }

            if (!modelConfig) {
                throw new Error(
                    `No model configured. Please configure a model in Settings > Models first.`
                );
            }

            const model = getModel(modelConfig);

            const storage = new LocalFileStorage({
                pathSegments: [PATHS.root, 'chat', sessionId],
                offloadPathSegments: [PATHS.offloadDir(sessionId)],
            });

            // tool
            const toolkit = await getToolkit(sessionId);

            // Build system prompt
            let sysPrompt: string;
            if (agentKey === 'friday') {
                // Friday is the only builtin agent with a fixed system prompt
                sysPrompt = `You're a helpful assistant named friday.


`;
            } else {
                // Custom agents use their configured system prompt
                sysPrompt = agentConfig.systemPrompt || '';
            }

            // Append user instruction if provided
            if (agentConfig.instruction) {
                sysPrompt += `\n\n${agentConfig.instruction}`;
            }

            const agentOptions: AgentOptions = {
                name: agentConfig.name,
                sysPrompt,
                model,
                maxIters: agentConfig.maxIters,
                compressionConfig: {
                    enabled: true,
                    triggerThreshold: agentConfig.compressionTrigger,
                    keepRecent: agentConfig.compressionKeepRecent,
                },
                storage,
                toolkit,
            };

            // 3. Call agent, each AgentEvent is pushed to agent:event:{sessionId}
            runningSessions.add(sessionId);
            try {
                await runAgent(
                    agentOptions,
                    event => webContents.send(`agent:event:${sessionId}`, event),
                    msg,
                    event
                );
            } finally {
                runningSessions.delete(sessionId);
            }
        }
    );
}

/**
 * Service class for managing chat sessions and messages
 */
export class ChatService {
    private sessionsIndexPath = path.join(PATHS.root, 'chat', 'index.json');

    // ─── Session ─────────────────────────────────────────────────────────────

    /**
     * Load all sessions from storage
     *
     * @returns Array of all sessions
     */
    private loadSessions(): Session[] {
        return readJSON<Session[]>(this.sessionsIndexPath, []);
    }

    /**
     * Save sessions to storage
     *
     * @param sessions - Array of sessions to save
     */
    private saveSessions(sessions: Session[]): void {
        writeJSON(this.sessionsIndexPath, sessions);
    }

    /**
     * Get sessions with pagination and pinned sessions
     *
     * @param query - Query parameters for pagination
     * @returns Result containing pinned sessions and paginated items
     */
    getSessions(query: GetSessionsQuery): GetSessionsResult {
        const { offset, limit } = query;
        const sessions = this.loadSessions();

        // pinned: return all, sorted by updatedAt descending
        const pinned = sessions.filter(s => s.pinned).sort((a, b) => b.updatedAt - a.updatedAt);

        // non-pinned: sorted by updatedAt descending, then paginated
        const unpinned = sessions.filter(s => !s.pinned).sort((a, b) => b.updatedAt - a.updatedAt);

        const total = unpinned.length;
        const items = unpinned.slice(offset, offset + limit);

        return {
            pinned,
            items,
            total,
            hasMore: offset + limit < total,
        };
    }

    /**
     * Create a new chat session
     *
     * @param name - Optional name for the session
     * @returns The created session
     */
    createSession(name?: string): Session {
        const sessions = this.loadSessions();
        const now = Date.now();
        const session: Session = {
            id: randomUUID(),
            name: name ?? `Session ${sessions.length + 1}`,
            pinned: false,
            createdAt: now,
            updatedAt: now,
        };
        sessions.push(session);
        this.saveSessions(sessions);

        // Create an empty JSONL file (not a JSON array)
        const messagesPath = PATHS.chatContext(session.id, 'friday');
        // Ensure the directory exists
        fs.mkdirSync(path.dirname(messagesPath), { recursive: true });
        fs.writeFileSync(messagesPath, '', 'utf-8');

        return session;
    }

    /**
     * Rename a session
     *
     * @param id - The session ID
     * @param name - The new name
     * @returns The updated session
     */
    renameSession(id: string, name: string): Session {
        const sessions = this.loadSessions();
        const session = sessions.find(s => s.id === id);
        if (!session) throw new Error(`Session not found: ${id}`);

        session.name = name;
        session.updatedAt = Date.now();
        this.saveSessions(sessions);
        return session;
    }

    /**
     * Pin or unpin a session
     *
     * @param id - The session ID
     * @param pinned - Whether to pin the session
     * @returns The updated session
     */
    pinSession(id: string, pinned: boolean): Session {
        const sessions = this.loadSessions();
        const session = sessions.find(s => s.id === id);
        if (!session) throw new Error(`Session not found: ${id}`);

        session.pinned = pinned;
        this.saveSessions(sessions);
        return session;
    }

    /**
     * Delete a session and its messages
     *
     * @param id - The session ID to delete
     */
    deleteSession(id: string): void {
        const sessions = this.loadSessions();
        const filtered = sessions.filter(s => s.id !== id);
        this.saveSessions(filtered);

        // Delete session directory (cascade delete)
        remove(PATHS.chatDir(id));
    }

    // ─── Message ─────────────────────────────────────────────────────────────

    /**
     * Get all messages for a session
     *
     * @param sessionId - The session ID
     * @returns Array of messages
     */
    getMessages(sessionId: string): Msg[] {
        const sessions = this.loadSessions();
        if (!sessions.find(s => s.id === sessionId)) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        return readJSONL<Msg>(PATHS.chatContext(sessionId, 'friday'));
    }

    /**
     * Add a message to a session
     * TODO: remove addMessage interface
     *
     * @param sessionId - The session ID
     * @param message - The message to add
     * @returns The added message
     */
    addMessage(sessionId: string, message: Msg): Msg {
        const sessions = this.loadSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) throw new Error(`Session not found: ${sessionId}`);

        appendJSONL(PATHS.chatContext(sessionId, 'friday'), message);

        session.updatedAt = Date.now();
        this.saveSessions(sessions);

        return message;
    }
}
