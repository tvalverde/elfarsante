import { useEffect, type ReactNode } from 'react';

interface NeonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function NeonModal({ isOpen, onClose, title, children }: NeonModalProps) {
  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-surface-container-high border-2 border-primary-container p-6 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.2)] w-full max-w-md max-h-[80vh] flex flex-col gap-4 animate-in zoom-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <h2 className="font-h1 text-2xl text-primary-container uppercase tracking-tight">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-outline transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar text-on-surface font-body-md leading-relaxed whitespace-pre-line">
          {children}
        </div>
      </div>
    </div>
  );
}
