import { useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useOllama } from '@/hooks/use-ollama';

interface OllamaDetectionProps {
    onDetected: () => void;
    onNotAvailable: () => void;
}

/**
 * Component to detect Ollama availability
 * Shows loading state while checking
 * @param root0 - The component props.
 * @param root0.onDetected - Callback when Ollama is detected.
 * @param root0.onNotAvailable - Callback when Ollama is not available.
 * @returns An OllamaDetection component.
 */
export function OllamaDetection({ onDetected, onNotAvailable }: OllamaDetectionProps) {
    const { loading, available } = useOllama();

    useEffect(() => {
        if (!loading) {
            if (available) {
                onDetected();
            } else {
                onNotAvailable();
            }
        }
    }, [loading, available, onDetected, onNotAvailable]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-background">
            <Spinner />
        </div>
    );
}
