import type { ModelConfig } from '@shared/types/config';
import { useState, useEffect } from 'react';

import { DataSettings } from './DataSettings';
import { FeatureSettings } from './FeatureSettings';
import { GeneralSettings } from './GeneralSettings';
import { ModelSettings } from './ModelSettings';
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { useConfig } from '@/hooks/use-config';
import i18n from '@/i18n';
import { useTranslation } from '@/i18n/useI18n';

/**
 * The settings page component for managing application configuration.
 *
 * @returns A SettingPage component.
 */
export function SettingPage() {
    const { t } = useTranslation();
    const { config, updateConfig } = useConfig();
    const [activeKey, setActiveKey] = useState('general');
    const [username, setUsername] = useState('');
    const [language, setLanguage] = useState(i18n.language);
    const [modelConfigs, setModelConfigs] = useState<Record<string, ModelConfig>>({});

    // Load config data into form state
    useEffect(() => {
        if (config) {
            setUsername(config.username);
            setLanguage(config.language);
            setModelConfigs(config.models || {});
        }
    }, [config]);

    const sidebarItems = [
        {
            key: 'general',
            group: t('setting.general'),
            items: [t('common.user'), t('common.language'), t('setting.versionInfo')],
        },
        {
            key: 'models',
            group: t('setting.models'),
            items: [t('setting.chatModels')],
        },
        {
            key: 'features',
            group: t('setting.features'),
            items: [t('chat.chat'), t('editor.editor')],
        },
        {
            key: 'data',
            group: t('setting.data'),
            items: [t('common.directory')],
        },
    ];

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
        // Auto-save language change
        updateConfig({
            language: lang as 'en' | 'zh',
        });
    };

    const handleUsernameChange = (value: string) => {
        setUsername(value);
        // Auto-save username change
        updateConfig({
            username: value,
        });
    };

    const handleSidebarClick = (key: string) => {
        setActiveKey(key);
    };

    const handleModelSave = async () => {
        try {
            await updateConfig({
                models: modelConfigs,
            });
        } catch (error) {
            console.error('Failed to save model configs:', error);
        }
    };

    // Render the active section
    const renderActiveSection = () => {
        switch (activeKey) {
            case 'general':
                return (
                    <GeneralSettings
                        username={username}
                        language={language}
                        onUsernameChange={handleUsernameChange}
                        onLanguageChange={handleLanguageChange}
                    />
                );
            case 'models':
                return (
                    <ModelSettings
                        modelConfigs={modelConfigs}
                        onModelConfigsChange={setModelConfigs}
                        onSave={handleModelSave}
                    />
                );
            case 'features':
                return <FeatureSettings />;
            case 'data':
                return <DataSettings />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-full w-full">
            <Sidebar collapsible="none" className="w-64 hidden md:block">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>{t('common.settings')}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {sidebarItems.map((section, idx) => (
                                    <SidebarMenuItem key={idx}>
                                        <SidebarMenuButton
                                            isActive={section.key === activeKey}
                                            onClick={() => handleSidebarClick(section.key)}
                                        >
                                            <span className="font-medium">{section.group}</span>
                                        </SidebarMenuButton>
                                        <SidebarMenuSub>
                                            {section.items.map((item, itemIdx) => (
                                                <SidebarMenuSubItem key={itemIdx}>
                                                    <SidebarMenuSubButton
                                                        onClick={() =>
                                                            handleSidebarClick(section.key)
                                                        }
                                                    >
                                                        <span>{item}</span>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <div className="flex-1 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-6">{renderActiveSection()}</div>
            </div>
        </div>
    );
}
