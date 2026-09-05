import React from 'react';
import { motion } from 'framer-motion';

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  glowType = 'blue', // 'blue', 'purple', 'none'
  breakdown
}) {
  const glowClass = 
    glowType === 'blue' 
      ? 'border-quantum-blue/10 hover:border-quantum-blue/30 hover:shadow-glow-blue' 
      : glowType === 'purple' 
      ? 'border-quantum-purple/10 hover:border-quantum-purple/30 hover:shadow-glow-purple'
      : 'border-slate-800/40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`glass-card neu-raised p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden group ${glowClass}`}
    >
      {/* Background glow effects */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-quantum-blue/5 to-quantum-purple/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded bg-dark-850 border border-slate-800 text-slate-400 group-hover:text-slate-200 transition-colors ${
            glowType === 'blue' ? 'group-hover:border-quantum-blue/30 text-quantum-blue/80' : glowType === 'purple' ? 'group-hover:border-quantum-purple/30 text-quantum-purple/80' : ''
          }`}>
            <Icon size={16} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3 relative z-10">
        <div className={`text-2xl font-bold tracking-tight text-white font-sans ${
          glowType === 'blue' ? 'text-glow-blue' : glowType === 'purple' ? 'text-glow-purple' : ''
        }`}>
          {value}
        </div>
      </div>

      {/* Footer / Trend / Subtext */}
      <div className="mt-2 flex items-center justify-between text-xs relative z-10">
        {breakdown ? (
          <div className="grid grid-cols-3 gap-2 w-full text-[9px] font-mono text-slate-500 mt-1.5 pt-2 border-t border-dark-800">
            {Object.entries(breakdown).map(([key, val]) => (
              <div key={key} className="flex flex-col">
                <span className="capitalize">
  {key.replace(/([A-Z])/g, ' $1')}:
</span>
                <span className="text-white font-semibold">{val}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <span className="text-slate-500 font-medium truncate pr-2">{subtext}</span>
            {trend && (
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                trend.type === 'positive' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                  : trend.type === 'negative' 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' 
                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/25'
              }`}>
                {trend.value}
              </span>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
