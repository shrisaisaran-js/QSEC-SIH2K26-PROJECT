import React from 'react';
import { useQds } from '../context/QdsContext';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function ProbabilityChart() {
  const { probabilitySeries } = useQds();

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-950 border border-slate-800 p-3 rounded shadow-glow-blue text-xs font-mono">
          <p className="text-white font-bold mb-1.5">Samples: {label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between gap-6 py-0.5">
              <span style={{ color: entry.color }} className="font-semibold">
                {entry.name}:
              </span>
              <span className="text-white font-bold">
                {entry.value}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card neu-raised p-6 border-slate-800/40 relative">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Verification Probability Analysis</h3>
        <p className="text-xs text-slate-400 mt-1">
          Trace of the acceptance bounds as quantum measurements scale.
        </p>
      </div>

      <div className="h-64 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={probabilitySeries}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis 
              dataKey="samples" 
              stroke="#64748b" 
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <YAxis 
              stroke="#64748b" 
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 10 }}
              iconSize={10}
              iconType="circle"
            />
            {/* Required Threshold Line */}
            <Line 
              name="Required Threshold (95%)" 
              type="monotone" 
              dataKey="threshold" 
              stroke="#ef4444" 
              strokeDasharray="5 5"
              strokeWidth={1.5}
              dot={false}
            />
            {/* Theoretical forgery guessing bound (0.75^n) — not an observed rate */}
            <Area 
              name="Theoretical Forgery Guessing Bound" 
              type="monotone" 
              dataKey="forgery" 
              fill="rgba(189, 0, 255, 0.08)" 
              stroke="#bd00ff"
              strokeWidth={2}
            />
            {/* Observed acceptance line */}
            <Line 
              name="Observed Probability" 
              type="monotone" 
              dataKey="observed" 
              stroke="#00f0ff" 
              strokeWidth={2.5}
              dot={{ stroke: '#00f0ff', strokeWidth: 2, r: 3, fill: '#090d16' }}
              activeDot={{ r: 5, strokeWidth: 0, fill: '#00f0ff' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-[10px] text-slate-500 font-mono text-center">
        The theoretical forgery guessing bound contextualizes the simulated measurement model
        under a 3/4-per-sample guessing assumption; it is not an observed attack-success rate.
      </div>
    </div>
  );
}
