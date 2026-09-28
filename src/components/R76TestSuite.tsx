import React, { useState, useEffect } from 'react';
import { DeviceUnderTest, LoadingTestPoint, EccentricityPoint, StatutoryAuditRecord } from '../types/metrology';
import { computeDeterministicStep, getDefaultLoadingMatrix } from '../utils/oimlEngine';

interface R76TestSuiteProps {
  device: DeviceUnderTest;
  onOpenLedgerModal: () => void;
  onOpenCertificateModal: () => void;
  auditTrail: StatutoryAuditRecord[];
  onAddAuditRecord: (record: StatutoryAuditRecord) => void;
  onOpenGovtLookup?: () => void;
}

export const R76TestSuite: React.FC<R76TestSuiteProps> = ({
  device,
  onOpenLedgerModal,
  onOpenCertificateModal,
  auditTrail,
  onAddAuditRecord,
  onOpenGovtLookup,
}) => {
  const [loadingSteps, setLoadingSteps] = useState<LoadingTestPoint[]>(() =>
    getDefaultLoadingMatrix(device.scaleIntervalE_g)
  );

  const [activeStepIndex, setActiveStepIndex] = useState<number>(5); // Step 6 (15kg) default
  const activeStep = loadingSteps[activeStepIndex] || loadingSteps[5];

  // Dynamic live weight jitter to simulate real RS-232 20Hz strain-gauge stream
  const [liveJitterKg, setLiveJitterKg] = useState<number>(activeStep.indicationKg);
  const [isRunningSuite, setIsRunningSuite] = useState<boolean>(false);
  const [runButtonText, setRunButtonText] = useState<string>('Run R-76 Suite');

  // Eccentricity points state
  const [eccentricityPoints, setEccentricityPoints] = useState<EccentricityPoint[]>([
    { position: 'Pos 1 (Center)', code: 'P1', loadKg: 10.0, indicationKg: 10.0004, deltaG: 0.2, deltaE: 0.04, isCompliant: true, isDatum: true },
    { position: 'Pos 2 (TL)', code: 'P2', loadKg: 10.0, indicationKg: 10.0012, deltaG: 0.6, deltaE: 0.12, isCompliant: true },
    { position: 'Pos 3 (TR)', code: 'P3', loadKg: 10.0, indicationKg: 9.9992, deltaG: -0.4, deltaE: 0.08, isCompliant: true },
    { position: 'Pos 4 (BL)', code: 'P4', loadKg: 10.0, indicationKg: 10.0016, deltaG: 0.8, deltaE: 0.16, isCompliant: true },
    { position: 'Pos 5 (BR)', code: 'P5', loadKg: 10.0, indicationKg: 10.0010, deltaG: 0.5, deltaE: 0.10, isCompliant: true },
  ]);

  // Jitter effect
  useEffect(() => {
    const interval = setInterval(() => {
      // 0.2 gram micro-oscillation at 20Hz load cell acquisition
      const noise = (Math.random() * 0.0004 - 0.0002);
      setLiveJitterKg(Number((activeStep.indicationKg + noise).toFixed(3)));
    }, 1500);
    return () => clearInterval(interval);
  }, [activeStep.indicationKg]);

  // Recalculate deterministic step values
  const currentCalc = computeDeterministicStep(
    activeStep.standardLoadKg,
    activeStep.indicationKg,
    activeStep.turningPointDeltaL_g,
    device.scaleIntervalE_g,
    activeStep.zeroDatumShiftOffsetG,
    device.accuracyClass
  );

  // Capacity calculation
  const capacityPct = device.maxCapacityKg > 0
    ? ((activeStep.indicationKg / device.maxCapacityKg) * 100).toFixed(3)
    : '0.000';

  // Interactive step selection
  const handleSelectStep = (index: number) => {
    setActiveStepIndex(index);
    setLiveJitterKg(loadingSteps[index].indicationKg);
  };

  // Run full automated R-76 suite simulation
  const handleRunSuite = () => {
    if (isRunningSuite) return;
    setIsRunningSuite(true);
    setRunButtonText('Calibrating & Verifying...');

    let current = 0;
    const interval = setInterval(() => {
      if (current < loadingSteps.length) {
        setActiveStepIndex(current);
        setLiveJitterKg(loadingSteps[current].indicationKg);
        current++;
      } else {
        clearInterval(interval);
        setIsRunningSuite(false);
        setRunButtonText('Suite Verified PASS');

        // Add verified record to audit trail
        const newRecord: StatutoryAuditRecord = {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          testVector: 'Full R-76 Automated Suite (Steps 1-10)',
          clause: 'A.4.4.1 to A.4.4.4',
          standardLoadKg: `${device.maxCapacityKg.toFixed(3)} kg`,
          indicationKg: `${device.maxCapacityKg.toFixed(3)} kg`,
          deltaLTurn_g: '2.0 g',
          correctedErrorEc: '+1.8 g (+0.36e)',
          mpeLimit: '±7.5 g (±1.5e)',
          result: 'COMPLIANT',
          hash: '0x' + Math.random().toString(16).slice(2, 10) + '9b4e881024' + Math.random().toString(16).slice(2, 12),
        };
        onAddAuditRecord(newRecord);

        setTimeout(() => {
          setRunButtonText('Run R-76 Suite');
        }, 3000);
      }
    }, 700);
  };

  // Eccentricity quadrant nudge
  const handleEccentricityClick = (index: number) => {
    const updated = [...eccentricityPoints];
    const item = updated[index];
    // Slightly adjust reading to show interactive reactivity
    const adjustment = item.deltaG > 0.5 ? -0.2 : 0.3;
    const newDeltaG = Number((item.deltaG + adjustment).toFixed(1));
    item.deltaG = newDeltaG;
    item.deltaE = Number((Math.abs(newDeltaG) / device.scaleIntervalE_g).toFixed(2));
    item.isCompliant = Math.abs(newDeltaG) <= 5.0;
    setEccentricityPoints(updated);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Operational Header & Statutory Bar */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="bg-white p-3.5 rounded border border-[#c3c6ce]/30 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#001428] text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                ManoSetu-NAWI Metrology OS
              </span>
              <span className="text-[11px] text-[#006781] font-semibold bg-[#8fdfff]/25 px-2 py-0.5 rounded">
                Central Automated Verification Engine
              </span>
              <span className="font-mono text-[11px] text-[#43474d] bg-[#e5eeff] px-2 py-0.5 rounded">
                SESSION: #GOI-DEL-2026-9042
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#21a173] bg-[#eff4ff] px-2 py-0.5 rounded font-semibold border border-[#c3c6ce]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#21a173] animate-pulse" />
                OIML R-76-1:2006 (E) Sec A.4.4.3 & Cl. 3.5.1 COMPLIANT
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap mt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-[#43474d] font-medium">DUT:</span>
                <span className="text-[15px] font-bold text-[#001428] tracking-tight">
                  {device.name}
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#dce9ff] text-[#001428] px-1.5 py-0.5 rounded">
                  {device.accuracyClass.replace('_', ' ')}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1 font-mono text-[12px] text-[#43474d]">
                <span>Max={device.maxCapacityKg.toFixed(3)} kg</span>
                <span className="text-[#c3c6ce]">•</span>
                <span>Min={(device.minCapacityKg * 1000).toFixed(0)} g</span>
                <span className="text-[#c3c6ce]">•</span>
                <span>e={device.scaleIntervalE_g} g</span>
                <span className="text-[#c3c6ce]">•</span>
                <span>d={device.scaleIntervalD_g} g</span>
                <span className="text-[#c3c6ce]">•</span>
                <span className="font-semibold text-[#001428]">n={device.numberOfIntervals.toLocaleString()}e</span>
                {onOpenGovtLookup && (
                  <>
                    <span className="text-[#c3c6ce]">•</span>
                    <button
                      onClick={onOpenGovtLookup}
                      className="text-[#006781] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      title="Inspect Government Model Approval & Legal Norms"
                    >
                      <span className="material-symbols-outlined text-[14px]">menu_book</span>
                      <span>Govt Approval: {device.approvalNumber}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRunSuite}
              disabled={isRunningSuite}
              id="btn-run-suite"
              className="bg-[#001428] hover:bg-[#0f2942] disabled:opacity-60 text-white px-3.5 py-2 rounded text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <span className={`material-symbols-outlined text-[18px] ${isRunningSuite ? 'animate-spin' : ''}`}>
                {isRunningSuite ? 'refresh' : 'play_circle'}
              </span>
              <span>{runButtonText}</span>
              <span className="text-[10px] font-mono opacity-75 bg-[#0f2942] px-1 rounded ml-0.5">F5</span>
            </button>

            <button
              onClick={onOpenLedgerModal}
              id="btn-verify-block"
              className="bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#001428] px-3.5 py-2 rounded text-[13px] font-semibold flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-[#006781]">verified_user</span>
              <span>Verify SHA-256 Ledger</span>
            </button>

            <button
              onClick={onOpenCertificateModal}
              id="btn-download-pdf"
              className="bg-[#21a173] hover:bg-[#006781] text-white px-3.5 py-2 rounded text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Form VIII Report (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrology 3-Column Inspection Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Live Telemetry & Deterministic Engine (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Live Instrument Readout Console */}
          <div className="bg-white rounded border border-[#c3c6ce]/30 shadow-sm p-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 bg-[#eff4ff] -mx-4 -mt-4 px-4 pt-2.5 border-b border-[#c3c6ce]/20">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#21a173] animate-pulse" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#001428]">
                  Load Receiver Stream
                </span>
              </div>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded text-[#43474d] border border-[#c3c6ce]/20">
                SERIAL: {device.indicatorSerial}
              </span>
            </div>

            {/* LCD Main Display Simulation */}
            <div className="bg-[#001428] text-white p-3.5 rounded flex flex-col justify-between shadow-inner relative">
              <div className="flex items-center justify-between text-[#b0c9e8] font-mono text-[11px] mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 bg-[#0f2942] text-[#85f8c4] rounded font-bold">STABLE</span>
                  <span className="px-1.5 bg-[#0f2942] text-[#cbdbf5] rounded">NET=0</span>
                  <span className="px-1.5 bg-[#0f2942] text-[#85f8c4] rounded">CENTER OF ZERO [&gt;0&lt;]</span>
                </div>
                <span className="font-mono text-[11px]">RATE: 20 Hz</span>
              </div>

              <div className="flex items-baseline justify-between my-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-[34px] font-bold text-white tracking-tight" id="live-weight-val">
                    {liveJitterKg.toFixed(3)}
                  </span>
                  <span className="text-[18px] text-[#b0c9e8] font-semibold">kg</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[#b0c9e8] uppercase font-medium">Standard Load L</span>
                  <span className="font-mono text-[16px] text-[#85f8c4] font-bold">
                    {activeStep.standardLoadKg.toFixed(3)} kg
                  </span>
                </div>
              </div>

              <div className="pt-1.5 mt-1 bg-[#0f2942]/60 -mx-3.5 -mb-3.5 px-3.5 py-1.5 rounded-b flex items-center justify-between font-mono text-[11px] text-[#b0c9e8]">
                <span>NPL Class F1 Traceable Standards</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#85f8c4]">Turning Point ΔL: {activeStep.turningPointDeltaL_g.toFixed(1)} g</span>
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      onClick={() => {
                        const updated = [...loadingSteps];
                        const step = updated[activeStepIndex];
                        step.turningPointDeltaL_g = Math.max(0.5, Number((step.turningPointDeltaL_g - 0.5).toFixed(1)));
                        setLoadingSteps(updated);
                      }}
                      className="w-4 h-4 bg-[#0f2942] hover:bg-[#1a3b5c] text-white rounded flex items-center justify-center text-[11px] font-bold"
                      title="Decrease Delta L (-0.5g)"
                    >
                      -
                    </button>
                    <button
                      onClick={() => {
                        const updated = [...loadingSteps];
                        const step = updated[activeStepIndex];
                        step.turningPointDeltaL_g = Math.min(5.0, Number((step.turningPointDeltaL_g + 0.5).toFixed(1)));
                        setLoadingSteps(updated);
                      }}
                      className="w-4 h-4 bg-[#0f2942] hover:bg-[#1a3b5c] text-white rounded flex items-center justify-center text-[11px] font-bold"
                      title="Increase Delta L (+0.5g)"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="mt-3 flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-[#43474d]">
                <span>Nominal Capacity Utilization</span>
                <span className="font-mono font-bold text-[#001428]">
                  {capacityPct} % ({liveJitterKg.toFixed(3)} / {device.maxCapacityKg.toFixed(3)} kg)
                </span>
              </div>
              <div className="w-full h-2 bg-[#e5eeff] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006781] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, Number(capacityPct)))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Clause A.4.4.3 Deterministic Metrology Calculation Well */}
          <div className="bg-white rounded border border-[#c3c6ce]/30 shadow-sm p-4">
            <div className="flex items-center justify-between pb-1 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006781] text-[20px]">functions</span>
                <span className="font-bold text-[15px] text-[#001428]">
                  Clause A.4.4.3 Deterministic Engine
                </span>
              </div>
              <span className="font-mono text-[10px] bg-[#e5eeff] text-[#43474d] px-1.5 py-0.5 rounded font-bold">
                STATUTORY AUDIT
              </span>
            </div>

            <p className="text-[12px] text-[#43474d] mb-3 leading-relaxed">
              Zero-approximation precision calculation for verification of error before rounding, eliminating internal digitization quantization errors:
            </p>

            {/* Formula Trace Blocks */}
            <div className="space-y-1.5 font-mono text-[12px]">
              {/* Formula 1 */}
              <div className="p-2.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20 flex flex-col gap-0.5">
                <div className="flex items-center justify-between font-sans">
                  <span className="font-semibold text-[#001428] text-[12px]">1. True Calculated Indication (P)</span>
                  <span className="font-mono text-[10px] text-[#006781]">P = I + 0.5e - ΔL</span>
                </div>
                <div className="font-mono text-[13px] flex items-center justify-between">
                  <span>
                    {activeStep.indicationKg.toFixed(3)} kg + {(0.5 * (device.scaleIntervalE_g / 1000)).toFixed(4)} kg - {(activeStep.turningPointDeltaL_g / 1000).toFixed(4)} kg
                  </span>
                  <span className="font-bold text-[#001428]">= {currentCalc.trueCalculatedIndicationKg.toFixed(4)} kg</span>
                </div>
              </div>

              {/* Formula 2 */}
              <div className="p-2.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20 flex flex-col gap-0.5">
                <div className="flex items-center justify-between font-sans">
                  <span className="font-semibold text-[#001428] text-[12px]">2. Raw Indication Error (E)</span>
                  <span className="font-mono text-[10px] text-[#006781]">E = P - L</span>
                </div>
                <div className="font-mono text-[13px] flex items-center justify-between">
                  <span>
                    {currentCalc.trueCalculatedIndicationKg.toFixed(4)} kg - {activeStep.standardLoadKg.toFixed(4)} kg
                  </span>
                  <span className="font-bold text-[#006781]">
                    = {currentCalc.rawErrorG >= 0 ? '+' : ''}{currentCalc.rawErrorG.toFixed(1)} g ({currentCalc.rawErrorE >= 0 ? '+' : ''}{currentCalc.rawErrorE.toFixed(2)}e)
                  </span>
                </div>
              </div>

              {/* Formula 3 */}
              <div className="p-2.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20 flex flex-col gap-0.5">
                <div className="flex items-center justify-between font-sans">
                  <span className="font-semibold text-[#001428] text-[12px]">3. Zero-Datum Shift Offset (E₀)</span>
                  <span className="font-mono text-[10px] text-[#006781]">Datum at L = 0</span>
                </div>
                <div className="font-mono text-[13px] flex items-center justify-between">
                  <span>Zero-track baseline drift</span>
                  <span className="font-bold text-[#43474d]">
                    = +{activeStep.zeroDatumShiftOffsetG.toFixed(1)} g (+{(activeStep.zeroDatumShiftOffsetG / device.scaleIntervalE_g).toFixed(2)}e)
                  </span>
                </div>
              </div>

              {/* Formula 4 */}
              <div className="p-2.5 bg-[#e5eeff] rounded border border-[#006781]/30 flex flex-col gap-0.5">
                <div className="flex items-center justify-between font-sans">
                  <span className="font-semibold text-[#001428] text-[12px]">4. True Corrected Error (Ec)</span>
                  <span className="font-mono text-[10px] text-[#001428]">Ec = E - E₀</span>
                </div>
                <div className="font-mono text-[13px] flex items-center justify-between">
                  <span>
                    ({currentCalc.rawErrorG >= 0 ? '+' : ''}{currentCalc.rawErrorG.toFixed(1)} g) - (+{activeStep.zeroDatumShiftOffsetG.toFixed(1)} g)
                  </span>
                  <span className="font-bold text-[#001428] text-[14px]">
                    = {currentCalc.correctedErrorG >= 0 ? '+' : ''}{currentCalc.correctedErrorG.toFixed(1)} g ({currentCalc.correctedErrorE >= 0 ? '+' : ''}{currentCalc.correctedErrorE.toFixed(2)}e)
                  </span>
                </div>
              </div>
            </div>

            {/* MPE Verdict Box */}
            <div className="mt-3 p-2.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded flex items-center justify-center text-white ${currentCalc.isCompliant ? 'bg-[#21a173]' : 'bg-[#ba1a1a]'}`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {currentCalc.isCompliant ? 'check_circle' : 'cancel'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] font-bold text-[#001428] uppercase">MPE Limit Verification</span>
                  <span className="text-[12px] text-[#0b1c30]">
                    |Ec| ≤ ±{currentCalc.mpeLimitG.toFixed(1)} g (±{currentCalc.mpeLimitE.toFixed(1)}e)
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded tracking-wider uppercase ${currentCalc.isCompliant ? 'bg-[#85f8c4] text-[#002114]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                  {currentCalc.isCompliant ? 'STRICT PASS' : 'REJECTED'}
                </span>
                <span className="text-[10px] text-[#43474d] mt-0.5 font-mono">
                  Residual Headroom: {currentCalc.residualHeadroomG.toFixed(1)} g ({currentCalc.headroomPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* 5-Point Plate Eccentricity Matrix (Clause A.4.7) */}
          <div className="bg-white rounded border border-[#c3c6ce]/30 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006781] text-[20px]">grid_view</span>
                <span className="font-bold text-[15px] text-[#001428]">Eccentricity Matrix (A.4.7)</span>
              </div>
              <span className="text-[11px] text-[#43474d] font-mono">
                Load: 10.000 kg (1/3 Max)
              </span>
            </div>
            <p className="text-[12px] text-[#43474d] mb-2.5">
              Corner sensitivity load distribution on rectangular load receptor platter (click corners to simulate off-centre loads):
            </p>

            {/* Platter Diagram with 5 quadrants */}
            <div className="bg-[#eff4ff] p-3 rounded border border-[#c3c6ce]/30 relative aspect-[16/10] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                {/* Pos 2 (TL) */}
                <button
                  onClick={() => handleEccentricityClick(1)}
                  className="bg-white hover:bg-[#dce9ff] p-1.5 rounded shadow-xs w-28 text-center border border-[#c3c6ce]/30 transition-colors"
                >
                  <div className="text-[10px] text-[#43474d] font-semibold">{eccentricityPoints[1].position}</div>
                  <div className="font-mono text-[13px] text-[#001428] font-bold">
                    {eccentricityPoints[1].deltaG >= 0 ? '+' : ''}{eccentricityPoints[1].deltaG.toFixed(1)} g
                  </div>
                  <div className="text-[9px] text-[#21a173] font-semibold font-mono">
                    Δ {eccentricityPoints[1].deltaE.toFixed(2)}e • PASS
                  </div>
                </button>

                {/* Pos 3 (TR) */}
                <button
                  onClick={() => handleEccentricityClick(2)}
                  className="bg-white hover:bg-[#dce9ff] p-1.5 rounded shadow-xs w-28 text-center border border-[#c3c6ce]/30 transition-colors"
                >
                  <div className="text-[10px] text-[#43474d] font-semibold">{eccentricityPoints[2].position}</div>
                  <div className="font-mono text-[13px] text-[#006781] font-bold">
                    {eccentricityPoints[2].deltaG >= 0 ? '+' : ''}{eccentricityPoints[2].deltaG.toFixed(1)} g
                  </div>
                  <div className="text-[9px] text-[#21a173] font-semibold font-mono">
                    Δ {eccentricityPoints[2].deltaE.toFixed(2)}e • PASS
                  </div>
                </button>
              </div>

              {/* Pos 1 (Center) */}
              <div className="flex justify-center items-center">
                <button
                  onClick={() => handleEccentricityClick(0)}
                  className="bg-[#001428] text-white p-1.5 rounded shadow-md w-32 text-center border border-[#0f2942] hover:bg-[#0f2942] transition-colors"
                >
                  <div className="text-[10px] text-[#b0c9e8] font-semibold">{eccentricityPoints[0].position}</div>
                  <div className="font-mono text-[13px] text-[#85f8c4] font-bold">
                    {eccentricityPoints[0].deltaG >= 0 ? '+' : ''}{eccentricityPoints[0].deltaG.toFixed(1)} g
                  </div>
                  <div className="text-[9px] text-[#d1e4ff] font-semibold font-mono">DATUM • PASS</div>
                </button>
              </div>

              <div className="flex justify-between items-center">
                {/* Pos 4 (BL) */}
                <button
                  onClick={() => handleEccentricityClick(3)}
                  className="bg-white hover:bg-[#dce9ff] p-1.5 rounded shadow-xs w-28 text-center border border-[#c3c6ce]/30 transition-colors"
                >
                  <div className="text-[10px] text-[#43474d] font-semibold">{eccentricityPoints[3].position}</div>
                  <div className="font-mono text-[13px] text-[#001428] font-bold">
                    {eccentricityPoints[3].deltaG >= 0 ? '+' : ''}{eccentricityPoints[3].deltaG.toFixed(1)} g
                  </div>
                  <div className="text-[9px] text-[#21a173] font-semibold font-mono">
                    Δ {eccentricityPoints[3].deltaE.toFixed(2)}e • PASS
                  </div>
                </button>

                {/* Pos 5 (BR) */}
                <button
                  onClick={() => handleEccentricityClick(4)}
                  className="bg-white hover:bg-[#dce9ff] p-1.5 rounded shadow-xs w-28 text-center border border-[#c3c6ce]/30 transition-colors"
                >
                  <div className="text-[10px] text-[#43474d] font-semibold">{eccentricityPoints[4].position}</div>
                  <div className="font-mono text-[13px] text-[#001428] font-bold">
                    {eccentricityPoints[4].deltaG >= 0 ? '+' : ''}{eccentricityPoints[4].deltaG.toFixed(1)} g
                  </div>
                  <div className="text-[9px] text-[#21a173] font-semibold font-mono">
                    Δ {eccentricityPoints[4].deltaE.toFixed(2)}e • PASS
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[12px] font-mono">
              <span className="text-[#43474d]">
                Max Corner Incursion: <strong className="text-[#001428] font-bold">+0.8 g</strong>
              </span>
              <span className="text-[#21a173] font-semibold bg-[#eff4ff] px-2 py-0.5 rounded border border-[#c3c6ce]/20">
                MPE: ±5.0 g • COMPLIANT
              </span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Visual OIML R-76 MPE Staircase & Loading Vectors (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {/* Tolerance Envelope Card */}
          <div className="bg-white rounded border border-[#c3c6ce]/30 shadow-sm p-4">
            <div className="flex items-center justify-between pb-1 mb-1">
              <div className="flex flex-col">
                <span className="font-bold text-[16px] text-[#001428]">
                  OIML R-76 MPE Staircase Envelope
                </span>
                <span className="text-[11px] text-[#43474d]">
                  Clause 3.5.1 Maximum Permissible Errors (Initial Verification)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#006781]" />
                <span className="font-mono text-[11px] font-bold text-[#001428] uppercase">
                  Class III (n=6000)
                </span>
              </div>
            </div>

            {/* MPE Tier Rules Legend */}
            <div className="grid grid-cols-3 gap-2 my-2.5 text-center">
              <div className="p-2 bg-[#eff4ff] rounded border border-[#c3c6ce]/20">
                <div className="text-[10px] text-[#43474d] font-semibold">0 ≤ m ≤ 500e (2.5kg)</div>
                <div className="font-mono text-[12px] text-[#001428] font-bold">±0.5e (±2.5g)</div>
              </div>
              <div className="p-2 bg-[#eff4ff] rounded border border-[#c3c6ce]/20">
                <div className="text-[10px] text-[#43474d] font-semibold">500e &lt; m ≤ 2000e (10kg)</div>
                <div className="font-mono text-[12px] text-[#001428] font-bold">±1.0e (±5.0g)</div>
              </div>
              <div className="p-2 bg-[#eff4ff] rounded border border-[#c3c6ce]/20">
                <div className="text-[10px] text-[#43474d] font-semibold">2000e &lt; m ≤ 6000e (30kg)</div>
                <div className="font-mono text-[12px] text-[#001428] font-bold">±1.5e (±7.5g)</div>
              </div>
            </div>

            {/* High-Precision SVG Tolerance Chart */}
            <div className="w-full bg-[#eff4ff]/60 rounded border border-[#c3c6ce]/20 p-2.5 relative">
              <svg className="w-full h-auto text-[#001428]" preserveAspectRatio="xMidYMid meet" viewBox="0 0 540 260">
                <defs>
                  <linearGradient id="envelope-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#006781" stopOpacity="0.12" />
                    <stop offset="50%" stopColor="#006781" stopOpacity="0.02" />
                    <stop offset="100%" stopColor="#006781" stopOpacity="0.12" />
                  </linearGradient>
                </defs>

                {/* Zero Error Baseline */}
                <line stroke="#74777e" strokeDasharray="3 3" strokeWidth="1.5" x1="45" x2="520" y1="130" y2="130" />
                <text className="text-[10px] font-mono fill-[#74777e]" opacity="0.8" x="12" y="134">0.0 e</text>

                {/* Upper Staircase (+MPE) in Crimson */}
                <path
                  d="M 45 100 L 125 100 L 125 70 L 285 70 L 285 40 L 520 40"
                  fill="none"
                  stroke="#ba1a1a"
                  strokeLinejoin="miter"
                  strokeWidth="2"
                />
                <text className="text-[9px] font-mono fill-[#ba1a1a] font-bold" x="495" y="32">+1.5e (+7.5g)</text>
                <text className="text-[9px] font-mono fill-[#ba1a1a] font-bold" x="245" y="64">+1.0e</text>
                <text className="text-[9px] font-mono fill-[#ba1a1a] font-bold" x="85" y="94">+0.5e</text>

                {/* Lower Staircase (-MPE) in Crimson */}
                <path
                  d="M 45 160 L 125 160 L 125 190 L 285 190 L 285 220 L 520 220"
                  fill="none"
                  stroke="#ba1a1a"
                  strokeLinejoin="miter"
                  strokeWidth="2"
                />
                <text className="text-[9px] font-mono fill-[#ba1a1a] font-bold" x="495" y="235">-1.5e (-7.5g)</text>

                {/* Shaded Corridor */}
                <polygon
                  fill="url(#envelope-fill)"
                  points="45,100 125,100 125,70 285,70 285,40 520,40 520,220 285,220 285,190 125,190 125,160 45,160"
                />

                {/* Vertical Tier Delimiters */}
                <line stroke="#c3c6ce" strokeDasharray="3 3" strokeWidth="1" x1="125" x2="125" y1="40" y2="220" />
                <line stroke="#c3c6ce" strokeDasharray="3 3" strokeWidth="1" x1="285" x2="285" y1="30" y2="230" />
                <text className="text-[9px] font-mono fill-[#43474d]" x="105" y="248">500e (2.5kg)</text>
                <text className="text-[9px] font-mono fill-[#43474d]" x="260" y="248">2000e (10kg)</text>
                <text className="text-[9px] font-mono fill-[#43474d]" x="470" y="248">6000e (30kg)</text>

                {/* Ascending Measured Run (Emerald Solid Line) */}
                <polyline
                  fill="none"
                  points="45,130 125,124 178,118 285,112 360,106"
                  stroke="#21a173"
                  strokeWidth="2.5"
                />

                {/* Descending Hysteresis Run (Teal Dashed) */}
                <polyline
                  fill="none"
                  points="360,106 285,110 178,116 125,122 45,129"
                  stroke="#006781"
                  strokeDasharray="4 2"
                  strokeWidth="1.5"
                />

                {/* Measured Nodes */}
                <circle cx="45" cy="130" fill="#21a173" r="3.5" />
                <circle cx="125" cy="124" fill="#21a173" r="3.5" />
                <circle cx="178" cy="118" fill="#21a173" r="3.5" />
                <circle cx="285" cy="112" fill="#21a173" r="3.5" />

                {/* Active Load Point Node (Pulsing at active step) */}
                <circle className="animate-ping" cx="360" cy="106" fill="#006781" opacity="0.35" r="7" />
                <circle cx="360" cy="106" fill="#006781" r="5" />
                <text className="text-[10px] font-mono fill-[#001428] font-bold" x="370" y="102">
                  Pt {activeStep.step} ({activeStep.standardLoadKg.toFixed(0)}kg, +{currentCalc.correctedErrorE.toFixed(2)}e)
                </text>
              </svg>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] text-[#0b1c30]">
                  <span className="w-3 h-1 bg-[#21a173] rounded" /> Ascending Error Vector
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-[#0b1c30]">
                  <span className="w-3 h-1 bg-[#006781] rounded" /> Descending Hysteresis Vector
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#21a173] font-bold bg-[#eff4ff] px-2 py-0.5 rounded border border-[#c3c6ce]/20">
                0 TOLERANCE INCURSIONS
              </span>
            </div>
          </div>

          {/* Test Progression Protocol Queue (Clause A.4.4 Test Points) */}
          <div className="bg-white rounded border border-[#c3c6ce]/30 shadow-sm p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1">
              <span className="font-bold text-[15px] text-[#001428]">
                A.4.4 Complete Loading Execution Matrix
              </span>
              <span className="font-mono text-[11px] text-[#43474d] font-bold">
                STEP {activeStepIndex + 1} OF {loadingSteps.length} ACTIVE
              </span>
            </div>

            <p className="text-[11px] text-[#43474d] -mt-1">
              Click any load step to inspect live measurement equations and verify OIML staircase bounds:
            </p>

            {/* Interactive Step List */}
            <div className="space-y-1.5 mt-1 max-h-[340px] overflow-y-auto pr-1">
              {loadingSteps.map((step, idx) => {
                const isActive = idx === activeStepIndex;
                const isPassed = step.isCompliant;

                return (
                  <button
                    key={step.step}
                    onClick={() => handleSelectStep(idx)}
                    className={`w-full flex items-center justify-between p-2 rounded text-[12px] font-mono transition-all text-left ${
                      isActive
                        ? 'bg-[#8fdfff]/25 rounded border border-[#006781]/60 shadow-xs'
                        : 'bg-[#eff4ff] hover:bg-[#dce9ff]/70 border border-[#c3c6ce]/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isActive
                            ? 'bg-[#006781] text-white animate-pulse'
                            : isPassed
                            ? 'bg-[#21a173] text-white'
                            : 'bg-[#ba1a1a] text-white'
                        }`}
                      >
                        {step.step}
                      </span>
                      <span className={`truncate font-sans font-medium ${isActive ? 'font-bold text-[#001428]' : 'text-[#0b1c30]'}`}>
                        {step.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className={`text-[11px] ${isActive ? 'font-bold text-[#006781]' : 'text-[#43474d]'}`}>
                        Ec: {step.correctedErrorG >= 0 ? '+' : ''}{step.correctedErrorG.toFixed(1)}g ({step.correctedErrorE >= 0 ? '+' : ''}{step.correctedErrorE.toFixed(2)}e)
                      </span>
                      {isActive ? (
                        <span className="bg-[#001428] text-white px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                          LIVE STAGE
                        </span>
                      ) : (
                        <span className="text-[#21a173] font-bold text-[11px]">
                          PASS
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Statutory Legal Vault & Pan-India Grid (3 cols) */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* Form VIII Statutory Certificate Card */}
          <div className="bg-white rounded border border-[#c3c6ce]/30 shadow-md p-4 relative overflow-hidden">
            {/* Watermark accent */}
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[#dce9ff]/30 pointer-events-none flex items-center justify-center">
              <span className="material-symbols-outlined text-[64px] text-[#001428]/10">verified</span>
            </div>

            <div className="flex flex-col items-center text-center pb-2">
              <div className="w-11 h-11 rounded-full bg-[#001428] flex items-center justify-center mb-1.5 shadow-sm text-white">
                <span className="material-symbols-outlined text-[24px]">balance</span>
              </div>
              <span className="font-mono text-[10px] text-[#43474d] uppercase tracking-widest font-semibold">
                Schedule VIII • Rule 24
              </span>
              <span className="text-[16px] font-bold text-[#001428]">Certificate of Verification</span>
              <span className="font-mono text-[11px] text-[#006781] font-semibold">
                CERT NO: IND/LM/DL/2026/049182
              </span>
            </div>

            <div className="space-y-1 my-2.5 font-mono text-[12px]">
              <div className="flex justify-between items-center p-1.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20">
                <span className="text-[#43474d] font-sans text-[11px]">Issuer:</span>
                <span className="font-semibold text-[#001428]">LM Dept, Delhi</span>
              </div>
              <div className="flex justify-between items-center p-1.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20">
                <span className="text-[#43474d] font-sans text-[11px]">Standard Weight Ref:</span>
                <span className="font-semibold text-[#001428]">NPL-F1-98442</span>
              </div>
              <div className="flex justify-between items-center p-1.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20">
                <span className="text-[#43474d] font-sans text-[11px]">Valid Until:</span>
                <span className="font-semibold text-[#21a173]">25-FEB-2027</span>
              </div>
              <div className="flex justify-between items-center p-1.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20">
                <span className="text-[#43474d] font-sans text-[11px]">Ledger Block:</span>
                <span className="font-semibold text-[#001428]">Hyperledger #1,409,218</span>
              </div>
            </div>

            {/* QR Code Verification Box */}
            <div className="p-2.5 bg-[#eff4ff] rounded border border-[#c3c6ce]/20 flex items-center gap-2.5 my-1.5">
              <div className="w-14 h-14 bg-white p-1 rounded flex-shrink-0 flex items-center justify-center border border-[#c3c6ce]/30 shadow-xs">
                <svg className="w-full h-full text-[#001428]" fill="currentColor" viewBox="0 0 40 40">
                  <path d="M0 0h16v16H0zM4 4h8v8H4zM24 0h16v16H24zM28 4h8v8h-8zM0 24h16v16H0zM4 28h8v8H4zM24 24h6v6h-6zM34 24h6v6h-6zM24 34h6v6h-6zM34 34h6v6h-6zM18 4h4v4h-4zM18 12h4v4h-4zM18 20h4v4h-4zM4 18h4v4H4zM12 18h4v4h-4zM26 18h6v4h-6zM32 20h8v4h-8zM18 28h4v4h-4zM18 36h4v4h-4z" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[9px] text-[#006781] uppercase font-bold">
                  DigiLocker • Citizen Scan
                </span>
                <span className="font-mono text-[10px] text-[#43474d] truncate">
                  0x9F4CB821A8F732DE09B2
                </span>
                <span className="text-[10px] text-[#21a173] font-semibold mt-0.5 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                  Crypto-Stamped
                </span>
              </div>
            </div>

            {/* Inspector Stamp */}
            <div className="mt-2.5 pt-2 border-t border-[#c3c6ce]/20 flex items-center justify-between text-[12px]">
              <div className="flex flex-col">
                <span className="font-bold text-[#001428] text-[12px]">Dr. V. Ramanathan</span>
                <span className="text-[10px] text-[#43474d]">Director • Legal Metrology</span>
              </div>
              <div className="w-16 h-9 border border-dashed border-[#21a173] rounded flex items-center justify-center bg-[#21a173]/10">
                <span className="font-mono text-[8px] text-[#21a173] font-bold uppercase text-center leading-tight">
                  SEALED<br />2026-GOI
                </span>
              </div>
            </div>
          </div>

          {/* National Surveillance Grid Telemetry Feed */}
          <div className="bg-white rounded border border-[#c3c6ce]/30 shadow-sm p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006781] text-[20px]">travel_explore</span>
                <span className="font-bold text-[15px] text-[#001428]">National Surveillance Feed</span>
              </div>
              <span className="font-mono text-[9px] bg-[#8fdfff]/30 text-[#00647d] px-1.5 py-0.5 rounded font-bold">
                LIVE GRID
              </span>
            </div>
            <p className="text-[11px] text-[#43474d]">
              Real-time compliance monitoring across wholesale mandis, state borders, and automated weighbridges:
            </p>

            <div className="space-y-1.5 font-mono text-[12px]">
              <div className="p-2 bg-[#eff4ff] rounded border border-[#c3c6ce]/20 flex items-center justify-between">
                <span className="font-medium text-[#0b1c30] font-sans text-[12px]">Delhi APMC Mandi</span>
                <span className="text-[#21a173] font-bold">99.4% Valid</span>
              </div>
              <div className="p-2 bg-[#eff4ff] rounded border border-[#c3c6ce]/20 flex items-center justify-between">
                <span className="font-medium text-[#0b1c30] font-sans text-[12px]">Punjab Grain Silos</span>
                <span className="text-[#21a173] font-bold">98.2% Valid</span>
              </div>
              <div className="p-2 bg-[#eff4ff] rounded border border-[#c3c6ce]/20 flex items-center justify-between">
                <span className="font-medium text-[#0b1c30] font-sans text-[12px]">Maharashtra Ports</span>
                <span className="text-[#21a173] font-bold">97.8% Valid</span>
              </div>
            </div>

            {/* Economic Leakage Metric */}
            <div className="p-3 bg-[#001428] text-white rounded flex flex-col gap-0.5 shadow-sm mt-1">
              <span className="text-[10px] text-[#b0c9e8] uppercase tracking-wider font-semibold font-mono">
                Est. Economic Leakage Prevented
              </span>
              <span className="font-mono text-[20px] text-[#85f8c4] font-bold">
                ₹4,280.45 Crore
              </span>
              <span className="text-[10px] text-[#cbdbf5]">
                Calculated via OIML R-76 statutory accuracy enforcements
              </span>
            </div>
          </div>

          {/* 100% Deterministic Core Pill */}
          <div className="bg-[#eff4ff] p-3 rounded border border-[#c3c6ce]/30 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#001428] text-[22px]">verified</span>
            <div className="flex flex-col">
              <span className="font-bold text-[12px] text-[#001428]">100% Deterministic Core</span>
              <span className="text-[10px] text-[#43474d]">
                Zero LLM hallucinations in metrology arithmetic • Pure statutory algorithms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Regulatory Verification & Audit Ledger Log */}
      <div className="mt-6 bg-white rounded border border-[#c3c6ce]/30 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 mb-3 bg-[#eff4ff] -mx-4 -mt-4 px-4 pt-3 border-b border-[#c3c6ce]/20 rounded-t">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006781] text-[20px]">terminal</span>
            <span className="font-bold text-[15px] text-[#001428]">
              Statutory Traceability Log • Immutable Audit Trail
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#43474d] flex-wrap">
            <span className="truncate max-w-md">
              HASH: SHA-256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </span>
            <span className="bg-[#21a173] text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
              SYNCED
            </span>
          </div>
        </div>

        {/* Monospaced High-Density Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[12px]">
            <thead className="text-[#43474d] text-[11px] uppercase tracking-wider bg-[#eff4ff] border-b border-[#c3c6ce]/30">
              <tr>
                <th className="py-2 px-3">Timestamp (UTC+5:30)</th>
                <th className="py-2 px-3">Test Vector</th>
                <th className="py-2 px-3">Clause</th>
                <th className="py-2 px-3">Standard (L)</th>
                <th className="py-2 px-3">Indic (I)</th>
                <th className="py-2 px-3">ΔL (Turn)</th>
                <th className="py-2 px-3">Corrected Error (Ec)</th>
                <th className="py-2 px-3">MPE Limit</th>
                <th className="py-2 px-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6ce]/20 text-[#0b1c30]">
              {auditTrail.map((record, index) => (
                <tr key={record.id || index} className="hover:bg-[#eff4ff]/60 transition-colors">
                  <td className="py-2 px-3 text-[#43474d] whitespace-nowrap">{record.timestamp}</td>
                  <td className="py-2 px-3 font-bold text-[#001428] font-sans">{record.testVector}</td>
                  <td className="py-2 px-3 text-[#006781]">{record.clause}</td>
                  <td className="py-2 px-3">{record.standardLoadKg}</td>
                  <td className="py-2 px-3">{record.indicationKg}</td>
                  <td className="py-2 px-3">{record.deltaLTurn_g}</td>
                  <td className="py-2 px-3 text-[#006781] font-bold">{record.correctedErrorEc}</td>
                  <td className="py-2 px-3">{record.mpeLimit}</td>
                  <td className="py-2 px-3">
                    <span className="text-[#21a173] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      {record.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
