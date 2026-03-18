import type { MCPServerState } from '@shared/types/mcp';
import { Trash2, Search, Loader2, Plug, PlugZap } from 'lucide-react';
import { useState } from 'react';

import { EmptyMCP, EmptySearch } from './empty';
import { ImportDialog } from './import-dialog';
import { DeleteDialog } from '@/components/dialog/DeleteDialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardAction,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMcp } from '@/hooks/use-mcp';
import { useTranslation } from '@/i18n/useI18n';

/**
 * The MCP page component for managing MCP servers.
 *
 * @returns An MCPPage component.
 */
export function MCPPage() {
    const { t } = useTranslation();
    const { servers, loading, add, remove, connect, disconnect } = useMcp();
    const [searchQuery, setSearchQuery] = useState('');
    const [connectingId, setConnectingId] = useState<string | null>(null);
    const [toDeleteMCPId, setToDeleteMCPId] = useState<string | null>(null);

    const handleToggleConnect = async (server: MCPServerState) => {
        const id = server.config.id;
        setConnectingId(id);
        try {
            if (server.status === 'connected') {
                await disconnect(id);
            } else {
                await connect(id);
            }
        } finally {
            setConnectingId(null);
        }
    };

    const filteredServers = servers.filter(
        s =>
            s.config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.config.protocol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getProtocolColor = (protocol: string) => {
        switch (protocol) {
            case 'sse':
                return 'text-blue-600 dark:text-blue-400';
            case 'streamable-http':
                return 'text-green-600 dark:text-green-400';
            case 'stdio':
                return 'text-purple-600 dark:text-purple-400';
            default:
                return 'text-muted-foreground';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected':
                return 'text-green-600 dark:text-green-400';
            case 'connecting':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'error':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-muted-foreground';
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex flex-col gap-4 p-6 border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{t('mcp.title')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">{t('mcp.description')}</p>
                    </div>
                    <ImportDialog onImport={add} />
                </div>
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder={t('mcp.search')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9 h-8 text-sm"
                    />
                </div>
            </div>

            <DeleteDialog
                open={toDeleteMCPId !== null}
                setOpen={open => {
                    if (!open) setToDeleteMCPId(null);
                }}
                title={t('mcp.deleteMCP.title')}
                description={t('mcp.deleteMCP.description', {
                    name: servers.find(s => s.config.id === toDeleteMCPId)?.config.name || '',
                })}
                onConfirm={async () => {
                    if (toDeleteMCPId) {
                        remove(toDeleteMCPId);
                        setToDeleteMCPId(null);
                    }
                }}
                successToast={t('mcp.deleteMCP.successToast')}
            />

            {loading ? (
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : filteredServers.length === 0 ? (
                searchQuery ? (
                    <div className="flex-1 flex items-center justify-center">
                        <EmptySearch />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <EmptyMCP importTrigger={<ImportDialog onImport={add} />} />
                    </div>
                )
            ) : (
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredServers.map(server => {
                            const isConnecting = connectingId === server.config.id;
                            const isConnected = server.status === 'connected';
                            return (
                                <Card
                                    key={server.config.id}
                                    className="group transition-colors hover:bg-accent/50"
                                >
                                    <CardHeader>
                                        <CardTitle>{server.config.name}</CardTitle>
                                        <CardDescription className={getStatusColor(server.status)}>
                                            {server.status}
                                            {server.error && ` — ${server.error}`}
                                        </CardDescription>
                                        <CardAction className="flex gap-1">
                                            <Button
                                                size="icon-sm"
                                                variant="secondary"
                                                disabled={isConnecting}
                                                onClick={() => handleToggleConnect(server)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                {isConnecting ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : isConnected ? (
                                                    <PlugZap />
                                                ) : (
                                                    <Plug />
                                                )}
                                            </Button>
                                            <Button
                                                size="icon-sm"
                                                variant="secondary"
                                                onClick={() => setToDeleteMCPId(server.config.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 />
                                            </Button>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    {t('mcp.protocol')}:
                                                </span>
                                                <span
                                                    className={`font-medium uppercase ${getProtocolColor(server.config.protocol)}`}
                                                >
                                                    {server.config.protocol}
                                                </span>
                                            </div>
                                            {'url' in server.config && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        {t('mcp.url')}:
                                                    </span>
                                                    <span
                                                        className="font-medium truncate ml-2"
                                                        title={server.config.url}
                                                    >
                                                        {server.config.url}
                                                    </span>
                                                </div>
                                            )}
                                            {'command' in server.config && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        {t('mcp.command')}:
                                                    </span>
                                                    <span className="font-medium">
                                                        {server.config.command}
                                                    </span>
                                                </div>
                                            )}
                                            {server.tools && server.tools.length > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        {t('common.tools')}:
                                                    </span>
                                                    <span className="font-medium">
                                                        {server.tools.length}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
