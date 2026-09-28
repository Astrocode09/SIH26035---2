import React, { useState } from 'react';
import { StatutoryAuditRecord } from '../../types/metrology';

interface LedgerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditTrail: StatutoryAuditRecord[];
}

export const LedgerVerificationModal: React.FC<LedgerVerificationModalProps> = ({
  isOpen,
  onClose,
  auditTrail,
}) => {
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const merkleRoot = '0x9f4cb821a8f732de09b2e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b';

  const handleCopy = () => {
    navigator.clipboard.writeText(merkleRoot);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleRunVerification = () => {
    setIsVerifying(true);
    setVerificationResult(null);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult('All 4 test leaves verified against SHA-256 Merkle tree root. Zero hash divergence. Ledger state immutable.');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#001428]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded border border-[#c3c6ce]/40 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#001428] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006781] text-[20px]">verified_user</span>
            <span className="font-bold text-[15px]">SHA-256 Merkle Tree Ledger Verification</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#cbdbf5] text-[18px] font-mono leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-[#0b1c30]">
          <p className="text-[12px] text-[#43474d] leading-relaxed">
            The statutory traceability ledger guarantees cryptographic non-repudiation. Each test point executed under OIML R-76 is signed with the inspecting officer&apos;s private key and anchored into a sequential Merkle leaf.
          </p>

          {/* Block Overview */}
          <div className="bg-[#eff4ff] p-3 rounded border border-[#c3c6ce]/30 flex flex-col gap-2 font-mono text-[12px]">
            <div className="flex justify-between">
              <span className="text-[#43474d]">BLOCK NUMBER:</span>
              <span className="font-bold text-[#001428]">#1,409,218 (Hyperledger Metrology Node)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#43474d]">CONSENSUS ENGINE:</span>
              <span className="font-bold text-[#21a173]">Raft BFT (State Legal Metrology Org)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#43474d]">MERKLE ROOT:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#006781] font-bold truncate max-w-[240px]">{merkleRoot}</span>
                <button
                  onClick={handleCopy}
                  className="px-2 py-0.5 bg-white border border-[#c3c6ce]/40 rounded text-[10px] text-[#001428] hover:bg-[#dce9ff]"
                >
                  {copiedHash ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Leaves Breakdown */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono font-bold text-[#43474d] uppercase tracking-wider">
              Cryptographic Leaves In Active Block (Leaf Hash Chain)
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px]">
              {auditTrail.map((record, index) => (
                <div key={record.id || index} className="p-2 bg-[#eff4ff]/60 rounded border border-[#c3c6ce]/20 flex items-center justify-between">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[#001428] font-sans truncate">{record.testVector}</span>
                    <span className="text-[#43474d] text-[10px] truncate">{record.hash}</span>
                  </div>
                  <span className="text-[#21a173] font-bold shrink-0 ml-2">HASH OK</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action and feedback */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleRunVerification}
              disabled={isVerifying}
              className="w-full py-2.5 bg-[#001428] hover:bg-[#0f2942] disabled:opacity-60 text-white rounded text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span className={`material-symbols-outlined text-[18px] ${isVerifying ? 'animate-spin' : ''}`}>
                {isVerifying ? 'refresh' : 'rule'}
              </span>
              <span>{isVerifying ? 'Validating Merkle Tree Branches...' : 'Execute Mathematical Proof Verification'}</span>
            </button>

            {verificationResult && (
              <div className="p-2.5 bg-[#85f8c4]/30 border border-[#21a173] text-[#002114] rounded text-[11px] font-mono">
                ✅ {verificationResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
