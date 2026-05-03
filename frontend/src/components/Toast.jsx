import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, Sparkles } from 'lucide-react';

const ToastContext = createContext(null);

const toneConfig = {
  success: {
    ring: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
    Icon: CheckCircle2,
  },
  error: {
    ring: 'border-rose-400/30 bg-rose-400/10 text-rose-100',
    Icon: AlertTriangle,
  },
  info: {
    ring: 'border-sky-400/30 bg-sky-400/10 text-sky-100',
    Icon: Info,
  },
  default: {
    ring: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
    Icon: Sparkles,
  },
};

function ToastCard({ toast, onDismiss }) {
  const config = toneConfig[toast.tone] || toneConfig.default;
  const Icon = config.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.96 }}
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${config.ring}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border border-white/10 bg-black/20 p-2">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{toast.title}</p>
          {toast.message ? <p className="mt-1 text-sm text-slate-300">{toast.message}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = (toast) => {
    const id = globalThis.crypto?.randomUUID?.() || `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { tone: 'default', ...toast, id }]);
    window.setTimeout(() => removeToast(id), toast.duration || 4200);
  };

  const value = { pushToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
