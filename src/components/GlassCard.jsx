import React from 'react';

/**
 * GlassCard
 *
 * Consistent premium glass surface used across Q-SEC. Wraps the existing
 * .glass-card utility with optional neumorphic depth, hover-lift, and accent
 * variants, so every panel in the app shares one visual system.
 *
 * variant: 'default' | 'blue' | 'purple' | 'dense'
 *   - 'dense' uses a less-transparent surface for content that must stay
 *     highly readable (tables, crypto values, logs).
 * lift: adds a subtle hover-lift micro-interaction for interactive cards.
 * raised: adds neumorphic dual-shadow depth.
 */
export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  lift = false,
  raised = false,
  as: Tag = 'div',
  ...rest
}) {
  const variantClass =
    variant === 'purple'
      ? 'glass-card-purple'
      : variant === 'dense'
      ? 'glass-dense'
      : 'glass-card';

  return (
    <Tag
      className={`${variantClass} ${raised ? 'neu-raised' : ''} ${
        lift ? 'card-lift neu-raised-hover' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
