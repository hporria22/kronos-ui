import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Toast } from '../types';

interface ToastContextValue {
  push: (type: Toast['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (type: Toast['type'], message: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-container" data-testid="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`} data-testid={`toast-${t.type}`}>
            <span>{t.message}</span>
            <button className="toast-close" onClick={() => remove(t.id)} aria-label="Close">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}