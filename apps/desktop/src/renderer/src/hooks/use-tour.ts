import { useCallback, useState } from 'react';
import { CallBackProps, Step } from 'react-joyride';

import { useConfig } from './use-config';

interface UseTourReturn {
    run: boolean;
    steps: Step[];
    stepIndex: number;
    startTour: () => void;
    handleJoyrideCallback: (data: CallBackProps) => void;
}

/**
 * Hook to manage the application tour state and behavior.
 *
 * @returns An object containing tour state and control functions.
 */
export function useTour(): UseTourReturn {
    const { updateConfig } = useConfig();
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    const steps: Step[] = [
        {
            target: '[data-tour="sidebar-workspace"]',
            title: 'Agent Workspace',
            content: 'Chat with your agents, schedule tasks and edit files with AI assistance',
            disableBeacon: true,
            placement: 'right',
        },
        {
            target: '[data-tour="sidebar-agent-config"]',
            title: 'Agent Configuration',
            content: 'Configure your agents, manage their skills and MCP servers',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '[data-tour="sidebar-dashboard"]',
            title: 'Dashboard',
            content: 'Monitor your token usage and analytics',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '[data-tour="sidebar-setting"]',
            title: 'Settings',
            content: 'Configure the application settings',
            placement: 'right-end',
            disableBeacon: true,
        },
        {
            target: '[data-tour="chat-input"]',
            title: 'Start Chatting',
            content: 'Type your message here to start chatting with your AI assistant!',
            placement: 'top',
            disableBeacon: true,
        },
    ];

    const handleJoyrideCallback = useCallback(
        (data: CallBackProps) => {
            const { action, index, status, type } = data;

            if (type === 'step:after') {
                if (action === 'next') {
                    setStepIndex(index + 1);
                } else if (action === 'prev') {
                    setStepIndex(index - 1);
                }
            }

            if (status === 'finished' || status === 'skipped') {
                setRun(false);
                setStepIndex(0);
                updateConfig({ tourCompleted: true });
            }
        },
        [updateConfig]
    );

    const startTour = useCallback(() => {
        setRun(true);
        setStepIndex(0);
    }, []);

    return {
        run,
        steps,
        stepIndex,
        startTour,
        handleJoyrideCallback,
    };
}
