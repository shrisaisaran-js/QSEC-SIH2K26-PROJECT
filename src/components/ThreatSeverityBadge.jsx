import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Flame } from 'lucide-react';

/**
 * ThreatSeverityBadge
 *
 * Consistent severity pill used across Threat Detection, Attack Lab, Attack
 * Trace, and Audit Trail. Renders whatever severity string the backend
 * returns (LOW / WARNING / HIGH / CRITICAL) — it never computes or infers a
 * severity itself.
 */
export default function ThreatSeverityBadge({ severity, size = 'sm' }) {
  const normalized = String(severity || 'LOW').toUpperCase();

  const config =
    {
      CRITICAL: {
        icon: Flame,
        classes: 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse',
      },
      HIGH: {
        icon: ShieldAlert,
        classes: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      },
      WARNING: {
        icon: AlertTriangle,
        classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      },
      LOW: {
        icon: ShieldCheck,
        classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      },
    }[normalized] || {
      icon: ShieldCheck,
      classes: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    };

  const Icon = config.icon;
  const sizeClasses =
    size === 'xs' ? 'text-[9px] px-1.5 py-0.5 gap-1' : 'text-[10px] px-2 py-0.5 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-bold uppercase tracking-wider whitespace-nowrap border ${sizeClasses} ${config.classes}`}
    >
      <Icon size={size === 'xs' ? 9 : 11} />
      {normalized}
    </span>
  );
}
