import { ModelConfig } from '@shared/types/config';
import { AlertCircleIcon } from 'lucide-react';
import { useState } from 'react';

import googleLogo from '@/assets/images/logo-google.svg';
import ollamaLogo from '@/assets/images/logo-ollama.svg';
import openAILogo from '@/assets/images/logo-openai.svg';
import qwenLogo from '@/assets/images/logo-qwen.svg';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/i18n/useI18n';

/**
 * Drawer for editing an existing model configuration.
 * @param root0 - Component props.
 * @param root0.modelKey - Key of the model being edited.
 * @param root0.setModelKey - Controls which model is selected for editing.
 * @param root0.modelConfig - Current model configuration.
 * @param root0.onUpdate - Async callback invoked with the updated config.
 * @returns A drawer element.
 */
export function ModelUpdateDrawer({
    modelKey,
    setModelKey,
    modelConfig,
    onUpdate,
}: {
    modelKey: string;
    setModelKey: (key: string | null) => void;
    modelConfig: ModelConfig;
    onUpdate: (modelConfig: ModelConfig) => Promise<void>;
}) {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [updatedConfig, setUpdatedConfig] = useState<ModelConfig>(modelConfig);

    return (
        <Drawer
            direction="right"
            open={modelKey !== null}
            onOpenChange={open => {
                if (!open) setModelKey(null);
            }}
        >
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Config: {modelKey}</DrawerTitle>
                    <DrawerDescription>{t('setting.newModelConfigDesc')}</DrawerDescription>
                </DrawerHeader>
                <FieldSet className="flex flex-1 no-scrollbar overflow-y-auto px-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel>{t('setting.apiProvider')}</FieldLabel>
                            <Select
                                name="provider"
                                value={updatedConfig.provider}
                                onValueChange={value =>
                                    setUpdatedConfig(prev => ({
                                        ...prev,
                                        provider: value as ModelConfig['provider'],
                                    }))
                                }
                            >
                                <SelectTrigger size="sm">
                                    <SelectValue placeholder={t('setting.chooseDepartment')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="dashscope">
                                            <img src={qwenLogo} alt="Qwen" className="size-4" />
                                            <span>DashScope</span>
                                        </SelectItem>
                                        <SelectItem value="openai">
                                            <img src={openAILogo} alt="OpenAI" className="size-4" />
                                            <span>OpenAI</span>
                                        </SelectItem>
                                        <SelectItem value="google">
                                            <img src={googleLogo} alt="Google" className="size-4" />
                                            <span>Google</span>
                                        </SelectItem>
                                        {/*<SelectItem value="anthropic">*/}
                                        {/*    <img*/}
                                        {/*        src={anthropicLogo}*/}
                                        {/*        alt="Anthropic"*/}
                                        {/*        className="size-4"*/}
                                        {/*    />*/}
                                        {/*    <span>Anthropic</span>*/}
                                        {/*</SelectItem>*/}
                                        <SelectItem value="ollama">
                                            <img src={ollamaLogo} alt="Ollama" className="size-4" />
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
                                value={updatedConfig.modelName}
                                onChange={e =>
                                    setUpdatedConfig(prev => ({
                                        ...prev,
                                        modelName: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field>
                            <FieldLabel>{t('setting.apiKey')}</FieldLabel>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                name="apiKey"
                                className="h-8 text-sm px-2"
                                value={updatedConfig.apiKey}
                                onChange={e =>
                                    setUpdatedConfig(prev => ({
                                        ...prev,
                                        apiKey: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <DrawerFooter>
                    {error && (
                        <Alert variant="destructive" className="bg-red-50 border-red-500">
                            <AlertCircleIcon />
                            <AlertTitle>{t('setting.modelConfigCreateFail')}</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        onClick={async () => {
                            try {
                                if (!updatedConfig.modelName) {
                                    setError('The model name is required.');
                                    return;
                                } else if (
                                    !updatedConfig.apiKey &&
                                    updatedConfig.provider !== 'ollama'
                                ) {
                                    setError('The API key is required.');
                                    return;
                                }

                                await onUpdate(updatedConfig);
                                setError(null);
                            } catch (e) {
                                setError(String(e));
                            }
                        }}
                    >
                        {t('common.update')}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
