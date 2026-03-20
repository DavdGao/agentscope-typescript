import { ArrowRight } from 'lucide-react';
import { Fragment } from 'react';

import { Button } from '@/components/ui/button';
import { useConfig } from '@/hooks/use-config';
import { useOllama } from '@/hooks/use-ollama';

interface OllamaSetupProps {
    onSkip: () => void;
    onComplete: () => void;
}

/**
 * Ollama setup page for selecting a local model
 * @param root0 - The component props.
 * @param root0.onSkip - Callback when user skips setup.
 * @param root0.onComplete - Callback when setup is complete.
 * @returns An OllamaSetup component.
 */
export function OllamaSetup({ onSkip, onComplete }: OllamaSetupProps) {
    const { models } = useOllama();
    const { updateConfig } = useConfig();

    const handleSelectModel = async (modelName: string) => {
        await updateConfig({
            models: {
                ollama: {
                    provider: 'ollama',
                    modelName: modelName,
                    apiKey: '',
                },
            },
        });
        onComplete();
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-background">
            <div className="flex flex-col gap-2 max-w-[18rem] w-full px-6">
                {/* Title */}
                <div className="text-primary font-medium">Start fast with a local model</div>

                {/* Model List */}
                <div className="w-wull h-82 border rounded-md">
                    <div className="py-4 px-2">
                        <div className="px-2 text-sm mb-2 leanding-none font-medium">
                            Ollama models
                        </div>
                        {models.map(model => (
                            <Fragment key={model.name}>
                                <div
                                    className="cursor-pointer rounded-lg px-2.5 h-8 text-sm flex items-center hover:text-secondary-foreground hover:bg-secondary overflow-hidden"
                                    onClick={() => handleSelectModel(model.name)}
                                >
                                    <div className="truncate">{model.name}</div>
                                </div>
                            </Fragment>
                        ))}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 w-full justify-end">
                    <Button
                        size="sm"
                        variant="link"
                        onClick={onSkip}
                        className="text-muted-foreground text-[12px]"
                    >
                        Skip, I will set up later
                        <ArrowRight className="size-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
