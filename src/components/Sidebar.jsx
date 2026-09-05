import React from 'react';
import { useQds } from '../context/QdsContext';
import {
  LayoutDashboard,
  Binary,
  ShieldCheck,
  Activity,
  Flame,
  Bomb,
  BookOpen,
  FileCode,
  Cpu,
  Fingerprint,
  Terminal
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, stats } = useQds();

  const menuGroups = [
    {
      label: 'Overview',
      items: [{ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Verification',
      items: [
        { id: 'live', label: 'Live Signature', icon: Fingerprint },
        { id: 'verification', label: 'Signature Verification', icon: ShieldCheck },
        { id: 'measurement', label: 'Measurement Analysis', icon: Activity },
      ],
    },
    {
      label: 'Security',
      items: [
        { id: 'threat', label: 'Threat Detection', icon: Flame },
        { id: 'attack', label: 'Attack Lab', icon: Bomb },
        { id: 'attack-trace', label: 'Attack Trace', icon: Terminal },
      ],
    },
    {
      label: 'Audit',
      items: [
        { id: 'audit', label: 'Audit Trail', icon: FileCode },
        { id: 'security', label: 'Security Analysis', icon: BookOpen },
      ],
    },
    {
      label: 'Protocol',
      items: [{ id: 'protocol', label: 'QDS Protocol', icon: Binary }],
    },
  ];

  return (
    <aside className="w-64 glass-panel min-h-screen flex flex-col justify-between p-5 text-slate-300 font-sans relative z-10">
      <div className="min-h-0 overflow-y-auto">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-8 border-b border-dark-800 pb-5">
          <div className="p-2 rounded-lg bg-gradient-to-br from-quantum-blue to-quantum-purple text-white shadow-glow-blue motion-safe:animate-pulse-slow neu-raised">
            <Cpu size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-wider text-glow-blue text-white leading-none">
              Q-SEC
            </h1>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-widest block mt-1 truncate">
              Quantum-Inspired Security Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-5">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-4 block mb-1.5">
                {group.label}
              </span>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quantum-blue/60 ${
                        isActive
                          ? 'bg-gradient-to-r from-quantum-blue/15 to-quantum-purple/5 text-white border-l-2 border-quantum-blue shadow-glow-blue neu-raised'
                          : 'hover:bg-dark-800/50 hover:text-white border-l-2 border-transparent hover:translate-x-0.5'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`transition-colors duration-200 shrink-0 ${
                          isActive ? 'text-quantum-blue' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Lab Simulation Footer Indicators */}
      <div className="border-t border-dark-800 pt-5 space-y-4">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
            System Console
          </span>
          <div className="space-y-2 text-xs font-mono">
            {/* Simulator Live status */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Quantum Simulator</span>
              <span className="flex items-center gap-1.5 font-bold text-quantum-blue">
                <span className="status-pulse-dot bg-quantum-blue"></span>
                ONLINE
              </span>
            </div>

            {/* Integrity Security state */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">System Integrity</span>
              {stats.protocolIntegrity === 'SECURE' ? (
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span className="status-pulse-dot bg-emerald-400"></span>
                  SECURE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-bold text-red-500">
                  <span className="status-pulse-dot bg-red-500"></span>
                  ALERT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Institutional branding */}
        <div className="bg-dark-950/60 p-2.5 rounded border border-dark-800/50 text-[10px] font-mono text-center text-slate-500 leading-relaxed">
          <span className="text-white font-semibold">Q-SEC</span> Security Platform
          <span className="block text-slate-600 mt-0.5">Real crypto + quantum-inspired simulation</span>
        </div>
      </div>
    </aside>
  );
}
