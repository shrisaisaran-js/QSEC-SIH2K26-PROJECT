import React, { useState } from 'react';
import { useQds } from '../context/QdsContext';
import { Filter, Search, ShieldAlert, ShieldCheck, Inbox } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function VerificationTable() {
  const { history } = useQds();
  const [searchTerm, setSearchTerm] = useState('');
  const [basisFilter, setBasisFilter] = useState('ALL');

  // Filter history based on search term and basis filter
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.signatureId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.receiver.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBasis = basisFilter === 'ALL' || item.basis === basisFilter;

    return matchesSearch && matchesBasis;
  });

  // Helper for decision badges
  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'ACCEPT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={11} />
            ACCEPT
          </span>
        );
      case 'REJECT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert size={11} />
            REJECT
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            BLOCKED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            SUSPICIOUS
          </span>
        );
    }
  };

  return (
    <div className="glass-card neu-raised p-6 border-slate-800/40 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-dark-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Recent Verification History</h3>
            <StatusBadge type="real" size="xs" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Backend-persisted log of normal signature verification attempts.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-500" size={13} />
            <input
              type="text"
              placeholder="Search signatures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-950/60 border border-dark-800 rounded px-2 py-2 pl-8 text-white focus:outline-none focus:border-quantum-blue/40 w-44"
            />
          </div>

          {/* Basis filter */}
          <div className="flex items-center gap-1.5 bg-dark-950/60 border border-dark-800 rounded px-2 py-1.5">
            <Filter size={11} className="text-slate-500" />
            <select
              value={basisFilter}
              onChange={(e) => setBasisFilter(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none border-none pr-3 cursor-pointer"
            >
              <option value="ALL" className="bg-dark-950">ALL BASIS</option>
              <option value="X" className="bg-dark-950">X BASIS</option>
              <option value="Y" className="bg-dark-950">Y BASIS</option>
              <option value="Z" className="bg-dark-950">Z BASIS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-dark-800 text-slate-500 pb-2">
              <th className="pb-3 font-bold uppercase tracking-wider">Signature ID</th>
              <th className="pb-3 font-bold uppercase tracking-wider">Sender</th>
              <th className="pb-3 font-bold uppercase tracking-wider">Receiver</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-center">Basis</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-center">Samples</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-center">Match Rate</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-center">Forgery Prob</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-center">Decision</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-900">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-600">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox size={22} className="opacity-40" />
                    <span>
                      {history.length === 0
                        ? 'No verification attempts yet. Run a verification to see results here.'
                        : 'No verification attempts found matching criteria.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredHistory.map((item, idx) => (
                <tr key={idx} className="hover:bg-dark-900/10 transition-colors">
                  <td className="py-3 font-bold text-white tracking-wide">{item.signatureId}</td>
                  <td className="py-3 text-slate-300">{item.sender}</td>
                  <td className="py-3 text-slate-300">{item.receiver}</td>
                  <td className="py-3 text-center">
                    <span className="px-1.5 py-0.5 bg-dark-950 border border-dark-800 rounded text-slate-400 font-bold text-[10px]">
                      {item.basis}
                    </span>
                  </td>
                  <td className="py-3 text-center text-slate-300">{item.samples}</td>
                  <td className={`py-3 text-center font-bold ${
                    item.decision === 'ACCEPT' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {item.matchRate}%
                  </td>
                  <td className="py-3 text-center text-slate-400 font-semibold">
                    {item.forgeryProbability}
                  </td>
                  <td className="py-3 text-center">{getDecisionBadge(item.decision)}</td>
                  <td className="py-3 text-right text-slate-500">{item.timestamp}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
