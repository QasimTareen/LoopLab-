import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export default function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-start gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-purple-950/85 border-purple-500/50 text-purple-200'
                : toast.type === 'error'
                ? 'bg-red-950/85 border-red-500/50 text-red-200'
                : 'bg-indigo-950/85 border-indigo-500/50 text-indigo-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm font-medium">{toast.text}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-purple-400 hover:text-purple-100 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
