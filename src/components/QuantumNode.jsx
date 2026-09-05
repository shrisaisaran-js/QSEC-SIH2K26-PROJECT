import React from 'react';

/**
 * QuantumNode
 *
 * Purely decorative quantum-inspired node used in the QDS Protocol education
 * page and pipeline diagrams: an icon inside a ringed node with a subtle
 * orbiting halo and pulse. Presentational only — carries no security state.
 *
 * accent: 'blue' | 'purple'
 * active: highlights the node as the currently-selected protocol stage.
 */
export default function QuantumNode({ icon: Icon, accent = 'purple', active = false, size = 44 }) {
  const isBlue = accent === 'blue';
  const ringColor = isBlue ? 'border-quantum-blue/30' : 'border-quantum-purple/30';
  const dotColor = isBlue ? 'bg-quantum-blue' : 'bg-quantum-purple';
  const glow = isBlue ? 'shadow-glow-blue' : 'shadow-glow-purple';
  const iconColor = isBlue ? 'text-quantum-blue' : 'text-quantum-purple';
  const bg = isBlue ? 'bg-quantum-blue/10' : 'bg-quantum-purple/10';

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Outer orbital ring */}
      <div
        className={`absolute inset-0 rounded-full border ${ringColor} motion-safe:animate-orbit-slow`}
        style={{ borderStyle: 'dashed' }}
      />
      {/* Orbiting particle */}
      <div className="absolute inset-0 motion-safe:animate-orbit-slow-reverse">
        <span className={`absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${dotColor}`} />
      </div>

      {/* Pulse ring when active */}
      {active && (
        <span className={`absolute inset-1 rounded-full border ${ringColor} node-pulse-ring`} />
      )}

      {/* Core node */}
      <div
        className={`relative z-10 flex items-center justify-center rounded-full border ${bg} ${
          active ? `${ringColor} ${glow}` : 'border-slate-800'
        } transition-all duration-300`}
        style={{ width: size * 0.68, height: size * 0.68 }}
      >
        {Icon && <Icon size={size * 0.34} className={iconColor} />}
      </div>
    </div>
  );
}
