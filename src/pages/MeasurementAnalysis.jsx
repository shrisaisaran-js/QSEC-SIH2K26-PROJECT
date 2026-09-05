import React from 'react';
import { useQds } from '../context/QdsContext';
import MeasurementChart from '../components/MeasurementChart';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import InfoTooltip from '../components/InfoTooltip';
import { Cpu, Database, Gauge } from 'lucide-react';

export default function MeasurementAnalysis() {
  const { pauliStats, currentSimulation } = useQds();

  const hasMeasurements = currentSimulation && typeof currentSimulation.samples === 'number';

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Measurement Analysis"
        description="Software-based quantum-inspired measurement analysis supporting the security pipeline."
        action={<StatusBadge type="simulated" />}
      />

      {/* Intro explanation */}
      <div className="glass-card neu-raised p-6 border-slate-800/40 relative">
        <h2 className="text-lg font-semibold text-glow-blue text-white">Quantum-Inspired Measurement Behavior</h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The QDS simulation models projective measurement outcomes in a teleportation-inspired protocol:
          secret keys are prepared using random orthogonal and non-orthogonal bases, and an intercept-resend
          adversary is expected to introduce a minimum 25% error rate, detectable during Z, X, or Y basis
          verification runs. This is a software statistical model, not a physical quantum measurement.
        </p>
      </div>

      {/* A. Measurement Overview */}
      <div className="glass-card neu-raised p-6 border-slate-800/40">
        <div className="flex items-center justify-between border-b border-dark-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-quantum-blue" />
            <h3 className="text-base font-semibold text-white">Measurement Overview</h3>
          </div>
          <StatusBadge type="simulated" size="xs" />
        </div>

        {!hasMeasurements ? (
          <div className="text-center text-slate-600 font-mono text-sm py-8">
            Awaiting verification measurements
            <p className="text-[11px] text-slate-600 mt-2 normal-case">
              Run a signature verification to populate measurement statistics here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 rounded bg-dark-950/40 border border-slate-800/60">
              <div className="text-slate-500 flex items-center gap-1">
                Sample Count
                <InfoTooltip text="Total simulated measurement outcomes compared for this verification attempt." />
              </div>
              <div className="text-white text-lg font-bold mt-1">{currentSimulation.samples}</div>
            </div>
            <div className="p-3 rounded bg-dark-950/40 border border-slate-800/60">
              <div className="text-slate-500">Matching</div>
              <div className="text-emerald-400 text-lg font-bold mt-1">{currentSimulation.matching}</div>
            </div>
            <div className="p-3 rounded bg-dark-950/40 border border-slate-800/60">
              <div className="text-slate-500">Mismatch</div>
              <div className="text-red-400 text-lg font-bold mt-1">{currentSimulation.mismatch}</div>
            </div>
            <div className="p-3 rounded bg-dark-950/40 border border-slate-800/60">
              <div className="text-slate-500">Match Rate</div>
              <div className="text-white text-lg font-bold mt-1">{currentSimulation.matchRate}%</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics details */}
        <div className="lg:col-span-1 glass-card p-6 border-slate-800/40 space-y-5">
          <div className="flex items-center gap-2 border-b border-dark-800 pb-3">
            <Database size={16} className="text-quantum-blue" />
            <h3 className="text-base font-semibold text-white font-mono uppercase">Basis Statistics</h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* X basis */}
            <div className="p-3.5 rounded bg-dark-950/40 border border-slate-800/60">
              <div className="flex justify-between font-bold text-white mb-2">
                <span>X Basis Stats</span>
                <span className="text-quantum-blue">Eigenstates: |+⟩, |-⟩</span>
              </div>
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Match Rate (+1):</span>
                  <span className="text-emerald-400 font-semibold">{pauliStats.X.plus}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Mismatch Rate (-1):</span>
                  <span className="text-red-400 font-semibold">{pauliStats.X.minus}%</span>
                </div>
              </div>
            </div>

            {/* Y basis */}
            <div className="p-3.5 rounded bg-dark-950/40 border border-slate-800/60">
              <div className="flex justify-between font-bold text-white mb-2">
                <span>Y Basis Stats</span>
                <span className="text-quantum-blue">Eigenstates: |+i⟩, |-i⟩</span>
              </div>
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Match Rate (+1):</span>
                  <span className="text-emerald-400 font-semibold">{pauliStats.Y.plus}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Mismatch Rate (-1):</span>
                  <span className="text-red-400 font-semibold">{pauliStats.Y.minus}%</span>
                </div>
              </div>
            </div>

            {/* Z basis */}
            <div className="p-3.5 rounded bg-dark-950/40 border border-slate-800/60">
              <div className="flex justify-between font-bold text-white mb-2">
                <span>Z Basis Stats</span>
                <span className="text-quantum-blue">Eigenstates: |0⟩, |1⟩</span>
              </div>
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Match Rate (+1):</span>
                  <span className="text-emerald-400 font-semibold">{pauliStats.Z.plus}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Mismatch Rate (-1):</span>
                  <span className="text-red-400 font-semibold">{pauliStats.Z.minus}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphical Representation */}
        <div className="lg:col-span-2">
          <MeasurementChart />
        </div>
      </div>

      {/* D. Probability Information */}
      <div className="glass-card neu-raised p-6 border-slate-800/40">
        <div className="flex items-center justify-between border-b border-dark-800 pb-3 mb-4">
          <h3 className="text-base font-semibold text-white">Probability Information</h3>
          <StatusBadge type="simulated" size="xs" />
        </div>
        {!hasMeasurements || currentSimulation.forgeryProbability === undefined ? (
          <div className="text-center text-slate-600 font-mono text-sm py-6">
            Awaiting verification measurements
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded bg-dark-950/40 border border-slate-800/60">
              <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-1">
                Theoretical Forgery Guessing Bound
              </div>
              <div className="text-quantum-purple text-lg font-bold">
                {Number(currentSimulation.forgeryProbability).toExponential(2)}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                (3/4)<sup>n</sup> — the theoretical maximum probability that all matching outcomes were achieved by
                guessing, under the assumed per-sample guessing model. This is not a measured forgery rate.
              </p>
            </div>
            <div className="p-3.5 rounded bg-dark-950/40 border border-slate-800/60">
              <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-1">
                Observed Match Rate vs Threshold
              </div>
              <div className="text-white text-lg font-bold">
                {currentSimulation.matchRate}% <span className="text-slate-600 text-xs">/ 95% required</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                Observed measurement agreement reflects the simulated QDS verification behavior for this attempt.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Scientific formulas panel */}
      <div className="glass-card neu-raised p-6 border-slate-800/40 font-mono text-xs space-y-4">
        <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Cpu size={14} className="text-quantum-blue" />
          Projective Measurement Operator Logic
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-950/40 p-4 rounded border border-dark-800 space-y-2">
            <span className="text-[10px] text-quantum-blue font-bold uppercase tracking-wider block">
              Z Basis Projection (Computational)
            </span>
            <code className="text-[11px] text-slate-300 block select-all">
              P_0 = |0⟩⟨0|, \quad P_1 = |1⟩⟨1|
            </code>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
              Validates direct bit parity. Used to verify signature parity after Pauli correction operations are applied.
            </p>
          </div>
          <div className="bg-dark-950/40 p-4 rounded border border-dark-800 space-y-2">
            <span className="text-[10px] text-quantum-purple font-bold uppercase tracking-wider block">
              X Basis Projection (Superposition)
            </span>
            <code className="text-[11px] text-slate-300 block select-all">
              P_+ = |+⟩⟨+|, \quad P_- = |-⟩⟨-|
            </code>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
              Validates phase coherence. Any intercept-resend tampering (an eavesdropper measuring in the computational basis) collapses state phase, causing 50% mismatch rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
