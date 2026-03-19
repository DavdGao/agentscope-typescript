import { useEffect, useRef, useState } from 'react';
import TypeIt from 'typeit-react';

import typeSound from '@/assets/sounds/keyboard-0.ogg';
import deleteSound from '@/assets/sounds/keyboard-1.ogg';

interface OnboardingWizardProps {
    onComplete: () => void;
}

/**
 * Onboarding wizard component for first-time users.
 * Features a typewriter effect that displays different text sequences.
 *
 * @param root0
 * @param root0.onComplete
 * @returns An OnboardingWizard component.
 */
export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
    const typeAudioRef = useRef<HTMLAudioElement | null>(null);
    const deleteAudioRef = useRef<HTMLAudioElement | null>(null);
    const isTypingRef = useRef<boolean>(true);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [canProceed, setCanProceed] = useState(false);

    // Configuration for typewriter effect and audio
    const config = {
        // Typewriter timing (in milliseconds)
        initialDelay: 1500, // Delay before animation starts
        typeSpeed: 100, // Speed of typing each character
        deleteSpeed: 60, // Speed of deleting each character
        pauseAfterType: 1000, // Pause after typing before delete
        pauseAfterDelete: 300, // Pause after delete before next type
        pauseBeforeFinal: 300, // Pause before typing final text
        pauseBeforeDesktop: 1500, // Pause after "AGENTSCOPE" before typing " DESKTOP"
        delayBeforePrompt: 2000, // Delay before showing "press any key" prompt

        // Audio settings
        audioVolume: 0.3, // Volume level (0.0 to 1.0)

        // Text sequences
        sequences: [
            { text: 'AGENT', shouldDelete: true },
            { text: 'AGENTSCOPE', shouldDelete: true },
            { text: 'AGENTSCOPE DESKTOP', shouldDelete: false },
        ],
    };

    useEffect(() => {
        // Initialize audio elements for typing and deleting
        typeAudioRef.current = new Audio(typeSound);
        typeAudioRef.current.volume = config.audioVolume;

        deleteAudioRef.current = new Audio(deleteSound);
        deleteAudioRef.current.volume = config.audioVolume;
    }, [config.audioVolume]);

    // Listen for keyboard events to proceed
    useEffect(() => {
        const handleKeyPress = () => {
            if (canProceed) {
                onComplete();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [canProceed, onComplete]);

    // Delay showing the "press any key" prompt
    useEffect(() => {
        if (animationComplete) {
            const timer = setTimeout(() => {
                setCanProceed(true);
            }, config.delayBeforePrompt);

            return () => clearTimeout(timer);
        }
        return undefined;
    }, [animationComplete, config.delayBeforePrompt]);

    const playKeySound = () => {
        const audio = isTypingRef.current ? typeAudioRef.current : deleteAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
                // Ignore errors
            });
        }
    };

    return (
        <div className="size-full flex justify-center">
            <div className="flex flex-col w-fit h-full relative items-start justify-center">
                <div
                    aria-hidden="true"
                    className="text-5xl font-bold inline-flex items-center tracking-wide text-white h-0 invisible"
                >
                    AGENTSCOPE DESKTOP
                    <div className="inline-block w-[2px]"></div>
                </div>
                <div className="relative inline-flex items-center w-full">
                    <div className="absolute -top-10 text-2xl font-medium">WE BUILD</div>
                    <div className="text-5xl font-bold inline-flex items-center tracking-wide">
                        <TypeIt
                            options={{
                                startDelay: config.initialDelay,
                                speed: config.typeSpeed,
                                deleteSpeed: config.deleteSpeed,
                                waitUntilVisible: true,
                                cursor: false,
                                afterStep: () => {
                                    playKeySound();
                                },
                                afterComplete: () => {
                                    setAnimationComplete(true);
                                },
                            }}
                            getBeforeInit={instance => {
                                config.sequences.forEach((seq, index) => {
                                    instance.exec(() => {
                                        isTypingRef.current = true;
                                    });

                                    // For the last sequence, split "AGENTSCOPE DESKTOP" into two parts
                                    if (
                                        index === config.sequences.length - 1 &&
                                        seq.text === 'AGENTSCOPE DESKTOP'
                                    ) {
                                        instance
                                            .type('AGENTSCOPE')
                                            .pause(config.pauseBeforeDesktop)
                                            .type(' DESKTOP');
                                    } else {
                                        instance.type(seq.text);
                                    }

                                    if (seq.shouldDelete) {
                                        instance.pause(config.pauseAfterType);
                                        instance.exec(() => {
                                            isTypingRef.current = false;
                                        });
                                        instance.delete();
                                        instance.pause(
                                            index < config.sequences.length - 1
                                                ? config.pauseAfterDelete
                                                : config.pauseBeforeFinal
                                        );
                                    }
                                });
                                return instance;
                            }}
                        />
                        <div className="inline-block w-[2px] animate-blink bg-primary h-10 ml-1"></div>
                    </div>
                </div>

                {/* Press any key to continue */}
                {canProceed && (
                    <div className="absolute bottom-20 text-sm text-muted-foreground animate-pulse items-center w-full text-center">
                        ANY KEY TO CONTINUE
                    </div>
                )}
            </div>
        </div>
    );
}
