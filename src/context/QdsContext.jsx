import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../api';
import {
  initialStats,
  initialHistory,
  initialEvents,
  initialHealth,
  initialPauliStats,
  runQdsSimulation,
  generateSessionId,
  QDS_CONFIGS
} from '../data/qdsData';

const QdsContext = createContext();


export const QdsProvider = ({ children }) => {
  const [isSimulatingAttack, setIsSimulatingAttack] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sessionId, setSessionId] = useState(generateSessionId());
  const [signingParty, setSigningParty] = useState("Organization A");
  const [verifyingParty, setVerifyingParty] = useState("Organization B");
  const [stats, setStats] = useState(initialStats);
  const [history, setHistory] = useState(initialHistory);
  const [events, setEvents] = useState(initialEvents);
  const [auditLogs, setAuditLogs] = useState([]);
  const [health, setHealth] = useState(initialHealth);
  const [pauliStats, setPauliStats] = useState(initialPauliStats);
  const [probabilitySeries, setProbabilitySeries] = useState([]);
  
  
  const [currentSimulation, setCurrentSimulation] = useState(null);

  const [attackSimulation, setAttackSimulation] = useState({
    type: null,
    active: false,
    detected: false,
    probability: 0.0,
    threshold: QDS_CONFIGS.REQUIRED_THRESHOLD,
    decision: "",
    logs: [],
    trace: [],
    timestamp: null,
    sessionId: null,
    signatureId: null,
    matchRate: null,
    severity: null,
    riskScore: null
  });

  // Calculate overall metrics whenever history changes
 useEffect(() => {
  const loadDashboardData = async () => {
    try {
      const [
  statsResponse,
  pauliResponse,
  healthResponse,
  probabilityResponse,
  historyResponse,
  auditResponse
] = await Promise.all([
  api.dashboardStats(),
  api.pauliStats(),
  api.dashboardHealth(),
  api.probabilitySeries(),
  api.verificationHistory(50),
  api.audit(50)
]);

      if (statsResponse?.stats) {
        setStats(statsResponse.stats);
      }

      if (pauliResponse?.pauliStats) {
        setPauliStats(pauliResponse.pauliStats);
      }

      if (healthResponse?.health) {
        setHealth(healthResponse.health);
      }

      if (probabilityResponse?.series) {
        setProbabilitySeries(probabilityResponse.series);
  }
      if (historyResponse?.history) {
  setHistory(historyResponse.history);
}
      if (auditResponse?.events) {
       setAuditLogs(auditResponse.events);
}
    } catch (error) {
      console.error(
        '[dashboard] Failed to load dashboard data:',
        error
      );
    }
  };

  loadDashboardData();
}, []);

  

  // Execute standard QDS verification (normal behavior)
  const refreshDashboardStats = async () => {
  try {
    const response = await api.dashboardStats();

    if (response.success && response.stats) {
      setStats(response.stats);
    }
  } catch (error) {
    console.error("Failed to refresh dashboard stats:", error);
  }
};

  const refreshAuditLogs = async () => {
  try {
    const response = await api.audit(50);

    if (response.success && response.events) {
      setAuditLogs(response.events);
    }
  } catch (error) {
    console.error("Failed to refresh audit logs:", error);
  }
};
  const runVerification = async (samples = 256, basis = "Z") => {
    const session = await api.createSession(signingParty, verifyingParty);
    setSessionId(session.sessionId);
    const message = `Q-SEC verification request from ${signingParty} to ${verifyingParty}`;
    const signature = await api.createSignature({
  sessionId: session.sessionId,
  sender: signingParty,
  receiver: verifyingParty,
  message
});
    // important - for verification rejection
    const outcome = runQdsSimulation(basis, samples, null);
    const verification = await api.verification({
  sessionId: session.sessionId,
  signatureId: signature.signatureId,
  basis,
  samples,
  expectedMeasurements: outcome.expectedMeasurements,
  receivedMeasurements: outcome.receivedMeasurements,
  requestingParticipant: verifyingParty
});
    
    const newAttempt = {
      ...verification.verification,
      signatureId: signature.signatureId,
      sender: signingParty,
      receiver: verifyingParty,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    // Update history
    setHistory(prev => [newAttempt, ...prev]);

    // Create timeline event
    const newEvent = {
      id: Date.now(),
      timestamp: newAttempt.timestamp,
      eventType: "Signature verification completed",
      severity: "LOW",
      decision: newAttempt.decision,
      sessionId: session.sessionId,
      signatureId: newAttempt.signatureId,
      details: `Basis [${basis}] statistical rate ${newAttempt.matchRate}% matches rules. Forgery prob ${newAttempt.forgeryProbability}.`
    };
    setEvents(prev => [newEvent, ...prev]);

    // Update current simulation dashboard status
    setCurrentSimulation({
      ...newAttempt,
      active: true
    });

    // Reset attack state when doing normal verification
    setAttackSimulation({
      type: null,
      active: false,
      detected: false,
      probability: 0.0,
      threshold: QDS_CONFIGS.REQUIRED_THRESHOLD,
      decision: "",
      logs: [],
      trace: [],
      timestamp: null,
      sessionId: null,
      signatureId: null,
      matchRate: null,
      severity: null,
      riskScore: null
    });

    // Update Pauli statistics slightly towards normal
    // Refresh Pauli statistics from backend
try {
  const pauliResponse = await api.pauliStats();

  if (pauliResponse?.pauliStats) {
    setPauliStats(pauliResponse.pauliStats);
  }
} catch (error) {
  console.error("[Q-SEC] Failed to refresh Pauli statistics:", error);
}

    // Update Health checks
    // Refresh health status from backend
try {
  const healthResponse = await api.dashboardHealth();

  if (healthResponse?.health) {
    setHealth(healthResponse.health);
  }
  
} catch (error) {
  console.error("[Q-SEC] Failed to refresh health status:", error);
}
  await refreshDashboardStats();
  await refreshAuditLogs();
  };

  // Simulate Cyber Threat/Attack targeting the QDS Protocol
  const simulateAttack = async (type) => {
  try {
    setIsSimulatingAttack(true);
    const samples = 256;
    const basis = "Z";

    // Convert frontend attack names to backend API slugs
    const attackTypeMap = {
  Forgery: "forgery",
  forgery: "forgery",

  Replay: "replay",
  replay: "replay",

  Impersonation: "impersonation",
  impersonation: "impersonation",

  "Channel Manipulation": "channel",
  channel: "channel",

  "Message Tampering": "message-tampering",
  "message-tampering": "message-tampering",

  "Signature Tampering": "signature-tampering",
  "signature-tampering": "signature-tampering"
};

    const backendType = attackTypeMap[type];

if (!backendType) {
  throw new Error(`Unsupported attack type: ${type}`);
}

    

    // Run the controlled attack through the backend.
    // Backend handles QDS verification, threat detection,
    // Attack creation and Threat creation in MongoDB.
let response;

if (type === "message-tampering") {
  response = await api.messageTampering();
} else if (type === "signature-tampering") {
  response = await api.signatureTampering();
} else {
  response = await api.attack(backendType, {
    samples,
    basis
  });
}

    if (!response?.success || !response?.attack) {
      throw new Error("Invalid attack simulation response");
    }

    const attack = response.attack;

    const timestamp =
      attack.timestamp ||
      new Date().toLocaleTimeString("en-US", {
        hour12: false
      });

    // Convert backend result into the history format
    // (display-only labels; do not affect backend security decisions)
    const newAttempt = {
      ...attack,
      sender:
        type === "Forgery"
          ? "Adversarial Simulation"
          : type === "Impersonation"
            ? "Threat Actor (Impersonation Attempt)"
            : "Organization A",
      receiver: "Organization B",
      timestamp
    };

    // Add the actual backend result to history
    //setHistory(prev => [newAttempt, ...prev]);

    // Add activity event
    const newEvent = {
      id: Date.now(),
      timestamp,
      eventType: `${attack.type} attack detected`,
      severity: attack.severity || "WARNING",
      decision: attack.decision,
      sessionId: attack.sessionId,
      signatureId: attack.signatureId,
      details:
        attack.logs?.[attack.logs.length - 1] ||
        `${attack.type} attack simulation completed.`
    };

    setEvents(prev => [newEvent, ...prev]);

    // Update the current simulation panel
    setCurrentSimulation({
      ...newAttempt,
      active: true
    });

    // Update Attack Simulation panel
    setAttackSimulation({
      type,
      active: true,
      detected: attack.detected,
      probability: attack.forgeryProbability,
      threshold: QDS_CONFIGS.REQUIRED_THRESHOLD,
      decision: attack.decision,
      logs: attack.logs || [],
      trace: attack.trace || [],
      timestamp: attack.timestamp || timestamp,
      sessionId: attack.sessionId || null,
      signatureId: attack.signatureId || null,
      matchRate: attack.matchRate,
      severity: attack.severity || null,
      riskScore: attack.riskScore
    });

    // Refresh dashboard statistics FROM MONGODB
    await refreshDashboardStats();

    console.log("[attack] Backend simulation completed:", attack);

    return attack;
  } catch (error) {
    console.error("[attack] Simulation failed:", error);

    setEvents(prev => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour12: false
        }),
        eventType: "Attack simulation failed",
        severity: "ERROR",
        decision: "ERROR",
        sessionId: "-",
        signatureId: "-",
        details: error.message
      },
      ...prev
    ]);

    throw error;
  } finally {
    setIsSimulatingAttack(false);
  }
};

  const resetStats = async () => {
    await api.dashboardReset();
    setStats(initialStats);
    setHistory(initialHistory);
    setEvents(initialEvents);
    setHealth(initialHealth);
    setPauliStats(initialPauliStats);
    setSessionId(generateSessionId());
    setCurrentSimulation(null);
    setAttackSimulation({
      type: null,
      active: false,
      detected: false,
      probability: 0.0,
      threshold: QDS_CONFIGS.REQUIRED_THRESHOLD,
      decision: "",
      logs: [],
      trace: [],
      timestamp: null,
      sessionId: null,
      signatureId: null,
      matchRate: null,
      severity: null,
      riskScore: null
    });
    setProbabilitySeries([]);
  };

  return (
    <QdsContext.Provider value={{
      activeTab,
      setActiveTab,
      sessionId,
      signingParty,
      verifyingParty,
      stats,
      history,
      events,
      auditLogs,
      health,
      pauliStats,
      probabilitySeries,
      currentSimulation,
      attackSimulation,
      isSimulatingAttack,
      runVerification,
      simulateAttack,
      resetStats,
      refreshDashboardStats
    }}>
      {children}
    </QdsContext.Provider>
  );
};

export const useQds = () => useContext(QdsContext);
