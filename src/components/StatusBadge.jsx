import React from 'react';
import { CheckCircle2, Cpu, Sparkles, Sigma } from 'lucide-react';

/**
 * StatusBadge
 *
 * Scientific-transparency label used across Q-SEC to make an explicit,
 * consistent distinction between:
 *   - REAL       -> actually implemented (Ed25519, SHA-256, sessions, DB, audit...)
 *   - SIMULATED  -> software simulation of quantum behavior (Bell state, teleportation...)
 *   - FUTURE     -> not implemented yet, roadmap only (physical QPU, PQC provider...)
 *
 * This is a presentational component only. It never determines or implies
 * any security decision — it exists purely to keep judges/reviewers oriented.
 */
export default function StatusBadge({ type = 'real', label, size = 'sm' }) {
  const normalized = String(type).toLowerCase();

  const config = {
    real: {
      text: label || 'REAL',
      icon: CheckCircle2,
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    simulated: {
      text: label || 'SIMULATED',
      icon: Cpu,
      classes: 'bg-quantum-purple/10 text-quantum-purple border-quantum-purple/30',
    },
    future: {
      text: label || 'FUTURE',
      icon: Sparkles,
      classes: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    },
    theoretical: {
      text: label || 'THEORETICAL',
      icon: Sigma,
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
  }[normalized] || {
    text: label || String(type).toUpperCase(),
    icon: CheckCircle2,
    classes: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  const Icon = config.icon;
  const sizeClasses =
    size === 'xs'
      ? 'text-[9px] px-1.5 py-0.5 gap-1'
      : 'text-[10px] px-2 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono font-bold uppercase tracking-wider whitespace-nowrap ${sizeClasses} ${config.classes}`}
      title={
        normalized === 'real'
          ? 'Actually implemented and cryptographically enforced'
          : normalized === 'simulated'
          ? 'Software-based quantum-inspired simulation, not physical quantum hardware'
          : normalized === 'theoretical'
          ? 'Theoretical mathematical reference bound, not an observed measurement'
          : 'Planned future extension, not yet implemented'
      }
    >
      <Icon size={size === 'xs' ? 10 : 11} />
      {config.text}
    </span>
  );
}
