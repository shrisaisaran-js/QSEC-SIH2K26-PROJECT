import React from 'react';
import { useQds } from '../context/QdsContext';
import { Lock, Shield, Settings, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Topbar() {
  const { activeTab, sessionId, stats, resetStats } = useQds();

  // Helper to format tab title
  const getPageHeader = () => {
    switch (activeTab) {
      case 'overview':
        return 'Overview & Real-time Metrics';
      case 'live':
        return 'Live Signature Workstation';
      case 'protocol':
        return 'QDS Teleportation Protocol';
      case 'verification':
        return 'Signature Verification';
      case 'measurement':
        return 'Pauli Measurement Analysis';
      case 'threat':
        return 'Threat Detection Control';
      case 'attack':
        return 'Attack Simulation Lab';
      case 'attack-trace':
        return 'Attack Forensic Trace';
      case 'security':
        return 'Security Bounds Analysis';
      case 'audit':
        return 'Cryptographic Audit Trail';
      default:
        return 'Quantum Signature Security';
    }
  };

  return (
    <header className="min-h-16 glass-panel border-b border-slate-800/60 px-4 md:px-6 py-2 flex flex-wrap items-center justify-between gap-y-2 z-10">
      {/* Title Path */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider shrink-0">
          Q-SEC
        </span>
        <span className="text-slate-700">/</span>
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider truncate">
          {getPageHeader()}
        </h2>
      </div>

      {/* Control Tools */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Simulator status */}
          <div className="hidden md:flex items-center gap-2 bg-dark-950/60 px-3 py-1.5 rounded-full border border-dark-800 text-[10px] font-mono font-bold tracking-wider neu-raised">
            <span className="status-pulse-dot bg-quantum-blue"></span>
            <span className="text-quantum-blue">SIMULATOR ONLINE</span>
          </div>

          {/* Protocol Integrity Status */}
          {stats.protocolIntegrity === 'SECURE' ? (
            <div className="flex items-center gap-1.5 bg-emerald-950/30 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-900/40 text-[10px] font-mono font-bold neu-raised">
              <Shield size={12} className="text-emerald-400" />
              INTEGRITY: SECURE
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-950/30 text-red-400 px-3 py-1.5 rounded-full border border-red-900/40 text-[10px] font-mono font-bold animate-pulse neu-raised">
              <AlertTriangle size={12} className="text-red-400" />
              INTEGRITY: COMPROMISED
            </div>
          )}

          {/* Session ID display */}
          <div className="hidden sm:flex items-center gap-1.5 bg-dark-950/60 px-3 py-1.5 rounded border border-dark-800 text-[10px] font-mono text-slate-400 max-w-[220px] neu-raised">
            <Lock size={12} className="text-quantum-blue shrink-0" />
            <span className="shrink-0">SESSION:</span>
            <span className="text-white font-semibold truncate" title={sessionId}>{sessionId}</span>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex items-center gap-2 border-l border-dark-800 pl-4">
          {/* Reset button */}
          <button
            onClick={resetStats}
            title="Reset Simulation Metrics"
            className="cyber-btn p-2 bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border-dark-800 hover:border-slate-700"
          >
            <RefreshCw size={15} />
          </button>

          {/* Configuration button */}
          <button
            title="Protocol Simulation Parameters"
            className="cyber-btn p-2 bg-dark-850 text-slate-400 border-dark-800 cursor-not-allowed"
            disabled
          >
            <Settings size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
