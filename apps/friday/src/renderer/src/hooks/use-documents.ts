import type { Document } from '@shared/types/document';
import { useState, useEffect, useCallback } from 'react';

const PAGE_SIZE = 20;

/**
 * A custom hook for managing documents and their operations.
 *
 * @returns An object containing document data and management functions.
 */
export function useDocuments() {
    const [pinnedDocuments, setPinnedDocuments] = useState<Document[]>([]);
    const [unpinnedDocuments, setUnpinnedDocuments] = useState<Document[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);

    const loadDocuments = useCallback(async (currentOffset: number) => {
        setLoading(true);
        try {
            const result = await window.api.editor.getDocuments({
                offset: currentOffset,
                limit: PAGE_SIZE,
            });

            if (currentOffset === 0) {
                setPinnedDocuments(result.pinned);
                setUnpinnedDocuments(result.items);
                setOffset(result.items.length);
            } else {
                setUnpinnedDocuments(prev => [...prev, ...result.items]);
                setOffset(prev => prev + result.items.length);
            }

            setHasMore(result.hasMore);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(() => {
        loadDocuments(0);
    }, [loadDocuments]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadDocuments(offset);
        }
    }, [loading, hasMore, offset, loadDocuments]);

    const createDocument = useCallback(async (name?: string) => {
        try {
            const newDocument = await window.api.editor.createDocument(name);
            // Optimistic update: add new document to the top of the list
            setUnpinnedDocuments(prev => [newDocument, ...prev]);
            return newDocument;
        } catch (error) {
            console.error('Failed to create document:', error);
            throw error;
        }
    }, []);

    const renameDocument = useCallback(async (id: string, name: string) => {
        try {
            await window.api.editor.renameDocument(id, name);
            // Optimistic update: directly modify frontend data
            const updateName = (documents: Document[]) =>
                documents.map(d => (d.id === id ? { ...d, name } : d));
            setPinnedDocuments(updateName);
            setUnpinnedDocuments(updateName);
        } catch (error) {
            console.error('Failed to rename document:', error);
            throw error;
        }
    }, []);

    const pinDocument = useCallback(
        async (id: string) => {
            try {
                // Find the document
                const allDocuments = [...pinnedDocuments, ...unpinnedDocuments];
                const document = allDocuments.find(d => d.id === id);
                if (!document) return;

                const newPinnedState = !document.pinned;
                await window.api.editor.pinDocument(id, newPinnedState);

                // Optimistic update: move between two lists
                if (newPinnedState) {
                    // Pin: move from unpinned to pinned
                    setUnpinnedDocuments(prev => prev.filter(d => d.id !== id));
                    setPinnedDocuments(prev => [...prev, { ...document, pinned: true }]);
                } else {
                    // Unpin: move from pinned to unpinned
                    setPinnedDocuments(prev => prev.filter(d => d.id !== id));
                    setUnpinnedDocuments(prev => [{ ...document, pinned: false }, ...prev]);
                }
            } catch (error) {
                console.error('Failed to pin document:', error);
                throw error;
            }
        },
        [pinnedDocuments, unpinnedDocuments]
    );

    const deleteDocument = useCallback(async (id: string) => {
        try {
            await window.api.editor.deleteDocument(id);
            // Optimistic update: directly remove from frontend list
            setPinnedDocuments(prev => prev.filter(d => d.id !== id));
            setUnpinnedDocuments(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error('Failed to delete document:', error);
            throw error;
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        pinnedDocuments,
        unpinnedDocuments,
        allDocuments: [...pinnedDocuments, ...unpinnedDocuments],
        hasMore,
        loading,
        loadMore,
        refresh,
        createDocument,
        renameDocument,
        pinDocument,
        deleteDocument,
    };
}
