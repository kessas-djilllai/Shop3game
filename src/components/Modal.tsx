import { motion, AnimatePresence } from 'motion/react';
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
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full overflow-hidden rounded-[25px] border border-gray-100 bg-white p-6 md:p-8 shadow-2xl shadow-gray-200/50 ${className || 'max-w-md'}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`text-2xl font-black ${type === 'error' ? 'text-red-600' : type === 'success' ? 'text-emerald-600' : 'text-blue-600'}`}>
                {title}
              </h3>
              <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 transition-colors">
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <div className="text-gray-600 font-medium">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
