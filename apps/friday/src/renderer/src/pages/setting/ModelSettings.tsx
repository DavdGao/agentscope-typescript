import type { ModelConfig } from '@shared/types/config';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

import anthropicLogo from '@/assets/images/logo-anthropic.svg';
import googleLogo from '@/assets/images/logo-google.svg';
import ollamaLogo from '@/assets/images/logo-ollama.svg';
import openAILogo from '@/assets/images/logo-openai.svg';
import qwenLogo from '@/assets/images/logo-qwen.svg';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/i18n/useI18n';

interface ModelSettingsProps {
    modelConfigs: Record<string, ModelConfig>;
    onModelConfigsChange: (configs: Record<string, ModelConfig>) => void;
    onSave: () => Promise<void>;
}

/**
 * Model settings component for managing AI model configurations.
 * @param root0 - Component props
 * @param root0.modelConfigs - Current model configurations
 * @param root0.onModelConfigsChange - Callback when model configurations change
 * @param root0.onSave - Callback to save model configurations
 * @returns The model settings UI component
 */
export function ModelSettings({ modelConfigs, onModelConfigsChange, onSave }: ModelSettingsProps) {
    const { t } = useTranslation();
    const [editingConfigKey, setEditingConfigKey] = useState<string | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newConfig, setNewConfig] = useState<ModelConfig & { name: string }>({
        name: '',
        provider: 'dashscope',
        modelName: '',
        apiKey: '',
    });
    const [clientArgs, setClientArgs] = useState<
        Array<{ id: string; name: string; type: string; value: string }>
    >([]);
    const [generationArgs, setGenerationArgs] = useState<
        Array<{ id: string; name: string; type: string; value: string }>
    >([]);

    const handleCreate = async () => {
        try {
            const { name, ...configData } = newConfig;
            const updatedConfigs = {
                ...modelConfigs,
                [name]: configData,
            };
            onModelConfigsChange(updatedConfigs);
            await onSave();

            setNewConfig({
                name: '',
                provider: 'dashscope',
                modelName: '',
                apiKey: '',
            });
            setIsCreatingNew(false);

            console.log('Model config created successfully');
        } catch (error) {
            console.error('Failed to create model config:', error);
        }
    };

    const addClientArg = () => {
        const newId = Date.now().toString();
        setClientArgs([...clientArgs, { id: newId, name: '', type: '', value: '' }]);
    };

    const removeClientArg = (id: string) => {
        setClientArgs(clientArgs.filter(arg => arg.id !== id));
    };

    const updateClientArg = (id: string, field: string, value: string) => {
        setClientArgs(clientArgs.map(arg => (arg.id === id ? { ...arg, [field]: value } : arg)));
    };

    const addGenerationArg = () => {
        const newId = Date.now().toString();
        setGenerationArgs([...generationArgs, { id: newId, name: '', type: '', value: '' }]);
    };

    const removeGenerationArg = (id: string) => {
        setGenerationArgs(generationArgs.filter(arg => arg.id !== id));
    };

    const updateGenerationArg = (id: string, field: string, value: string) => {
        setGenerationArgs(
            generationArgs.map(arg => (arg.id === id ? { ...arg, [field]: value } : arg))
        );
    };

    const groupedModels: Record<string, (ModelConfig & { name: string })[]> = {};
    Object.entries(modelConfigs).forEach(([key, config]) => {
        if (!groupedModels[config.provider]) {
            groupedModels[config.provider] = [];
        }
        groupedModels[config.provider].push({ ...config, name: key });
    });

    return (
        <div className="flex flex-col size-full max-w-2xl max-h-full gap-y-8 overflow-hidden">
            {/* Main Title */}

            <div className="flex flex-row w-full justify-between items-center flex-shrink-0">
                <div className="flex font-bold text-2xl">{t('setting.models')}</div>
                <Button size="sm" variant="default" onClick={() => setIsCreatingNew(true)}>
                    <PlusCircle />
                    <span>{t('setting.createModelConfig')}</span>
                </Button>
            </div>

            {/* Create New Model Config Card */}
            {isCreatingNew && (
                <Card className="flex-shrink-0">
                    <CardHeader>
                        <div>
                            <CardTitle className="text-base">
                                {t('setting.newModelConfig')}
                            </CardTitle>
                            <CardDescription>{t('setting.newModelConfigDesc')}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Field>
                                <FieldLabel>{t('setting.name')}</FieldLabel>
                                <Input
                                    placeholder={t('setting.configNamePlaceholder')}
                                    className="h-8 text-sm px-2"
                                    value={newConfig.name}
                                    onChange={e =>
                                        setNewConfig({
                                            ...newConfig,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </Field>
                            <div className="flex flex-row gap-4">
                                <Field className="w-full max-w-xs">
                                    <FieldLabel>{t('setting.apiProvider')}</FieldLabel>
                                    <Select
                                        name="provider"
                                        value={newConfig.provider}
                                        onValueChange={value =>
                                            setNewConfig({
                                                ...newConfig,
                                                provider: value as ModelConfig['provider'],
                                            })
                                        }
                                    >
                                        <SelectTrigger size="sm">
                                            <SelectValue
                                                placeholder={t('setting.chooseDepartment')}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="dashscope">
                                                    <img
                                                        src={qwenLogo}
                                                        alt="Qwen"
                                                        className="size-4"
                                                    />
                                                    <span>DashScope</span>
                                                </SelectItem>
                                                <SelectItem value="openai">
                                                    <img
                                                        src={openAILogo}
                                                        alt="OpenAI"
                                                        className="size-4"
                                                    />
                                                    <span>OpenAI</span>
                                                </SelectItem>
                                                <SelectItem value="google">
                                                    <img
                                                        src={googleLogo}
                                                        alt="Google"
                                                        className="size-4"
                                                    />
                                                    <span>Google</span>
                                                </SelectItem>
                                                <SelectItem value="anthropic">
                                                    <img
                                                        src={anthropicLogo}
                                                        alt="Anthropic"
                                                        className="size-4"
                                                    />
                                                    <span>Anthropic</span>
                                                </SelectItem>
                                                <SelectItem value="ollama">
                                                    <img
                                                        src={ollamaLogo}
                                                        alt="Ollama"
                                                        className="size-4"
                                                    />
                                                    <span>Ollama</span>
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel>{t('common.llm')}</FieldLabel>
                                    <Input
                                        placeholder={t('setting.llmPlaceholder')}
                                        name="llm"
                                        className="h-8 text-sm px-2"
                                        value={newConfig.modelName}
                                        onChange={e =>
                                            setNewConfig({
                                                ...newConfig,
                                                modelName: e.target.value,
                                            })
                                        }
                                    />
                                </Field>
                            </div>
                            <Field>
                                <FieldLabel>{t('setting.apiKey')}</FieldLabel>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    name="apiKey"
                                    className="h-8 text-sm px-2"
                                    value={newConfig.apiKey}
                                    onChange={e =>
                                        setNewConfig({
                                            ...newConfig,
                                            apiKey: e.target.value,
                                        })
                                    }
                                />
                            </Field>
                            <div className="flex justify-end gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreatingNew(false);
                                        setNewConfig({
                                            name: '',
                                            provider: 'dashscope',
                                            modelName: '',
                                            apiKey: '',
                                        });
                                    }}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button size="sm" variant="default" onClick={handleCreate}>
                                    {t('common.create')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col w-full flex-1 overflow-y-auto no-scrollbar">
                {/* Existing Model Configs */}
                {Object.entries(groupedModels).map(([provider, configs]) => {
                    return (
                        <div key={provider} className="flex flex-col gap-y-2">
                            <FieldSeparator className="my-2">
                                {provider.toUpperCase()}
                            </FieldSeparator>
                            {configs.map(modelConfig => {
                                return (
                                    <Card
                                        key={modelConfig.name}
                                        className="group"
                                        onClick={() => {
                                            setEditingConfigKey(
                                                editingConfigKey === modelConfig.name
                                                    ? null
                                                    : modelConfig.name
                                            );
                                        }}
                                    >
                                        <CardHeader>
                                            <CardTitle className="text-base">
                                                {modelConfig.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {modelConfig.provider} - {modelConfig.modelName}
                                            </CardDescription>

                                            <CardAction>
                                                <Button
                                                    className="group-hover:flex hidden"
                                                    size="icon-sm"
                                                    variant="destructive"
                                                    onClick={async () => {
                                                        const newConfigs = {
                                                            ...modelConfigs,
                                                        };
                                                        delete newConfigs[modelConfig.name];
                                                        onModelConfigsChange(newConfigs);

                                                        try {
                                                            await onSave();
                                                            console.log(
                                                                'Model config deleted successfully'
                                                            );
                                                        } catch (error) {
                                                            console.error(
                                                                'Failed to delete model config:',
                                                                error
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </CardAction>
                                        </CardHeader>
                                        {editingConfigKey === modelConfig.name && (
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="flex flex-row gap-4">
                                                        <Field className="w-full max-w-xs">
                                                            <FieldLabel>
                                                                {t('setting.apiProvider')}
                                                            </FieldLabel>
                                                            <Select
                                                                defaultValue={modelConfig.provider}
                                                                name="provider"
                                                            >
                                                                <SelectTrigger size="sm">
                                                                    <SelectValue
                                                                        placeholder={t(
                                                                            'setting.chooseDepartment'
                                                                        )}
                                                                    />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        <SelectItem value="dashscope">
                                                                            <img
                                                                                src={qwenLogo}
                                                                                alt="Qwen"
                                                                                className="size-4"
                                                                            />
                                                                            <span>DashScope</span>
                                                                        </SelectItem>
                                                                        <SelectItem value="openai">
                                                                            <img
                                                                                src={openAILogo}
                                                                                alt="OpenAI"
                                                                                className="size-4"
                                                                            />
                                                                            <span>OpenAI</span>
                                                                        </SelectItem>
                                                                        <SelectItem value="google">
                                                                            <img
                                                                                src={googleLogo}
                                                                                alt="Google"
                                                                                className="size-4"
                                                                            />
                                                                            <span>Google</span>
                                                                        </SelectItem>
                                                                        <SelectItem value="anthropic">
                                                                            <img
                                                                                src={anthropicLogo}
                                                                                alt="Anthropic"
                                                                                className="size-4"
                                                                            />
                                                                            <span>Anthropic</span>
                                                                        </SelectItem>
                                                                        <SelectItem value="ollama">
                                                                            <img
                                                                                src={ollamaLogo}
                                                                                alt="Ollama"
                                                                                className="size-4"
                                                                            />
                                                                            <span>Ollama</span>
                                                                        </SelectItem>
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                        </Field>
                                                        <Field>
                                                            <FieldLabel>
                                                                {t('common.llm')}
                                                            </FieldLabel>
                                                            <Input
                                                                placeholder={t(
                                                                    'setting.llmPlaceholder'
                                                                )}
                                                                value={modelConfig.modelName}
                                                                onChange={e => {
                                                                    onModelConfigsChange({
                                                                        ...modelConfigs,
                                                                        [modelConfig.name]: {
                                                                            ...modelConfig,
                                                                            modelName:
                                                                                e.target.value,
                                                                        },
                                                                    });
                                                                }}
                                                                name="llm"
                                                                className="h-8 text-sm px-2"
                                                            />
                                                        </Field>
                                                    </div>
                                                    <Field>
                                                        <FieldLabel>
                                                            {t('setting.apiKey')}
                                                        </FieldLabel>
                                                        <FieldDescription>
                                                            {t('setting.apiKeyDesc')}
                                                        </FieldDescription>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            defaultValue={modelConfig.apiKey}
                                                            name="apiKey"
                                                            className="h-8 text-sm px-2"
                                                        />
                                                    </Field>

                                                    <Accordion type="single" collapsible>
                                                        <AccordionItem value="advanced">
                                                            <AccordionTrigger className="text-sm text-muted-foreground">
                                                                {t('setting.advancedOptions')}
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <div className="space-y-4 pt-4">
                                                                    <Separator />
                                                                    {/* Client Arguments Section */}
                                                                    <FieldGroup>
                                                                        <div className="flex w-full justify-between">
                                                                            <div className="space-y-2">
                                                                                <FieldLabel>
                                                                                    {t(
                                                                                        'setting.clientKeywordArguments'
                                                                                    )}
                                                                                </FieldLabel>
                                                                                <FieldDescription>
                                                                                    {t(
                                                                                        'setting.clientKeywordArgumentsDesc'
                                                                                    )}
                                                                                </FieldDescription>
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="default"
                                                                                onClick={
                                                                                    addClientArg
                                                                                }
                                                                            >
                                                                                <PlusCircle />
                                                                                <span>
                                                                                    {t(
                                                                                        'setting.add'
                                                                                    )}
                                                                                </span>
                                                                            </Button>
                                                                        </div>
                                                                        <div className="flex flex-col gap-4">
                                                                            {clientArgs.length >
                                                                                0 && (
                                                                                <div className="flex flex-row gap-4 items-center">
                                                                                    <div className="grid grid-cols-3 gap-4 flex-1 pr-12">
                                                                                        <FieldLabel>
                                                                                            {t(
                                                                                                'common.name'
                                                                                            )}
                                                                                        </FieldLabel>
                                                                                        <FieldLabel>
                                                                                            {t(
                                                                                                'common.type'
                                                                                            )}
                                                                                        </FieldLabel>
                                                                                        <FieldLabel>
                                                                                            {t(
                                                                                                'common.value'
                                                                                            )}
                                                                                        </FieldLabel>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {clientArgs.map(arg => (
                                                                                <div
                                                                                    key={arg.id}
                                                                                    className="flex flex-row gap-4 items-center"
                                                                                >
                                                                                    <div className="grid grid-cols-3 gap-4 flex-1">
                                                                                        <Field>
                                                                                            <Input
                                                                                                className="h-8 text-sm px-2"
                                                                                                value={
                                                                                                    arg.name
                                                                                                }
                                                                                                onChange={e =>
                                                                                                    updateClientArg(
                                                                                                        arg.id,
                                                                                                        'name',
                                                                                                        e
                                                                                                            .target
                                                                                                            .value
                                                                                                    )
                                                                                                }
                                                                                            />
                                                                                        </Field>
                                                                                        <Field>
                                                                                            <Select
                                                                                                value={
                                                                                                    arg.type
                                                                                                }
                                                                                                onValueChange={value =>
                                                                                                    updateClientArg(
                                                                                                        arg.id,
                                                                                                        'type',
                                                                                                        value
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <SelectTrigger size="sm">
                                                                                                    <SelectValue
                                                                                                        placeholder={t(
                                                                                                            'setting.selectType'
                                                                                                        )}
                                                                                                    />
                                                                                                </SelectTrigger>
                                                                                                <SelectContent>
                                                                                                    <SelectItem value="string">
                                                                                                        {t(
                                                                                                            'common.string'
                                                                                                        )}
                                                                                                    </SelectItem>
                                                                                                    <SelectItem value="number">
                                                                                                        {t(
                                                                                                            'common.number'
                                                                                                        )}
                                                                                                    </SelectItem>
                                                                                                    <SelectItem value="boolean">
                                                                                                        {t(
                                                                                                            'common.boolean'
                                                                                                        )}
                                                                                                    </SelectItem>
                                                                                                </SelectContent>
                                                                                            </Select>
                                                                                        </Field>
                                                                                        <Field>
                                                                                            <Input
                                                                                                className="h-8 text-sm px-2"
                                                                                                value={
                                                                                                    arg.value
                                                                                                }
                                                                                                onChange={e =>
                                                                                                    updateClientArg(
                                                                                                        arg.id,
                                                                                                        'value',
                                                                                                        e
                                                                                                            .target
                                                                                                            .value
                                                                                                    )
                                                                                                }
                                                                                            />
                                                                                        </Field>
                                                                                    </div>
                                                                                    <Button
                                                                                        size="icon-sm"
                                                                                        variant="secondary"
                                                                                        onClick={() =>
                                                                                            removeClientArg(
                                                                                                arg.id
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <Trash2 />
                                                                                    </Button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </FieldGroup>
                                                                    <Separator />
                                                                    {/* Generation Arguments Section */}
                                                                    <FieldGroup>
                                                                        <div className="flex w-full justify-between">
                                                                            <div className="space-y-2">
                                                                                <FieldLabel>
                                                                                    {t(
                                                                                        'setting.generationKeywordArguments'
                                                                                    )}
                                                                                </FieldLabel>
                                                                                <FieldDescription>
                                                                                    {t(
                                                                                        'setting.generationKeywordArgumentsDesc'
                                                                                    )}
                                                                                </FieldDescription>
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="default"
                                                                                onClick={
                                                                                    addGenerationArg
                                                                                }
                                                                            >
                                                                                <PlusCircle />
                                                                                <span>
                                                                                    {t(
                                                                                        'setting.add'
                                                                                    )}
                                                                                </span>
                                                                            </Button>
                                                                        </div>
                                                                        <div className="flex flex-col gap-4">
                                                                            {generationArgs.length >
                                                                                0 && (
                                                                                <div className="flex flex-row gap-4 items-center">
                                                                                    <div className="grid grid-cols-3 gap-4 flex-1 pr-12">
                                                                                        <FieldLabel>
                                                                                            {t(
                                                                                                'common.name'
                                                                                            )}
                                                                                        </FieldLabel>
                                                                                        <FieldLabel>
                                                                                            {t(
                                                                                                'common.type'
                                                                                            )}
                                                                                        </FieldLabel>
                                                                                        <FieldLabel>
                                                                                            {t(
                                                                                                'common.value'
                                                                                            )}
                                                                                        </FieldLabel>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {generationArgs.map(
                                                                                arg => (
                                                                                    <div
                                                                                        key={arg.id}
                                                                                        className="flex flex-row gap-4 items-center"
                                                                                    >
                                                                                        <div className="grid grid-cols-3 gap-4 flex-1">
                                                                                            <Field>
                                                                                                <Input
                                                                                                    className="h-8 text-sm px-2"
                                                                                                    value={
                                                                                                        arg.name
                                                                                                    }
                                                                                                    onChange={e =>
                                                                                                        updateGenerationArg(
                                                                                                            arg.id,
                                                                                                            'name',
                                                                                                            e
                                                                                                                .target
                                                                                                                .value
                                                                                                        )
                                                                                                    }
                                                                                                />
                                                                                            </Field>
                                                                                            <Field>
                                                                                                <Select
                                                                                                    value={
                                                                                                        arg.type
                                                                                                    }
                                                                                                    onValueChange={value =>
                                                                                                        updateGenerationArg(
                                                                                                            arg.id,
                                                                                                            'type',
                                                                                                            value
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    <SelectTrigger size="sm">
                                                                                                        <SelectValue
                                                                                                            placeholder={t(
                                                                                                                'setting.selectType'
                                                                                                            )}
                                                                                                        />
                                                                                                    </SelectTrigger>
                                                                                                    <SelectContent>
                                                                                                        <SelectItem value="string">
                                                                                                            {t(
                                                                                                                'common.string'
                                                                                                            )}
                                                                                                        </SelectItem>
                                                                                                        <SelectItem value="number">
                                                                                                            {t(
                                                                                                                'common.number'
                                                                                                            )}
                                                                                                        </SelectItem>
                                                                                                        <SelectItem value="boolean">
                                                                                                            {t(
                                                                                                                'common.boolean'
                                                                                                            )}
                                                                                                        </SelectItem>
                                                                                                    </SelectContent>
                                                                                                </Select>
                                                                                            </Field>
                                                                                            <Field>
                                                                                                <Input
                                                                                                    className="h-8 text-sm px-2"
                                                                                                    value={
                                                                                                        arg.value
                                                                                                    }
                                                                                                    onChange={e =>
                                                                                                        updateGenerationArg(
                                                                                                            arg.id,
                                                                                                            'value',
                                                                                                            e
                                                                                                                .target
                                                                                                                .value
                                                                                                        )
                                                                                                    }
                                                                                                />
                                                                                            </Field>
                                                                                        </div>
                                                                                        <Button
                                                                                            size="icon-sm"
                                                                                            variant="secondary"
                                                                                            onClick={() =>
                                                                                                removeGenerationArg(
                                                                                                    arg.id
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Trash2 />
                                                                                        </Button>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    </FieldGroup>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </div>

                                                {/* Footer with Save and Cancel buttons */}
                                                <Separator className="my-4" />
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingConfigKey(null);
                                                        }}
                                                    >
                                                        {t('common.cancel')}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={async () => {
                                                            try {
                                                                await onSave();
                                                                console.log('Model config saved');
                                                                setEditingConfigKey(null);
                                                            } catch (error) {
                                                                console.error(
                                                                    'Failed to save:',
                                                                    error
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {t('common.save')}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
