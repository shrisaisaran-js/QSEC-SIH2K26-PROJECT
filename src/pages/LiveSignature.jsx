import React, { useState } from 'react';
import { api } from '../api';
import { 
  Fingerprint, 
  Send, 
  ShieldCheck, 
  Terminal, 
  Play,
  FileCheck,
  AlertTriangle,
  XCircle,
  Code
} from 'lucide-react';
import { useQds } from '../context/QdsContext';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import SigningFlow from '../components/SigningFlow';
import CryptoField from '../components/CryptoField';
import CyberButton from '../components/CyberButton';

export default function LiveSignature() {
  // Input State
  const [sender, setSender] = useState('Organization A');
  const [receiver, setReceiver] = useState('Organization B');
  const [message, setMessage] = useState('Transfer authorization request #QSEC-001');

  // Signature Result State
  const [isSigning, setIsSigning] = useState(false);
  const [signatureResult, setSignatureResult] = useState(null);
  const [signError, setSignError] = useState(null);

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  
  // To allow updating the context state with the latest verification history
  const { refreshDashboardStats } = useQds();

  const handleSign = async () => {
    try {
      setIsSigning(true);
      setSignError(null);
      setVerificationResult(null); // Reset verification on new sign
      const res = await api.liveSign({ sender, receiver, message });
      if (res.success) {
        setSignatureResult(res.data);
      }
    } catch (err) {
      console.error("Live sign failed:", err);
      setSignError(err.message || 'Failed to generate signature.');
    } finally {
      setIsSigning(false);
    }
  };

  const handleVerify = async () => {
    if (!signatureResult) return;
    
    try {
      setIsVerifying(true);
      setVerifyError(null);
      const res = await api.liveVerify({ signatureId: signatureResult.signatureId });
      if (res.success) {
        setVerificationResult(res.data);
        await refreshDashboardStats(); // Refresh stats for dashboard
      }
    } catch (err) {
      console.error("Live verify failed:", err);
      setVerifyError(err.message || 'Failed to verify signature.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Live Signature"
        description="Generate a real Ed25519 digital signature, bound to a session and nonce, then submit it for backend verification."
        action={<StatusBadge type="real" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Input Form & Signing */}
        <div className="space-y-6">
          <div className="glass-card neu-raised p-6 border-slate-800/40">
            <div className="flex items-center gap-2 mb-4">
              <Send size={16} className="text-quantum-blue" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Payload Configuration</h3>
            </div>
            
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-cyan-400/90 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Organization A (Signer)
                </label>
                <input 
                  type="text" 
                  className="w-full bg-dark-950/60 border border-cyan-900/40 text-white p-2.5 rounded focus:outline-none focus:border-cyan-400/60 focus:shadow-[0_0_12px_-4px_rgba(34,211,238,0.5)] transition-all"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-blue-400/90 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Organization B (Receiver)
                </label>
                <input 
                  type="text" 
                  className="w-full bg-dark-950/60 border border-blue-900/40 text-white p-2.5 rounded focus:outline-none focus:border-blue-400/60 focus:shadow-[0_0_12px_-4px_rgba(96,165,250,0.5)] transition-all"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-violet-400/90 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
                    Message Content
                  </label>
                  <span className="text-slate-600 text-[10px]">{message.length} chars</span>
                </div>
                <textarea 
                  className="w-full bg-dark-950/60 border border-violet-900/40 text-white p-2.5 rounded focus:outline-none focus:border-violet-400/60 focus:shadow-[0_0_12px_-4px_rgba(167,139,250,0.5)] transition-all h-24 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              
              <button 
                onClick={handleSign}
                disabled={isSigning || !sender || !receiver || !message}
                className="cyber-btn w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-dark-950 border-cyan-400/60 hover:shadow-[0_0_20px_-4px_rgba(34,211,238,0.6)] text-xs mt-2"
              >
                {isSigning ? (
                  <span className="animate-pulse">Generating Cryptographic Signature...</span>
                ) : (
                  <>
                    <Fingerprint size={14} /> Generate Real Signature
                  </>
                )}
              </button>

              {signError && (
                <div className="flex items-start gap-2 p-2.5 rounded bg-red-950/30 border border-red-500/20 text-red-400 text-[11px]">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>{signError}</span>
                </div>
              )}

              <SigningFlow status={isSigning ? 'signing' : signatureResult ? 'complete' : 'idle'} />
            </div>
          </div>
          
          {/* Verification Trigger Panel */}
          {signatureResult && (
             <div className="glass-card neu-raised p-6 border-slate-800/40">
               <div className="flex items-center gap-2 mb-4">
                 <ShieldCheck size={16} className="text-quantum-blue" />
                 <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Verification Pipeline</h3>
               </div>
               <p className="text-xs text-slate-400 font-mono mb-4">
                 Submits the signature to the backend QDS verification engine. This will consume the session nonce and run the statistical analysis.
               </p>
               <button 
                 onClick={handleVerify}
                 disabled={isVerifying}
                 className="cyber-btn w-full py-3 bg-dark-800 text-white border-slate-700 hover:bg-dark-700 text-xs"
               >
                 {isVerifying ? (
                   <span className="animate-pulse flex items-center gap-2"><Play size={14} /> Processing Pipeline...</span>
                 ) : (
                   <>
                     <Play size={14} /> Execute Verification
                   </>
                 )}
               </button>
               {verifyError && (
                 <div className="flex items-start gap-2 mt-3 p-2.5 rounded bg-red-950/30 border border-red-500/20 text-red-400 text-[11px]">
                   <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                   <span>{verifyError}</span>
                 </div>
               )}
             </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          
          {/* Signature Result */}
          <div className="glass-card neu-raised p-6 border-slate-800/40 min-h-[300px]">
             <div className="flex items-center justify-between border-b border-dark-800 pb-3 mb-4">
               <div className="flex items-center gap-2">
                 <Terminal size={16} className="text-emerald-400" />
                 <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Generated Payload</h3>
               </div>
               {signatureResult && (
                 <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/20 text-emerald-400">
                   READY
                 </span>
               )}
             </div>
             
             {!signatureResult ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono text-sm py-12">
                 <Code size={32} className="mb-4 opacity-30" />
                 Awaiting signature generation...
               </div>
             ) : (
               <div className="glass-dense p-3 space-y-3 font-mono text-xs">
                 <CryptoField label="Signature ID" value={signatureResult.signatureId} />
                 <CryptoField label="Session ID" value={signatureResult.sessionId} accent="cyan" />
                 <CryptoField label="Message SHA-256 Hash" value={signatureResult.messageHash} accent="purple" />
                 <CryptoField label="Ed25519 Signature" value={signatureResult.signature} tag="Base64" collapsible previewChars={60} accent="green" />
                 <CryptoField label="Public Key" value={signatureResult.publicKey} tag="PEM" collapsible previewChars={60} accent="blue" />
               </div>
             )}
          </div>
          
          {/* Verification Result */}
          {verificationResult && (
            <div className={`glass-card neu-raised p-6 border-slate-800/40 relative overflow-hidden ${
              verificationResult.decision === 'ACCEPT' 
                ? 'shadow-glow-green border-emerald-500/30' 
                : 'shadow-glow-red border-red-500/30'
            }`}>
              <div className="flex items-center gap-2 border-b border-dark-800 pb-3 mb-4">
                 <FileCheck size={16} className={verificationResult.decision === 'ACCEPT' ? 'text-emerald-400' : 'text-red-400'} />
                 <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Verification Output</h3>
              </div>
              
              <div className="space-y-3 font-mono text-xs">
                 <div className="flex justify-between items-center p-2 rounded bg-dark-950 border border-dark-800">
                   <span className="text-slate-400">Cryptographic Signature</span>
                   <span className={`font-bold ${verificationResult.cryptoValid ? 'text-emerald-400' : 'text-red-400'}`}>
                     {verificationResult.cryptoValid ? 'VALID' : 'INVALID'}
                   </span>
                 </div>
                 
                 <div className="flex justify-between items-center p-2 rounded bg-dark-950 border border-dark-800">
                   <span className="text-slate-400">Session Nonce state</span>
                   <span className={`font-bold ${verificationResult.sessionValid ? 'text-emerald-400' : 'text-red-400'}`}>
                     {verificationResult.sessionValid ? 'CONSUMED' : (verificationResult.nonceValid ? 'REUSED' : 'INVALID')}
                   </span>
                 </div>
                 
                 <div className="flex justify-between items-center p-2 rounded bg-dark-950 border border-dark-800">
                   <span className="text-slate-400 flex items-center gap-1.5">
                     QDS Match Check
                     <StatusBadge type="simulated" size="xs" />
                   </span>
                   <span className={`font-bold ${verificationResult.qdsAnalysis === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}`}>
                     {verificationResult.qdsAnalysis}
                   </span>
                 </div>
                 
                 <div className="flex justify-between items-center p-2 rounded bg-dark-950 border border-dark-800">
                   <span className="text-slate-400">Threat Level</span>
                   <span className={`font-bold ${
                     verificationResult.threatLevel === 'LOW' ? 'text-emerald-400' : 
                     verificationResult.threatLevel === 'WARNING' ? 'text-amber-400' : 'text-red-400'
                   }`}>
                     {verificationResult.threatLevel}
                   </span>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-dark-800 flex flex-col items-center">
                   {verificationResult.decision === 'ACCEPT' ? (
                     <>
                       <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                       <div className="text-lg font-bold text-glow-green text-emerald-400 tracking-widest">SIGNATURE ACCEPTED</div>
                     </>
                   ) : verificationResult.decision === 'BLOCKED' ? (
                     <>
                       <AlertTriangle size={32} className="text-amber-400 mb-2" />
                       <div className="text-lg font-bold text-amber-400 tracking-widest">SIGNATURE BLOCKED</div>
                     </>
                   ) : (
                     <>
                       <XCircle size={32} className="text-red-400 mb-2" />
                       <div className="text-lg font-bold text-red-400 tracking-widest">SIGNATURE REJECTED</div>
                     </>
                   )}
                 </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

// Helper component for rendering missing icons
const CheckCircle2 = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9 12l2 2 4-4"></path>
  </svg>
);
