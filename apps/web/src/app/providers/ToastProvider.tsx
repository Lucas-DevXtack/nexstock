import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: string; type: 'info'|'success'|'warn'|'error'; message: string };

const ToastCtx = createContext<{ push: (t: Omit<Toast,'id'>) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast,'id'>) => {
    const id = crypto.randomUUID();
    setItems((s) => [...s, { ...t, id }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2500);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {items.map((t) => (
          <div key={t.id} className={`rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm ${
            t.type==='error'?'border-red-200':t.type==='warn'?'border-amber-200':t.type==='success'?'border-green-200':'border-gray-200'
          }`}>
            <div className="font-semibold">{t.type.toUpperCase()}</div>
            <div className="text-gray-700">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    return { push: (t: any) => console.warn('[toast]', t?.type || 'info', t?.message || t) };
  }
  return ctx;
}
