import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Hash, KeyRound, FileSignature } from 'lucide-react';
import FlowConnector from './FlowConnector';
import StatusBadge from './StatusBadge';

const STAGES = [
  {
    id: 'message',
    title: 'Message',
    icon: FileText,
    reached: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_14px_-3px_rgba(34,211,238,0.45)]',
    ring: 'border-cyan-400/40',
    connector: 'bg-cyan-400',
  },
  {
    id: 'hash',
    title: 'SHA-256 Hash',
    icon: Hash,
    reached: 'bg-violet-500/10 border-violet-500/30 text-violet-400 shadow-[0_0_14px_-3px_rgba(167,139,250,0.45)]',
    ring: 'border-violet-400/40',
    connector: 'bg-violet-400',
  },
  {
    id: 'sign',
    title: 'Ed25519 Signing',
    icon: KeyRound,
    reached: 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_14px_-3px_rgba(96,165,250,0.45)]',
    ring: 'border-blue-400/40',
    connector: 'bg-blue-400',
  },
  {
    id: 'ready',
    title: 'Signature Ready',
    icon: FileSignature,
    reached: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_14px_-3px_rgba(52,211,153,0.45)]',
    ring: 'border-emerald-400/40',
    connector: 'bg-emerald-400',
  },
];

/**
 * SigningFlow
 *
 * Presentation-only visualization of the real backend signing pipeline
 * (Message -> SHA-256 -> Ed25519 -> Signature). Reflects the current
 * request state (idle/signing/complete) but never invents cryptographic
 * values itself - actual values are rendered separately from backend data.
 */
export default function SigningFlow({ status = 'idle' }) {
  // status: 'idle' | 'signing' | 'complete'
  const activeIndex = status === 'idle' ? -1 : status === 'signing' ? 2 : 3;

  return (
    <div className="rounded-lg border border-slate-800/60 bg-dark-950/40 neu-raised p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
          Cryptographic Signing Process
        </span>
        <StatusBadge type="real" size="xs" />
      </div>
      <div className="flex items-center gap-1">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const reached = idx <= activeIndex;
          return (
            <React.Fragment key={stage.id}>
              <motion.div
                animate={{ opacity: reached ? 1 : 0.4 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-1.5 text-center flex-1 min-w-0"
              >
                <div
                  className={`relative p-2 rounded-full border transition-all duration-300 ${
                    reached
                      ? stage.reached
                      : 'bg-dark-900 border-slate-800 text-slate-600'
                  }`}
                >
                  {idx === activeIndex && status === 'signing' && (
                    <span className={`absolute inset-0 rounded-full border node-pulse-ring ${stage.ring}`} />
                  )}
                  <Icon size={14} className="relative z-10" />
                </div>
                <span className={`text-[10px] font-mono leading-tight ${reached ? 'text-slate-200' : 'text-slate-600'}`}>
                  {stage.title}
                </span>
              </motion.div>
              {idx < STAGES.length - 1 && (
                <div className="w-6 sm:w-10 shrink-0">
                  <FlowConnector
                    direction="horizontal"
                    state={idx < activeIndex ? 'secure' : 'normal'}
                    colorClass={idx < activeIndex ? STAGES[idx + 1]?.connector : undefined}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
