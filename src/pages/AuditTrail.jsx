import React from 'react';
import VerificationTable from '../components/VerificationTable';
import ProtocolHealth from '../components/ProtocolHealth';
import AuditEventTable from '../components/AuditEventTable';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';

export default function AuditTrail() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="glass-card neu-raised p-6 border-slate-800/40 relative">
        <SectionHeader
          title="Audit Trail"
          description="Security-relevant system activity recorded by Q-SEC."
          action={<StatusBadge type="real" />}
        />

        <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-3xl">
          Every significant security event&mdash;session creation, verification outcomes, threat
          detections, and controlled attack simulations&mdash;is written to the Q-SEC audit log
          with a timestamp, severity, and outcome as it occurs. These are standard database
          records; the log is not cryptographically hashed or chained, and Q-SEC does not claim
          it is tamper-proof or immutable.
        </p>
      </div>

      {/* Backend Audit Events */}
      <AuditEventTable />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification history table */}
        <div className="lg:col-span-2">
          <VerificationTable />
        </div>

        {/* Protocol Health check list */}
        <div className="lg:col-span-1">
          <ProtocolHealth />
        </div>
      </div>
    </div>
  );
}