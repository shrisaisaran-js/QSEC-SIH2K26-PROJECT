import React, { useState } from 'react';
import { Shield, ShieldAlert, AlertTriangle, Play, Activity, ChevronDown } from 'lucide-react';

/**
 * ForensicEvent
 *
 * A single expandable node in the Attack Trace forensic timeline. Renders
 * exactly the backend-provided trace step (stage/status/detail/timestamp) —
 * it never invents or reorders events.
 */
export default function ForensicEvent({ step, isLast }) {
  const [expanded, setExpanded] = useState(false);

  let Icon = Activity;
  let colorClass = 'text-slate-400';
  let bgClass = 'border-slate-800 bg-dark-950/60';
  let iconBgClass = 'bg-dark-900 border-slate-800';

  if (step.status === 'OK' || step.status === 'PASS') {
    colorClass = 'text-emerald-400';
    bgClass = 'border-emerald-500/20 bg-emerald-950/10';
    iconBgClass = 'bg-emerald-950 border-emerald-500/50';
    Icon = Shield;
  } else if (step.status === 'DETECTED' || step.status === 'FAILED') {
    colorClass = 'text-red-400';
    bgClass = 'border-red-500/30 bg-red-950/10';
    iconBgClass = 'bg-red-950 border-red-500/50';
    Icon = ShieldAlert;
  } else if (step.status === 'BLOCKED' || step.status === 'REJECT') {
    colorClass = 'text-amber-400';
    bgClass = 'border-amber-500/30 bg-amber-950/10';
    iconBgClass = 'bg-amber-950 border-amber-500/50';
    Icon = AlertTriangle;
  } else if (step.status === 'INFO') {
    colorClass = 'text-quantum-blue';
    bgClass = 'border-quantum-blue/20 bg-quantum-blue/5';
    iconBgClass = 'bg-dark-900 border-quantum-blue/50';
    Icon = Play;
  }

  const extraKeys = Object.keys(step).filter(
    (k) => !['stage', 'status', 'detail', 'timestamp'].includes(k)
  );

  let timeLabel = '';
  try {
    timeLabel = new Date(step.timestamp).toISOString().split('T')[1].replace('Z', '');
  } catch {
    timeLabel = String(step.timestamp || '');
  }

  return (
    <div className="relative flex gap-3">
      {/* Node + connecting line */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-full border-2 shadow-lg ${iconBgClass}`}
        >
          <Icon size={14} className={colorClass} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-gradient-to-b from-slate-700 to-transparent mt-1" />}
      </div>

      {/* Event card */}
      <button
        type="button"
        onClick={() => extraKeys.length > 0 && setExpanded((v) => !v)}
        className={`mb-4 flex-1 text-left p-3 rounded-lg border card-lift ${bgClass} ${
          extraKeys.length > 0 ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={`text-[10px] font-bold font-mono tracking-wider ${colorClass}`}>
            {step.stage.replace(/_/g, ' ')}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-mono text-slate-500">{timeLabel}</span>
            {extraKeys.length > 0 && (
              <ChevronDown
                size={12}
                className={`text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            )}
          </div>
        </div>
        <div className="text-xs text-slate-300 font-mono leading-relaxed break-words">
          {step.detail}
        </div>
        {expanded && extraKeys.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dark-800/60 space-y-1 font-mono text-[10px] text-slate-500">
            {extraKeys.map((k) => (
              <div key={k} className="flex gap-2">
                <span className="text-slate-600">{k}:</span>
                <span className="text-slate-400 break-all">{String(step[k])}</span>
              </div>
            ))}
          </div>
        )}
      </button>
    </div>
  );
}
