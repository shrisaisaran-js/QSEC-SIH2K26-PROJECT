import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Radio,
  ArrowRight,
  Shield,
  HelpCircle,
  Gavel,
  ChevronRight
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import QuantumNode from '../components/QuantumNode';
import FlowConnector from '../components/FlowConnector';

const STEPS = [
  {
    title: 'Key State Preparation',
    icon: Cpu,
    formula:
      '|\\psi\\rangle_{Signer} = \\alpha|0\\rangle + \\beta|1\\rangle \\quad \\text{or} \\quad \\frac{1}{\\sqrt{2}}(|0\\rangle \\pm |1\\rangle)',
    details:
      "The Signer (Organization A) prepares two sets of secret keys: K\u2080 and K\u2081, encoding them into a sequence of single-qubit states chosen randomly from the Pauli eigenstates {X, Y, Z}. These states are held within the Signer's quantum transmitter system.",
    explanation:
      'By selecting randomly from orthogonal and non-orthogonal eigenstates, the protocol ensures that any adversarial attempt to copy or measure the states introduces detectable errors, consistent with the No-Cloning Theorem.'
  },
  {
    title: 'Bell-State Entanglement',
    icon: Radio,
    formula: '|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)',
    details:
      'The Quantum Channel distributes one qubit of each entangled Bell pair to the Receiver (Organization B), and the other to the Verification Authority. This forms the shared quantum resource used for teleportation.',
    explanation:
      "Neither the Receiver nor the Verification Authority measures these qubits immediately. Their shared entanglement lets the Signer's key states be teleported to both simultaneously, without direct physical transport of the signature states."
  },
  {
    title: 'Quantum Teleportation',
    icon: ArrowRight,
    formula: 'M_{Bell} \\in \\{|\\Phi^+\\rangle, |\\Phi^-\\rangle, |\\Psi^+\\rangle, |\\Psi^-\\rangle\\}',
    details:
      "The Signer performs a joint Bell-state measurement (BSM) on the signature qubits together with their half of the shared entanglement. This projects the Receiver's and Verification Authority's qubits into a corresponding transformed state, teleporting the signature.",
    explanation:
      "Because the measurement collapses the Signer's original state, the signature is transmitted without the underlying qubits ever being physically sent. The Signer's outcome determines how the remote states have been transformed."
  },
  {
    title: 'Classical Correction',
    icon: Shield,
    formula: '|\\psi_{Receiver}\\rangle = \\sigma_x^{a}\\,\\sigma_z^{b}\\,|\\psi_{Signer}\\rangle \\quad (a, b \\in \\{0, 1\\})',
    details:
      'The Signer transmits the Bell-measurement outcomes to the Receiver and the Verification Authority over an authenticated classical channel. Using these two classical bits, each party applies the corresponding Pauli correction (Identity, X, Y, or Z) to reconstruct the teleported state.',
    explanation:
      "This step requires classical feedforward: without the Signer's classical outcome bits, neither party can reconstruct the signature state, which prevents unauthorized verification if the Signer withholds the classical data."
  },
  {
    title: 'Projective Measurement',
    icon: HelpCircle,
    formula: 'P_i = |i\\rangle\\langle i|',
    details:
      'To sign a message M, the Signer releases the key-basis choices. The Receiver and Verification Authority each perform a projective measurement on their reconstructed qubits in the corresponding basis and record the outcomes.',
    explanation:
      "The measurement outcomes are what the verification stage statistically compares against the expected key values \u2014 this is the step Q-SEC's software simulation models numerically to produce a match rate."
  },
  {
    title: 'Verification',
    icon: Gavel,
    formula: '\\text{match rate} \\longrightarrow \\text{Q-SEC verification engine} \\longrightarrow \\text{ACCEPT / REJECT / BLOCKED}',
    details:
      "The Receiver and Verification Authority compare their measurement outcomes against the released key values. The resulting match rate is passed to Q-SEC's backend verification engine, which combines it with deterministic threat-detection rules to reach the final decision.",
    explanation:
      'This final decision is always made by the backend \u2014 this page only illustrates the conceptual protocol. Live results for real requests appear on the Signature Verification and Threat Detection pages.'
  }
];

const FLOW_LABELS = [
  'Signer',
  'Key State Prep',
  'Bell-State Entanglement',
  'Quantum Teleportation',
  'Classical Correction',
  'Receiver Measurement',
  'Verification'
];

