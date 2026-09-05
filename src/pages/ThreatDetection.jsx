import React from 'react';
import { useQds } from '../context/QdsContext';
import ThreatPanel from '../components/ThreatPanel';
import ThreatTimeline from '../components/ThreatTimeline';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import InfoTooltip from '../components/InfoTooltip';
import { Cpu, ShieldCheck, ShieldAlert, Radar } from 'lucide-react';

export default function ThreatDetection() {
  const { stats } = useQds();

  const isSecure = stats.protocolIntegrity !== 'ALERT';
  const totalThreats = stats.threatsDetected ?? 0;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="glass-card neu-raised p-6 border-slate-800/40 relative">
        <SectionHeader
          title="Threat Detection"
          description="Backend-authoritative detection, classification, and risk assessment."
          action={<StatusBadge type="real" />}
        />

        <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-3xl">
          Every finding below is produced by deterministic, rule-based checks in the Q-SEC
          backend&mdash;replay/session validation, identity consistency, and statistical
          measurement-deviation bounds. Nothing here is inferred or estimated in the browser.
        </p>

        {/* Backend-derived overview strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-dark-800/60">
          <div className="bg-dark-950/40 border border-dark-800 rounded-lg p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
              Security Posture
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-bold font-mono ${
                isSecure ? 'text-emerald-400' : 'text-red-400 animate-pulse'
              }`}
            >
              {isSecure ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
              {stats.protocolIntegrity ?? 'UNKNOWN'}
            </span>
          </div>
          <div className="bg-dark-950/40 border border-dark-800 rounded-lg p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
              Total Threats
            </span>
            <span className="text-sm font-bold font-mono text-white">{totalThreats}</span>
          </div>
          <div className="bg-dark-950/40 border border-dark-800 rounded-lg p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
              Avg. Risk Score
              <InfoTooltip text="Mean riskScore (0-100) across all persisted threat findings, as returned by the backend threat engine." />
            </span>
            <span className="text-sm font-bold font-mono text-white">
              {stats.averageRiskScore ?? 0}/100
            </span>
          </div>
          <div className="bg-dark-950/40 border border-dark-800 rounded-lg p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
              Verification Accuracy
            </span>
            <span className="text-sm font-bold font-mono text-white">
              {stats.verificationAccuracy ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {totalThreats === 0 && (
        <div className="glass-card neu-raised p-8 border-slate-800/40 flex flex-col items-center text-center gap-2">
          <Radar size={22} className="text-quantum-blue" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            No Threats Detected
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            Backend threat monitoring is active. Detection events will appear here when recorded.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat category breakdown */}
        <div className="lg:col-span-2">
          <ThreatPanel />
        </div>

        {/* Detection rules panel */}
        <div className="lg:col-span-1 glass-card neu-raised p-6 border-slate-800/40 space-y-4">
          <div className="flex items-center gap-2 border-b border-dark-800 pb-3">
            <Cpu size={16} className="text-quantum-blue" />
            <h3 className="text-sm font-semibold text-white font-mono uppercase">
              Detection Rules
            </h3>
          </div>

          <div className="space-y-4 font-mono text-[11px] text-slate-400 leading-relaxed">
            <div className="p-3 bg-dark-950/40 border border-dark-900 rounded">
              <strong className="text-white block mb-1">1. Forgery bound rule</strong>
              <p>
                Flags a Forgery finding when the observed measurement match rate falls into the
                statistical guessing band consistent with a party lacking the correct quantum
                state.
              </p>
            </div>
            <div className="p-3 bg-dark-950/40 border border-dark-900 rounded">
              <strong className="text-white block mb-1">2. Replay / session validation</strong>
              <p>
                Ensures a session/nonce has not already been consumed by a prior verification.
                Reuse triggers an immediate BLOCKED decision, independent of measurement quality.
              </p>
            </div>
            <div className="p-3 bg-dark-950/40 border border-dark-900 rounded">
              <strong className="text-white block mb-1">3. Identity consistency check</strong>
              <p>
                The requesting participant must match one of the two parties bound to the
                session at creation time, or the request is flagged as Impersonation.
              </p>
            </div>
            <div className="p-3 bg-dark-950/40 border border-dark-900 rounded">
              <strong className="text-white block mb-1">4. Channel deviation check</strong>
              <p>
                Flags Channel Manipulation when measurement deviation exceeds the configured
                degraded-but-not-guessing band, indicating possible interference on the
                simulated channel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Event Timeline */}
      <ThreatTimeline />
    </div>
  );
}
