import React, { useState } from 'react';
import { govtApprovedModels, standardWeightsTolerances } from '../../data/govtStandardsData';
import { DeviceUnderTest } from '../../types/metrology';

interface GovtQuickLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyModelToDUT: (device: DeviceUnderTest) => void;
}

export const GovtQuickLookupModal: React.FC<GovtQuickLookupModalProps> = ({
  isOpen,
  onClose,
  onApplyModelToDUT,
}) => {
  const [activeTab, setActiveTab] = useState<'models' | 'calculator' | 'weights'>('models');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [calcLoadKg, setCalcLoadKg] = useState<number>(15.0);
  const [calcE, setCalcE] = useState<number>(5.0);

  if (!isOpen) return null;

  const filtered = govtApprovedModels.filter(
    (m) =>
      m.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.approvalNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // MPE Quick Math for Class III
  const mInE = (calcLoadKg * 1000) / calcE;
  let mpeE = 1.0;
  let band = '';
  if (mInE <= 500) {
    mpeE = 0.5;
    band = '0 ≤ m ≤ 500e';
  } else if (mInE <= 2000) {
    mpeE = 1.0;
    band = '500e < m ≤ 2000e';
  } else {
    mpeE = 1.5;
    band = '2000e < m ≤ 10000e';
  }

  const handleApply = (model: any) => {
    onApplyModelToDUT({
      id: `DUT-${model.approvalNumber.replace(/\//g, '-')}`,
      name: `${model.manufacturer.split(' ')[0]} ${model.modelName}`,
      model: model.modelName,
      manufacturer: model.manufacturer,
      accuracyClass: model.accuracyClass,
      maxCapacityKg: model.maxCapacityKg,
      minCapacityKg: model.minCapacityKg,
      scaleIntervalE_g: model.scaleIntervalE_g,
      scaleIntervalD_g: model.scaleIntervalD_g,
      serialNumber: `${model.approvalNumber}-SN-001`,
      indicatorSerial: 'RS232-STD-CH01',
      approvalNumber: model.approvalNumber,
      numberOfIntervals: model.numberOfIntervals,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#001428]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded border border-[#c3c6ce]/40 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#001428] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#85f8c4] text-[20px]">menu_book</span>
            <span className="font-bold text-[15px]">Government Norms & Standard Reference Quick-Lookup</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#cbdbf5] text-[18px] font-mono leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tab Controls */}
        <div className="p-3 bg-[#eff4ff] border-b border-[#c3c6ce]/30 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('models')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors ${
              activeTab === 'models' ? 'bg-[#001428] text-white' : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            Approved Scale Models
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors ${
              activeTab === 'calculator' ? 'bg-[#001428] text-white' : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            Instant MPE Checker
          </button>
          <button
            onClick={() => setActiveTab('weights')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors ${
              activeTab === 'weights' ? 'bg-[#001428] text-white' : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            NPL Test Weights (F1/M1)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto flex-1 text-[#0b1c30]">
          {activeTab === 'models' && (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Search approved models (e.g. Mettler, Avery, Essae)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded text-[12px] font-sans text-[#001428] focus:outline-none focus:border-[#006781]"
              />

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filtered.map((m) => (
                  <div
                    key={m.approvalNumber}
                    className="p-3 bg-[#eff4ff]/60 hover:bg-[#dce9ff]/50 rounded border border-[#c3c6ce]/30 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[13px] text-[#001428] truncate">{m.modelName}</span>
                        <span className="text-[9px] font-mono font-bold bg-[#001428] text-white px-1.5 py-0.5 rounded">
                          {m.accuracyClass.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#43474d]">{m.manufacturer} • {m.approvalNumber}</span>
                      <span className="text-[10px] font-mono text-[#006781] mt-0.5">
                        Max: {m.maxCapacityKg} kg | e = {m.scaleIntervalE_g} g | n = {m.numberOfIntervals}e
                      </span>
                    </div>

                    <button
                      onClick={() => handleApply(m)}
                      className="px-3 py-1.5 bg-[#001428] hover:bg-[#006781] text-white rounded text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      Use in Test
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#43474d]">Applied Load (kg)</label>
                  <input
                    type="number"
                    value={calcLoadKg}
                    onChange={(e) => setCalcLoadKg(Number(e.target.value))}
                    className="p-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded font-mono text-[13px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#43474d]">Scale Interval e (g)</label>
                  <input
                    type="number"
                    value={calcE}
                    onChange={(e) => setCalcE(Number(e.target.value))}
                    className="p-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded font-mono text-[13px]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#001428] text-white rounded flex flex-col gap-2">
                <span className="text-[10px] text-[#b0c9e8] font-mono uppercase font-bold">OIML R-76 Class III Tolerance Result</span>
                <div className="flex justify-between items-baseline">
                  <span className="font-mono text-[28px] font-bold text-[#85f8c4]">
                    ±{(mpeE * calcE).toFixed(1)} g
                  </span>
                  <span className="font-mono text-[16px] text-white font-semibold">
                    (±{mpeE.toFixed(1)}e)
                  </span>
                </div>
                <div className="pt-2 border-t border-[#0f2942] text-[11px] font-mono text-[#cbdbf5] flex justify-between">
                  <span>Clause 3.5.1 Band: {band}</span>
                  <span className="text-[#85f8c4]">In-Service MPE: ±{(mpeE * 2 * calcE).toFixed(1)} g (±{(mpeE * 2).toFixed(1)}e)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weights' && (
            <div className="space-y-2">
              <span className="text-[12px] font-bold text-[#001428] block">
                Standard Test Weight Tolerances (OIML R 111-1)
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-[#eff4ff] text-[#43474d]">
                    <tr>
                      <th className="p-2">Nominal Mass</th>
                      <th className="p-2 text-[#006781] font-bold">Class F1 (±mg)</th>
                      <th className="p-2 text-[#21a173] font-bold">Class M1 (±mg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c3c6ce]/20">
                    {standardWeightsTolerances.slice(0, 10).map((w) => (
                      <tr key={w.nominalMass} className="hover:bg-[#eff4ff]/60">
                        <td className="p-2 font-bold">{w.nominalMass}</td>
                        <td className="p-2 text-[#006781] font-bold">{w.classF1_mg} mg</td>
                        <td className="p-2 text-[#21a173] font-bold">{w.classM1_mg} mg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
