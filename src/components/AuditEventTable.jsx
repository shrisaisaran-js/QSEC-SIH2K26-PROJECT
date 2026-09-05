import React from 'react';
import { useQds } from '../context/QdsContext';
import {
  ShieldAlert,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function AuditEventTable() {
  const { auditLogs } = useQds();

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            CRITICAL
          </span>
        );

      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            HIGH
          </span>
        );

      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            WARNING
          </span>
        );

      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            LOW
          </span>
        );
    }
  };

  const getEventIcon = (eventType) => {
    if (eventType?.includes('DETECTED')) {
      return <ShieldAlert size={14} className="text-red-400" />;
    }

    if (eventType === 'VERIFICATION_ACCEPTED') {
      return <ShieldCheck size={14} className="text-emerald-400" />;
    }

    return <Activity size={14} className="text-cyan-400" />;
  };

  return (
    <div className="glass-card neu-raised p-6 border-slate-800/40 relative">
      <div className="flex items-center justify-between mb-5 border-b border-dark-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            Backend Audit Events
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Live cryptographic and threat events recorded by the Q-SEC backend.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          BACKEND LOG
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-dark-800 text-slate-500">
              <th className="pb-3 font-bold uppercase tracking-wider">
                Event
              </th>

              <th className="pb-3 font-bold uppercase tracking-wider">
                Severity
              </th>

              <th className="pb-3 font-bold uppercase tracking-wider">
                Decision
              </th>

              <th className="pb-3 font-bold uppercase tracking-wider">
                Session
              </th>

              <th className="pb-3 font-bold uppercase tracking-wider">
                Signature
              </th>

              <th className="pb-3 font-bold uppercase tracking-wider">
                Details
              </th>

              <th className="pb-3 font-bold uppercase tracking-wider text-right">
                Time
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-dark-900">
            {!auditLogs || auditLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-slate-600"
                >
                  <div className="font-bold uppercase tracking-wider text-slate-500 mb-1">
                    No Security Events Recorded
                  </div>
                  <div className="text-[11px] normal-case text-slate-600">
                    Backend audit monitoring is active. Events will appear here as they occur.
                  </div>
                </td>
              </tr>
            ) : (
              auditLogs.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-dark-900/20 transition-colors"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.eventType)}

                      <span className="font-bold text-slate-300 whitespace-nowrap">
                        {event.eventType}
                      </span>
                    </div>
                  </td>

                  <td className="py-3">
                    {getSeverityBadge(event.severity)}
                  </td>

                  <td className="py-3">
                    <span
                      className={
                        event.decision === 'ACCEPT'
                          ? 'text-emerald-400 font-bold'
                          : event.decision === 'BLOCKED'
                            ? 'text-amber-400 font-bold'
                            : event.decision === 'REJECT'
                              ? 'text-red-400 font-bold'
                              : 'text-slate-500'
                      }
                    >
                      {event.decision || '—'}
                    </span>
                  </td>

                  <td className="py-3 text-slate-400 whitespace-nowrap">
                    {event.sessionId || '—'}
                  </td>

                  <td className="py-3 text-slate-400 whitespace-nowrap">
                    {event.signatureId || '—'}
                  </td>

                  <td className="py-3 text-slate-500 min-w-[300px]">
                    {event.details || '—'}
                  </td>

                  <td className="py-3 text-right text-slate-500 whitespace-nowrap">
                    {event.timestamp || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-dark-800 text-[10px] text-slate-600 font-mono">
        {auditLogs?.length || 0} backend events loaded
      </div>
    </div>
  );
}