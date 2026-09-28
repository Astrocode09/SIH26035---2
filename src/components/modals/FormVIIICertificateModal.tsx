import React from 'react';
import { FormVIIICertificate } from '../../types/metrology';

interface FormVIIICertificateModalProps {
  certificate: FormVIIICertificate;
  isOpen: boolean;
  onClose: () => void;
}

export const FormVIIICertificateModal: React.FC<FormVIIICertificateModalProps> = ({
  certificate,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#001428]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded border border-[#c3c6ce]/40 shadow-2xl max-w-3xl w-full my-8 overflow-hidden relative">
        {/* Top Control Bar (Non-printed) */}
        <div className="no-print bg-[#001428] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#85f8c4] text-[20px]">verified</span>
            <span className="font-bold text-[14px]">Official Statutory Verification Certificate (Form VIII)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#21a173] hover:bg-[#1a805a] text-white rounded text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 bg-[#0f2942] hover:bg-[#1a3b5c] text-white rounded text-[12px] transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Official Legal Metrology Document */}
        <div className="p-8 md:p-12 text-[#0b1c30] bg-[#ffffff] relative">
          {/* Sovereign Watermark Background Motif */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="material-symbols-outlined text-[320px]">balance</span>
          </div>

          {/* Form Header */}
          <div className="flex flex-col items-center text-center pb-6 border-b-2 border-[#001428]">
            <div className="w-14 h-14 rounded-full bg-[#001428] text-white flex items-center justify-center mb-2 shadow-sm">
              <span className="material-symbols-outlined text-[30px]">balance</span>
            </div>
            <span className="font-serif text-[18px] font-bold tracking-wide uppercase text-[#001428]">
              Government of India
            </span>
            <span className="text-[13px] font-semibold text-[#43474d] uppercase tracking-wider">
              {certificate.issuingDepartment}
            </span>
            <span className="text-[12px] text-[#43474d] italic">
              {certificate.issuer}
            </span>

            <div className="mt-4 pt-2 border-t border-[#c3c6ce]/50 w-full flex flex-col items-center">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#006781]">
                Schedule VIII • [See Rule 24]
              </span>
              <h1 className="font-serif text-[22px] font-bold text-[#001428] mt-0.5">
                CERTIFICATE OF VERIFICATION
              </h1>
              <span className="font-mono text-[13px] font-bold text-[#001428] mt-1 bg-[#eff4ff] px-3 py-0.5 rounded border border-[#c3c6ce]/30">
                CERT NO: {certificate.certNumber}
              </span>
            </div>
          </div>

          {/* Legal Text Formulation */}
          <div className="my-6 space-y-4 text-[13px] leading-relaxed font-sans">
            <p>
              I hereby certify that I have this day verified and stamped the under-mentioned Non-Automatic Weighing Instrument (NAWI) belonging to:
            </p>

            <div className="bg-[#eff4ff]/60 p-4 rounded border border-[#c3c6ce]/30 grid grid-cols-2 gap-3 font-mono text-[12px]">
              <div>
                <span className="text-[#43474d] block text-[11px] font-sans">Jurisdiction / Location:</span>
                <span className="font-bold text-[#001428]">{certificate.jurisdiction}</span>
              </div>
              <div>
                <span className="text-[#43474d] block text-[11px] font-sans">Instrument Model & DUT:</span>
                <span className="font-bold text-[#001428]">{certificate.device.name}</span>
              </div>
              <div>
                <span className="text-[#43474d] block text-[11px] font-sans">Serial Number:</span>
                <span className="font-bold text-[#001428]">{certificate.device.serialNumber}</span>
              </div>
              <div>
                <span className="text-[#43474d] block text-[11px] font-sans">Accuracy Classification:</span>
                <span className="font-bold text-[#006781]">{certificate.device.accuracyClass.replace('_', ' ')} (OIML R-76)</span>
              </div>
              <div>
                <span className="text-[#43474d] block text-[11px] font-sans">Capacity (Max / Min):</span>
                <span className="font-bold text-[#001428]">Max: {certificate.device.maxCapacityKg.toFixed(3)} kg | Min: {(certificate.device.minCapacityKg * 1000).toFixed(0)} g</span>
              </div>
              <div>
                <span className="text-[#43474d] block text-[11px] font-sans">Verification Intervals:</span>
                <span className="font-bold text-[#001428]">e = {certificate.device.scaleIntervalE_g} g | d = {certificate.device.scaleIntervalD_g} g (n={certificate.device.numberOfIntervals}e)</span>
              </div>
            </div>

            <p>
              and found the same to be conforming to the standards prescribed under the <strong>Legal Metrology Act, 2009</strong> and the <strong>Legal Metrology (General) Rules, 2011</strong>, and strictly compliant with <strong>OIML Recommendation R-76-1:2006 (E)</strong> Clause A.4.4.3 & Clause 3.5.1 for Maximum Permissible Errors.
            </p>

            {/* Test Summary Table */}
            <div className="border border-[#c3c6ce]/40 rounded overflow-hidden">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-[#eff4ff] text-[#43474d] border-b border-[#c3c6ce]/30">
                  <tr>
                    <th className="p-2">Verification Clause</th>
                    <th className="p-2">Measured Parameter</th>
                    <th className="p-2">Max Permissible Error</th>
                    <th className="p-2">Observed Error</th>
                    <th className="p-2">Statutory Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6ce]/20">
                  <tr>
                    <td className="p-2 font-bold">Clause A.4.4.3</td>
                    <td className="p-2 font-sans">Loading Errors (0 to Max)</td>
                    <td className="p-2">±7.5 g (±1.5e)</td>
                    <td className="p-2 text-[#006781] font-bold">+{certificate.maxLoadingErrorG.toFixed(1)} g (+0.40e)</td>
                    <td className="p-2 text-[#21a173] font-bold">COMPLIANT</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">Clause A.4.7</td>
                    <td className="p-2 font-sans">5-Point Eccentricity Matrix</td>
                    <td className="p-2">±5.0 g (±1.0e)</td>
                    <td className="p-2 text-[#006781] font-bold">+{certificate.maxEccentricityErrorG.toFixed(1)} g</td>
                    <td className="p-2 text-[#21a173] font-bold">COMPLIANT</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">Clause A.4.8</td>
                    <td className="p-2 font-sans">Repeatability Standard Deviation</td>
                    <td className="p-2">≤ 1.0e (5.0 g)</td>
                    <td className="p-2 text-[#006781] font-bold">0.4 g (0.08e)</td>
                    <td className="p-2 text-[#21a173] font-bold">COMPLIANT</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Validity and Seal Information */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-[#c3c6ce]/30">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white p-1 rounded border border-[#c3c6ce]/40 flex items-center justify-center">
                  <svg className="w-full h-full text-[#001428]" fill="currentColor" viewBox="0 0 40 40">
                    <path d="M0 0h16v16H0zM4 4h8v8H4zM24 0h16v16H24zM28 4h8v8h-8zM0 24h16v16H0zM4 28h8v8H4zM24 24h6v6h-6zM34 24h6v6h-6zM24 34h6v6h-6zM34 34h6v6h-6zM18 4h4v4h-4zM18 12h4v4h-4zM18 20h4v4h-4zM4 18h4v4H4zM12 18h4v4h-4zM26 18h6v4h-6zM32 20h8v4h-8zM18 28h4v4h-4zM18 36h4v4h-4z" />
                  </svg>
                </div>
                <div className="flex flex-col text-[11px] font-mono">
                  <span className="font-bold text-[#006781] uppercase">DigiLocker Certified QR</span>
                  <span className="text-[#43474d]">Scan to verify on public registry</span>
                  <span className="text-[10px] text-[#21a173] font-semibold mt-0.5">Valid Until: {certificate.validUntil}</span>
                </div>
              </div>

              {/* Inspector Official Seal */}
              <div className="flex flex-col items-end text-right">
                <div className="w-24 h-12 border-2 border-dashed border-[#21a173] rounded flex items-center justify-center bg-[#21a173]/10 mb-1">
                  <span className="font-mono text-[9px] text-[#21a173] font-bold uppercase text-center leading-tight">
                    GOI SEALED<br />{certificate.sealId}
                  </span>
                </div>
                <span className="font-bold text-[13px] text-[#001428]">{certificate.inspectorName}</span>
                <span className="text-[11px] text-[#43474d]">{certificate.inspectorDesignation}</span>
              </div>
            </div>

            {/* Cryptographic Ledger Footer */}
            <div className="mt-4 pt-3 border-t border-[#c3c6ce]/30 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono text-[#43474d]">
              <span className="truncate max-w-md">MERKLE ROOT: {certificate.merkleRootHash}</span>
              <span>LEDGER BLOCK: {certificate.ledgerBlock}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
