import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  fullWidth = false
}: ButtonProps) {
  const baseClass = "font-medium rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed";
  
  const variantClass = {
    primary: "bg-accent text-background border-2 border-accent hover:bg-accent-hover hover:border-accent-hover shadow-[0_0_20px_rgba(91,222,234,0.2)] hover:shadow-[0_0_25px_rgba(91,222,234,0.3)] disabled:shadow-none",
    secondary: "bg-transparent text-accent border-2 border-accent/50 hover:bg-accent/10 hover:border-accent",
    destructive: "bg-destructive text-foreground border-2 border-destructive hover:bg-destructive-hover hover:border-destructive-hover shadow-[0_0_15px_rgba(200,93,93,0.2)]"
  }[variant];

  const sizeClass = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  }[size];

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
