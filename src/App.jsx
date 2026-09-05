import React from 'react';
import { MotionConfig } from 'framer-motion';
import { QdsProvider, useQds } from './context/QdsContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Page imports
import Dashboard from './pages/Dashboard';
import QdsProtocol from './pages/QDSProtocol';
import Verification from './pages/Verification';
import MeasurementAnalysis from './pages/MeasurementAnalysis';
import ThreatDetection from './pages/ThreatDetection';
import AttackSimulation from './pages/AttackSimulation';
import AttackTracePage from './pages/AttackTracePage';
import SecurityAnalysis from './pages/SecurityAnalysis';
import AuditTrail from './pages/AuditTrail';
import LiveSignature from './pages/LiveSignature';

function AppContent() {
  const { activeTab } = useQds();

  // Determine active view to render in the main content container
  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <Dashboard />;
      case 'live':
        return <LiveSignature />;
      case 'protocol':
        return <QdsProtocol />;
      case 'verification':
        return <Verification />;
      case 'measurement':
        return <MeasurementAnalysis />;
      case 'threat':
        return <ThreatDetection />;
      case 'attack':
        return <AttackSimulation />;
      case 'attack-trace':
        return <AttackTracePage />;
      case 'security':
        return <SecurityAnalysis />;
      case 'audit':
        return <AuditTrail />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-dark-950 min-h-screen text-slate-300 relative font-sans">
      {/* Background visual scans */}
      <div className="absolute inset-0 opacity-5 pointer-events-none quantum-grid" />
      <div className="absolute inset-0 pointer-events-none quantum-scan-line" />

      {/* Main Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar />

        {/* Scrollable Main Screen content wrapper */}
        <main className="flex-1 p-6 overflow-y-auto relative z-10 max-w-7xl mx-auto w-full">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QdsProvider>
      {/* reducedMotion="user" makes every framer-motion animation in the app
          (entrance fades, whileHover lifts, AnimatePresence transitions)
          automatically honor the OS-level prefers-reduced-motion setting. */}
      <MotionConfig reducedMotion="user">
        <AppContent />
      </MotionConfig>
    </QdsProvider>
  );
}
