import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import { sound } from '../../services/sound';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  const iconWrapperClass = isDanger
    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
    : isWarning
      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
      : 'bg-duo-blue/15 dark:bg-duo-blue/20 text-duo-blue border-duo-blue/30';

  const confirmBtnClass = isDanger
    ? 'bg-rose-500 hover:bg-rose-400 border-b-4 border-rose-700 text-white'
    : isWarning
      ? 'bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-700 text-white'
      : 'bg-duo-blue hover:bg-blue-400 border-b-4 border-duo-blue-dark text-white';

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onCancel}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#18272e] rounded-3xl border-2 border-duo-gray-200 dark:border-[#283842] shadow-2xl p-5 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 ${iconWrapperClass}`}
            >
              {isDanger || isWarning ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <HelpCircle className="w-5 h-5" />
              )}
            </div>
            <h3
              id="confirm-modal-title"
              className="text-base font-black text-gray-800 dark:text-gray-100 leading-tight"
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onCancel();
            }}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#131f24] hover:bg-gray-200 dark:hover:bg-[#283842] flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>

        <p
          id="confirm-modal-desc"
          className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 leading-relaxed"
        >
          {message}
        </p>

        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onCancel();
            }}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-gray-100 dark:bg-[#131f24] hover:bg-gray-200 dark:hover:bg-[#283842] border-2 border-duo-gray-200 dark:border-[#283842] text-xs font-black text-gray-700 dark:text-gray-200 transition-all cursor-pointer active:translate-y-0.5"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onConfirm();
            }}
            className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer active:translate-y-0.5 ${confirmBtnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
