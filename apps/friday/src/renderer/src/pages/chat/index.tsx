import { ContentBlock, ToolCallBlock } from '@agentscope-ai/agentscope/message';
import type { Session } from '@shared/types/chat';
import {
    ArrowUpToLine,
    ArrowDownToLine,
    Ellipsis,
    PencilLine,
    Trash2,
    PanelLeftClose,
    PanelLeft,
    Loader2,
    ChevronDown,
    CornerDownLeft,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

import { ChatContent } from '@/components/chat/ChatContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { useChat } from '@/hooks/use-chat';
import { useConfig } from '@/hooks/use-config';
import { useMessages } from '@/hooks/use-messages';
import { useTranslation } from '@/i18n/useI18n';

/**
 * The chat page component that displays chat sessions and messages.
 *
 * @returns A ChatPage component.
 */
export function ChatPage() {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const { config } = useConfig();

    const [selectedAgentKey, setSelectedAgentKey] = useState<string>('friday');

    const {
        allSessions,
        hasMore,
        loading,
        loadMore,
        createSession,
        renameSession,
        pinSession,
        deleteSession,
    } = useChat();

    useEffect(() => {
        setCurrentSessionId(prev => {
            if (allSessions.length > 0 && !prev) {
                return allSessions[0].id;
            }
            return prev;
        });
    }, [allSessions]);

    const { messages, sending, sendMessage, sendUserConfirm } = useMessages(currentSessionId);

    useEffect(() => {}, [allSessions]);

    const handleRenameClick = (session: Session) => {
        setSelectedSessionId(session.id);
        setRenameValue(session.name);
        setRenameDialogOpen(true);
    };

    const handleRenameConfirm = async () => {
        if (selectedSessionId && renameValue.trim()) {
            await renameSession(selectedSessionId, renameValue.trim());
            setRenameDialogOpen(false);
        }
    };

    const handleDeleteClick = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedSessionId) {
            await deleteSession(selectedSessionId);
            setDeleteDialogOpen(false);
            if (selectedSessionId === currentSessionId) {
                // Filter out the deleted session and find the first remaining session
                const remainingSessions = allSessions.filter(s => s.id !== selectedSessionId);
                setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
            }
        }
    };

    const handleUserConfirm = async (
        toolCall: ToolCallBlock,
        confirm: boolean,
        replyId: string
    ) => {
        await sendUserConfirm(toolCall, confirm, replyId, currentSessionId!, selectedAgentKey);
    };

    const handleSendMessage = useCallback(
        async (content: ContentBlock[]) => {
            if (content.length === 0) return;

            // Create a new session if there is no current session
            if (!currentSessionId) {
                const newSession = await createSession();
                setCurrentSessionId(newSession.id);
                await sendMessage(content, newSession.id, selectedAgentKey);
            } else {
                await sendMessage(content, currentSessionId, selectedAgentKey);
            }
        },
        [currentSessionId, selectedAgentKey, createSession, sendMessage]
    );

    const handleSessionClick = (sessionId: string) => {
        setCurrentSessionId(sessionId);
    };

    const handleCreateSession = async () => {
        const newSession = await createSession();
        setCurrentSessionId(newSession.id);
    };

    const handleAutoComplete = useCallback(() => {
        return 'fake answer';
    }, []);

    return (
        <div className="flex h-full w-full max-w-full max-h-full">
            {sidebarOpen && (
                <Sidebar collapsible="none" className="w-64">
                    <SidebarHeader className="my-2">
                        <Button size="sm" variant="default" onClick={handleCreateSession}>
                            {t('chat.createSession')}
                        </Button>
                    </SidebarHeader>
                    <SidebarContent className="flex flex-1">
                        <SidebarGroup>
                            <SidebarGroupLabel>{t('common.sessions')}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <ScrollArea className="flex gap-y-2 rounded-sm">
                                    {allSessions.map(session => (
                                        <Button
                                            variant={
                                                session.id === currentSessionId
                                                    ? 'secondary'
                                                    : 'ghost'
                                            }
                                            key={session.id}
                                            className="group flex w-full h-9 text-sm items-center px-3 rounded-sm justify-between"
                                            onClick={() => handleSessionClick(session.id)}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                {session.pinned && (
                                                    <ArrowUpToLine className="h-3 w-3 flex-shrink-0" />
                                                )}
                                                <span className="truncate">{session.name}</span>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <Button
                                                        className="hidden group-hover:flex"
                                                        size="icon-sm"
                                                        variant="ghost"
                                                    >
                                                        <Ellipsis />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem
                                                        onClick={() => pinSession(session.id)}
                                                    >
                                                        {session.pinned ? (
                                                            <>
                                                                <ArrowDownToLine />
                                                                <span>{t('common.unpin')}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ArrowUpToLine />
                                                                <span>{t('common.pin')}</span>
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleRenameClick(session)}
                                                    >
                                                        <PencilLine />
                                                        <span>{t('common.rename')}</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDeleteClick(session.id)
                                                        }
                                                    >
                                                        <Trash2 />
                                                        <span>{t('common.delete')}</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </Button>
                                    ))}

                                    {/* Load More Button */}
                                    {hasMore && (
                                        <Button
                                            variant="ghost"
                                            className="w-full h-9 text-sm"
                                            onClick={loadMore}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {t('common.loading')}
                                                </>
                                            ) : (
                                                <>
                                                    {t('chat.loadMore')}
                                                    <ChevronDown className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </ScrollArea>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            )}
            <div className="flex flex-col items-start h-full flex-1">
                <div className="flex h-fit pt-4 pl-2 w-full">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? (
                            <PanelLeftClose className="h-4 w-4" />
                        ) : (
                            <PanelLeft className="h-4 w-4" />
                        )}
                    </Button>
                    <Select value={selectedAgentKey} onValueChange={setSelectedAgentKey}>
                        <SelectTrigger size="sm" className="border-none shadow-none">
                            <SelectValue placeholder="Pick agent">
                                {selectedAgentKey && config?.agents?.[selectedAgentKey] && (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage
                                                src={`/src/assets/avatars/${config.agents[selectedAgentKey].avatar || 'friday'}.png`}
                                            />
                                            <AvatarFallback className="text-xs">
                                                {config.agents[
                                                    selectedAgentKey
                                                ].name[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{config.agents[selectedAgentKey].name}</span>
                                    </div>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent align={'start'}>
                            <SelectGroup>
                                {Object.entries(config?.agents || {}).map(([key, agent]) => (
                                    <SelectItem value={key} key={key}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage
                                                    src={`/src/assets/avatars/${agent.avatar || 'friday'}.png`}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {agent.name[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{agent.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-1 w-full justify-center overflow-x-auto">
                    <ChatContent
                        msgs={messages}
                        sending={sending}
                        onSend={handleSendMessage}
                        onUserConfirm={handleUserConfirm}
                        autoComplete={handleAutoComplete}
                    />
                </div>
            </div>

            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('common.rename')}</DialogTitle>
                        <DialogDescription>{t('chat.renameDescription')}</DialogDescription>
                    </DialogHeader>
                    <Input
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        placeholder={t('common.name')}
                        autoFocus
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                handleRenameConfirm();
                            }
                        }}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleRenameConfirm}>
                            <CornerDownLeft className="h-4 w-4" />
                            {t('common.rename')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('common.delete')}</DialogTitle>
                        <DialogDescription>
                            {t('chat.deleteSessionConfirm', {
                                name:
                                    allSessions.find(s => s.id === selectedSessionId)?.name ||
                                    'Unknown',
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} autoFocus>
                            {t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
