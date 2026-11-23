// App-wide toasts.
//   const toast = useToast();
//   toast.success('Booking saved');
//   toast.error('Could not save the booking', 'Check your connection and try again.');
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { cx } from './cx.js';

const ToastContext = createContext(null);

const tones = {
  success: { bar: 'bg-success-600', icon: '✓' },
  error: { bar: 'bg-danger-600', icon: '✕' },
  info: { bar: 'bg-primary-600', icon: 'i' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (tone, title, message) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, tone, title, message }]);
      setTimeout(() => dismiss(id), tone === 'error' ? 8000 : 4000);
    },
    [dismiss],
  );
  const api = useMemo(
    () => ({
      success: (title, message) => push('success', title, message),
      error: (title, message) => push('error', title, message),
      info: (title, message) => push('info', title, message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-fade-in overflow-hidden rounded-xl bg-surface shadow-xl ring-1 ring-slate-200"
          >
            <span className={cx('w-1.5 shrink-0', tones[t.tone].bar)} />
            <div className="flex flex-1 items-start gap-3 p-4">
              <span aria-hidden="true" className="text-sm font-bold text-slate-500">
                {tones[t.tone].icon}
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-slate-900">{t.title}</p>
                {t.message && <p className="mt-0.5 text-slate-600">{t.message}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="-m-1 rounded p-1 text-slate-400 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>.');
  return ctx;
}
