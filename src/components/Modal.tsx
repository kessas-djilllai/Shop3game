import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  type?: 'default' | 'error' | 'success';
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, type = 'default', className = '' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div
        className={`relative w-full overflow-hidden rounded-[25px] border border-gray-100 bg-white p-6 md:p-8 shadow-2xl shadow-gray-200/50 ${className || 'max-w-md'}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className={`text-xl font-black ${type === 'error' ? 'text-red-600' : type === 'success' ? 'text-emerald-600' : 'text-[#CD1212]'}`}>
            {title}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 transition-colors">
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>
        <div className="text-gray-600 font-medium">
          {children}
        </div>
      </div>
    </div>
  );
}
