import React from 'react';
import { motion } from 'framer-motion';
import { FileSignature, KeyRound, ShieldCheck, Atom, Flame, Gavel } from 'lucide-react';
import FlowConnector from './FlowConnector';
import StatusBadge from './StatusBadge';

const STAGES = [
  { id: 'signature', title: 'Signature', icon: FileSignature, status: 'real' },
  { id: 'session', title: 'Session + Nonce', icon: KeyRound, status: 'real' },
  { id: 'crypto', title: 'Ed25519 Verification', icon: ShieldCheck, status: 'real' },
  { id: 'qds', title: 'QDS Measurement Analysis', icon: Atom, status: 'simulated' },
  { id: 'threat', title: 'Threat Assessment', icon: Flame, status: 'real' },
  { id: 'decision', title: 'Security Decision', icon: Gavel, status: 'real' },
];

/**
 * VerificationFlow
 *
 * Presentation-only pipeline diagram for the Signature Verification page.
 * The frontend never computes a decision here - `decision` is rendered
 * purely from the backend response to color the final stage/connectors.
 */
export default function VerificationFlow({ decision = null }) {
  const finalState =
    decision === 'ACCEPT' ? 'secure' : decision === 'BLOCKED' ? 'warning' : decision ? 'threat' : 'normal';

  return (
    <div className="glass-card neu-raised p-5 border-slate-800/40 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Verification Pipeline</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Backend-authoritative. The frontend only renders this result.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge type="real" size="xs" />
          <StatusBadge type="simulated" size="xs" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-1">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isLast = idx === STAGES.length - 1;
          const stageState = isLast && decision ? finalState : decision ? 'secure' : 'normal';
          return (
            <React.Fragment key={stage.id}>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`flex-1 min-w-[100px] rounded-lg border p-3 flex flex-col items-center text-center gap-1.5 bg-dark-950/40 ${
                  isLast && decision
                    ? finalState === 'secure'
                      ? 'border-emerald-500/30'
                      : finalState === 'warning'
                      ? 'border-amber-500/30'
                      : 'border-rose-500/30'
                    : stage.status === 'simulated'
                    ? 'border-quantum-purple/20'
                    : 'border-quantum-blue/20'
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    isLast && decision
                      ? finalState === 'secure'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : finalState === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : stage.status === 'simulated'
                      ? 'bg-quantum-purple/10 text-quantum-purple border border-quantum-purple/20'
                      : 'bg-quantum-blue/10 text-quantum-blue border border-quantum-blue/20'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span className="text-[11px] font-semibold text-white leading-tight">{stage.title}</span>
                <StatusBadge type={stage.status} size="xs" />
              </motion.div>

              {!isLast && (
                <div className="hidden lg:flex items-center px-1 w-6">
                  <FlowConnector direction="horizontal" state={stageState} />
                </div>
              )}
              {!isLast && (
                <div className="flex lg:hidden justify-center py-0.5">
                  <FlowConnector direction="vertical" state={stageState} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
