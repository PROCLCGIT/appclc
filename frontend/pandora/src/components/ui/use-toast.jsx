// Adapted from https://ui.shadcn.com/docs/components/toast
import { useState, useEffect, createContext, useContext } from "react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

const toastTimeouts = new Map();

const ToastContext = createContext({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
  remove: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function toast({ ...props }) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      ...props,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss(id);
      },
    };

    setToasts((prevToasts) => {
      const updatedToasts = [newToast, ...prevToasts].slice(0, TOAST_LIMIT);
      return updatedToasts;
    });

    return id;
  }

  function dismiss(id) {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, open: false } : toast
      )
    );

    if (toastTimeouts.has(id)) {
      clearTimeout(toastTimeouts.get(id));
    }

    const timeout = setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, TOAST_REMOVE_DELAY);

    toastTimeouts.set(id, timeout);
  }

  function remove(id) {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, remove }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}