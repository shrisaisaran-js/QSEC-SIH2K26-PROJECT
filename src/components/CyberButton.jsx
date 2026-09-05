import React from 'react';

/**
 * CyberButton
 *
 * Premium action button used throughout Q-SEC: raised glass surface with a
 * subtle lift-on-hover / press-on-active micro-interaction (see .cyber-btn
 * in index.css). Purely presentational — never makes a security decision.
 *
 * variant: 'primary' | 'danger' | 'ghost' | 'outline'
 * size: 'sm' | 'md'
 */
export default function CyberButton({
  children,
  icon: Icon,
  variant = 'outline',
  size = 'sm',
  className = '',
  ...rest
}) {
  const variantClass =
    variant === 'primary'
      ? 'bg-gradient-to-r from-quantum-blue to-quantum-blue/80 text-dark-950 border-quantum-blue/60 hover:shadow-glow-blue'
      : variant === 'danger'
      ? 'bg-dark-900/60 text-red-400 border-red-500/40 hover:bg-red-950/20 hover:shadow-glow-red'
      : variant === 'ghost'
      ? 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-dark-850/60'
      : 'bg-dark-900/60 text-quantum-blue border-quantum-blue/30 hover:bg-quantum-blue/10 hover:shadow-glow-blue';

  const sizeClass = size === 'md' ? 'px-4 py-2.5 text-xs' : 'px-3 py-2 text-[11px]';

  return (
    <button
      type="button"
      className={`cyber-btn ${variantClass} ${sizeClass} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'md' ? 14 : 12} />}
      {children}
    </button>
  );
}
