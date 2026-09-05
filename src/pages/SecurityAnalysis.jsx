import React from 'react';
import { useQds } from '../context/QdsContext';
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Gauge,
  Percent,
  Fingerprint,
  Radio,
  AlertOctagon
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import InfoTooltip from '../components/InfoTooltip';
import MetricCard from '../components/MetricCard';
import AttackDistribution from '../components/AttackDistribution';
import ProbabilityChart from '../components/ProbabilityChart';

export default function SecurityAnalysis() {
  const { stats } = useQds();
  const isSecure = stats.protocolIntegrity !== 'ALERT';

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="glass-card neu-raised p-6 border-slate-800/40 relative">
        <SectionHeader
          title="Security Analysis"
          description="How secure is the system, based on observed backend data?"
        />
        <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-3xl">
          This page separates three kinds of information: metrics{' '}
          <span className="text-emerald-400 font-semibold">observed</span> from real backend
          activity, results from the{' '}
          <span className="text-quantum-purple font-semibold">simulated</span> quantum-inspired
          measurement model, and{' '}
          <span className="text-amber-400 font-semibold">theoretical</span> mathematical
          reference bounds. None of these are calculated or overridden in the browser&mdash;the
          backend remains authoritative for every security decision.
        </p>
      </div>

      {/* A. Security Posture */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Security Posture
          </h3>
          <StatusBadge type="real" label="OBSERVED" size="xs" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title="Protocol Integrity"
            value={stats.protocolIntegrity ?? 'UNKNOWN'}
            subtext={isSecure ? 'No active alerts' : 'Active alert condition'}
            icon={isSecure ? ShieldCheck : ShieldAlert}
            glowType={isSecure ? 'blue' : 'none'}
          />
          <MetricCard
            title="Threats Detected"
            value={stats.threatsDetected ?? 0}
            subtext="Persisted threat findings"
            icon={AlertOctagon}
            glowType="none"
          />
          <MetricCard
            title="Average Risk Score"
            value={`${stats.averageRiskScore ?? 0}/100`}
            subtext="Mean across all findings"
            icon={Gauge}
            glowType="purple"
          />
          <MetricCard
            title="False Acceptance Rate"
            value={`${stats.falseAcceptanceRate ?? 0}%`}
            subtext="Attack simulations wrongly accepted"
            icon={Percent}
            glowType="none"
          />
          <MetricCard
            title="Observed Confidence"
            value={stats.observedConfidence != null ? stats.observedConfidence : '—'}
            subtext="Latest normal verification match ratio"
            icon={Activity}
            glowType="blue"
          />
          <MetricCard
            title="Identity Consistency"
            value={stats.identityConsistency != null ? `${stats.identityConsistency}%` : '—'}
            subtext="Latest verification identity match"
            icon={Fingerprint}
            glowType="none"
          />
          <MetricCard
            title="Measurement Deviation"
            value={stats.measurementDeviation != null ? `${stats.measurementDeviation}%` : '—'}
            subtext="Latest channel deviation"
            icon={Radio}
            glowType="none"
          />
          <MetricCard
            title="Verification Acceptance Rate"
            value={`${stats.verificationAccuracy ?? 0}%`}
            subtext={`${stats.successfulVerifications ?? 0} of ${stats.totalAttempts ?? 0} attempts`}
            icon={ShieldCheck}
            glowType="blue"
          />
        </div>
      </div>

      {/* B. Verification Integrity */}
      <div className="glass-card neu-raised p-6 border-slate-800/40">
        <div className="flex items-center gap-2 border-b border-dark-800 pb-3 mb-4">
          <ShieldCheck size={16} className="text-quantum-blue" />
          <h3 className="text-sm font-semibold text-white font-mono uppercase">
            Verification Integrity
          </h3>
          <StatusBadge type="real" label="OBSERVED" size="xs" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Normal Attempts</span>
            <span className="text-white text-lg font-bold">{stats.totalAttempts ?? 0}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Accepted</span>
            <span className="text-emerald-400 text-lg font-bold">
              {stats.successfulVerifications ?? 0}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Rejected</span>
            <span className="text-red-400 text-lg font-bold">
              {stats.failedVerifications ?? 0}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Acceptance Rate</span>
            <span className="text-white text-lg font-bold">
              {stats.verificationAccuracy ?? 0}%
            </span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-4 pt-3 border-t border-dark-800/60 leading-relaxed">
          Figures cover NORMAL-mode verification attempts only. Controlled attack simulations are
          tracked separately in Threat Posture and the Attack Lab, and never mixed into this
          history.
        </p>
      </div>

      {/* C. Threat Posture */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Threat Posture
          </h3>
          <StatusBadge type="real" label="OBSERVED" size="xs" />
        </div>
        <AttackDistribution />
      </div>

      {/* D. QDS / Statistical Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            QDS / Statistical Insights
          </h3>
        </div>

        <ProbabilityChart />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card neu-raised p-6 border-slate-800/40 space-y-3">
            <div className="flex items-center gap-2">
              <StatusBadge type="theoretical" />
              <h4 className="text-sm font-semibold text-white">
                Theoretical Forgery Guessing Bound
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The curve labeled &ldquo;Theoretical Forgery Guessing Bound&rdquo; above follows{' '}
              <code className="text-quantum-purple font-mono">(3/4)^N</code>, the maximum
              per-sample guessing probability for a party without the correct quantum state.
              This is a theoretical bound used to contextualize the simulated measurement model;
              it is not an observed attack-success rate, and should never be read as a measured
              forgery probability.
            </p>
          </div>

          <div className="glass-card neu-raised p-6 border-slate-800/40 space-y-3">
            <div className="flex items-center gap-2">
              <StatusBadge type="real" />
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                False Acceptance Rate
                <InfoTooltip text="Share of controlled ATTACK_SIMULATION-mode verifications that the backend decided to ACCEPT, out of all attack simulations run." />
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              False Acceptance Rate ({stats.falseAcceptanceRate ?? 0}%) reflects the share of
              controlled attack simulations the backend accepted, per its own metric definition.
              It is a distinct, independently observed figure&mdash;it is not derived from, and
              should not be confused with, the theoretical forgery guessing bound above.
            </p>
          </div>
        </div>

        <div className="glass-card neu-raised p-6 border-slate-800/40 space-y-2">
          <div className="flex items-center gap-2">
            <StatusBadge type="simulated" />
            <h4 className="text-sm font-semibold text-white">QDS Measurement Behavior</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bell-state preparation, teleportation, and Pauli correction are modeled in software
            for this prototype&mdash;they do not run on physical quantum hardware. Observed
            confidence and identity consistency above are computed from this simulation&rsquo;s
            output, combined with the same deterministic, rule-based threat engine used for real
            traffic.
          </p>
          <div className="flex items-center gap-2 pt-2 mt-2 border-t border-dark-800/60">
            <StatusBadge type="future" />
            <p className="text-[11px] text-slate-500">
              Physical quantum hardware, a production QDS deployment, and a post-quantum
              signature provider are roadmap items, not part of this build.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
