import { motion } from 'motion/react';
import React from 'react';
import { cn } from '../lib/utils';

interface LoaderButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export default function LoaderButton({ 
  isLoading, 
  loadingText, 
  children, 
  className, 
  disabled,
  ...props 
}: LoaderButtonProps) {
  return (
    <button
      className={cn(
        "relative flex h-14 w-full items-center justify-center rounded-xl font-bold transition-all disabled:opacity-70",
        isLoading ? "cursor-wait" : "active:scale-95",
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-6 w-6 rounded-full border-2 border-white border-b-transparent"
          />
          {loadingText && <span className="mr-3">{loadingText}</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
}
