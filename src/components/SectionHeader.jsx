import React from 'react';

/**
 * SectionHeader
 *
 * Consistent title/description header used to open a page or major section,
 * with optional trailing status/action slot (e.g. a StatusBadge or a button).
 */
export default function SectionHeader({ title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">
          {title}
        </h2>
        {description && (
          <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
