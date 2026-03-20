import type { MCPServerState } from '@shared/types/mcp';
import { Search, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { EmptyMCP, EmptySearch } from './empty';
import { ImportDialog } from './import-dialog';
import { ServerCard } from './server-card';
import { DeleteDialog } from '@/components/dialog/DeleteDialog';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
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
    const [toDeleteMCPId, setToDeleteMCPId] = useState<string | null>(null);

    const handleToggleConnect = async (server: MCPServerState) => {
        const id = server.config.id;
        if (server.status === 'connected') {
            await disconnect(id);
        } else {
            await connect(id);
        }
    };

    const filteredServers = servers.filter(
        s =>
            s.config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.config.protocol.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <div className="flex items-center gap-x-2">
                    <InputGroup className="max-w-sm h-8 text-sm">
                        <InputGroupInput
                            placeholder={t('mcp.search')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                    {/*<DropdownMenu>*/}
                    {/*    <DropdownMenuTrigger>*/}
                    {/*        <Button size="icon-sm" variant="ghost">*/}
                    {/*            <ListFilter />*/}
                    {/*        </Button>*/}
                    {/*    </DropdownMenuTrigger>*/}
                    {/*    <DropdownMenuContent>*/}
                    {/*        <DropdownMenuGroup>*/}
                    {/*            <DropdownMenuLabel>{t('common.protocol')}</DropdownMenuLabel>*/}
                    {/*            <DropdownMenuItem>*/}
                    {/*                <Checkbox />*/}
                    {/*                STDIO*/}
                    {/*            </DropdownMenuItem>*/}
                    {/*            <DropdownMenuRadioGroup*/}
                    {/*                value={position}*/}
                    {/*                onValueChange={setPosition}*/}
                    {/*            >*/}
                    {/*                <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>*/}
                    {/*                <DropdownMenuRadioItem value="bottom">*/}
                    {/*                    Bottom*/}
                    {/*                </DropdownMenuRadioItem>*/}
                    {/*                <DropdownMenuRadioItem value="right">*/}
                    {/*                    Right*/}
                    {/*                </DropdownMenuRadioItem>*/}
                    {/*            </DropdownMenuRadioGroup>*/}
                    {/*        </DropdownMenuGroup>*/}
                    {/*    </DropdownMenuContent>*/}
                    {/*</DropdownMenu>*/}
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
                    <div className="flex w-full gap-4">
                        {filteredServers.map(server => {
                            return (
                                <ServerCard
                                    key={server.config.id}
                                    server={server}
                                    onToggle={async () => await handleToggleConnect(server)}
                                    onDelete={async () => setToDeleteMCPId(server.config.id)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
