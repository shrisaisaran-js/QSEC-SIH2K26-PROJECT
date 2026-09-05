import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * CryptoField
 *
 * Consistent, safe presentation for cryptographic / technical values
 * (signature IDs, session IDs, hashes, signatures, public keys, nonces).
 *
 * - Always monospace and wraps safely (never breaks layout).
 * - Optional copy-to-clipboard button.
 * - Optional collapse/expand for long values (e.g. public keys, signatures).
 */
// Optional semantic accents for field labels + left rail. Purely presentational;
// omitting `accent` preserves the original neutral slate styling exactly.
const ACCENTS = {
  cyan: { label: 'text-cyan-400/90', rail: 'border-l-cyan-500/50', hover: 'hover:text-cyan-300' },
  violet: { label: 'text-violet-400/90', rail: 'border-l-violet-500/50', hover: 'hover:text-violet-300' },
  purple: { label: 'text-purple-400/90', rail: 'border-l-purple-500/50', hover: 'hover:text-purple-300' },
  blue: { label: 'text-blue-400/90', rail: 'border-l-blue-500/50', hover: 'hover:text-blue-300' },
  green: { label: 'text-emerald-400/90', rail: 'border-l-emerald-500/50', hover: 'hover:text-emerald-300' },
};

export default function CryptoField({ label, value, tag, collapsible = false, previewChars = 64, accent }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!collapsible);

  const stringValue = value === null || value === undefined ? '' : String(value);
  const isLong = collapsible && stringValue.length > previewChars;
  const displayValue = !expanded && isLong ? `${stringValue.slice(0, previewChars)}…` : stringValue;
  const a = ACCENTS[accent];

  const handleCopy = async () => {
    if (!stringValue) return;
    try {
      await navigator.clipboard.writeText(stringValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail silently (e.g. insecure context) - no-op.
    }
  };

  return (
    <div
      className={`bg-dark-950 p-3 rounded border overflow-hidden transition-colors ${
        a ? `border-dark-800 border-l-2 ${a.rail}` : 'border-dark-800'
      }`}
    >
      <div className="flex justify-between items-center mb-1 gap-2">
        <span className={`text-[11px] font-mono uppercase tracking-wide ${a ? a.label : 'text-slate-500'}`}>
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {tag && <span className="text-[9px] text-slate-600 font-mono">{tag}</span>}
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className={`text-slate-500 transition-colors cursor-pointer ${a ? a.hover : 'hover:text-quantum-blue'}`}
              aria-label={expanded ? 'Collapse value' : 'Expand value'}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
          {stringValue && (
            <button
              type="button"
              onClick={handleCopy}
              className={`text-slate-500 transition-colors cursor-pointer ${a ? a.hover : 'hover:text-quantum-blue'}`}
              aria-label="Copy to clipboard"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
      <div className="crypto-value text-slate-200">
        {displayValue || <span className="text-slate-600 italic">Not available</span>}
      </div>
    </div>
  );
}
