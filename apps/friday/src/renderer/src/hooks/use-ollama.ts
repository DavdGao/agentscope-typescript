import { useEffect, useState } from 'react';

export interface OllamaModel {
    name: string;
    model: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
        format: string;
        family: string;
        families: string[];
        parameter_size: string;
        quantization_level: string;
    };
}

export interface OllamaResponse {
    models: OllamaModel[];
}

/**
 * Hook to check if Ollama is available and fetch models
 *
 * @returns An object containing models array, loading state, and availability status.
 */
export function useOllama() {
    const [models, setModels] = useState<OllamaModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [available, setAvailable] = useState(false);

    useEffect(() => {
        checkOllama();
    }, []);

    const checkOllama = async () => {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            if (response.ok) {
                const data: OllamaResponse = await response.json();
                setModels(data.models || []);
                setAvailable(data.models && data.models.length > 0);
            } else {
                console.log('Ollama API returned non-OK status:', response.status);
                setAvailable(false);
            }
        } catch (error) {
            console.error('Failed to check Ollama:', error);
            setAvailable(false);
        } finally {
            setLoading(false);
        }
    };

    return { models, loading, available };
}
