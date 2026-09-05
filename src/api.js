const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();
  

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export const api = {
 createSession: (sender = "Organization A", receiver = "Organization B") =>
  apiRequest("/qds/session", {
    method: "POST",
    body: JSON.stringify({
      sender,
      receiver
    })
  }).then(data => data.session),
  createSignature: (data) =>
  apiRequest("/signature", {
    method: "POST",
    body: JSON.stringify(data)
  }),

  getSession: (sessionId) =>
    apiRequest(`/qds/session/${sessionId}`),

  measurement: (data) =>
    apiRequest("/qds/measurement", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  verification: (data) =>
    apiRequest("/verification", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  verificationHistory: () =>
    apiRequest("/verification/history"),

  bellState: (data) =>
    apiRequest("/qds/bell-state", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  teleportation: (data) =>
    apiRequest("/qds/teleportation", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  attack: (type, data) =>
    apiRequest(`/attacks/${type}`, {
      method: "POST",
      body: JSON.stringify(data)
    }),
  messageTampering: (data = {}) =>
    apiRequest("/attacks/message-tampering", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  signatureTampering: (data = {}) =>
    apiRequest("/attacks/signature-tampering", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  threats: () =>
    apiRequest("/threats"),

  analyzeThreat: (data) =>
    apiRequest("/threats/analyze", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  liveSign: (data) =>
    apiRequest("/signature/live-sign", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  liveVerify: (data) =>
    apiRequest("/signature/live-verify", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  dashboardStats: () =>
    apiRequest("/dashboard/stats"),

  dashboardReset: () =>
  apiRequest("/dashboard/reset", {
    method: "POST"
  }),

  dashboardHealth: () =>
    apiRequest("/dashboard/health"),

  pauliStats: () =>
    apiRequest("/dashboard/pauli-stats"),

  probabilitySeries: () =>
    apiRequest("/dashboard/probability-series"),

  audit: (limit = 20) =>
    apiRequest(`/audit?limit=${limit}`)
};