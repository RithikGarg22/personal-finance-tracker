import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  // Focus management - focus confirm button when dialog opens
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  // Trap focus within dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      icon: '⚠️',
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      icon: '⚡',
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      icon: 'ℹ️',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <span
            className="text-2xl flex-shrink-0"
            aria-hidden="true"
            role="img"
          >
            {currentVariant.icon}
          </span>
          <div className="flex-1">
            <h2
              id="dialog-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Message */}
        <p
          id="dialog-description"
          className="text-gray-600 text-sm sm:text-base"
        >
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 min-h-[44px] text-gray-700 bg-gray-100 rounded-lg
              hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500
              focus:ring-offset-2 transition-colors font-medium"
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 min-h-[44px] text-white rounded-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2
              transition-colors font-medium ${currentVariant.button}`}
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> to
          cancel or <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd>{' '}
          to confirm
        </div>
      </div>
    </div>
  );
}