export default function QDSProtocol() {
  const [activeStep, setActiveStep] = useState(0);
  const ActiveIcon = STEPS[activeStep].icon;

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="glass-card p-6 border-slate-800/40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none quantum-grid" />
        <div className="relative z-10">
          <SectionHeader
            title="Quantum-Inspired Protocol Education"
            description="Teleportation-based Quantum Digital Signature (QDS) protocol walkthrough."
            action={<StatusBadge type="simulated" />}
          />
          <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-3xl">
            In the theoretical protocol this project is modeled on, signature states are
            distributed via quantum teleportation rather than direct physical transport, which is
            intended to make undetected interception during key distribution difficult. Q-SEC
            implements this as a <span className="text-quantum-purple font-semibold">software
            simulation</span> of that physics&mdash;no physical quantum hardware or quantum
            network is used anywhere in this build.
          </p>
        </div>
      </div>

      {/* Visual protocol pipeline */}
      <div className="glass-card p-6 border-slate-800/40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none quantum-grid" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 relative z-10">
          Protocol Flow
        </h3>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 relative z-10">
          {FLOW_LABELS.map((label, idx) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-2 text-center w-full lg:w-auto">
                <QuantumNode
                  icon={idx === 0 ? Cpu : idx === FLOW_LABELS.length - 1 ? Gavel : STEPS[idx - 1]?.icon}
                  accent="purple"
                  active={idx > 0 && activeStep === idx - 1}
                  size={48}
                />
                <span className="text-[10px] font-mono uppercase tracking-wide text-slate-400 max-w-[100px] leading-tight">
                  {label}
                </span>
              </div>
              {idx < FLOW_LABELS.length - 1 && (
                <div className="hidden lg:flex items-center flex-1">
                  <FlowConnector direction="horizontal" state="normal" />
                </div>
              )}
              {idx < FLOW_LABELS.length - 1 && (
                <div className="flex lg:hidden">
                  <FlowConnector direction="vertical" state="normal" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Interactive Walkthrough */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step List */}
        <div className="lg:col-span-1 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2 px-1">
            Protocol Stages
          </span>
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-4 rounded-lg border text-xs font-mono transition-all flex items-center gap-3 cursor-pointer card-lift ${
                  activeStep === idx
                    ? 'bg-gradient-to-r from-quantum-purple/15 to-transparent border-quantum-purple/40 text-white shadow-glow-purple'
                    : 'bg-dark-900/40 border-slate-800/40 text-slate-400 hover:bg-dark-800/20'
                }`}
              >
                <StepIcon
                  size={15}
                  className={activeStep === idx ? 'text-quantum-purple shrink-0' : 'text-slate-600 shrink-0'}
                />
                <span className="flex-1">{step.title}</span>
                <span className="text-[10px] text-slate-600 shrink-0">0{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation */}
        <div className="lg:col-span-2 glass-card p-6 border-slate-800/40 min-h-[340px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none quantum-grid" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5 relative z-10"
            >
              <div className="flex items-center gap-3">
                <QuantumNode icon={ActiveIcon} accent="purple" active size={40} />
                <div>
                  <span className="text-[10px] font-mono text-quantum-purple font-bold tracking-widest uppercase">
                    Active Protocol Stage
                  </span>
                  <h3 className="text-lg font-bold text-white">{STEPS[activeStep].title}</h3>
                </div>
              </div>

              {/* Mathematical Equation Representation */}
              <div className="glass-dense p-4 font-mono text-xs text-center text-quantum-purple overflow-x-auto select-all">
                <code>{STEPS[activeStep].formula}</code>
              </div>

              <div className="space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
                <p>{STEPS[activeStep].details}</p>
                <div className="bg-dark-900/50 p-3.5 rounded border border-slate-800/40 text-slate-400">
                  <strong className="text-white block mb-1">Security Significance:</strong>
                  {STEPS[activeStep].explanation}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 pt-4 border-t border-dark-800 flex items-center justify-between text-[10px] font-mono text-slate-500 relative z-10">
            <span>
              Stage {activeStep + 1} of {STEPS.length}
            </span>
            <button
              onClick={() => setActiveStep((activeStep + 1) % STEPS.length)}
              className="cyber-btn px-3 py-1.5 bg-dark-900/60 border-quantum-purple/30 text-slate-300 hover:text-white hover:bg-quantum-purple/10"
            >
              Next Stage
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Physics transparency box */}
      <div className="glass-card p-5 border-slate-800/40 font-mono text-xs space-y-2">
        <h4 className="font-bold text-white uppercase tracking-wider">Simulation Specifications</h4>
        <p className="text-slate-400 leading-relaxed">
          The quantum simulation framework executes standard single-particle projective operators.
          It evaluates density-matrix representations and checks matching rates under simulated
          thermal, quantum-channel, and detector dark-count noise. Adversarial interception
          (intercept-resend or entangling attacks) is simulated by introducing corresponding
          quantum-state transformations, inducing verifiable errors in measurement outcomes.
        </p>
      </div>
    </div>
  );
}
