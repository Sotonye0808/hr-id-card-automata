import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID?.() ?? `${Date.now()}`;
    setItems((prev) => [...prev, { id, message, type }]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {items.map((item) => (
            <ToastItem key={item.id} item={item} onDone={() => remove(item.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3500);
    return () => clearTimeout(timer);
  }, [onDone]);

  const icon = item.type === "success" ? <CheckCircle2 size={16} /> : item.type === "error" ? <AlertCircle size={16} /> : <Info size={16} />;
  const color = item.type === "success" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" : item.type === "error" ? "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" : "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 shadow-lg ${color}`}>
      {icon}
      <span className="text-xs font-semibold">{item.message}</span>
      <button onClick={onDone} className="ml-1 opacity-60 hover:opacity-100">
        <X size={12} />
      </button>
    </motion.div>
  );
}
