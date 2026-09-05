import React, { useState } from 'react';
import { useQds } from '../context/QdsContext';
import VerificationPanel from '../components/VerificationPanel';
import VerificationTable from '../components/VerificationTable';
import VerificationFlow from '../components/VerificationFlow';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import { Play, Sliders } from 'lucide-react';

export default function Verification() {
  const { runVerification, currentSimulation } = useQds();
  const [basis, setBasis] = useState('Z');
  const [samples, setSamples] = useState(256);
  const [isRunning, setIsRunning] = useState(false);

  const handleVerify = async () => {
    setIsRunning(true);
    try {
      await runVerification(samples, basis);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Signature Verification"
        description="Backend-authoritative cryptographic verification of Q-SEC digital signatures."
        action={<StatusBadge type="real" />}
      />

      <VerificationFlow decision={currentSimulation?.decision ?? null} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Controls */}
        <div className="lg:col-span-1 glass-card neu-raised p-6 border-slate-800/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-dark-800 pb-3 mb-4">
              <Sliders size={16} className="text-quantum-blue" />
              <h3 className="text-base font-semibold text-white">Verification Parameters</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Configure parameters to test the projective measurements verification engine.
            </p>

            <div className="space-y-5 font-mono text-xs">
              {/* Basis choice */}
              <div className="space-y-2">
                <label className="text-slate-500 font-bold uppercase tracking-wider block">
                  Measurement Basis
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['X', 'Y', 'Z'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBasis(b)}
                      className={`py-2 rounded font-bold border transition-all cursor-pointer ${
                        basis === b
                          ? 'bg-quantum-blue/10 border-quantum-blue text-white shadow-glow-blue'
                          : 'bg-dark-950/60 border-slate-800 text-slate-400 hover:bg-dark-800/20'
                      }`}
                    >
                      {b} Basis
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample count choice */}
              <div className="space-y-2">
                <label className="text-slate-500 font-bold uppercase tracking-wider block">
                  Qubit Measurement Samples (N)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[64, 128, 256].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSamples(num)}
                      className={`py-2 rounded font-bold border transition-all cursor-pointer ${
                        samples === num
                          ? 'bg-quantum-blue/10 border-quantum-blue text-white shadow-glow-blue'
                          : 'bg-dark-950/60 border-slate-800 text-slate-400 hover:bg-dark-800/20'
                      }`}
                    >
                      {num} Qubits
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-dark-800">
            <button
              onClick={handleVerify}
              disabled={isRunning}
              className="cyber-btn w-full py-3 bg-gradient-to-r from-quantum-blue to-quantum-blue/80 text-dark-950 border-quantum-blue/60 hover:shadow-glow-blue text-xs"
            >
              {isRunning ? (
                <span className="animate-pulse">Running Verification Pipeline...</span>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  Execute Verification
                </>
              )}
            </button>
            <div className="text-[10px] text-slate-500 text-center font-mono mt-3 leading-relaxed">
              Acceptance condition: Match Rate &ge; 95%
            </div>
          </div>
        </div>

        {/* Verification Result Display */}
        <div className="lg:col-span-2">
          <VerificationPanel />
        </div>
      </div>

      {/* Verification History Table */}
      <VerificationTable />
    </div>
  );
}
