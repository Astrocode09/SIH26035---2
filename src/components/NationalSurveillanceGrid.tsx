import React, { useState } from 'react';
import { SurveillanceNode } from '../types/metrology';
import { surveillanceNodes } from '../data/metrologyData';

export const NationalSurveillanceGrid: React.FC = () => {
  const [nodes, setNodes] = useState<SurveillanceNode[]>(surveillanceNodes);
  const [selectedNode, setSelectedNode] = useState<SurveillanceNode>(surveillanceNodes[0]);
  const [isDispatchingLMO, setIsDispatchingLMO] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Economic Leakage Simulation Controls
  const [mspRateRsPerQtl, setMspRateRsPerQtl] = useState<number>(2275); // Wheat MSP reference
  const [avgDailyTonnes, setAvgDailyTonnes] = useState<number>(18000);
  const [uncalibratedErrorPct, setUncalibratedErrorPct] = useState<number>(0.8); // 0.8% under-weighing

  // Calculated annual loss prevented per major mandi cluster
  const dailyLossRs = (avgDailyTonnes * 10) * mspRateRsPerQtl * (uncalibratedErrorPct / 100);
  const annualLossPreventedCr = ((dailyLossRs * 300) / 10000000).toFixed(2);

  const handleDispatchOfficer = (node: SurveillanceNode) => {
    setIsDispatchingLMO(true);
    setDispatchSuccess(null);
    setTimeout(() => {
      setIsDispatchingLMO(false);
      setDispatchSuccess(`Legal Metrology Officer (LMO Flying Squad) dispatched to ${node.name}. Inspection ref: #LMO-DISP-2026-${Math.floor(Math.random() * 8999 + 1000)}`);
      setTimeout(() => setDispatchSuccess(null), 5000);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header bar */}
      <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[18px] text-[#001428]">
              National Metrological Surveillance Grid & APMC Mandi Oversight
            </span>
            <span className="text-[11px] font-mono font-bold bg-[#8fdfff]/30 text-[#00647d] px-2 py-0.5 rounded">
              PAN-INDIA TELEMETRY
            </span>
          </div>
          <span className="text-[12px] text-[#43474d] mt-0.5">
            Real-time compliance surveillance across 2,400+ wholesale mandis, state border weighbridges, and FCI grain silos
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[12px] font-mono font-bold text-[#21a173] bg-[#eff4ff] px-3 py-1.5 rounded border border-[#c3c6ce]/30">
            <span className="w-2 h-2 rounded-full bg-[#21a173] animate-pulse" />
            <span>2,142 WEIGHBRIDGES ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Top Impact KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-1">
          <span className="text-[11px] text-[#43474d] uppercase font-semibold font-mono">National Accuracy Rate</span>
          <span className="text-[26px] font-mono font-bold text-[#001428]">98.6%</span>
          <span className="text-[11px] text-[#21a173] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +4.2% since OIML R-76 digital enforcement
          </span>
        </div>

        <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-1">
          <span className="text-[11px] text-[#43474d] uppercase font-semibold font-mono">Total Verified Scales</span>
          <span className="text-[26px] font-mono font-bold text-[#006781]">248,912</span>
          <span className="text-[11px] text-[#43474d]">
            Across Class I, II, III & IV categories
          </span>
        </div>

        <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-1">
          <span className="text-[11px] text-[#43474d] uppercase font-semibold font-mono">Tamper Alerts Prevented</span>
          <span className="text-[26px] font-mono font-bold text-[#ba1a1a]">1,429</span>
          <span className="text-[11px] text-[#43474d]">
            RF jammers and bridge shunts neutralized
          </span>
        </div>

        <div className="bg-[#001428] text-white p-4 rounded border border-[#0f2942] shadow-sm flex flex-col gap-1">
          <span className="text-[11px] text-[#b0c9e8] uppercase font-semibold font-mono">Est. Economic Leakage Saved</span>
          <span className="text-[26px] font-mono font-bold text-[#85f8c4]">₹4,280.45 Cr</span>
          <span className="text-[11px] text-[#cbdbf5]">
            Directly protecting farmers & consumers
          </span>
        </div>
      </div>

      {/* Main Interactive Grid & Map Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Column: Geographic Node Matrix (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006781] text-[20px]">map</span>
                <span className="font-bold text-[15px] text-[#001428]">
                  National High-Volume Agricultural & Port Hubs
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#43474d]">
                SELECT HUB TO INSPECT
              </span>
            </div>

            {/* Hub list */}
            <div className="space-y-2">
              {nodes.map((node) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`w-full text-left p-3 rounded border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-[#8fdfff]/25 border-[#006781] shadow-xs'
                        : 'bg-[#eff4ff] hover:bg-[#dce9ff]/60 border-[#c3c6ce]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#21a173]" />
                        <span className="font-bold text-[13px] text-[#001428] truncate">
                          {node.name}
                        </span>
                      </div>
                      <span className="font-mono text-[12px] font-bold text-[#006781] shrink-0">
                        {node.complianceRatePct}% Valid
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#43474d] font-mono">
                      <span>{node.city}, {node.state} • {node.type}</span>
                      <span>Daily Volume: {node.dailyWeighmentVolumeTonnes.toLocaleString()} MT</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Economic Leakage Calculator (Innovation Showcase) */}
          <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006781] text-[20px]">calculate</span>
                <span className="font-bold text-[15px] text-[#001428]">
                  Economic Leakage Prevention Model (Farmer Protection Engine)
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#eff4ff] text-[#001428] px-2 py-0.5 rounded border border-[#c3c6ce]/20">
                MSP PROCUREMENT MATH
              </span>
            </div>

            <p className="text-[12px] text-[#43474d] leading-relaxed">
              Demonstrates why digital OIML R-76 statutory compliance is crucial for the nation: Even a fractional scale error of 0.8% in grain procurement silently drains millions from farmer proceeds.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-1">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#43474d] font-semibold">Commodity MSP (₹ / Quintal)</label>
                <input
                  type="number"
                  value={mspRateRsPerQtl}
                  onChange={(e) => setMspRateRsPerQtl(Number(e.target.value))}
                  className="bg-[#eff4ff] border border-[#c3c6ce]/40 rounded p-1.5 text-[13px] font-mono text-[#001428]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#43474d] font-semibold">Mandi Daily Volume (Tonnes)</label>
                <input
                  type="number"
                  value={avgDailyTonnes}
                  onChange={(e) => setAvgDailyTonnes(Number(e.target.value))}
                  className="bg-[#eff4ff] border border-[#c3c6ce]/40 rounded p-1.5 text-[13px] font-mono text-[#001428]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#43474d] font-semibold">Uncalibrated Under-Weighing Error</label>
                <input
                  type="number"
                  step="0.1"
                  value={uncalibratedErrorPct}
                  onChange={(e) => setUncalibratedErrorPct(Number(e.target.value))}
                  className="bg-[#eff4ff] border border-[#c3c6ce]/40 rounded p-1.5 text-[13px] font-mono text-[#001428]"
                />
              </div>
            </div>

            <div className="p-3 bg-[#001428] text-white rounded flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#b0c9e8] font-mono">ANNUAL REVENUE PROTECTED FOR THIS MANDI</span>
                <span className="text-[22px] font-mono font-bold text-[#85f8c4]">
                  ₹{annualLossPreventedCr} Crore
                </span>
              </div>
              <div className="text-right text-[11px] text-[#cbdbf5] max-w-xs">
                Zero tolerance incursion guaranteed through continuous ManoSetu-NAWI R-76 algorithmic verification
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Node Deep Dive & LMO Dispatch (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#c3c6ce]/20">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#43474d] uppercase font-mono font-bold">INSPECTION NODE DOSSIER</span>
                <span className="font-bold text-[16px] text-[#001428]">{selectedNode.name}</span>
              </div>
              <span className="text-[11px] font-mono font-bold bg-[#eff4ff] text-[#21a173] px-2 py-0.5 rounded border border-[#c3c6ce]/20">
                {selectedNode.status}
              </span>
            </div>

            <div className="space-y-2 font-mono text-[12px]">
              <div className="flex justify-between p-2 bg-[#eff4ff] rounded">
                <span className="text-[#43474d] font-sans">Jurisdiction & Location:</span>
                <span className="font-bold text-[#001428]">{selectedNode.city}, {selectedNode.state}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#eff4ff] rounded">
                <span className="text-[#43474d] font-sans">Active Weighbridges Monitored:</span>
                <span className="font-bold text-[#001428]">{selectedNode.activeScales} Units</span>
              </div>
              <div className="flex justify-between p-2 bg-[#eff4ff] rounded">
                <span className="text-[#43474d] font-sans">Last On-Site Metrology Audit:</span>
                <span className="font-bold text-[#006781]">{selectedNode.lastInspected}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#eff4ff] rounded">
                <span className="text-[#43474d] font-sans">Tampering Alerts (30 Days):</span>
                <span className={`font-bold ${selectedNode.tamperingAlerts > 0 ? 'text-[#ba1a1a]' : 'text-[#21a173]'}`}>
                  {selectedNode.tamperingAlerts} incidents
                </span>
              </div>
              <div className="flex justify-between p-2 bg-[#eff4ff] rounded">
                <span className="text-[#43474d] font-sans">Annual Economic Leakage Prevented:</span>
                <span className="font-bold text-[#21a173]">₹{selectedNode.economicLeakagePreventedCr.toFixed(2)} Cr</span>
              </div>
            </div>

            {/* Dispatch Action */}
            <div className="pt-2 border-t border-[#c3c6ce]/20 flex flex-col gap-2">
              <button
                onClick={() => handleDispatchOfficer(selectedNode)}
                disabled={isDispatchingLMO}
                className="w-full py-2.5 bg-[#001428] hover:bg-[#0f2942] disabled:opacity-60 text-white rounded text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span className={`material-symbols-outlined text-[18px] ${isDispatchingLMO ? 'animate-spin' : ''}`}>
                  {isDispatchingLMO ? 'refresh' : 'local_police'}
                </span>
                <span>{isDispatchingLMO ? 'Dispatching LMO Squad...' : 'Dispatch Legal Metrology Officer (LMO)'}</span>
              </button>

              {dispatchSuccess && (
                <div className="p-2.5 bg-[#85f8c4]/30 border border-[#21a173] text-[#002114] rounded text-[11px] font-mono">
                  {dispatchSuccess}
                </div>
              )}
            </div>
          </div>

          {/* Statutory Mandate Callout */}
          <div className="bg-[#eff4ff] p-4 rounded border border-[#c3c6ce]/30 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006781] text-[20px]">gavel</span>
              <span className="font-bold text-[13px] text-[#001428]">
                Statutory Enforcement Under Legal Metrology Act, 2009
              </span>
            </div>
            <p className="text-[11px] text-[#43474d] leading-relaxed">
              Section 24 mandates annual or bi-annual mandatory re-verification of all non-automatic weighing instruments used in commercial transactions. Failure to maintain verified calibration carries strict penal sanctions under Section 30.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
