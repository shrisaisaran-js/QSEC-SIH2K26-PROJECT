import React, { useState } from 'react';
import { useQds } from '../context/QdsContext';
import {
  FlaskConical,
  ShieldAlert,
  AlertTriangle,
  Fingerprint,
  Radio,
  FileCode,
  FileSignature,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Ban
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import FlowConnector from '../components/FlowConnector';

const ATTACKS = [
  {
    id: 'forgery',
    name: 'Forgery',
    category: 'Forgery',
    icon: ShieldAlert,
    desc: 'Submit measurement outcomes consistent with a party guessing quantum states without the correct key, instead of a genuine teleported signature.'
  },
  {
    id: 'replay',
    name: 'Replay',
    category: 'Replay',
    icon: AlertTriangle,
    desc: 'Resubmit a previously accepted signature payload against an already-consumed session to test session/nonce reuse protection.'
  },
  {
    id: 'impersonation',
    name: 'Impersonation',
    category: 'Impersonation',
    icon: Fingerprint,
    desc: 'Attempt verification with a requesting participant who was not a party to the originating session.'
  },
  {
    id: 'channel',
    name: 'Channel Manipulation',
    category: 'Channel Manipulation',
    icon: Radio,
    desc: 'Introduce degraded measurement fidelity on the simulated quantum channel, consistent with interception or channel noise.'
  },
  {
    id: 'message-tampering',
    name: 'Message Tampering',
    category: 'Message Tampering',
    icon: FileCode,
    desc: 'Create a real Ed25519 signature, then alter the signed message before verification to test cryptographic hash integrity.'
  },
  {
    id: 'signature-tampering',
    name: 'Signature Tampering',
    category: 'Signature Tampering',
    icon: FileSignature,
    desc: 'Create a real Ed25519 signature, then corrupt the signature bytes before verification to test cryptographic signature integrity.'
  }
];

// Semantic color identity per attack category — SOC-dashboard style: subtle
// glass tint + accent rail + colored badge/icon/button, no rainbow effect.
const ATTACK_STYLES = {
  forgery: {
    icon: 'text-purple-400',
    iconBox: 'bg-purple-500/10 border-purple-500/30',
    badge: 'text-purple-300 border-purple-500/30 bg-purple-500/5',
    rail: 'border-l-purple-500/70',
    tint: 'bg-purple-500/[0.035]',
    selected: 'border-purple-400/50 bg-purple-500/[0.07] shadow-[0_0_18px_-6px_rgba(168,85,247,0.5)]',
    hover: 'hover:border-purple-500/40 hover:bg-purple-500/[0.05]',
    button: 'border-purple-500/40 text-purple-300 hover:bg-purple-500/10',
    dot: 'bg-purple-400',
  },
  replay: {
    icon: 'text-amber-400',
    iconBox: 'bg-amber-500/10 border-amber-500/30',
    badge: 'text-amber-300 border-amber-500/30 bg-amber-500/5',
    rail: 'border-l-amber-500/70',
    tint: 'bg-amber-500/[0.035]',
    selected: 'border-amber-400/50 bg-amber-500/[0.07] shadow-[0_0_18px_-6px_rgba(245,158,11,0.5)]',
    hover: 'hover:border-amber-500/40 hover:bg-amber-500/[0.05]',
    button: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10',
    dot: 'bg-amber-400',
  },
  impersonation: {
    icon: 'text-rose-400',
    iconBox: 'bg-rose-500/10 border-rose-500/30',
    badge: 'text-rose-300 border-rose-500/30 bg-rose-500/5',
    rail: 'border-l-rose-500/70',
    tint: 'bg-rose-500/[0.035]',
    selected: 'border-rose-400/50 bg-rose-500/[0.07] shadow-[0_0_18px_-6px_rgba(244,63,94,0.5)]',
    hover: 'hover:border-rose-500/40 hover:bg-rose-500/[0.05]',
    button: 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10',
    dot: 'bg-rose-400',
  },
  channel: {
    icon: 'text-blue-400',
    iconBox: 'bg-blue-500/10 border-blue-500/30',
    badge: 'text-blue-300 border-blue-500/30 bg-blue-500/5',
    rail: 'border-l-blue-500/70',
    tint: 'bg-blue-500/[0.035]',
    selected: 'border-blue-400/50 bg-blue-500/[0.07] shadow-[0_0_18px_-6px_rgba(59,130,246,0.5)]',
    hover: 'hover:border-blue-500/40 hover:bg-blue-500/[0.05]',
    button: 'border-blue-500/40 text-blue-300 hover:bg-blue-500/10',
    dot: 'bg-blue-400',
  },
  'message-tampering': {
    icon: 'text-yellow-400',
    iconBox: 'bg-yellow-500/10 border-yellow-500/30',
    badge: 'text-yellow-300 border-yellow-500/30 bg-yellow-500/5',
    rail: 'border-l-yellow-500/70',
    tint: 'bg-yellow-500/[0.035]',
    selected: 'border-yellow-400/50 bg-yellow-500/[0.07] shadow-[0_0_18px_-6px_rgba(234,179,8,0.5)]',
    hover: 'hover:border-yellow-500/40 hover:bg-yellow-500/[0.05]',
    button: 'border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10',
    dot: 'bg-yellow-400',
  },
  'signature-tampering': {
    icon: 'text-fuchsia-400',
    iconBox: 'bg-fuchsia-500/10 border-fuchsia-500/30',
    badge: 'text-fuchsia-300 border-fuchsia-500/30 bg-fuchsia-500/5',
    rail: 'border-l-fuchsia-500/70',
    tint: 'bg-fuchsia-500/[0.035]',
    selected: 'border-fuchsia-400/50 bg-fuchsia-500/[0.07] shadow-[0_0_18px_-6px_rgba(217,70,239,0.5)]',
    hover: 'hover:border-fuchsia-500/40 hover:bg-fuchsia-500/[0.05]',
    button: 'border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-500/10',
    dot: 'bg-fuchsia-400',
  },
};

// Lookup from backend/display category name back to the style key above,
// used to color-code the result panel by whichever attack actually ran.
const CATEGORY_TO_STYLE_KEY = ATTACKS => ATTACKS.reduce((acc, a) => {
  acc[a.category.toLowerCase()] = a.id;
  return acc;
}, {});

const PIPELINE_STAGES = [
  'Attack Scenario',
  'Controlled Simulation',
  'Q-SEC Verification Pipeline',
  'Threat Detection',
  'Risk Assessment',
  'Security Decision'
];

export default function AttackSimulation() {
  const { attackSimulation, simulateAttack, isSimulatingAttack, setActiveTab } = useQds();
  const [activeAttack, setActiveAttack] = useState(null);
  const [runError, setRunError] = useState(null);

  const handleRunAttack = async (attackId) => {
    setActiveAttack(attackId);
    setRunError(null);
    try {
      await simulateAttack(attackId);
    } catch (err) {
      setRunError(err?.message || 'Attack simulation failed.');
    }
  };

  const hasResult = attackSimulation.active;
  const isThreatDetected = attackSimulation.detected;
  const isAccept = attackSimulation.decision === 'ACCEPT';

  // Resolve which attack's color identity the current result belongs to
  // (backend reports the category name, e.g. "Forgery").
  const categoryLookup = CATEGORY_TO_STYLE_KEY(ATTACKS);
  const resultStyleKey = categoryLookup[String(attackSimulation.type || '').toLowerCase()];
  const resultStyle = ATTACK_STYLES[resultStyleKey];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card neu-raised p-6 border-slate-800/40 relative">
        <SectionHeader
          title="Controlled Security Testing Lab"
          description="Controlled attack simulation."
          action={<StatusBadge type="simulated" />}
        />
        <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-3xl">
          Controlled security testing against the Q-SEC verification pipeline. Each scenario is
          routed through the same backend verification, threat-detection, and risk-scoring
          engine used for real traffic, so the result shown here reflects a genuine backend
          decision&mdash;not a scripted demonstration.
        </p>
      </div>

      {/* Execution flow */}
      <div className="glass-card neu-raised p-6 border-slate-800/40">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Attack Execution Flow
        </h3>
        <div className="flex flex-col lg:flex-row items-stretch gap-2">
          {PIPELINE_STAGES.map((stage, idx) => (
            <React.Fragment key={stage}>
              <div
                className={`flex-1 text-center px-3 py-3 rounded-lg border font-mono text-[10px] uppercase tracking-wide transition-colors ${
                  isSimulatingAttack
                    ? 'border-quantum-blue/40 bg-quantum-blue/5 text-quantum-blue animate-pulse'
                    : hasResult
                    ? isThreatDetected
                      ? 'border-red-500/30 bg-red-950/10 text-red-300'
                      : 'border-emerald-500/30 bg-emerald-950/10 text-emerald-300'
                    : 'border-slate-800 bg-dark-950/40 text-slate-500'
                }`}
              >
                {stage}
              </div>
              {idx < PIPELINE_STAGES.length - 1 && (
                <div className="hidden lg:flex items-center w-6">
                  <FlowConnector
                    direction="horizontal"
                    state={isSimulatingAttack ? 'normal' : hasResult ? (isThreatDetected ? 'threat' : 'secure') : 'normal'}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {isSimulatingAttack && (
          <p className="text-[10px] font-mono text-quantum-blue mt-3 flex items-center gap-1.5">
            <Loader2 size={11} className="animate-spin" />
            Simulation in progress&mdash;awaiting backend verification result.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario selection */}
        <div className="glass-card neu-raised p-6 border-slate-800/40">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-dark-800 pb-2">
            Attack Scenarios
          </h3>

          <div className="space-y-3">
            {ATTACKS.map((attack) => {
              const Icon = attack.icon;
              const isSelected = activeAttack === attack.id;
              const isRunning = isSimulatingAttack && isSelected;
              const style = ATTACK_STYLES[attack.id];
              return (
                <div
                  key={attack.id}
                  className={`p-4 rounded-lg border border-l-4 transition-all ${style.rail} ${style.tint} ${
                    isSelected
                      ? style.selected
                      : `border-slate-800 ${style.hover}`
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-0.5 shrink-0 h-8 w-8 rounded-lg border flex items-center justify-center ${style.iconBox}`}>
                      <Icon size={16} className={style.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-white font-mono uppercase text-sm">
                          {attack.name}
                        </span>
                        <span className={`text-[9px] font-mono rounded px-1.5 py-0.5 uppercase tracking-wide border ${style.badge}`}>
                          {attack.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        {attack.desc}
                      </p>
                      <button
                        type="button"
                        disabled={isSimulatingAttack}
                        onClick={() => handleRunAttack(attack.id)}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wide px-3 py-1.5 rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${style.button}`}
                      >
                        {isRunning ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Simulation In Progress
                          </>
                        ) : (
                          <>Simulate Controlled Attack</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Result */}
        <div className="glass-card neu-raised p-6 border-slate-800/40 min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-dark-800 pb-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Simulation Result
            </h3>
            {hasResult && (
              <span className="text-[10px] font-mono text-slate-500">
                {attackSimulation.timestamp}
              </span>
            )}
          </div>

          {runError && (
            <div className="mb-4 p-3 rounded border border-red-500/30 bg-red-950/10 text-xs text-red-300 font-mono">
              {runError}
            </div>
          )}

          {!hasResult ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 text-slate-600 font-mono text-xs px-6">
              <FlaskConical size={20} className="text-slate-700" />
              SELECT A CONTROLLED SCENARIO TO BEGIN
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* Dominant result banner */}
              <div
                className={`p-4 rounded-lg border text-center ${
                  isThreatDetected
                    ? 'border-red-500/40 bg-red-950/20'
                    : 'border-emerald-500/40 bg-emerald-950/20'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  {isThreatDetected ? (
                    <ShieldAlert size={18} className="text-red-400" />
                  ) : (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  )}
                  <span
                    className={`text-lg font-extrabold font-mono tracking-wide ${
                      isThreatDetected ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {isThreatDetected ? 'THREAT DETECTED' : 'NO THREAT DETECTED'}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  {resultStyle && <span className={`inline-block h-1.5 w-1.5 rounded-full ${resultStyle.dot}`} />}
                  <span
                    className={`text-xs font-mono uppercase tracking-wider ${
                      resultStyle ? resultStyle.icon : 'text-slate-300'
                    }`}
                  >
                    {attackSimulation.type} Attack
                  </span>
                </div>
              </div>

              {/* Result details grid */}
              <div className="bg-dark-950 p-4 rounded border border-dark-800 grid grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Decision</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      isAccept
                        ? 'text-emerald-400'
                        : attackSimulation.decision === 'BLOCKED'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {isAccept ? (
                      <CheckCircle2 size={12} />
                    ) : attackSimulation.decision === 'BLOCKED' ? (
                      <Ban size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                    {attackSimulation.decision || '—'}
                  </span>
                </div>
                {attackSimulation.severity && (
                  <div>
                    <span className="text-slate-500 block mb-1">Risk Severity</span>
                    <span className="text-white font-bold">{attackSimulation.severity}</span>
                  </div>
                )}
                {attackSimulation.riskScore !== undefined && attackSimulation.riskScore !== null && (
                  <div>
                    <span className="text-slate-500 block mb-1">Risk Score</span>
                    <span className="text-white font-bold">{attackSimulation.riskScore}/100</span>
                  </div>
                )}
                {attackSimulation.matchRate !== undefined && attackSimulation.matchRate !== null && (
                  <div>
                    <span className="text-slate-500 block mb-1">Match Rate</span>
                    <span className="text-white font-bold">{attackSimulation.matchRate}%</span>
                  </div>
                )}
                {attackSimulation.probability !== undefined && attackSimulation.probability !== null && (
                  <div>
                    <span className="text-slate-500 block mb-1">Guessing Probability</span>
                    <span className="text-amber-400 font-bold">{attackSimulation.probability}</span>
                  </div>
                )}
                {attackSimulation.sessionId && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block mb-1">Session ID</span>
                    <span className="text-slate-300 break-all">{attackSimulation.sessionId}</span>
                  </div>
                )}
                {attackSimulation.signatureId && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block mb-1">Signature ID</span>
                    <span className="text-slate-300 break-all">{attackSimulation.signatureId}</span>
                  </div>
                )}
              </div>

              {/* Execution logs */}
              {attackSimulation.logs?.length > 0 && (
                <div>
                  <h4 className="text-slate-500 mb-2 border-b border-dark-800 pb-1 text-[11px] font-mono uppercase tracking-wide">
                    Execution Logs
                  </h4>
                  <div className="space-y-1.5 text-slate-300 bg-dark-950 p-3 rounded font-mono text-xs">
                    {attackSimulation.logs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-slate-600 select-none">{'>'}</span>
                        <span
                          className={
                            log.includes('Status:')
                              ? log.includes('ACCEPT')
                                ? 'text-emerald-400 font-bold'
                                : 'text-red-400 font-bold'
                              : log.includes('WARNING') || log.includes('FAILED')
                              ? 'text-amber-400'
                              : ''
                          }
                        >
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Link to forensic trace */}
              {attackSimulation.trace?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('attack-trace')}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wide px-3 py-2.5 rounded border border-quantum-purple/40 text-quantum-purple hover:bg-quantum-purple/10 transition-colors"
                >
                  View Forensic Trace
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
