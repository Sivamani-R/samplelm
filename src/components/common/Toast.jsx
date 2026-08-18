import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

/**
 * Toast Item Component
 */
export const ToastItem = ({ toast, onDismiss }) => {
  const Icon = TOAST_ICONS[toast.type] || Info;

  return (
    <div className={`toast-item toast-${toast.type}`} role="alert">
      <div className="toast-icon-wrap">
        <Icon size={18} />
      </div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

/**
 * Toast Container Component
 */
export const ToastContainer = ({ toasts = [], onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
