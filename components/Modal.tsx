
import React, { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  requireConfirmationText?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    children, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel', 
    confirmVariant = 'primary',
    requireConfirmationText 
}) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const confirmClasses = {
    primary: 'bg-violet-600 hover:bg-violet-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const isConfirmDisabled = requireConfirmationText ? inputValue.trim() !== requireConfirmationText.trim() : false;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 fade-in" onClick={onClose}>
      <div className="comic-panel max-w-md w-full bg-gray-800" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b-4 border-black">
          <h3 className="font-comic-header text-3xl text-red-400">{title}</h3>
        </div>
        <div className="p-6 text-gray-300 leading-relaxed space-y-4">
          {children}
          {requireConfirmationText && (
            <div className="mt-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Type "${requireConfirmationText}" to confirm`}
                className="w-full bg-gray-900 border-2 border-black rounded-md p-2 text-white font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          )}
        </div>
        <div className="p-4 flex justify-end gap-3 bg-gray-900/50 border-t-2 border-black">
          <button onClick={onClose} className="comic-button bg-gray-500 hover:bg-gray-600 text-white px-4 py-2">
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`comic-button px-4 py-2 ${confirmClasses[confirmVariant]}`}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
