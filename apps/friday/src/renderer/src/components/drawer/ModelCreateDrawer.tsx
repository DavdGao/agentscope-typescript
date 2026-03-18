import { ModelConfig } from '@shared/types/config';
import { AlertCircleIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';

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
    DrawerTrigger,
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
// import anthropicLogo from '@/assets/images/logo-anthropic.svg';

/**
 * Drawer for creating a new model configuration.
 * @param root0 - Component props.
 * @param root0.children - Trigger element.
 * @param root0.onCreate - Async callback invoked with the new config.
 * @returns A drawer element.
 */
export function ModelCreateDrawer({
    children,
    onCreate,
}: {
    children: ReactNode;
    onCreate: (modelKey: string, modelConfig: ModelConfig) => Promise<void>;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const defaultConfig: ModelConfig & { name: string } = {
        name: '',
        provider: 'dashscope',
        modelName: '',
        apiKey: '',
    };
    const [newConfig, setNewConfig] = useState<ModelConfig & { name: string }>(defaultConfig);
    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) {
            setError(null);
            setNewConfig(defaultConfig);
        }
    };

    return (
        <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
            <DrawerTrigger>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{t('setting.newModelConfig')}</DrawerTitle>
                    <DrawerDescription>{t('setting.newModelConfigDesc')}</DrawerDescription>
                </DrawerHeader>
                <FieldSet className="flex flex-1 no-scrollbar overflow-y-auto px-4">
                    <FieldGroup>
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
                                required={true}
                            />
                        </Field>
                        <Field>
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
                                value={newConfig.modelName}
                                onChange={e =>
                                    setNewConfig({
                                        ...newConfig,
                                        modelName: e.target.value,
                                    })
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
                                value={newConfig.apiKey}
                                onChange={e =>
                                    setNewConfig({
                                        ...newConfig,
                                        apiKey: e.target.value,
                                    })
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
                                if (!newConfig.name) {
                                    setError('The name of the model configuration is required.');
                                    return;
                                } else if (!newConfig.modelName) {
                                    setError('The model name is required.');
                                    return;
                                } else if (!newConfig.apiKey && newConfig.provider !== 'ollama') {
                                    setError('The API key is required.');
                                    return;
                                }

                                await onCreate(newConfig.name, newConfig);
                                setError(null);
                                handleOpenChange(false);
                            } catch (e) {
                                setError(String(e));
                            }
                        }}
                    >
                        {t('common.create')}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
