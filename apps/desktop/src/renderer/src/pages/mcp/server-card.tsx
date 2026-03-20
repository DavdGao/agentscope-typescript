import { MCPServerState, MCPServerStatus } from '@shared/types/mcp';
import {
    ArrowDownUp,
    ChevronDown,
    ChevronRight,
    Server,
    Plug,
    AlertCircle,
    Trash2,
    Unplug,
    ServerOff,
} from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/i18n/useI18n';
import { cn } from '@/lib/utils';

/**
 * The MCP server card.
 * @param root0
 * @param root0.server
 * @param root0.onToggle
 * @param root0.onDelete
 * @returns A server card component.
 */
export function ServerCard({
    server,
    onToggle,
    onDelete,
}: {
    server: MCPServerState;
    onToggle: () => Promise<void>;
    onDelete: () => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);

    const renderStatusBadge = (status: MCPServerStatus, connecting: boolean) => {
        if (connecting) return <span>{t('mcp.connecting')}</span>;
        switch (status) {
            case 'connected':
                return <span>{t('mcp.connected')}</span>;
            case 'disconnected':
                return <span>{t('mcp.disconnected')}</span>;
            case 'error':
                return <span>{t('mcp.error')}</span>;
        }
    };
    return (
        <Item
            variant="outline"
            className={cn(
                'w-full pb-0',
                server.status === 'error' || server.status === 'disconnected'
                    ? 'text-muted-foreground'
                    : ''
            )}
        >
            <ItemMedia variant="icon">
                {server.status === 'error' || server.status === 'disconnected' ? (
                    <ServerOff />
                ) : (
                    <Server />
                )}
            </ItemMedia>
            <ItemContent>
                <ItemTitle>{server.config.name}</ItemTitle>
                <ItemDescription>
                    <Badge variant="link" className="pl-0 text-current">
                        <ArrowDownUp data-icon="inline-start" />
                        {server.config.protocol === 'stdio' ? 'STDIO' : 'HTTP'}
                    </Badge>
                </ItemDescription>
            </ItemContent>
            <ItemActions>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon-sm"
                            variant="default"
                            onClick={async () => {
                                setError(null);
                                setConnecting(true);
                                try {
                                    await onToggle();
                                } catch (e) {
                                    setError(String(e));
                                } finally {
                                    setConnecting(false);
                                }
                            }}
                            disabled={connecting}
                        >
                            {connecting ? (
                                <Spinner />
                            ) : server.status === 'connected' ? (
                                <Unplug />
                            ) : (
                                <Plug />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <span>
                            {server.status == 'connected'
                                ? t('common.disconnect')
                                : t('common.connect')}
                        </span>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size={'icon-sm'} variant="ghost" onClick={onDelete}>
                            <Trash2 />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <span>{t('common.delete')}</span>
                    </TooltipContent>
                </Tooltip>
            </ItemActions>
            {error ? (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>{t('mcp.error')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            <div
                className={cn(
                    'flex flex-col w-full p-1',
                    open && (server.tools?.length || 0) > 0 ? 'border mb-3 rounded-sm' : 'border-t'
                )}
            >
                <div className="flex justify-between">
                    <div
                        className="flex gap-1 w-fit py-1 px-2 rounded items-center text-xs hover:bg-secondary"
                        onClick={() => setOpen(!open)}
                    >
                        {t('common.tools')}({server.tools?.length || 0})
                        {open ? (
                            <ChevronDown className="size-4" />
                        ) : (
                            <ChevronRight className="size-4" />
                        )}
                    </div>
                    <Badge variant="link" className="text-current">
                        {renderStatusBadge(server.status, connecting)}
                    </Badge>
                </div>
                {open && (server.tools?.length || 0) > 0 ? (
                    <div className="w-full py-1">
                        {server.tools?.map(tool => {
                            return (
                                <div
                                    key={tool}
                                    className="flex items-center justify-between px-2 w-full py-0.5 hover:bg-secondary rounded"
                                >
                                    {tool}
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </Item>
    );
}
