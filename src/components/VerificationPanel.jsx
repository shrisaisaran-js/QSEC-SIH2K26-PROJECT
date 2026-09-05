import React from 'react';
import { useQds } from '../context/QdsContext';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import InfoTooltip from './InfoTooltip';

export default function VerificationPanel() {
  const { currentSimulation } = useQds();

  if (!currentSimulation) {
    return (
      <div className="glass-card p-6 border-slate-800/40 text-center text-slate-500 font-mono text-sm py-12">
        Awaiting signature verification attempt...
        <p className="text-[11px] text-slate-600 mt-2 normal-case">
          Configure parameters and run a verification to see the backend decision here.
        </p>
      </div>
    );
  }

  const {
    signatureId,
    samples,
    matching,
    mismatch,
    matchRate,
    decision,
    basis
  } = currentSimulation;

  const isAccept = decision === 'ACCEPT';
  const isBlocked = decision === 'BLOCKED';

  return (
    <div className="glass-card neu-raised p-6 border-slate-800/40 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Glow highlight */}
      <div className={`absolute -right-20 -bottom-20 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none ${
        isAccept ? 'bg-emerald-500' : isBlocked ? 'bg-amber-500' : 'bg-red-500'
      }`} />

      <div>
        <div className="flex items-center justify-between border-b border-dark-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Verification Result</h3>
            <StatusBadge type="real" size="xs" />
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-dark-950 border border-dark-800 text-quantum-blue uppercase">
            Basis: {basis}
          </span>
        </div>

        {/* Verification specs */}
        <div className="space-y-2.5 font-mono text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Signature ID:</span>
            <span className="text-white font-semibold truncate max-w-[60%]" title={signatureId}>{signatureId}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              Measurement Samples:
              <InfoTooltip text="Number of simulated QDS measurement outcomes compared for this verification attempt." />
            </span>
            <span className="text-white font-semibold">{samples}</span>
          </div>
          <div className="flex justify-between">
            <span>Matching Outcomes:</span>
            <span className="text-emerald-400 font-semibold">{matching}</span>
          </div>
          <div className="flex justify-between">
            <span>Mismatch Outcomes:</span>
            <span className="text-red-400 font-semibold">{mismatch}</span>
          </div>

          <div className="pt-2 border-t border-dark-800 space-y-2.5">
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                Match Rate:
                <InfoTooltip text="Percentage of measurement outcomes that matched expected values. This drives the ACCEPT/REJECT decision, computed by the backend." />
              </span>
              <span className={`font-bold ${isAccept ? 'text-emerald-400' : 'text-red-400'}`}>
                {matchRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Required Threshold:</span>
              <span className="text-slate-400">95%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Decision Display */}
      <div className="mt-6 pt-4 border-t border-dark-800">
        {isAccept ? (
          <div className="flex flex-col items-center justify-center p-4 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 shadow-glow-green">
            <CheckCircle2 size={36} className="mb-2 text-emerald-400" />
            <span className="text-lg font-bold tracking-wider text-glow-green">✓ ACCEPTED</span>
            <span className="text-[10px] font-mono mt-1 text-emerald-500 text-center">
              Cryptographic signature verified. No tampering detected.
            </span>
          </div>
        ) : isBlocked ? (
          <div className="flex flex-col items-center justify-center p-4 rounded bg-amber-950/20 border border-amber-500/20 text-amber-400 shadow-glow-amber">
            <AlertTriangle size={36} className="mb-2 text-amber-400" />
            <span className="text-lg font-bold tracking-wider">✕ BLOCKED</span>
            <span className="text-[10px] font-mono mt-1 text-amber-500 text-center">
              Replay protection flagged this attempt. Signature rejected.
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 rounded bg-red-950/20 border border-red-500/20 text-red-400 shadow-glow-red">
            <XCircle size={36} className="mb-2 text-red-400" />
            <span className="text-lg font-bold tracking-wider">✕ REJECTED</span>
            <span className="text-[10px] font-mono mt-1 text-red-500 text-center">
              Measurement matching rate failed the required threshold.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
