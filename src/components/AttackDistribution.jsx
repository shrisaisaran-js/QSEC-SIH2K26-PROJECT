import React from 'react';
import { useQds } from '../context/QdsContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function AttackDistribution() {
  const { stats } = useQds();

  const data = [
  {
    name: 'Forgery',
    value: stats.threatBreakdown?.forgery ?? 0,
    color: '#bd00ff'
  },
  {
    name: 'Impersonation',
    value: stats.threatBreakdown?.impersonation ?? 0,
    color: '#4f46e5'
  },
  {
    name: 'Replay',
    value: stats.threatBreakdown?.replay ?? 0,
    color: '#3b82f6'
  },
  {
    name: 'Channel Manipulation',
    value: stats.threatBreakdown?.channel ?? 0,
    color: '#00f0ff'
  },
  {
    name: 'Message Tampering',
    value: stats.threatBreakdown?.messageTampering ?? 0,
    color: '#f59e0b'
  },
  {
    name: 'Signature Tampering',
    value: stats.threatBreakdown?.signatureTampering ?? 0,
    color: '#ef4444'
  }
].filter(item => item.value > 0); // Include even 0 values to show the categories

  const totalThreats = data.reduce((acc, curr) => acc + curr.value, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-950 border border-slate-800 p-2.5 rounded shadow-glow-blue text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="text-white font-bold">{data.name}</span>
          </div>
          <p className="text-slate-400 mt-1">Detections: <span className="text-white font-semibold">{data.value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card neu-raised p-6 border-slate-800/40 flex flex-col justify-between h-full relative">
      <div>
        <h3 className="text-base font-semibold text-white">Detected Attack Distribution</h3>
        <p className="text-xs text-slate-400 mt-1">
          Rule-based classification of quantum security interventions.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around py-4">
        {/* Donut Chart */}
        <div className="h-44 w-44 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-white text-glow-blue leading-none">
              {totalThreats}
            </span>
            <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider mt-1.5">
              Threat Events
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 font-mono text-xs mt-4 sm:mt-0">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 text-[11px]">{item.name}</span>
              </div>
              <span className="text-white font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] text-slate-500 font-mono text-center pt-2 border-t border-dark-800/60">
        Attack profiles are categorized deterministically via physical/logical boundary check.
      </div>
    </div>
  );
}
