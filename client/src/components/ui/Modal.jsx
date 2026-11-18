// Accessible dialog on the native <dialog> element: focus trap, Esc to close and a backdrop for free.
// dismissible={false} blocks Esc and backdrop clicks, for example while an action is running.
import { useEffect, useId, useRef } from 'react';
import Button from './Button.jsx';

export default function Modal({ open, onClose, title, children, footer, dismissible = true }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      // Esc fires "cancel" before the dialog closes; stop it and let React decide via onClose.
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose?.();
      }}
      // Mouse down (not click) on the backdrop, so dragging out of a text field doesn't close the dialog.
      onMouseDown={(e) => dismissible && e.target === ref.current && onClose?.()}
      aria-labelledby={titleId}
      className="w-[calc(100%-2rem)] max-w-lg rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm open:animate-fade-in"
    >
      <div className="p-6">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <div className="mt-2 text-sm text-slate-600">{children}</div>
      </div>
      {footer && (
        <div className="flex flex-col-reverse gap-2 rounded-b-2xl bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          {footer}
        </div>
      )}
    </dialog>
  );
}

// For cancel and refund actions: nothing happens until the user confirms,
// and the dialog cannot be dismissed while the action is running.
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Go back',
  danger = false,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      dismissible={!loading}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
