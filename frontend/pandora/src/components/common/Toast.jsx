    // src/components/common/Toast.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Toast = ({ show, message, type = 'success', onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 p-4 rounded-lg shadow-lg
      ${type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};