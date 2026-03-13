import {
    Command,
    CalendarCheck,
    Settings,
    ChartColumnBig,
    PencilRuler,
    PencilLine,
    MessageSquareMore,
    Bot,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import mcpSvg from '@/assets/images/mcp.svg';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslation } from '@/i18n/useI18n';

export const AppSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    return (
        <Sidebar
            collapsible={'none'}
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]! w-[calc(var(--sidebar-width-icon)+1px)]! border-r border-border!"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                            <a href="#">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {t('common.friday')}
                                    </span>
                                    <span className="truncate text-xs">
                                        {t('common.enterprise')}
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup data-tour="sidebar-workspace">
                    <SidebarGroupContent className="px-1.5 md:px-0">
                        <SidebarMenu>
                            <SidebarMenuItem key={'chat'}>
                                <SidebarMenuButton
                                    tooltip={{
                                        children: t('chat.chat'),
                                        hidden: false,
                                    }}
                                    isActive={location.pathname === '/'}
                                    className="px-2.5 md:px-2"
                                    onClick={() => {
                                        navigate('/');
                                    }}
                                >
                                    <MessageSquareMore />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem key={'schedule'}>
                                <SidebarMenuButton
                                    tooltip={{
                                        children: t('common.schedule'),
                                        hidden: false,
                                    }}
                                    isActive={location.pathname === '/schedule'}
                                    className="px-2.5 md:px-2"
                                    onClick={() => {
                                        navigate('/schedule');
                                    }}
                                >
                                    <CalendarCheck />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem key={'editor'}>
                                <SidebarMenuButton
                                    tooltip={{
                                        children: t('editor.editor'),
                                        hidden: false,
                                    }}
                                    isActive={location.pathname === '/editor'}
                                    className="px-2.5 md:px-2"
                                    onClick={() => {
                                        navigate('/editor');
                                    }}
                                >
                                    <PencilLine />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup data-tour="sidebar-agent-config">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem key={'agents'}>
                                <SidebarMenuButton
                                    tooltip={{
                                        children: t('common.agent'),
                                        hidden: false,
                                    }}
                                    isActive={location.pathname === '/agents'}
                                    className="px-2.5 md:px-2"
                                    onClick={() => {
                                        navigate('/agents');
                                    }}
                                >
                                    <Bot />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem key={'skill'}>
                                <SidebarMenuButton
                                    tooltip={{
                                        children: t('common.agentSkills'),
                                        hidden: false,
                                    }}
                                    isActive={location.pathname === '/skill'}
                                    className="px-2.5 md:px-2"
                                    onClick={() => {
                                        navigate('/skill');
                                    }}
                                >
                                    <PencilRuler />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem key={'mcp'}>
                                <SidebarMenuButton
                                    tooltip={{
                                        children: t('common.mcp'),
                                        hidden: false,
                                    }}
                                    isActive={location.pathname === '/mcp'}
                                    className="px-2.5 md:px-2"
                                    onClick={() => {
                                        navigate('/mcp');
                                    }}
                                >
                                    <img src={mcpSvg} className="h-full w-full" alt="MCP" />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup data-tour="sidebar-dashboard">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem key={'dashboard'}>
                                <SidebarMenuButton
                                    tooltip={{
                                        children: t('common.dashboard'),
                                        hidden: false,
                                    }}
                                    isActive={location.pathname === '/dashboard'}
                                    className="px-2.5 md:px-2"
                                    onClick={() => {
                                        navigate('/dashboard');
                                    }}
                                >
                                    <ChartColumnBig />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenuButton
                    tooltip={{
                        children: t('common.setting'),
                        hidden: false,
                    }}
                    isActive={location.pathname === '/setting'}
                    className="px-2.5 md:px-2"
                    onClick={() => {
                        navigate('/setting');
                    }}
                    data-tour="sidebar-setting"
                >
                    <Settings />
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    );
};
