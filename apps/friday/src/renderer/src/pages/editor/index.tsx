import { Crepe } from '@milkdown/crepe';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { replaceAll } from '@milkdown/utils';
import '@milkdown/crepe/theme/frame.css';
import '@milkdown/crepe/theme/common/reset.css';
import '@milkdown/crepe/theme/common/list-item.css';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/common/table.css';
import '@milkdown/crepe/theme/common/block-edit.css';
import '@milkdown/crepe/theme/common/cursor.css';
import '@milkdown/crepe/theme/common/code-mirror.css';
import '@milkdown/crepe/theme/common/image-block.css';
import '@milkdown/crepe/theme/common/latex.css';
import '@milkdown/crepe/theme/common/link-tooltip.css';
import '@milkdown/crepe/theme/common/placeholder.css';
import '@milkdown/crepe/theme/common/prosemirror.css';
import '@milkdown/crepe/theme/common/toolbar.css';
import '@milkdown/crepe/theme/frame.css';
import type { Document } from '@shared/types/document';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { FC, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { PageSidebar } from '@/components/sidebar/PageSidebar';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/use-documents';

interface Props {
    value?: string;
    onChange?: (markdown: string) => void;
}

export const MilkdownEditor: FC<Props> = ({ value, onChange }) => {
    const onChangeRef = useRef(onChange);
    const crepeRef = useRef<Crepe | null>(null);
    const prevExternalValue = useRef(value);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEditor(root => {
        const crepe = new Crepe({
            root,
            defaultValue: value ?? '',
        });

        crepe.editor
            .config(ctx => {
                ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
                    if (markdown !== prevMarkdown) {
                        prevExternalValue.current = markdown; // Sync record
                        onChangeRef.current?.(markdown);
                    }
                });
            })
            .use(listener);

        // ✅ Save instance
        crepeRef.current = crepe;

        return crepe;
    }, []);

    useEffect(() => {
        if (value === undefined) return;
        if (value === prevExternalValue.current) return;

        prevExternalValue.current = value;

        crepeRef.current?.editor.action(replaceAll(value));
    }, [value]);

    return <Milkdown />;
};

/**
 * The editor page component that provides a markdown editor with document management.
 *
 * @returns An EditorPage component.
 */
export function EditorPage() {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [content, setContent] = useState('');
    const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
    const initializedRef = useRef(false);

    const {
        allDocuments,
        hasMore,
        loading,
        loadMore,
        createDocument,
        renameDocument,
        pinDocument,
        deleteDocument,
    } = useDocuments();

    // Initialization logic: after loading is complete, automatically select the latest document or create a default document
    useEffect(() => {
        if (loading || initializedRef.current) return;
        initializedRef.current = true;

        const init = async () => {
            if (allDocuments.length > 0) {
                // Jump to the document with the latest updatedAt
                const latest = [...allDocuments].sort((a, b) => b.updatedAt - a.updatedAt)[0];
                setCurrentDocumentId(latest.id);
                try {
                    const documentContent = await window.api.editor.getContent(latest.id);
                    setContent(documentContent);
                } catch (error) {
                    console.error('Failed to load document content:', error);
                }
            } else {
                // No documents, create a default document
                try {
                    const newDocument = await createDocument();
                    if (newDocument) {
                        setCurrentDocumentId(newDocument.id);
                        setContent('');
                    }
                } catch (error) {
                    console.error('Failed to create default document:', error);
                }
            }
        };

        init().catch(console.error);
    }, [loading, allDocuments, createDocument]);

    const handleDocumentClick = async (document: Document) => {
        setCurrentDocumentId(document.id);
        try {
            const documentContent = await window.api.editor.getContent(document.id);
            setContent(documentContent);
        } catch (error) {
            console.error('Failed to load document content:', error);
        }
    };

    const handleCreateDocument = async () => {
        try {
            const newDocument = await createDocument();
            if (newDocument) {
                setCurrentDocumentId(newDocument.id);
                setContent('');
            }
        } catch (error) {
            console.error('Failed to create document:', error);
        }
    };

    const handleContentChange = async (markdown: string) => {
        setContent(markdown);
        if (currentDocumentId) {
            try {
                await window.api.editor.saveContent(currentDocumentId, markdown);
            } catch (error) {
                console.error('Failed to save document content:', error);
            }
        }
    };

    return (
        <div className="flex h-full w-full">
            {sidebarOpen && (
                <PageSidebar
                    items={allDocuments}
                    hasMore={hasMore}
                    loading={loading}
                    onItemClick={handleDocumentClick}
                    onCreateClick={handleCreateDocument}
                    onPinClick={pinDocument}
                    onRenameClick={renameDocument}
                    onDeleteClick={deleteDocument}
                    onLoadMore={loadMore}
                    locale={{
                        createButton: t('editor.createDocument'),
                        itemsTitle: t('editor.documents'),
                        loadMore: t('common.loadMore'),
                        renameTitle: t('common.rename'),
                        renameDescription: t('editor.renameDescription'),
                        deleteTitle: t('common.delete'),
                        deleteDescription: t('editor.deleteConfirm'),
                    }}
                />
            )}
            <div className="flex flex-row h-full flex-1">
                <div className="flex w-fit h-full pt-4 px-4">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? (
                            <PanelLeftClose className="h-4 w-4" />
                        ) : (
                            <PanelLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <div className="flex flex-rowbg-white h-full overflow-y-auto">
                    <MilkdownProvider>
                        <MilkdownEditor value={content} onChange={handleContentChange} />
                    </MilkdownProvider>
                </div>
            </div>
        </div>
    );
}
