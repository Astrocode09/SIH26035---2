import React, { useState } from 'react';
import {
  govtApprovedModels,
  oimlClassNorms,
  mpeBandDefinitions,
  standardWeightsTolerances,
  legalMetrologyDigest,
  regulatoryNorms2026,
  GovtApprovedModel,
} from '../data/govtStandardsData';
import { DeviceUnderTest } from '../types/metrology';

interface GovtStandardsRegistryProps {
  onSelectModelToDUT: (device: DeviceUnderTest) => void;
}

export const GovtStandardsRegistry: React.FC<GovtStandardsRegistryProps> = ({
  onSelectModelToDUT,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'models' | 'oiml-norms' | 'standard-weights' | 'law-digest' | 'norms-2026'>('models');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // MPE Calculator State
  const [calcLoadKg, setCalcLoadKg] = useState<number>(15.0);
  const [calcScaleIntervalEGrams, setCalcScaleIntervalEGrams] = useState<number>(5.0);
  const [calcClass, setCalcClass] = useState<'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IV'>('CLASS_III');
  const [calcVerificationType, setCalcVerificationType] = useState<'initial' | 'in-service'>('initial');

  // Filtered Approved Models
  const filteredModels = govtApprovedModels.filter((model) => {
    const matchesSearch =
      model.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.approvalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.applicationUsage.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      selectedClassFilter === 'ALL' || model.accuracyClass === selectedClassFilter;

    return matchesSearch && matchesClass;
  });

  // Calculate MPE interactively
  const mInE = (calcLoadKg * 1000) / calcScaleIntervalEGrams;
  let computedMpeE = 1.0;
  let tierDesc = '';

  if (calcClass === 'CLASS_III') {
    if (mInE <= 500) {
      computedMpeE = 0.5;
      tierDesc = '0 ≤ m ≤ 500e (Low Range)';
    } else if (mInE <= 2000) {
      computedMpeE = 1.0;
      tierDesc = '500e < m ≤ 2000e (Mid Range)';
    } else {
      computedMpeE = 1.5;
      tierDesc = '2000e < m ≤ 10000e (High Range)';
    }
  } else if (calcClass === 'CLASS_II') {
    if (mInE <= 5000) {
      computedMpeE = 0.5;
      tierDesc = '0 ≤ m ≤ 5000e';
    } else if (mInE <= 20000) {
      computedMpeE = 1.0;
      tierDesc = '5000e < m ≤ 20000e';
    } else {
      computedMpeE = 1.5;
      tierDesc = '20000e < m ≤ 100000e';
    }
  } else if (calcClass === 'CLASS_I') {
    if (mInE <= 50000) {
      computedMpeE = 0.5;
      tierDesc = '0 ≤ m ≤ 50000e';
    } else if (mInE <= 200000) {
      computedMpeE = 1.0;
      tierDesc = '50000e < m ≤ 200000e';
    } else {
      computedMpeE = 1.5;
      tierDesc = '200000e < m';
    }
  } else {
    // Class IV
    if (mInE <= 50) {
      computedMpeE = 0.5;
      tierDesc = '0 ≤ m ≤ 50e';
    } else if (mInE <= 200) {
      computedMpeE = 1.0;
      tierDesc = '50e < m ≤ 200e';
    } else {
      computedMpeE = 1.5;
      tierDesc = '200e < m ≤ 1000e';
    }
  }

  // Double MPE if in-service
  const finalMpeMultiplier = calcVerificationType === 'in-service' ? 2 : 1;
  const finalMpeE = computedMpeE * finalMpeMultiplier;
  const finalMpeGrams = (finalMpeE * calcScaleIntervalEGrams);

  const handleApplyModelToDUT = (model: GovtApprovedModel) => {
    const newDevice: DeviceUnderTest = {
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
    };

    onSelectModelToDUT(newDevice);
    setToastMessage(`Loaded "${model.modelName}" into active test suite.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Top Header Card */}
      <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[18px] text-[#001428]">
              Statutory Standards & Government Model Approval Directory
            </span>
            <span className="text-[11px] font-mono font-bold bg-[#001428] text-white px-2 py-0.5 rounded uppercase">
              OFFICIAL GAZETTE REGISTRY
            </span>
          </div>
          <span className="text-[12px] text-[#43474d] mt-0.5">
            Complete built-in statutory tables, OIML R-76 MPE formulas, NPL mass standards & Legal Metrology Act provisions
          </span>
        </div>

        {/* Sub-tabs switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#eff4ff] rounded border border-[#c3c6ce]/30 flex-wrap">
          <button
            onClick={() => setActiveSubTab('models')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
              activeSubTab === 'models'
                ? 'bg-[#001428] text-white shadow-xs'
                : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            Approved Models (12+)
          </button>
          <button
            onClick={() => setActiveSubTab('oiml-norms')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
              activeSubTab === 'oiml-norms'
                ? 'bg-[#001428] text-white shadow-xs'
                : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            OIML R-76 Calculator
          </button>
          <button
            onClick={() => setActiveSubTab('standard-weights')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
              activeSubTab === 'standard-weights'
                ? 'bg-[#001428] text-white shadow-xs'
                : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            NPL Standard Weights (E1-M3)
          </button>
          <button
            onClick={() => setActiveSubTab('law-digest')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
              activeSubTab === 'law-digest'
                ? 'bg-[#001428] text-white shadow-xs'
                : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            Act & Penal Digest
          </button>
          <button
            onClick={() => setActiveSubTab('norms-2026')}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all flex items-center gap-1 ${
              activeSubTab === 'norms-2026'
                ? 'bg-[#001428] text-white shadow-xs'
                : 'text-[#21a173] hover:text-[#001428] font-bold'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#21a173] animate-pulse" />
            <span>2026 Norms & OIML-CS</span>
          </button>
        </div>
      </div>

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="bg-[#85f8c4] border border-[#21a173] text-[#002114] p-3 rounded text-[12px] font-mono font-bold flex items-center justify-between shadow-md animate-fade-in">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            {toastMessage}
          </span>
          <span className="text-[11px] font-sans font-normal">Switch to &apos;R-76 Automated Test Suite&apos; to begin verification</span>
        </div>
      )}

      {/* SUB-TAB 1: GOVERNMENT APPROVED MODELS DIRECTORY */}
      {activeSubTab === 'models' && (
        <div className="flex flex-col gap-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[#74777e] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search model, manufacturer, approval no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded text-[12px] font-sans text-[#001428] focus:outline-none focus:border-[#006781]"
                />
              </div>

              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-[#eff4ff] border border-[#c3c6ce]/40 rounded py-1.5 px-3 text-[12px] font-sans text-[#001428]"
              >
                <option value="ALL">All Accuracy Classes</option>
                <option value="CLASS_I">Class I (Special)</option>
                <option value="CLASS_II">Class II (High)</option>
                <option value="CLASS_III">Class III (Medium)</option>
                <option value="CLASS_IV">Class IV (Ordinary)</option>
              </select>
            </div>

            <div className="text-[12px] text-[#43474d] font-mono">
              Found {filteredModels.length} Government Approved Models
            </div>
          </div>

          {/* Model Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <div
                key={model.approvalNumber}
                className="bg-white rounded border border-[#c3c6ce]/30 shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#c3c6ce]/20">
                    <span className="text-[10px] font-mono font-bold bg-[#001428] text-white px-2 py-0.5 rounded">
                      {model.accuracyClass.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#006781] truncate max-w-[170px]">
                      {model.approvalNumber}
                    </span>
                  </div>

                  <span className="text-[11px] text-[#43474d] font-medium block truncate">
                    {model.manufacturer}
                  </span>
                  <h3 className="font-bold text-[15px] text-[#001428] mt-0.5 leading-snug">
                    {model.modelName}
                  </h3>

                  <p className="text-[11px] text-[#43474d] my-2 leading-relaxed line-clamp-2">
                    {model.applicationUsage}
                  </p>

                  <div className="space-y-1 my-2.5 text-[11px] font-mono bg-[#eff4ff] p-2.5 rounded border border-[#c3c6ce]/20">
                    <div className="flex justify-between">
                      <span className="text-[#43474d] font-sans">Capacity (Max / Min):</span>
                      <span className="font-bold text-[#001428]">
                        {model.maxCapacityKg >= 1000 ? `${(model.maxCapacityKg / 1000).toFixed(0)} T` : `${model.maxCapacityKg} kg`} / {model.minCapacityKg < 1 ? `${(model.minCapacityKg * 1000).toFixed(1)} g` : `${model.minCapacityKg} kg`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#43474d] font-sans">Interval (e / d):</span>
                      <span className="font-bold text-[#006781]">
                        e = {model.scaleIntervalE_g} g | d = {model.scaleIntervalD_g} g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#43474d] font-sans">Total Intervals (n):</span>
                      <span className="font-bold text-[#001428]">{model.numberOfIntervals.toLocaleString()}e</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#43474d] font-sans">Gazette Reference:</span>
                      <span className="text-[#43474d] truncate max-w-[140px]">{model.gazetteNotification}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#c3c6ce]/20 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleApplyModelToDUT(model)}
                    className="w-full py-2 bg-[#001428] hover:bg-[#006781] text-white rounded text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_circle</span>
                    <span>Load into Active Test Suite</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: OIML R-76 INTERACTIVE MPE CALCULATOR & ACCURACY NORMS */}
      {activeSubTab === 'oiml-norms' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Left Column: Interactive Calculator (5 cols) */}
          <div className="xl:col-span-5 flex flex-col gap-4">
            <div className="bg-white p-5 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#c3c6ce]/20">
                <span className="material-symbols-outlined text-[#006781] text-[22px]">calculate</span>
                <span className="font-bold text-[16px] text-[#001428]">
                  Statutory OIML R-76 MPE Calculator
                </span>
              </div>
              <p className="text-[12px] text-[#43474d] leading-relaxed">
                Determine the legally allowed error on any weighing instrument according to OIML R-76-1:2006 Clause 3.5.1 (Initial) and Clause 3.5.2 (In-Service):
              </p>

              {/* Input parameters */}
              <div className="space-y-3 font-mono text-[12px]">
                <div className="flex flex-col gap-1 font-sans">
                  <label className="text-[11px] font-semibold text-[#43474d]">Accuracy Classification</label>
                  <select
                    value={calcClass}
                    onChange={(e) => setCalcClass(e.target.value as any)}
                    className="p-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded text-[12px] font-sans text-[#001428]"
                  >
                    <option value="CLASS_I">Class I (Special Accuracy, Lab/Micro)</option>
                    <option value="CLASS_II">Class II (High Accuracy, Bullion/Jewelry)</option>
                    <option value="CLASS_III">Class III (Medium Accuracy, Mandi/Weighbridge)</option>
                    <option value="CLASS_IV">Class IV (Ordinary Accuracy, Coal/Gravel)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1 font-sans">
                    <label className="text-[11px] font-semibold text-[#43474d]">Applied Load (kg)</label>
                    <input
                      type="number"
                      value={calcLoadKg}
                      onChange={(e) => setCalcLoadKg(Number(e.target.value))}
                      className="p-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded text-[13px] font-mono text-[#001428]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 font-sans">
                    <label className="text-[11px] font-semibold text-[#43474d]">Verification Interval e (g)</label>
                    <input
                      type="number"
                      value={calcScaleIntervalEGrams}
                      onChange={(e) => setCalcScaleIntervalEGrams(Number(e.target.value))}
                      className="p-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded text-[13px] font-mono text-[#001428]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 font-sans">
                  <label className="text-[11px] font-semibold text-[#43474d]">Verification Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCalcVerificationType('initial')}
                      className={`p-2 rounded text-[11px] font-semibold border transition-all ${
                        calcVerificationType === 'initial'
                          ? 'bg-[#001428] text-white border-[#001428]'
                          : 'bg-[#eff4ff] text-[#43474d] border-[#c3c6ce]/30'
                      }`}
                    >
                      Initial Verification (1x MPE)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcVerificationType('in-service')}
                      className={`p-2 rounded text-[11px] font-semibold border transition-all ${
                        calcVerificationType === 'in-service'
                          ? 'bg-[#001428] text-white border-[#001428]'
                          : 'bg-[#eff4ff] text-[#43474d] border-[#c3c6ce]/30'
                      }`}
                    >
                      In-Service / Re-stamp (2x MPE)
                    </button>
                  </div>
                </div>
              </div>

              {/* Calculated Results Card */}
              <div className="mt-2 p-4 bg-[#001428] text-white rounded border border-[#0f2942] flex flex-col gap-2">
                <span className="text-[10px] text-[#b0c9e8] uppercase font-mono font-bold tracking-wider">
                  STATUTORY MAXIMUM PERMISSIBLE ERROR (MPE)
                </span>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-[30px] font-bold text-[#85f8c4]">
                      ±{finalMpeGrams.toFixed(1)}
                    </span>
                    <span className="text-[16px] text-[#b0c9e8] font-semibold">g</span>
                  </div>
                  <span className="font-mono text-[16px] text-white font-bold">
                    (±{finalMpeE.toFixed(1)}e)
                  </span>
                </div>

                <div className="pt-2 border-t border-[#0f2942] flex flex-col gap-1 text-[11px] font-mono text-[#cbdbf5]">
                  <div className="flex justify-between">
                    <span>Applicable Load Band:</span>
                    <span className="text-white font-bold">{tierDesc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Load in scale intervals (m):</span>
                    <span className="text-white font-bold">{mInE.toLocaleString()}e</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statutory Legal Basis:</span>
                    <span className="text-[#85f8c4]">
                      OIML R-76 Cl. {calcVerificationType === 'initial' ? '3.5.1' : '3.5.2'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Classification Standards (Table 3 & Bands) (7 cols) */}
          <div className="xl:col-span-7 flex flex-col gap-4">
            {/* OIML Table 3 */}
            <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-3">
              <span className="font-bold text-[15px] text-[#001428]">
                OIML R-76 Table 3: Instrument Classification & Scale Interval Norms
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-[#eff4ff] text-[#43474d] border-b border-[#c3c6ce]/30">
                    <tr>
                      <th className="p-2">Class</th>
                      <th className="p-2">Verification Interval (e)</th>
                      <th className="p-2">Min Capacity</th>
                      <th className="p-2">Intervals (n)</th>
                      <th className="p-2">Typical Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c3c6ce]/20 text-[#0b1c30]">
                    {oimlClassNorms.map((norm) => (
                      <tr key={norm.accuracyClass} className="hover:bg-[#eff4ff]/60">
                        <td className="p-2 font-bold text-[#006781]">{norm.className.split(' ')[0]} {norm.className.split(' ')[1]}</td>
                        <td className="p-2">{norm.scaleIntervalRange}</td>
                        <td className="p-2 font-bold">{norm.minCapacityFormula}</td>
                        <td className="p-2">{norm.minN.toLocaleString()} - {norm.maxN.toLocaleString()}</td>
                        <td className="p-2 font-sans text-[10px] text-[#43474d]">{norm.typicalApplications}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MPE Staircase Band Table */}
            <div className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-3">
              <span className="font-bold text-[15px] text-[#001428]">
                OIML R-76 MPE Staircase Tolerance Limits (Initial vs In-Service)
              </span>
              <div className="space-y-2">
                {mpeBandDefinitions.map((def) => (
                  <div key={def.accuracyClass} className="p-2.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20 flex flex-col gap-1 text-[11px] font-mono">
                    <span className="font-bold text-[#001428] font-sans">{def.accuracyClass.replace('_', ' ')}</span>
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div className="p-1.5 bg-white rounded border border-[#c3c6ce]/20">
                        <span className="text-[#43474d] block font-sans">Tier 1: {def.tier1.range}</span>
                        <span className="text-[#21a173] font-bold">Initial: {def.tier1.initialMPE}</span>
                        <span className="text-[#006781] block">Service: {def.tier1.inServiceMPE}</span>
                      </div>
                      <div className="p-1.5 bg-white rounded border border-[#c3c6ce]/20">
                        <span className="text-[#43474d] block font-sans">Tier 2: {def.tier2.range}</span>
                        <span className="text-[#21a173] font-bold">Initial: {def.tier2.initialMPE}</span>
                        <span className="text-[#006781] block">Service: {def.tier2.inServiceMPE}</span>
                      </div>
                      <div className="p-1.5 bg-white rounded border border-[#c3c6ce]/20">
                        <span className="text-[#43474d] block font-sans">Tier 3: {def.tier3.range}</span>
                        <span className="text-[#21a173] font-bold">Initial: {def.tier3.initialMPE}</span>
                        <span className="text-[#006781] block">Service: {def.tier3.inServiceMPE}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: NPL-CSIR / OIML R-111 STANDARD WEIGHTS MPE TABLE */}
      {activeSubTab === 'standard-weights' && (
        <div className="bg-white p-5 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-[#c3c6ce]/20">
            <div>
              <span className="font-bold text-[16px] text-[#001428] block">
                NPL-CSIR & OIML R 111-1 Standard Test Weights Maximum Permissible Errors
              </span>
              <span className="text-[12px] text-[#43474d]">
                Official tolerances for reference weights used to calibrate and verify NAWI scales (in milligrams ±δm)
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#21a173] bg-[#eff4ff] px-2.5 py-1 rounded font-bold border border-[#c3c6ce]/20">
              TRACEABLE TO NPL-DELHI
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[12px]">
              <thead className="bg-[#eff4ff] text-[#43474d] text-[11px] uppercase border-b border-[#c3c6ce]/30">
                <tr>
                  <th className="p-2.5">Nominal Mass</th>
                  <th className="p-2.5 text-[#001428]">Class E1 (±mg)</th>
                  <th className="p-2.5 text-[#001428]">Class E2 (±mg)</th>
                  <th className="p-2.5 text-[#006781] font-bold">Class F1 (±mg)</th>
                  <th className="p-2.5 text-[#006781]">Class F2 (±mg)</th>
                  <th className="p-2.5 text-[#21a173] font-bold">Class M1 (±mg)</th>
                  <th className="p-2.5 text-[#43474d]">Class M2 (±mg)</th>
                  <th className="p-2.5 text-[#43474d]">Class M3 (±mg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6ce]/20 text-[#0b1c30]">
                {standardWeightsTolerances.map((row) => (
                  <tr key={row.nominalMass} className="hover:bg-[#eff4ff]/60">
                    <td className="p-2.5 font-bold text-[#001428]">{row.nominalMass}</td>
                    <td className="p-2.5 text-[#74777e]">{row.classE1_mg}</td>
                    <td className="p-2.5 text-[#74777e]">{row.classE2_mg}</td>
                    <td className="p-2.5 font-bold text-[#006781] bg-[#dce9ff]/30">{row.classF1_mg}</td>
                    <td className="p-2.5 text-[#006781]">{row.classF2_mg}</td>
                    <td className="p-2.5 font-bold text-[#21a173] bg-[#85f8c4]/15">{row.classM1_mg}</td>
                    <td className="p-2.5 text-[#43474d]">{row.classM2_mg}</td>
                    <td className="p-2.5 text-[#43474d]">{row.classM3_mg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#eff4ff] rounded border border-[#c3c6ce]/30 text-[11px] text-[#43474d] leading-relaxed">
            <strong>Metrological Guidance:</strong> Class F1 weights are standardly used for verifying Class II precision balances and Class III scales with n &gt; 5,000e. Class M1 weights are mandatory for ordinary commercial Class III scales and agricultural weighbridges.
          </div>
        </div>
      )}

      {/* SUB-TAB 4: STATUTORY LAW DIGEST & PENAL CODES */}
      {activeSubTab === 'law-digest' && (
        <div className="space-y-4">
          {legalMetrologyDigest.map((item) => (
            <div
              key={item.clauseNumber}
              className="bg-white p-5 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col gap-2"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#c3c6ce]/20">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] font-bold bg-[#001428] text-white px-2 py-0.5 rounded">
                    {item.clauseNumber}
                  </span>
                  <span className="font-bold text-[15px] text-[#001428]">
                    {item.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#006781] font-semibold">
                  {item.statutoryAct}
                </span>
              </div>

              <p className="text-[12px] text-[#43474d] leading-relaxed italic bg-[#eff4ff] p-3 rounded border border-[#c3c6ce]/20">
                &ldquo;{item.summary}&rdquo;
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[#001428]">Legal & Operational Implication:</span>
                  <span className="text-[#43474d]">{item.legalImplication}</span>
                </div>
                {item.penalSanction && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[#ba1a1a]">Penal Sanction for Violation:</span>
                    <span className="text-[#ba1a1a]">{item.penalSanction}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 5: 2026 REGULATORY GAZETTES & OIML-CS MANDATES */}
      {activeSubTab === 'norms-2026' && (
        <div className="flex flex-col gap-4">
          <div className="bg-[#001428] text-white p-5 rounded border border-[#0f2942] shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#85f8c4] text-[24px]">verified</span>
                <span className="font-bold text-[16px] text-white">
                  2026 Sovereign Metrology Regulatory Conformity Status: 100% UP TO DATE
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#21a173] text-white px-2 py-0.5 rounded uppercase">
                ACTIVE 2026 NORMS
              </span>
            </div>
            <p className="text-[12px] text-[#b0c9e8] leading-relaxed">
              All mathematical algorithms, maximum permissible error tables, model approval registers, and certificate formats in <strong>ManoSetu-NAWI</strong> conform precisely to the latest 2026 statutory amendments under the Legal Metrology (General) Rules, the Jan Vishwas Act compounding directives, and India&apos;s accreditation as an <strong>OIML Issuing Authority (OIML-CS)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regulatoryNorms2026.map((norm, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#c3c6ce]/20">
                    <span className="text-[10px] font-mono font-bold bg-[#eff4ff] text-[#006781] px-2 py-0.5 rounded border border-[#c3c6ce]/20">
                      {norm.effectiveDate}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#21a173] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#21a173]" />
                      {norm.systemImplementationStatus}
                    </span>
                  </div>

                  <h4 className="font-bold text-[14px] text-[#001428] leading-snug">
                    {norm.subjectTitle}
                  </h4>
                  <span className="text-[11px] font-mono text-[#43474d] block mt-1">
                    {norm.gazetteNotification}
                  </span>

                  <p className="text-[12px] text-[#43474d] mt-2 leading-relaxed bg-[#eff4ff] p-2.5 rounded border border-[#c3c6ce]/20">
                    {norm.complianceMandate}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#c3c6ce]/20 flex items-center justify-between text-[11px] text-[#006781] font-mono font-semibold">
                  <span>Enforcing Body:</span>
                  <span className="truncate max-w-[220px] text-right">{norm.regulatoryAuthority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
