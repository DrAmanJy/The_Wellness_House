'use client';

import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useStore } from '@/context/store-context';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#FFFEFA] border border-[#30473B]/15 rounded-xl shadow-xl p-4 flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200"
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-[#C58B71] shrink-0 mt-0.5" />
          ) : toast.type === 'info' ? (
            <Info className="w-5 h-5 text-[#30473B] shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#30473B] shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-[#252A25] leading-snug">{toast.title}</h4>
            {toast.description && (
              <p className="text-xs text-[#71776F] mt-0.5 leading-relaxed">{toast.description}</p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#71776F] hover:text-[#252A25] p-1 -mr-1 -mt-1 transition-colors"
            aria-label="Dismiss Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
