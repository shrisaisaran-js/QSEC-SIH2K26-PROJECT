import React from 'react';
import { useQds } from '../context/QdsContext';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function ProtocolHealth() {
  const { health } = useQds();

  return (
    <div className="glass-card neu-raised p-6 border-slate-800/40 relative">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">QDS Protocol Health</h3>
        <p className="text-xs text-slate-400 mt-1">
          Coherence and integrity states of the teleportation signature stages.
        </p>
      </div>

      {/* Grid checklist */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-dark-800 text-slate-500 pb-2">
              <th className="pb-2.5 font-bold uppercase tracking-wider">Protocol Node</th>
              <th className="pb-2.5 font-bold uppercase tracking-wider text-center">Status</th>
              <th className="pb-2.5 font-bold uppercase tracking-wider text-center">Confidence</th>
              <th className="pb-2.5 font-bold uppercase tracking-wider text-right">Last Calibrated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-900">
            {health.map((row) => {
              const isValid = row.status === 'VALID';
              return (
                <tr key={row.id} className="hover:bg-dark-900/20 transition-colors">
                  <td className="py-3 font-semibold text-slate-200 flex items-center gap-2">
                    {isValid ? (
                      <ShieldCheck size={14} className="text-emerald-400" />
                    ) : (
                      <ShieldAlert size={14} className="text-red-400 animate-pulse" />
                    )}
                    {row.component}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isValid 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 text-center font-bold text-white">
                    {(row.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 text-right text-slate-500">
                    {row.lastChecked}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-[9px] text-slate-600 font-mono flex items-center gap-1.5 justify-center">
        <span>●</span>
        <span>Confidence is estimated via statistical fidelity measurements of auxiliary check states.</span>
      </div>
    </div>
  );
}
