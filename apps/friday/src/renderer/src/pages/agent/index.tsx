import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

import { ProviderLogo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
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
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useConfig } from '@/hooks/use-config';
import { useTranslation } from '@/i18n/useI18n';

/**
 * Agent configuration page for managing agent settings and models.
 *
 * @returns An AgentPage component.
 */
export function AgentPage() {
    const { t } = useTranslation();
    const { config, updateConfig } = useConfig();
    const [selectedAgent] = useState<string>('friday');
    const [instruction, setInstruction] = useState<string>('');
    const [modelKey, setModelKey] = useState<string>('');
    const [maxIters, setMaxIters] = useState<number>(20);
    const [compressionTrigger, setCompressionTrigger] = useState<number>(10000);

    const agentConfig = config?.agents?.[selectedAgent];

    useEffect(() => {
        if (agentConfig) {
            setInstruction(agentConfig.instruction);
            setMaxIters(agentConfig.maxIters);
            setCompressionTrigger(agentConfig.compressionTrigger);

            // If modelKey is empty and there are models available, select the first one
            if (!agentConfig.modelKey && config?.models && Object.keys(config.models).length > 0) {
                const firstModelKey = Object.keys(config.models)[0];
                setModelKey(firstModelKey);
            } else {
                setModelKey(agentConfig.modelKey);
            }
        }
    }, [agentConfig, config?.models]);

    const handleSave = async () => {
        if (!config || !agentConfig) return;
        await updateConfig({
            agents: {
                ...config.agents,
                [selectedAgent]: {
                    ...agentConfig,
                    instruction,
                    modelKey,
                    maxIters,
                    compressionTrigger,
                },
            },
        });
    };

    return (
        <div className="flex flex-row h-full w-full">
            <Sidebar collapsible="none" className="w-64">
                <SidebarHeader className="my-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="sm" variant="default">
                                Add Custom Agent
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent align="center">Coming soon ...</TooltipContent>
                    </Tooltip>
                </SidebarHeader>
                <SidebarContent className="flex flex-1">
                    <SidebarGroup>
                        <SidebarGroupLabel>Builtin</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton isActive={selectedAgent === 'friday'}>
                                        Friday
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup>
                        <SidebarGroupLabel>Custom</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton disabled>Coming soon ...</SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <div className="flex flex-col h-full max-w-2xl min-w-xl 2xl:w-2xl flex-1 p-6 gap-y-5">
                <div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">AGENT: {agentConfig?.name}</h1>
                        <Avatar className="border-muted border">
                            <AvatarImage
                                src={`/src/assets/avatars/${agentConfig?.avatar || 'friday'}.png`}
                            />
                            <AvatarFallback>{agentConfig?.name?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">{t('agent.description')}</p>
                </div>
                <FieldSet>
                    <FieldLegend>LLM</FieldLegend>
                    <FieldDescription>The underlying LLM model of the agent</FieldDescription>
                    <FieldGroup className="flex flex-row">
                        <Field>
                            <Select value={modelKey} onValueChange={setModelKey}>
                                <SelectTrigger
                                    size="sm"
                                    className="bg-muted border-none shadow-none"
                                >
                                    <SelectValue placeholder="Pick model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(config?.models || {}).map(([key, config]) => (
                                        <SelectItem value={key} key={key}>
                                            <ProviderLogo
                                                provider={config.provider}
                                                className="size-6"
                                            />
                                            {key}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Button size="sm">
                            <Plus />
                            Add Model
                        </Button>
                    </FieldGroup>
                </FieldSet>
                <FieldSeparator />
                <FieldSet>
                    <FieldLegend>Context</FieldLegend>
                    <FieldDescription>The agent context related configuration</FieldDescription>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Instruction</FieldLabel>
                            <Textarea
                                value={instruction}
                                onChange={e => setInstruction(e.target.value)}
                                placeholder="The user instruction that would be attached to the end of the system prompt."
                                className="h-[150px]! min-h-[150px]! bg-muted border-none shadow-none"
                            />
                        </Field>
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldLabel>Compression Trigger</FieldLabel>
                                <FieldDescription>
                                    The token length threshold for triggering context compression.
                                </FieldDescription>
                            </FieldContent>
                            <Input
                                type="number"
                                value={compressionTrigger}
                                onChange={e => setCompressionTrigger(Number(e.target.value))}
                                className="h-8 text-sm w-50 bg-muted border-none shadow-none"
                            />
                        </Field>
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldLabel>Max Reasoning-Acting Iterations</FieldLabel>
                                <FieldDescription>
                                    The maximum number of reasoning-acting iterations the agent can
                                    perform in one reply.
                                </FieldDescription>
                            </FieldContent>
                            <Input
                                type="number"
                                value={maxIters}
                                onChange={e => setMaxIters(Number(e.target.value))}
                                max={10}
                                className="h-8 text-sm w-50 bg-muted border-none shadow-none"
                            />
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </div>
        </div>
    );
}
