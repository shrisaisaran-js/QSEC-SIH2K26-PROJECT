import React from 'react';
import { Terminal } from 'lucide-react';
import ForensicEvent from './ForensicEvent';

/**
 * AttackTrace
 *
 * Renders the backend-provided forensic trace for a single attack simulation
 * as a vertical timeline of expandable ForensicEvent cards. Renders exactly
 * what the backend returned in `trace` — no synthetic or reordered events.
 */
export default function AttackTrace({ trace, timestamp }) {
  if (!trace || trace.length === 0) return null;

  return (
    <div className="mt-6 border-t border-dark-800 pt-6">
      <div className="flex items-center gap-2 mb-4">
        <Terminal size={16} className="text-quantum-blue" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Attack Trace Timeline</h3>
      </div>

      <div className="text-[10px] text-slate-500 font-mono mb-4 flex justify-between items-center">
        <span>Detailed execution path through security architecture.</span>
        <span>{timestamp}</span>
      </div>

      <div className="space-y-0">
        {trace.map((step, index) => (
          <ForensicEvent key={index} step={step} isLast={index === trace.length - 1} />
        ))}
      </div>
    </div>
  );
}
