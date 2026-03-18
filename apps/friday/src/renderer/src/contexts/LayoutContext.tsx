import { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
    // Titlebar content
    titlebarContent: ReactNode | null;
    setTitlebarContent: (content: ReactNode | null) => void;

    // Statusbar content
    statusbarContent: ReactNode | null;
    setStatusbarContent: (content: ReactNode | null) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

/**
 * Provides layout context (titlebar/statusbar content) to the component tree.
 * @param root0 - Component props.
 * @param root0.children - Child components.
 * @returns A context provider element.
 */
export function LayoutProvider({ children }: { children: ReactNode }) {
    const [titlebarContent, setTitlebarContent] = useState<ReactNode | null>(null);
    const [statusbarContent, setStatusbarContent] = useState<ReactNode | null>(null);

    return (
        <LayoutContext.Provider
            value={{
                titlebarContent,
                setTitlebarContent,
                statusbarContent,
                setStatusbarContent,
            }}
        >
            {children}
        </LayoutContext.Provider>
    );
}

// Custom hooks
/**
 * Returns the full layout context value.
 * @returns The LayoutContextType value.
 */
export function useLayout() {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within LayoutProvider');
    }
    return context;
}

/**
 * Returns titlebar content state and setter.
 * @returns Titlebar content and setter.
 */
export function useTitlebar() {
    const { titlebarContent, setTitlebarContent } = useLayout();
    return { titlebarContent, setTitlebarContent };
}

/**
 * Returns statusbar content state and setter.
 * @returns Statusbar content and setter.
 */
export function useStatusbar() {
    const { statusbarContent, setStatusbarContent } = useLayout();
    return { statusbarContent, setStatusbarContent };
}
