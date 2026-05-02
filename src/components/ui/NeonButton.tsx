import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export function NeonButton({ children, variant = 'primary', fullWidth = false, className = '', ...props }: NeonButtonProps) {
  let baseStyles = "active:scale-[0.98] transition-all duration-200 pointer-events-auto flex items-center justify-center gap-2 ";
  
  if (variant === 'primary') {
    baseStyles += "font-h2 text-h2 py-4 rounded-xl font-bold tracking-wider bg-primary-container text-on-primary-fixed shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)]";
  } else if (variant === 'danger') {
    baseStyles += "font-h2 text-h2 py-4 rounded-xl font-bold tracking-wider bg-neon-red text-white shadow-[0_0_20px_rgba(255,42,95,0.4)] hover:shadow-[0_0_30px_rgba(255,42,95,0.6)]";
  } else if (variant === 'ghost') {
    baseStyles += "text-primary-container hover:text-primary transition-colors text-sm font-semibold tracking-wide py-2";
  }

  if (fullWidth) {
    baseStyles += " w-full max-w-md mx-auto block";
  }

  return (
    <button className={`${baseStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
