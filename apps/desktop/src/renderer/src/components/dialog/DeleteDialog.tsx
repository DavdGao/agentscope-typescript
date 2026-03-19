import { AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/i18n/useI18n';

/**
 * Confirmation dialog for destructive delete actions.
 * @param root0 - Component props.
 * @param root0.open - Whether the dialog is open.
 * @param root0.setOpen - Controls dialog visibility.
 * @param root0.title - Dialog title.
 * @param root0.description - Dialog description.
 * @param root0.onConfirm - Async callback executed on confirm.
 * @param root0.successToast - Toast message shown on success.
 * @returns A dialog element.
 */
export function DeleteDialog({
    open,
    setOpen,
    title,
    description,
    onConfirm,
    successToast,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    successToast: string;
}) {
    const { t } = useTranslation();
    const [deleting, setDeleting] = useState(false);
    const handleConfirm = async () => {
        setDeleting(true);
        try {
            await onConfirm();
            setOpen(false);
            toast.success(successToast);
        } catch (e) {
            toast.error(String(e));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="min-w-[34rem]">
                <DialogHeader>
                    <DialogTitle className="tracking-tighter">{title}</DialogTitle>
                    <DialogDescription className="tracking-tighter">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                        <AlertCircle data-icon="inline-start" className="size-3.5" />
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={async () => await handleConfirm()} autoFocus>
                        {deleting ? (
                            <Spinner data-icon="inline-start" />
                        ) : (
                            <CheckCircle data-icon="inline-start" className="size-3.5" />
                        )}
                        {t('common.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
