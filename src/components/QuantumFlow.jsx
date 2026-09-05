import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Radio, Shield, HelpCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import QuantumNode from './QuantumNode';

const STEPS = [
  {
    id: 'signer',
    title: 'Signer (Organization A)',
    subtitle: 'Key States Prep',
    details: 'The Signer encodes signature bits into eigenstates (|0>, |1>, |+>, |->).',
    icon: Cpu
  },
  {
    id: 'bell',
    title: 'Bell-State Entanglement',
    subtitle: 'Quantum Resource',
    details: 'Entangled pairs are created and shared across the Quantum Channel as verification resources.',
    icon: Radio
  },
  {
    id: 'teleport',
    title: 'Quantum Teleportation',
    subtitle: 'State Transmission',
    details: 'The Signer performs Bell-state measurements to teleport states to the Receiver and Verification Authority.',
    icon: ArrowRight
  },
  {
    id: 'pauli',
    title: 'Classical Correction',
    subtitle: 'Classical Feedforward',
    details: 'Classical bits are sent to rotate states (I, X, Y, or Z) and recover the raw key states.',
    icon: Shield
  },
  {
    id: 'measurement',
    title: 'Projective Measurement',
    subtitle: 'Verification Check',
    details: 'The Receiver performs measurement on the chosen basis to check signature matching.',
    icon: HelpCircle
  }
];

export default function QuantumFlow() {
  return (
    <div className="glass-card p-6 border-slate-800/40 relative overflow-hidden">
      {/* Background grids */}
      <div className="absolute inset-0 opacity-10 pointer-events-none quantum-grid" />
      <div className="absolute top-0 right-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest bg-dark-950/80 px-2 py-1 border-b border-l border-dark-800 rounded-bl">
        Quantum Simulation Environment
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">QDS Protocol Education</h3>
          <p className="text-xs text-slate-400 mt-1">
            Illustrates the teleportation-based QDS concept (Signer / Receiver / Verification
            Authority) this prototype&rsquo;s simulation is modeled on.
          </p>
        </div>
        <StatusBadge type="simulated" size="xs" />
      </div>

      {/* Horizontal Flow Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative z-10 py-4">
        {STEPS.map((step, idx) => {
          return (
            <React.Fragment key={step.id}>
              {/* Card Step */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative p-4 rounded-lg bg-dark-950/40 border border-quantum-purple/20 hover:border-quantum-purple/40 hover:bg-quantum-purple/[0.02] transition-all duration-300 flex flex-col items-center text-center group card-lift"
              >
                {/* Connector line on Desktop */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-4 h-[1px] bg-slate-800 z-0 group-hover:bg-quantum-purple/40 transition-colors" />
                )}

                {/* Quantum node icon */}
                <div className="mb-3">
                  <QuantumNode icon={step.icon} accent="purple" size={44} />
                </div>

                {/* Content */}
                <h4 className="text-xs font-bold text-white tracking-wide">{step.title}</h4>
                <span className="text-[10px] font-mono font-semibold uppercase mt-0.5 text-quantum-purple">
                  {step.subtitle}
                </span>

                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed h-12 overflow-hidden">
                  {step.details}
                </p>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Verification Summary status overlay */}
      <div className="mt-5 pt-4 border-t border-dark-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Security Target:</span>
          <span className="text-white px-2 py-0.5 bg-dark-950 rounded border border-dark-800">
            Bell-State Protocol Mapped
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-quantum-blue motion-safe:animate-pulse" />
            Signer key states transmitted
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-quantum-purple motion-safe:animate-pulse" />
            Receiver correction parity synchronized
          </span>
        </div>
      </div>
    </div>
  );
}
