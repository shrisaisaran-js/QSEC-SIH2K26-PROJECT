import React from 'react';
import { useQds } from '../context/QdsContext';
import MetricCard from '../components/MetricCard';
import QuantumFlow from '../components/QuantumFlow';
import SecurityPipeline from '../components/SecurityPipeline';
import StatusBadge from '../components/StatusBadge';
import MeasurementChart from '../components/MeasurementChart';
import VerificationPanel from '../components/VerificationPanel';
import ThreatPanel from '../components/ThreatPanel';
import ThreatTimeline from '../components/ThreatTimeline';
import ProbabilityChart from '../components/ProbabilityChart';
import AttackDistribution from '../components/AttackDistribution';
import CyberButton from '../components/CyberButton';
import {
  ShieldCheck,
  ShieldAlert,
  Percent,
  TrendingDown,
  Hash,
  AlertOctagon,
  TrendingUp,
  Play,
  Flame
} from 'lucide-react';

export default function Dashboard() {
  const { stats, runVerification, setActiveTab } = useQds();

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="glass-card neu-raised p-6 border-quantum-blue/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none quantum-grid" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Quantum-Inspired Threat Detection
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Deterministic security monitoring for teleportation-based Quantum Digital Signatures (QDS)
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <CyberButton
              variant="primary"
              size="md"
              icon={Play}
              onClick={() => runVerification(256, 'Z')}
            >
              Run Verification
            </CyberButton>
            <CyberButton
              variant="outline"
              size="md"
              icon={Flame}
              className="text-quantum-purple border-quantum-purple/30 hover:bg-quantum-purple/10 hover:shadow-glow-purple"
              onClick={() => setActiveTab('attack')}
            >
              Launch Attack Simulation
            </CyberButton>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
       {/* Acceptance Rate */}
<MetricCard
  title="Acceptance Rate"
  value={`${stats.verificationAccuracy}%`}
  subtext="Accepted / total attempts"
  icon={Percent}
  glowType="blue"
/>

        {/* Forgery Probability */}
        <MetricCard
  title="Forgery Probability"
  value={
  stats.forgeryProbability !== null &&
  stats.forgeryProbability !== undefined
    ? Number(stats.forgeryProbability).toExponential(2)
    : "N/A"
}
  subtext="Prototype statistical estimate"
  icon={TrendingDown}
  glowType="blue"
/>

        {/* Total Verification Attempts */}
        <MetricCard 
  title="Verification Attempts" 
  value={stats.totalAttempts.toLocaleString()} 
  subtext="Total verification attempts" 
  icon={Hash} 
  glowType="none" 
/>

        {/* Threats Detected */}
        <MetricCard
          title="Threats Detected"
          value={stats.threatsDetected}
          breakdown={stats.threatBreakdown}
          icon={AlertOctagon}
          glowType={stats.threatsDetected > 17 ? 'purple' : 'none'}
        />

        {/* False Acceptance Rate */}
        <MetricCard
  title="False Acceptance Rate"
  value={`${stats.falseAcceptanceRate}%`}
  subtext="Estimated false-accept rate"
  icon={TrendingUp}
  glowType="none"
/>

        {/* Protocol Integrity */}
        <MetricCard
          title="Protocol Integrity"
          value={stats.protocolIntegrity}
          subtext={`Observed Conf: ${stats.observedConfidence}`}
          icon={stats.protocolIntegrity === 'SECURE' ? ShieldCheck : ShieldAlert}
          glowType={stats.protocolIntegrity === 'SECURE' ? 'blue' : 'purple'}
        />
      </div>

      {/* Backend-authoritative verification pipeline */}
      <SecurityPipeline />

      {/* Quantum Protocol Education Diagram (simulated) */}
      <QuantumFlow />

      {/* Analytics Group: Pauli Basis + Statistical Composed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MeasurementChart />
        <ProbabilityChart />
      </div>

      {/* Decision Engine + Threat Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Panel */}
        <div className="lg:col-span-1">
          <VerificationPanel />
        </div>

        {/* Threat Detection Engine */}
        <div className="lg:col-span-2">
          <ThreatPanel />
        </div>
      </div>

      {/* Event Timeline + Attack Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Timeline */}
        <div className="lg:col-span-2">
          <ThreatTimeline />
        </div>

        {/* Attack Distribution (Donut) */}
        <div className="lg:col-span-1">
          <AttackDistribution />
        </div>
      </div>

      {/* Dashboard Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Action 1: Run QDS */}
        <div className="glass-card neu-raised card-lift p-5 border-slate-800/40 flex flex-col justify-between min-h-[140px] hover:border-quantum-blue/20 transition-all">
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Run QDS Verification</h4>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Execute teleportation-based signature verification using simulated measurement outcomes.
            </p>
          </div>
          <CyberButton
            variant="ghost"
            className="w-full mt-4 bg-dark-850/60 hover:bg-dark-800 border-dark-800 hover:border-slate-700 text-slate-300 hover:text-white justify-center"
            onClick={() => runVerification(256, 'Z')}
          >
            Start Verification
          </CyberButton>
        </div>

        {/* Quick Action 2: Simulate Attack */}
        <div className="glass-card neu-raised card-lift p-5 border-slate-800/40 flex flex-col justify-between min-h-[140px] hover:border-quantum-purple/20 transition-all">
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Simulate Attack</h4>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Generate controlled forgery, replay, impersonation or channel manipulation scenarios.
            </p>
          </div>
          <CyberButton
            variant="ghost"
            className="w-full mt-4 bg-dark-850/60 hover:bg-dark-800 border-dark-800 hover:border-slate-700 text-slate-300 hover:text-white justify-center"
            onClick={() => setActiveTab('attack')}
          >
            Open Simulator
          </CyberButton>
        </div>

        {/* Quick Action 3: Analyze Security */}
        <div className="glass-card neu-raised card-lift p-5 border-slate-800/40 flex flex-col justify-between min-h-[140px] hover:border-quantum-blue/20 transition-all">
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Analyze Security</h4>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Evaluate forgery probability and verification accuracy using statistical measurements.
            </p>
          </div>
          <CyberButton
            variant="ghost"
            className="w-full mt-4 bg-dark-850/60 hover:bg-dark-800 border-dark-800 hover:border-slate-700 text-slate-300 hover:text-white justify-center"
            onClick={() => setActiveTab('security')}
          >
            Security Analysis
          </CyberButton>
        </div>
      </div>

      {/* Scientific Transparency Footer */}
      <footer className="glass-card p-5 border-slate-800/40 bg-dark-950/20 font-mono text-[11px] text-slate-500 leading-relaxed">
        <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Security Model &mdash; Scientific Transparency</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge type="real" size="xs" />
            </div>
            <span className="text-slate-300 font-semibold block">
              Ed25519 signing/verification, SHA-256, session + nonce binding, backend threat/risk/decision engine, database & audit trail
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge type="simulated" size="xs" />
            </div>
            <span className="text-slate-300 font-semibold block">
              Bell state, entanglement, teleportation, Pauli correction, projective measurement, QDS statistical behavior
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge type="future" size="xs" />
            </div>
            <span className="text-slate-300 font-semibold block">
              Physical quantum hardware, production quantum network, post-quantum signature provider
            </span>
          </div>
        </div>
        <p className="text-slate-600 border-t border-dark-800 pt-3">
          Current prototype uses classical Ed25519 signatures for real cryptographic signing. The QDS layer is a
          software simulation. Post-quantum signature integration is a future extension. Ed25519 is not a
          post-quantum / quantum-safe algorithm.
        </p>
      </footer>
    </div>
  );
}
