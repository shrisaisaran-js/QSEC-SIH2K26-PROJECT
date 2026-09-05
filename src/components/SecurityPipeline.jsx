import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  KeyRound,
  FileSignature,
  Atom,
  BarChart3,
  Flame,
  Gavel,
  FileClock,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import FlowConnector from './FlowConnector';

const STAGES = [
  { id: 'org', title: 'Organization A / B', icon: Building2, status: 'real' },
  { id: 'session', title: 'Session + Nonce', icon: KeyRound, status: 'real' },
  { id: 'crypto', title: 'Ed25519 Verification', icon: FileSignature, status: 'real' },
  { id: 'qds', title: 'QDS Simulation', icon: Atom, status: 'simulated' },
  { id: 'stats', title: 'Statistical Analysis', icon: BarChart3, status: 'simulated' },
  { id: 'threat', title: 'Threat Detection', icon: Flame, status: 'real' },
  { id: 'decision', title: 'Security Decision', icon: Gavel, status: 'real' },
  { id: 'audit', title: 'Audit Trail', icon: FileClock, status: 'real' },
];

/**
 * SecurityPipeline
 *
 * High-level, always-visible map of the Q-SEC verification pipeline, from the
 * signing organization through to the audit trail. This is a static,
 * presentation-only diagram — it does not represent live per-request state.
 * Each stage is explicitly labeled REAL or SIMULATED so a reviewer can see at
 * a glance what is cryptographically enforced vs. what is a software
 * simulation of quantum behavior.
 */
export default function SecurityPipeline() {
  return (
    <div className="glass-card p-6 border-slate-800/40 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none quantum-grid" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5 relative z-10">
        <div>
          <h3 className="text-base font-semibold text-white">Q-SEC Verification Pipeline</h3>
          <p className="text-xs text-slate-400 mt-1">
            Backend-authoritative path from signing request to audited security decision.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge type="real" size="xs" />
          <StatusBadge type="simulated" size="xs" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch gap-1">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <React.Fragment key={stage.id}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className={`flex-1 min-w-[110px] rounded-lg border p-3 flex flex-col items-center text-center gap-2 bg-dark-950/40 neu-raised ${
                  stage.status === 'simulated'
                    ? 'border-quantum-purple/20'
                    : 'border-quantum-blue/20'
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    stage.status === 'simulated'
                      ? 'bg-quantum-purple/10 text-quantum-purple border border-quantum-purple/20'
                      : 'bg-quantum-blue/10 text-quantum-blue border border-quantum-blue/20'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span className="text-[11px] font-semibold text-white leading-tight">
                  {stage.title}
                </span>
                <StatusBadge type={stage.status} size="xs" />
              </motion.div>

              {idx < STAGES.length - 1 && (
                <div className="hidden lg:flex items-center px-1 w-6">
                  <FlowConnector direction="horizontal" state="secure" />
                </div>
              )}
              {idx < STAGES.length - 1 && (
                <div className="flex lg:hidden justify-center py-0.5">
                  <FlowConnector direction="vertical" state="secure" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
