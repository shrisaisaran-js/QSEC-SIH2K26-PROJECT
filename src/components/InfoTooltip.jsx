import React, { useState } from 'react';
import { Info } from 'lucide-react';

/**
 * InfoTooltip
 *
 * Small inline "?" affordance that reveals a short plain-language explanation
 * of a technical metric/term. Used so a judge unfamiliar with cryptography or
 * quantum computing can still understand each number on screen.
 */
export default function InfoTooltip({ text, side = 'top' }) {
  const [open, setOpen] = useState(false);

  const positionClasses =
    side === 'bottom'
      ? 'top-full mt-2'
      : side === 'left'
      ? 'right-full mr-2 top-1/2 -translate-y-1/2'
      : side === 'right'
      ? 'left-full ml-2 top-1/2 -translate-y-1/2'
      : 'bottom-full mb-2';

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More information"
        className="text-slate-500 hover:text-quantum-blue transition-colors cursor-help"
      >
        <Info size={12} />
      </button>
      {open && (
        <span
          role="tooltip"
          className={`absolute z-50 w-56 p-2.5 rounded-lg bg-dark-900/95 border border-slate-700/60 backdrop-blur-xl text-[11px] leading-relaxed text-slate-300 shadow-lg shadow-black/40 ${positionClasses}`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
