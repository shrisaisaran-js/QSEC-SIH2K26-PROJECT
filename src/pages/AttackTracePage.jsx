import React from 'react';
import { useQds } from '../context/QdsContext';
import { Terminal, FlaskConical, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import AttackTrace from '../components/AttackTrace';

export default function AttackTracePage() {
  const { attackSimulation, setActiveTab } = useQds();

  const hasTrace = Array.isArray(attackSimulation.trace) && attackSimulation.trace.length > 0;

  return (
    <div className="space-y-6">
      <div className="glass-card neu-raised p-6 border-slate-800/40 relative">
        <SectionHeader
          title="Attack Trace"
          description="Backend-recorded execution trace for controlled security simulations."
          action={<StatusBadge type="simulated" />}
        />
      </div>

      {!hasTrace ? (
        <div className="glass-card neu-raised p-10 border-slate-800/40 flex flex-col items-center text-center gap-3">
          <Terminal size={22} className="text-slate-700" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            No Attack Trace Available
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            Run a controlled simulation to generate a forensic trace.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('attack')}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wide px-3 py-2 rounded border border-quantum-blue/40 text-quantum-blue hover:bg-quantum-blue/10 transition-colors"
          >
            <FlaskConical size={13} />
            Open Attack Lab
            <ArrowRight size={13} />
          </button>
        </div>
      ) : (
        <div className="glass-card neu-raised p-6 border-slate-800/40">
          {/* Result summary */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-2 pb-4 border-b border-dark-800 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              {attackSimulation.detected ? (
                <ShieldAlert size={14} className="text-red-400" />
              ) : (
                <CheckCircle2 size={14} className="text-emerald-400" />
              )}
              <span className={attackSimulation.detected ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                {attackSimulation.detected ? 'THREAT DETECTED' : 'NO THREAT DETECTED'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Scenario:</span>{' '}
              <span className="text-slate-200 font-bold uppercase">{attackSimulation.type}</span>
            </div>
            <div>
              <span className="text-slate-500">Decision:</span>{' '}
              <span
                className={`font-bold ${
                  attackSimulation.decision === 'ACCEPT'
                    ? 'text-emerald-400'
                    : attackSimulation.decision === 'BLOCKED'
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {attackSimulation.decision || '—'}
              </span>
            </div>
            {attackSimulation.sessionId && (
              <div className="min-w-0">
                <span className="text-slate-500">Session:</span>{' '}
                <span className="text-slate-400 break-all">{attackSimulation.sessionId}</span>
              </div>
            )}
          </div>

          {/* Forensic timeline (reuses the existing AttackTrace component) */}
          <AttackTrace trace={attackSimulation.trace} timestamp={attackSimulation.timestamp} />
        </div>
      )}
    </div>
  );
}
