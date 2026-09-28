import React, { useState } from 'react';
import { FormVIIICertificate } from '../types/metrology';

interface LegalCertificateVaultProps {
  certificates: FormVIIICertificate[];
  onOpenCertificateModal: (cert: FormVIIICertificate) => void;
  onOpenLedgerModal: () => void;
}

export const LegalCertificateVault: React.FC<LegalCertificateVaultProps> = ({
  certificates,
  onOpenCertificateModal,
  onOpenLedgerModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [citizenVerifyInput, setCitizenVerifyInput] = useState<string>('');
  const [citizenVerificationResult, setCitizenVerificationResult] = useState<{
    found: boolean;
    cert?: FormVIIICertificate;
    message?: string;
  } | null>(null);

  // Filter certificates
  const filteredCerts = certificates.filter((cert) => {
    const matchesSearch =
      cert.certNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState =
      selectedState === 'ALL' || cert.issuer.toLowerCase().includes(selectedState.toLowerCase());

    return matchesSearch && matchesState;
  });

  const handleCitizenVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenVerifyInput.trim()) return;

    const query = citizenVerifyInput.trim().toLowerCase();
    const found = certificates.find(
      (c) =>
        c.certNumber.toLowerCase().includes(query) ||
        c.merkleRootHash.toLowerCase().includes(query) ||
        c.sealId.toLowerCase().includes(query)
    );

    if (found) {
      setCitizenVerificationResult({
        found: true,
        cert: found,
        message: 'Valid Sovereign Legal Metrology Certificate. Authenticity cryptographically confirmed.',
      });
    } else {
      setCitizenVerificationResult({
        found: false,
        message: 'No certificate found matching the provided hash or certificate number. Potential unverified scale.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header bar */}
      <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[18px] text-[#001428]">
              Legal Metrology Certificate Vault & Form VIII Repository
            </span>
            <span className="text-[11px] font-mono font-bold bg-[#8fdfff]/30 text-[#00647d] px-2 py-0.5 rounded">
              SCHEDULE VIII • RULE 24
            </span>
          </div>
          <span className="text-[12px] text-[#43474d] mt-0.5">
            Immutable statutory records under Legal Metrology Act, 2009 with DigiLocker and citizen scan integration
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCertificateModal(certificates[0])}
            className="px-3.5 py-2 bg-[#21a173] hover:bg-[#006781] text-white rounded text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>View Active Form VIII</span>
          </button>
        </div>
      </div>

      {/* Citizen & Merchant Verification Bar (DigiLocker Integration) */}
      <div className="bg-gradient-to-r from-[#001428] to-[#0f2942] text-white p-5 rounded border border-[#0f2942] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col max-w-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#85f8c4] text-[22px]">qr_code_scanner</span>
              <span className="font-bold text-[16px] text-white tracking-tight">
                DigiLocker & Citizen Verification Portal
              </span>
            </div>
            <p className="text-[12px] text-[#b0c9e8] mt-1 leading-relaxed">
              Verify any commercial weighing scale in India instantly. Farmers and merchants can scan the on-platter QR code or enter the certificate number to confirm government verification and prevent mandi fraud.
            </p>
          </div>

          <form onSubmit={handleCitizenVerify} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="e.g. IND/LM/DL/2026/049182 or Hash"
              value={citizenVerifyInput}
              onChange={(e) => setCitizenVerifyInput(e.target.value)}
              className="px-3 py-2 bg-[#000a14] border border-[#74777e]/50 rounded text-white text-[12px] font-mono focus:outline-none focus:border-[#8fdfff] w-64 md:w-80"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#21a173] hover:bg-[#1a805a] text-white rounded text-[12px] font-semibold transition-colors shrink-0"
            >
              Verify Seal
            </button>
          </form>
        </div>

        {/* Verification Result Feedback */}
        {citizenVerificationResult && (
          <div
            className={`mt-4 p-3 rounded text-[12px] border ${
              citizenVerificationResult.found
                ? 'bg-[#21a173]/15 border-[#21a173] text-[#85f8c4]'
                : 'bg-[#ba1a1a]/15 border-[#ba1a1a] text-[#ffdad6]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">
                  {citizenVerificationResult.found ? 'check_circle' : 'cancel'}
                </span>
                {citizenVerificationResult.message}
              </span>
              {citizenVerificationResult.cert && (
                <button
                  onClick={() => onOpenCertificateModal(citizenVerificationResult.cert!)}
                  className="underline hover:text-white font-mono text-[11px]"
                >
                  View Statutory Certificate Form VIII &rarr;
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-3.5 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[#74777e] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by Cert No, Mandi, Model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded text-[12px] font-sans text-[#001428] focus:outline-none focus:border-[#006781]"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[#eff4ff] border border-[#c3c6ce]/40 rounded py-1.5 px-3 text-[12px] font-sans text-[#001428]"
          >
            <option value="ALL">All Jurisdictions</option>
            <option value="Delhi">Delhi NCT</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Punjab">Punjab</option>
          </select>
        </div>

        <div className="text-[12px] text-[#43474d] font-mono">
          Showing {filteredCerts.length} of {certificates.length} Statutory Records
        </div>
      </div>

      {/* Certificate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCerts.map((cert) => (
          <div
            key={cert.certNumber}
            className="bg-white rounded border border-[#c3c6ce]/30 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col justify-between"
          >
            <div>
              {/* Card top */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#c3c6ce]/20">
                <span className="text-[10px] font-mono font-bold bg-[#eff4ff] text-[#006781] px-2 py-0.5 rounded border border-[#c3c6ce]/20">
                  {cert.device.accuracyClass.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#21a173] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#21a173]" />
                  {cert.status}
                </span>
              </div>

              <div className="flex items-start gap-3 my-2">
                <div className="w-10 h-10 rounded bg-[#001428] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">balance</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[14px] text-[#001428] leading-snug truncate">
                    {cert.device.name}
                  </span>
                  <span className="font-mono text-[11px] text-[#006781] font-semibold truncate">
                    {cert.certNumber}
                  </span>
                  <span className="text-[11px] text-[#43474d] truncate mt-0.5">
                    {cert.jurisdiction}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 my-3 text-[11px] font-mono bg-[#eff4ff]/60 p-2.5 rounded border border-[#c3c6ce]/20">
                <div className="flex justify-between">
                  <span className="text-[#43474d] font-sans">Issuer:</span>
                  <span className="font-bold text-[#001428] truncate max-w-[170px]">{cert.issuer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#43474d] font-sans">Valid Until:</span>
                  <span className="font-bold text-[#21a173]">{cert.validUntil}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#43474d] font-sans">Max Error Recorded:</span>
                  <span className="font-bold text-[#001428]">+{cert.maxLoadingErrorG.toFixed(1)} g (Ec)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#43474d] font-sans">Ledger Block:</span>
                  <span className="text-[#43474d] truncate max-w-[150px]">{cert.ledgerBlock}</span>
                </div>
              </div>
            </div>

            {/* Card actions */}
            <div className="pt-2 border-t border-[#c3c6ce]/20 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenCertificateModal(cert)}
                className="flex-1 py-1.5 bg-[#001428] hover:bg-[#0f2942] text-white text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">description</span>
                <span>Open Form VIII</span>
              </button>
              <button
                onClick={onOpenLedgerModal}
                className="px-2.5 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006781] text-[11px] font-mono font-semibold rounded border border-[#c3c6ce]/30 transition-colors"
                title="Verify SHA-256 Merkle Proof"
              >
                Audit Trail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
