import React from 'react';
import { useQds } from '../context/QdsContext';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default function ThreatPanel() {
  const { stats } = useQds();

  // Backend-derived security metrics
  const identityConsistency =
  stats.identityConsistency ?? 0;

  const measurementDeviation =
  stats.measurementDeviation ?? 0;

  // Forgery detection
  const forgeryCount =
  stats.threatBreakdown?.forgery ?? 0;

  const isForgeryHigh =
  forgeryCount > 0;

  // Impersonation detection
  const impersonationCount =
  stats.threatBreakdown?.impersonation ?? 0;

  const isImpersonationHigh =
  impersonationCount > 0;

  // Channel manipulation detection
  const channelTamperingCount =
  stats.threatBreakdown?.channel ?? 0;

  const isChannelDeviated =
  channelTamperingCount > 0;

  // Message tampering
  const messageTamperingCount =
  stats.threatBreakdown?.messageTampering ?? 0;

  const isMessageTamperingDetected =
  messageTamperingCount > 0;

  // Signature tampering
  const signatureTamperingCount =
  stats.threatBreakdown?.signatureTampering ?? 0;

  const isSignatureTamperingDetected =
  signatureTamperingCount > 0;

  return (
    <div className="glass-card neu-raised p-6 border-slate-800/40 relative">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-dark-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            Threat Detection Engine
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Real-time security validations via quantum-inspired statistical rules.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-dark-950 px-2.5 py-1 rounded text-[10px] font-mono text-slate-500">
          <RefreshCw
            size={10}
            className="animate-spin text-quantum-blue"
          />

          <span>STATISTICAL RULES ACTIVE</span>
        </div>
      </div>

      {/* Threat Detection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Forgery Detection */}
        <div
          className={`p-4 rounded-lg bg-dark-950/40 border transition-colors card-lift neu-raised ${
            isForgeryHigh
              ? 'border-red-500/30 bg-red-950/10'
              : 'border-slate-800/60'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              Forgery Detection
            </span>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isForgeryHigh
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isForgeryHigh ? 'HIGH RISK DETECTED' : 'LOW RISK'}
            </span>
          </div>

          <div className="space-y-1.5 mt-3 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Metric:</span>

              <span className="text-slate-200">
                Forgery Probability = {stats.forgeryProbability}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Validation Rule:</span>

              <span className="text-slate-500">
                Decay bound check: (3/4)^N
              </span>
            </div>
          </div>
        </div>

        {/* Impersonation Detection */}
        <div
          className={`p-4 rounded-lg bg-dark-950/40 border transition-colors card-lift neu-raised ${
            isImpersonationHigh
              ? 'border-red-500/30 bg-red-950/10'
              : 'border-slate-800/60'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              Impersonation Detection
            </span>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isImpersonationHigh
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isImpersonationHigh
                ? 'UNAUTHORIZED SENDER'
                : 'NORMAL'}
            </span>
          </div>

          <div className="space-y-1.5 mt-3 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Metric:</span>

              <span className="text-slate-200">
                Identity Consistency = {identityConsistency.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between">
              <span>Validation Rule:</span>

              <span className="text-slate-500">
                State key parity verification
              </span>
            </div>
          </div>
        </div>

        {/* Replay Detection */}
<div
  className={`p-4 rounded-lg bg-dark-950/40 border transition-colors card-lift neu-raised ${
    stats.threatBreakdown?.replay > 0
      ? 'border-amber-500/30 bg-amber-950/10'
      : 'border-slate-800/60'
  }`}
>
  <div className="flex justify-between items-start mb-2">
    <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
      Replay Detection
    </span>

    <span
      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
        stats.threatBreakdown?.replay > 0
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      }`}
    >
      {stats.threatBreakdown?.replay > 0
        ? `${stats.threatBreakdown.replay} ATTEMPT${
            stats.threatBreakdown.replay > 1 ? 'S' : ''
          } BLOCKED`
        : 'NORMAL'}
    </span>
  </div>

  <div className="space-y-1.5 mt-3 font-mono text-[11px] text-slate-400">
    <div className="flex justify-between">
      <span>Metric:</span>

      <span className="text-slate-200">
        Nonce / Session Validation
      </span>
    </div>

    <div className="flex justify-between">
      <span>Validation Rule:</span>

      <span className="text-slate-500">
        One-time session / nonce
      </span>
    </div>
  </div>
</div>

        {/* Channel Manipulation */}
        <div
          className={`p-4 rounded-lg bg-dark-950/40 border transition-colors card-lift neu-raised ${
            isChannelDeviated
              ? 'border-red-500/30 bg-red-950/10'
              : 'border-slate-800/60'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              Channel Manipulation
            </span>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isChannelDeviated
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isChannelDeviated
                ? 'CRITICAL DEVIATION'
                : 'MONITORED'}
            </span>
          </div>

          <div className="space-y-1.5 mt-3 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Metric:</span>

              <span className="text-slate-200">
                Measurement Deviation = {measurementDeviation}%
              </span>
            </div>

            <div className="flex justify-between">
              <span>Validation Rule:</span>

              <span className="text-slate-500">
                Basis mismatch error rate bounds
              </span>
            </div>
          </div>
        </div>

        {/* Message Tampering Detection */}
        <div
          className={`p-4 rounded-lg bg-dark-950/40 border transition-colors card-lift neu-raised ${
            isMessageTamperingDetected
              ? 'border-red-500/30 bg-red-950/10'
              : 'border-slate-800/60'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              Message Tampering Detection
            </span>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isMessageTamperingDetected
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isMessageTamperingDetected
                ? 'TAMPERING DETECTED'
                : 'NORMAL'}
            </span>
          </div>

          <div className="space-y-1.5 mt-3 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Metric:</span>

              <span className="text-slate-200">
                Attempts = {messageTamperingCount}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Validation Rule:</span>

              <span className="text-slate-500">
                Message integrity verification
              </span>
            </div>
          </div>
        </div>

        {/* Signature Tampering Detection */}
        <div
          className={`p-4 rounded-lg bg-dark-950/40 border transition-colors card-lift neu-raised ${
            isSignatureTamperingDetected
              ? 'border-red-500/30 bg-red-950/10'
              : 'border-slate-800/60'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              Signature Tampering Detection
            </span>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isSignatureTamperingDetected
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isSignatureTamperingDetected
                ? 'TAMPERING DETECTED'
                : 'NORMAL'}
            </span>
          </div>

          <div className="space-y-1.5 mt-3 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Metric:</span>

              <span className="text-slate-200">
                Attempts = {signatureTamperingCount}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Validation Rule:</span>

              <span className="text-slate-500">
                Cryptographic signature verification
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-dark-800/60 flex items-center gap-2 text-[10px] font-mono text-slate-500">
        <ShieldCheck
          size={14}
          className="text-quantum-blue"
        />

        <span>
          NOTE: Threat assessment uses zero machine learning model
          heuristics. All triggers are built on deterministic math bounds.
        </span>
      </div>

    </div>
  );
}