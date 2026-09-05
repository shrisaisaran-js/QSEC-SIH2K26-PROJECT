import React from 'react';

/**
 * FlowConnector
 *
 * Reusable connector line for pipeline/flow diagrams (e.g. the security
 * verification pipeline, attack trace, signing workflow). Renders a thin
 * line with a lightweight animated pulse traveling along it.
 *
 * direction: 'horizontal' | 'vertical'
 * state: 'normal' | 'secure' | 'warning' | 'threat'
 */
export default function FlowConnector({ direction = 'horizontal', state = 'normal', colorClass: colorClassOverride }) {
  const colorClass =
    colorClassOverride ||
    (state === 'secure'
      ? 'bg-emerald-400'
      : state === 'warning'
      ? 'bg-amber-400'
      : state === 'threat'
      ? 'bg-rose-500'
      : 'bg-quantum-blue');

  const trackClass = 'bg-slate-800/70';

  if (direction === 'vertical') {
    return (
      <div className="relative w-[2px] h-6 mx-auto overflow-hidden rounded-full">
        <div className={`absolute inset-0 ${trackClass}`} />
        <span
          className={`absolute left-0 w-full h-2 rounded-full ${colorClass} opacity-80 motion-safe:animate-flow-pulse-vertical motion-reduce:hidden`}
        />
      </div>
    );
  }

  return (
    <div className="relative h-[2px] w-full overflow-hidden rounded-full">
      <div className={`absolute inset-0 ${trackClass}`} />
      <span
        className={`absolute top-0 h-full w-8 rounded-full ${colorClass} opacity-80 motion-safe:animate-flow-pulse-horizontal motion-reduce:hidden`}
      />
    </div>
  );
}
