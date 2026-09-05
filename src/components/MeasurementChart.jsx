import React from 'react';
import { useQds } from '../context/QdsContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function MeasurementChart() {
  const { pauliStats } = useQds();

  const totalSamples =
    (pauliStats.X.plus || 0) + (pauliStats.X.minus || 0) +
    (pauliStats.Y.plus || 0) + (pauliStats.Y.minus || 0) +
    (pauliStats.Z.plus || 0) + (pauliStats.Z.minus || 0);

  // Parse Pauli eigenstate stats into chart layout
  const chartData = [
    {
      name: 'X Basis',
      plusOutcome: pauliStats.X.plus,
      minusOutcome: pauliStats.X.minus,
    },
    {
      name: 'Y Basis',
      plusOutcome: pauliStats.Y.plus,
      minusOutcome: pauliStats.Y.minus,
    },
    {
      name: 'Z Basis',
      plusOutcome: pauliStats.Z.plus,
      minusOutcome: pauliStats.Z.minus,
    }
  ];

  // Custom tooltip styled for black/glass theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-950 border border-slate-800 p-3 rounded shadow-glow-blue text-xs font-mono">
          <p className="text-white font-bold mb-1.5">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between gap-6 py-0.5">
              <span style={{ color: entry.color }} className="font-semibold">
                {entry.name}:
              </span>
              <span className="text-white font-bold">{entry.value}%</span>
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
        <h3 className="text-base font-semibold text-white">Pauli Eigenstate Measurement Distribution</h3>
        <p className="text-xs text-slate-400 mt-1">
          Comparison of matching (+1) vs mismatching (-1) projective outcomes per basis.
        </p>
      </div>

      {/* Bar Chart Container */}
      {totalSamples === 0 ? (
        <div className="h-60 w-full flex flex-col items-center justify-center text-slate-600 font-mono text-sm">
          Awaiting verification measurements
          <span className="text-[11px] text-slate-600 mt-1 normal-case">
            Run a verification to populate this chart with real backend measurement data.
          </span>
        </div>
      ) : (
      <div className="h-60 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis 
              dataKey="name" 
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
            <Bar 
              name="+1 (Key Matches)" 
              dataKey="plusOutcome" 
              fill="#00f0ff" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar 
              name="-1 (Errors / Mismatch)" 
              dataKey="minusOutcome" 
              fill="#bd00ff" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}

      <div className="mt-4 bg-dark-950/40 border border-dark-800/60 p-3 rounded text-[11px] font-mono text-slate-400 leading-relaxed">
        <strong>Scientific Transparency:</strong> Measurement distributions are evaluated against protocol-defined statistical thresholds. Large deviations in Z or X distributions indicate phase/bit flips, often caused by eavesdropping tampering.
      </div>
    </div>
  );
}
