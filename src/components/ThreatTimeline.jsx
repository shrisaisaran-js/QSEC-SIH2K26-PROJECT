import React from 'react';
import { useQds } from '../context/QdsContext';
import { motion } from 'framer-motion';

export default function ThreatTimeline() {
  const { events } = useQds();

  return (
    <div className="glass-card p-6 border-slate-800/40 relative flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Security Event Timeline</h3>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically aligned log of simulated channel measurements.
        </p>
      </div>

      {/* Timeline scroll container */}
      <div className="flex-1 overflow-y-auto max-h-[360px] pr-2 space-y-4 font-mono text-xs">
        {events.length === 0 ? (
          <p className="text-center text-slate-600 py-10">No events logged.</p>
        ) : (
          events.map((event, idx) => {
            const isCritical = event.severity === 'CRITICAL';
            const isWarning = event.severity === 'WARNING';
            
            let badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            if (isCritical) {
              badgeColor = 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse';
            } else if (isWarning) {
              badgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            }

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.4) }}
                className="relative pl-6 border-l border-dark-800 pb-2 group"
              >
                {/* Timeline node dot */}
                <div className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border ${
                  isCritical 
                    ? 'bg-red-500 border-red-400 animate-ping' 
                    : isWarning 
                    ? 'bg-amber-500 border-amber-400' 
                    : 'bg-emerald-500 border-emerald-400'
                }`} />

                {/* Event header */}
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold">{event.timestamp}</span>
                    <span className="text-slate-200 font-bold tracking-wide">{event.eventType}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
                    {event.severity}
                  </span>
                </div>

                {/* Details box */}
                <div className="bg-dark-950/40 border border-dark-800/40 p-2.5 rounded text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                  <p>{event.details}</p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-500 pt-1 border-t border-dark-900">
                    <div>
                      <span>Session ID:</span>{' '}
                      <span className="text-slate-400">{event.sessionId}</span>
                    </div>
                    <div>
                      <span>Signature:</span>{' '}
                      <span className="text-slate-400">{event.signatureId}</span>
                    </div>
                    <div>
                      <span>Outcome:</span>{' '}
                      <span className={`font-semibold ${
                        event.decision === 'ACCEPT' 
                          ? 'text-emerald-400' 
                          : event.decision === 'BLOCKED' 
                          ? 'text-amber-400' 
                          : 'text-red-400'
                      }`}>{event.decision}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
