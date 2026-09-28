import React, { useState } from 'react';

export const SystemArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'innovation' | 'future-scope' | 'compliance'>('architecture');

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header bar */}
      <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[18px] text-[#001428]">
              System Architecture & SIH 2026 Grand Finale Innovation Dossier
            </span>
            <span className="text-[11px] font-mono font-bold bg-[#001428] text-white px-2 py-0.5 rounded uppercase">
              SIH26035 SPECIFICATION
            </span>
          </div>
          <span className="text-[12px] text-[#43474d] mt-0.5">
            Ministry of Consumer Affairs, Food & Public Distribution • Legal Metrology Division Evaluation Standard
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#eff4ff] rounded border border-[#c3c6ce]/30">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
              activeTab === 'architecture' ? 'bg-[#001428] text-white shadow-xs' : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            System Architecture
          </button>
          <button
            onClick={() => setActiveTab('innovation')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
              activeTab === 'innovation' ? 'bg-[#001428] text-white shadow-xs' : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            Key Innovations
          </button>
          <button
            onClick={() => setActiveTab('future-scope')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
              activeTab === 'future-scope' ? 'bg-[#001428] text-white shadow-xs' : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            Future Scope (2026-30)
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
              activeTab === 'compliance' ? 'bg-[#001428] text-white shadow-xs' : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            Statutory Compliance
          </button>
        </div>
      </div>

      {/* Tab 1: System Architecture */}
      {activeTab === 'architecture' && (
        <div className="flex flex-col gap-5">
          {/* Architectural Diagram representation */}
          <div className="bg-white p-5 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#c3c6ce]/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006781] text-[22px]">hub</span>
                <span className="font-bold text-[16px] text-[#001428]">
                  ManoSetu-NAWI Four-Tier Distributed Architecture
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#21a173] font-bold bg-[#eff4ff] px-2 py-0.5 rounded border border-[#c3c6ce]/20">
                100% AIR-GAPPED COMPATIBLE
              </span>
            </div>

            {/* 4 Tiers Visual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Tier 1 */}
              <div className="bg-[#eff4ff] p-4 rounded border border-[#c3c6ce]/30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#001428] text-white px-1.5 py-0.5 rounded">
                    TIER 1
                  </span>
                  <span className="text-[10px] font-mono text-[#006781] font-bold">20 Hz SAMPLING</span>
                </div>
                <span className="font-bold text-[14px] text-[#001428]">
                  Hardware Abstraction Layer (HAL)
                </span>
                <p className="text-[11px] text-[#43474d] leading-relaxed">
                  Universal driver interface for RS-232, RS-485 Modbus, USB-CDC, and Bluetooth BLE. Ingests raw serial data from Mettler Toledo, Avery, Essae, CAS, and Sartorius.
                </p>
                <div className="mt-auto pt-2 border-t border-[#c3c6ce]/20 font-mono text-[10px] text-[#006781]">
                  Web Serial API • GATT Service
                </div>
              </div>

              {/* Tier 2 */}
              <div className="bg-[#eff4ff] p-4 rounded border border-[#c3c6ce]/30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#006781] text-white px-1.5 py-0.5 rounded">
                    TIER 2
                  </span>
                  <span className="text-[10px] font-mono text-[#21a173] font-bold">DETERMINISTIC</span>
                </div>
                <span className="font-bold text-[14px] text-[#001428]">
                  OIML R-76 Core Calculation Engine
                </span>
                <p className="text-[11px] text-[#43474d] leading-relaxed">
                  Pure mathematical implementation of OIML R-76-1:2006. Zero LLM hallucinations. Clause A.4.4.3 turning point math, Clause 3.5.1 MPE envelopes, and A.4.7 eccentricity analysis.
                </p>
                <div className="mt-auto pt-2 border-t border-[#c3c6ce]/20 font-mono text-[10px] text-[#21a173]">
                  P = I + 0.5e - ΔL • Ec = E - E₀
                </div>
              </div>

              {/* Tier 3 */}
              <div className="bg-[#eff4ff] p-4 rounded border border-[#c3c6ce]/30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#0f2942] text-white px-1.5 py-0.5 rounded">
                    TIER 3
                  </span>
                  <span className="text-[10px] font-mono text-[#006781] font-bold">CRYPTOGRAPHIC</span>
                </div>
                <span className="font-bold text-[14px] text-[#001428]">
                  Immutable Audit Ledger & DigiLocker
                </span>
                <p className="text-[11px] text-[#43474d] leading-relaxed">
                  SHA-256 Merkle chain verification preventing retrospective modification of test data by rogue inspectors. Direct export to DigiLocker W3C verifiable credentials.
                </p>
                <div className="mt-auto pt-2 border-t border-[#c3c6ce]/20 font-mono text-[10px] text-[#0f2942]">
                  Hyperledger Fabric • SHA-256
                </div>
              </div>

              {/* Tier 4 */}
              <div className="bg-[#eff4ff] p-4 rounded border border-[#c3c6ce]/30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#21a173] text-white px-1.5 py-0.5 rounded">
                    TIER 4
                  </span>
                  <span className="text-[10px] font-mono text-[#001428] font-bold">GOVERNANCE</span>
                </div>
                <span className="font-bold text-[14px] text-[#001428]">
                  National Surveillance Cloud (NMC)
                </span>
                <p className="text-[11px] text-[#43474d] leading-relaxed">
                  Centralized command console for the Ministry of Consumer Affairs. Real-time telemetry from 2,400+ APMC mandis, e-NAM integration, and automated LMO dispatch.
                </p>
                <div className="mt-auto pt-2 border-t border-[#c3c6ce]/20 font-mono text-[10px] text-[#21a173]">
                  RESTful GeoJSON • e-NAM API
                </div>
              </div>
            </div>
          </div>

          {/* Technical Architecture Deep Dive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-3">
              <span className="font-bold text-[14px] text-[#001428] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006781] text-[18px]">lock</span>
                Cryptographic Non-Repudiation Model
              </span>
              <p className="text-[12px] text-[#43474d] leading-relaxed">
                In traditional inspection workflows, paper-based verification certificates (Form VIII) are vulnerable to tampering, unauthorized stamping, and date forgery. ManoSetu-NAWI hashes each raw reading at the load cell acquisition stage:
              </p>
              <div className="p-3 bg-[#001428] text-white rounded font-mono text-[11px] space-y-1">
                <div>Block Header: [Timestamp, Officer_ID, DUT_Serial, Session_ID]</div>
                <div>Payload: [L_standard, I_indicated, Delta_L, Ec_corrected, MPE_verdict]</div>
                <div className="text-[#85f8c4]">Hash = SHA-256(Block_Header + Payload + Prev_Block_Hash)</div>
              </div>
              <p className="text-[11px] text-[#43474d]">
                If a single byte is changed in the report post-calibration, the entire Merkle tree root becomes invalid.
              </p>
            </div>

            <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-3">
              <span className="font-bold text-[14px] text-[#001428] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006781] text-[18px]">wifi_off</span>
                Offline-First Field Capability for Remote Mandis
              </span>
              <p className="text-[12px] text-[#43474d] leading-relaxed">
                India has hundreds of rural agricultural mandis with intermittent 2G/3G connectivity. ManoSetu-NAWI was engineered from the ground up as a progressive offline-first engine:
              </p>
              <ul className="text-[12px] text-[#43474d] space-y-1.5 list-disc pl-5">
                <li>Local SQLite/IndexedDB encrypted cache stores 10,000+ calibration runs locally.</li>
                <li>Local cryptographic key pairs on the officer's device sign certificates offline.</li>
                <li>Background delta sync automatically reconciles with the Ministry Central Server as soon as network connectivity is restored.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Key Innovations */}
      {activeTab === 'innovation' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded bg-[#001428] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">functions</span>
            </div>
            <span className="font-bold text-[15px] text-[#001428]">
              1. Deterministic Rigor (Zero AI Hallucination)
            </span>
            <p className="text-[12px] text-[#43474d] leading-relaxed">
              We deliberately avoided using generative AI or LLMs in the core measurement equations. Statutory law demands 100% deterministic, audit-traceable calculations as defined in OIML R-76-1:2006. AI is restricted exclusively to non-statutory surveillance tasks such as RF anomaly detection.
            </p>
          </div>

          <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded bg-[#006781] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <span className="font-bold text-[15px] text-[#001428]">
              2. Anti-Shunt RF Tamper Detection
            </span>
            <p className="text-[12px] text-[#43474d] leading-relaxed">
              Wholesale mandi fraud relies on wireless 433MHz micro-relays that inject parallel resistors into the load cell bridge. Our real-time impedance spectrum analyzer detects high-frequency switching and impedance discontinuities, immediately locking the certificate.
            </p>
          </div>

          <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded bg-[#21a173] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
            </div>
            <span className="font-bold text-[15px] text-[#001428]">
              3. Citizen & Farmer QR Verification
            </span>
            <p className="text-[12px] text-[#43474d] leading-relaxed">
              Empowering farmers at the point of sale: Every verified weighbridge receives a tamper-evident physical QR code linked to DigiLocker. Farmers can scan with any basic smartphone to verify the scale's last calibration date and allowable error headroom.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Future Scope (2026-2030) */}
      {activeTab === 'future-scope' && (
        <div className="bg-white p-5 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#c3c6ce]/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006781] text-[22px]">rocket_launch</span>
              <span className="font-bold text-[16px] text-[#001428]">
                Five-Year Strategic Roadmap for the Ministry of Consumer Affairs (2026–2030)
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#006781] font-bold">
              VISION 2030
            </span>
          </div>

          <div className="space-y-4">
            {/* 2026 */}
            <div className="p-3.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="font-mono text-[14px] font-bold text-[#001428] bg-white px-2 py-1 rounded border border-[#c3c6ce]/30 shrink-0">
                  2026
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-[#001428]">
                    Phase 1: Statutory Core Launch & APMC Mandi Pilot
                  </span>
                  <span className="text-[12px] text-[#43474d] mt-0.5">
                    Deploy ManoSetu-NAWI software in Delhi (Azadpur), Punjab (Khanna), and Maharashtra (Vashi). Integrate with state Legal Metrology divisions for paperless Form VIII generation.
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#21a173] shrink-0">ACTIVE DEPLOYMENT</span>
            </div>

            {/* 2027 */}
            <div className="p-3.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="font-mono text-[14px] font-bold text-[#001428] bg-white px-2 py-1 rounded border border-[#c3c6ce]/30 shrink-0">
                  2027
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-[#001428]">
                    Phase 2: Edge IoT Retrofit Dongles for 500,000+ Mechanical Scales
                  </span>
                  <span className="text-[12px] text-[#43474d] mt-0.5">
                    Launch low-cost (sub-₹1,500) BLE/cellular smart load-cell collar dongles that digitize legacy analog mechanical dial and steelyard weighbridges across rural India without replacing physical scale frames.
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#006781] shrink-0">HARDWARE PROTOTYPING</span>
            </div>

            {/* 2028 */}
            <div className="p-3.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="font-mono text-[14px] font-bold text-[#001428] bg-white px-2 py-1 rounded border border-[#c3c6ce]/30 shrink-0">
                  2028
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-[#001428]">
                    Phase 3: Automated Drone LiDAR Tare Validation at Seaports & Rail Yards
                  </span>
                  <span className="text-[12px] text-[#43474d] mt-0.5">
                    Deploy autonomous volumetric LiDAR drones to scan empty railway wagons and grain trailers before weighment, preventing tare deception (water tanks or hidden ballast weights).
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#006781] shrink-0">R&D SPECIFICATION</span>
            </div>

            {/* 2029-2030 */}
            <div className="p-3.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="font-mono text-[14px] font-bold text-[#001428] bg-white px-2 py-1 rounded border border-[#c3c6ce]/30 shrink-0">
                  2029-30
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-[#001428]">
                    Phase 4: Quantum Metrology Link to CSIR-NPL Kibble Primary Mass Standard
                  </span>
                  <span className="text-[12px] text-[#43474d] mt-0.5">
                    Direct cryptographic synchronization with the National Physical Laboratory of India (NPL-CSIR) Kibble Balance reference standards, achieving seamless primary calibration traceability down to quantum Planck constant ($h$).
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#43474d] shrink-0">NATIONAL VISION</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Statutory Compliance */}
      {activeTab === 'compliance' && (
        <div className="bg-white p-5 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#c3c6ce]/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006781] text-[22px]">policy</span>
              <span className="font-bold text-[16px] text-[#001428]">
                Statutory and Regulatory Conformity Matrix
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#21a173] font-bold">100% AUDIT READY</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[12px]">
              <thead className="bg-[#eff4ff] text-[#43474d] text-[11px] uppercase border-b border-[#c3c6ce]/30">
                <tr>
                  <th className="py-2.5 px-3">Statutory Standard</th>
                  <th className="py-2.5 px-3">Mandated Clause</th>
                  <th className="py-2.5 px-3">ManoSetu-NAWI Implementation</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6ce]/20 text-[#0b1c30]">
                <tr>
                  <td className="py-2.5 px-3 font-bold">OIML R-76-1:2006 (E)</td>
                  <td className="py-2.5 px-3 text-[#006781]">Section A.4.4.3</td>
                  <td className="py-2.5 px-3 font-sans">Eliminates rounding quantization errors via true calculated indication $P = I + 0.5e - \Delta L$</td>
                  <td className="py-2.5 px-3 text-[#21a173] font-bold">COMPLIANT</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">OIML R-76-1:2006 (E)</td>
                  <td className="py-2.5 px-3 text-[#006781]">Clause 3.5.1</td>
                  <td className="py-2.5 px-3 font-sans">Exact three-tier MPE staircase tolerance enforcement (±0.5e, ±1.0e, ±1.5e)</td>
                  <td className="py-2.5 px-3 text-[#21a173] font-bold">COMPLIANT</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">OIML R-76-1:2006 (E)</td>
                  <td className="py-2.5 px-3 text-[#006781]">Clause A.4.7</td>
                  <td className="py-2.5 px-3 font-sans">5-point rectangular platter eccentricity matrix calculation with 1/3 Max loading</td>
                  <td className="py-2.5 px-3 text-[#21a173] font-bold">COMPLIANT</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Legal Metrology Act, 2009</td>
                  <td className="py-2.5 px-3 text-[#006781]">Section 24 & Rule 24</td>
                  <td className="py-2.5 px-3 font-sans">Official Schedule VIII Form VIII legal certificate generation with QR and signature</td>
                  <td className="py-2.5 px-3 text-[#21a173] font-bold">COMPLIANT</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">ISO/IEC 17025:2017</td>
                  <td className="py-2.5 px-3 text-[#006781]">Clause 7.8.2</td>
                  <td className="py-2.5 px-3 font-sans">Statutory measurement traceability to NPL-CSIR Class F1 secondary standards</td>
                  <td className="py-2.5 px-3 text-[#21a173] font-bold">COMPLIANT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
