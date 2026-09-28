import React, { useState } from 'react';
import { UserPersona } from '../types/metrology';

interface MinistryConsumerFoodCommandProps {
  currentPersona?: UserPersona | null;
  onOpenGrievanceModal?: () => void;
}

type MinistryHub = 'farmer-msp' | 'fps-ration' | 'jago-grahak' | 'pmd-packaged';

interface CitizenGrievance {
  id: string;
  category: 'PETROL_PUMP' | 'PACKAGED_GOODS' | 'LPG_CYLINDER' | 'SWEET_SHOP' | 'MANDI_GRAIN';
  title: string;
  complainant: string;
  location: string;
  reportedShortage: string;
  statutoryClause: string;
  timestamp: string;
  status: 'INVESTIGATING' | 'RAID_EXECUTED' | 'SEIZED_COMPOUNDED' | 'RESOLVED';
  penaltyAmountRs?: number;
}

const INITIAL_GRIEVANCES: CitizenGrievance[] = [
  {
    id: 'NCH-2026-9182',
    category: 'PETROL_PUMP',
    title: 'Fuel Dispenser Delivering -45ml Short on Every 5 Litre Delivery',
    complainant: 'Rajesh Sharma (Consumer Rights Forum)',
    location: 'Highway Fuel Point, NH-44 Ambala, Haryana',
    reportedShortage: '45 ml short per 5000 ml (0.9% shortfall, MPE limit is ±25 ml)',
    statutoryClause: 'Section 15, LM Act 2009 & Rule 24 Schedule VIII',
    timestamp: '18 mins ago',
    status: 'INVESTIGATING',
  },
  {
    id: 'NCH-2026-8841',
    category: 'PACKAGED_GOODS',
    title: 'Packaged Chakki Atta 10kg Bag Weighs 9.32kg (680g Missing)',
    complainant: 'Sunita Devi (Homemaker & Citizen)',
    location: 'Super Bazaar, Dadar West, Mumbai',
    reportedShortage: '680g under net declared quantity (Allowed MPE is 150g)',
    statutoryClause: 'Legal Metrology (Packaged Commodities) Rules, 2011 Rule 18',
    timestamp: '42 mins ago',
    status: 'INVESTIGATING',
  },
  {
    id: 'NCH-2026-8219',
    category: 'LPG_CYLINDER',
    title: 'Domestic LPG Cylinder (14.2 kg) Delivered with 1.35 kg Short Gas',
    complainant: 'Arun Patel',
    location: 'Indane Gas Agency Route #4, Ahmedabad, Gujarat',
    reportedShortage: 'Net gas 12.85 kg vs 14.2 kg statutory tare weight stamp',
    statutoryClause: 'Section 30 (Penalty for using non-standard weight) LM Act',
    timestamp: '2 hours ago',
    status: 'SEIZED_COMPOUNDED',
    penaltyAmountRs: 25000,
  },
  {
    id: 'NCH-2026-7904',
    category: 'SWEET_SHOP',
    title: 'Mithai Box Tare Weight (140g Cardboard) Charged as Kaju Katli (₹1,100/kg)',
    complainant: 'Kavita Verma',
    location: 'Royal Sweets, Chandni Chowk, Delhi',
    reportedShortage: 'Box weighed with sweets; consumer overcharged ₹154 per 1kg box',
    statutoryClause: 'Legal Metrology (General) Rules 2011 Rule 23 (Net Weight)',
    timestamp: '4 hours ago',
    status: 'SEIZED_COMPOUNDED',
    penaltyAmountRs: 15000,
  },
  {
    id: 'NCH-2026-7640',
    category: 'MANDI_GRAIN',
    title: 'Grain Bag Weighbridge Showing -1.2kg on Every 50kg Paddy Gunny Bag',
    complainant: 'Harpreet Singh (Bhartiya Kisan Union)',
    location: 'Kharar APMC Mandi, Punjab',
    reportedShortage: '1.2 kg deducted per bag under guise of moisture & dust',
    statutoryClause: 'Section 15 & Section 24, Legal Metrology Act 2009',
    timestamp: '5 hours ago',
    status: 'RAID_EXECUTED',
    penaltyAmountRs: 50000,
  },
];

export const MinistryConsumerFoodCommand: React.FC<MinistryConsumerFoodCommandProps> = ({
  currentPersona,
}) => {
  const [activeHub, setActiveHub] = useState<MinistryHub>('farmer-msp');

  // Hub 1: Farmer MSP & Mandi Calculator State
  const [cropType, setCropType] = useState<string>('WHEAT');
  const [farmerLotQuintals, setFarmerLotQuintals] = useState<number>(120);
  const [underWeighingPct, setUnderWeighingPct] = useState<number>(0.8); // 0.8% under-reading
  const [restitutionGenerated, setRestitutionGenerated] = useState<boolean>(false);

  const CROP_MSP_RATES: Record<string, { name: string; msp: number; season: string }> = {
    WHEAT: { name: 'Wheat (Rabi)', msp: 2275, season: 'RMS 2025-26' },
    PADDY_COMMON: { name: 'Paddy Common (Kharif)', msp: 2300, season: 'KMS 2025-26' },
    MUSTARD: { name: 'Mustard / Rapeseed', msp: 5650, season: 'RMS 2025-26' },
    CHANA: { name: 'Chana / Gram', msp: 5440, season: 'RMS 2025-26' },
    SOYABEAN: { name: 'Soyabean (Yellow)', msp: 4892, season: 'KMS 2025-26' },
    MAIZE: { name: 'Maize (Makka)', msp: 2090, season: 'KMS 2025-26' },
  };

  const selectedCrop = CROP_MSP_RATES[cropType];
  const trueWeightKg = farmerLotQuintals * 100;
  const recordedWeightKg = trueWeightKg * (1 - underWeighingPct / 100);
  const stolenWeightKg = trueWeightKg - recordedWeightKg;
  const stolenWeightQuintals = stolenWeightKg / 100;
  const farmerLossAmountRs = Math.round(stolenWeightQuintals * selectedCrop.msp);
  const totalLegitimatePayoutRs = Math.round(farmerLotQuintals * selectedCrop.msp);

  // Hub 2: FPS Ration e-PoS State
  const [selectedStateFPS, setSelectedStateFPS] = useState<string>('UP');
  const [fpsInspecting, setFpsInspecting] = useState<boolean>(false);
  const [fpsResult, setFpsResult] = useState<{
    shopCode: string;
    dealerName: string;
    allottedKg: number;
    deliveredKg: number;
    tareDetectedG: number;
    status: 'VERIFIED' | 'TAMPERED_LOCKED';
    lockoutMessage?: string;
  } | null>(null);

  const FPS_DATA: Record<string, { state: string; shop: string; dealer: string; quotaKg: number; typicalErrorG: number }> = {
    UP: { state: 'Uttar Pradesh', shop: 'FPS-UP-VAR-1082', dealer: 'Shree Kashi Annapurna Sahakari Samiti', quotaKg: 35, typicalErrorG: 750 },
    BIHAR: { state: 'Bihar', shop: 'FPS-BH-PAT-4029', dealer: 'Patna Gramin Mahila Kalyan Kendra', quotaKg: 35, typicalErrorG: 950 },
    MP: { state: 'Madhya Pradesh', shop: 'FPS-MP-IND-0812', dealer: 'Malwa Kisan Seva Samiti', quotaKg: 35, typicalErrorG: 220 },
    MAHA: { state: 'Maharashtra', shop: 'FPS-MH-PUN-3310', dealer: 'Shivaji Maharaj Annachhatra Kendra', quotaKg: 35, typicalErrorG: 180 },
    WB: { state: 'West Bengal', shop: 'FPS-WB-HOW-0192', dealer: 'Howrah Central Consumers Co-op', quotaKg: 35, typicalErrorG: 820 },
  };

  const handleTestFPSScale = () => {
    setFpsInspecting(true);
    setFpsResult(null);
    setTimeout(() => {
      setFpsInspecting(false);
      const data = FPS_DATA[selectedStateFPS];
      const isTampered = data.typicalErrorG > 400; // Over 400g tare diversion
      setFpsResult({
        shopCode: data.shop,
        dealerName: data.dealer,
        allottedKg: data.quotaKg,
        deliveredKg: isTampered ? Number((data.quotaKg - data.typicalErrorG / 1000).toFixed(2)) : data.quotaKg,
        tareDetectedG: data.typicalErrorG,
        status: isTampered ? 'TAMPERED_LOCKED' : 'VERIFIED',
        lockoutMessage: isTampered
          ? `STATUTORY LOCKOUT ACTIVATED: Scale at ${data.shop} diverted ${data.typicalErrorG}g per bag by manipulating gunny tare. e-PoS terminal locked under Section 15 of Legal Metrology Act, 2009. District Supply Officer (DSO) notified.`
          : undefined,
      });
    }, 1200);
  };

  // Hub 3: Jago Grahak Jago Grievances & Raid Simulator
  const [grievances, setGrievances] = useState<CitizenGrievance[]>(INITIAL_GRIEVANCES);
  const [activeRaidGrievance, setActiveRaidGrievance] = useState<CitizenGrievance | null>(null);
  const [raidStep, setRaidStep] = useState<number>(0);
  const [isExecutingRaid, setIsExecutingRaid] = useState<boolean>(false);

  const handleStartRaid = (grievance: CitizenGrievance) => {
    setActiveRaidGrievance(grievance);
    setRaidStep(1);
  };

  const handleExecuteRaidStep = (stepNumber: number) => {
    setIsExecutingRaid(true);
    setTimeout(() => {
      setIsExecutingRaid(false);
      if (stepNumber === 4) {
        // Finalize raid
        if (activeRaidGrievance) {
          setGrievances((prev) =>
            prev.map((g) =>
              g.id === activeRaidGrievance.id
                ? {
                    ...g,
                    status: 'SEIZED_COMPOUNDED',
                    penaltyAmountRs: 35000,
                  }
                : g
            )
          );
        }
        setRaidStep(4);
      } else {
        setRaidStep(stepNumber + 1);
      }
    }, 800);
  };

  // Hub 4: PMD & Packaged Commodities State
  const [packageProduct, setPackageProduct] = useState<string>('OIL_1L');
  const [packageTestResult, setPackageTestResult] = useState<{
    declaredQty: string;
    measuredQty: string;
    tareContainer: string;
    mpeAllowedG: number;
    deviationG: number;
    unitSalePricePrinted: boolean;
    isCompliant: boolean;
    statutoryRemarks: string;
  } | null>(null);

  const PACKAGE_ITEMS: Record<string, { name: string; declared: string; measured: string; tare: string; mpe: number; unitPrice: boolean; compliant: boolean; remarks: string }> = {
    OIL_1L: {
      name: 'Mustard Oil Pouch (1 Litre / 910g)',
      declared: '1000 ml (910 g net)',
      measured: '878 g net (965 ml)',
      tare: '12 g (poly-pouch)',
      mpe: 15,
      unitPrice: true,
      compliant: false,
      remarks: 'Violation of Schedule II: Deficit of 32g exceeds allowed negative error of 15g. Notice issued to Packaging Unit.',
    },
    ATTA_10KG: {
      name: 'Whole Wheat Chakki Atta (10 kg bag)',
      declared: '10.00 kg net',
      measured: '9.98 kg net',
      tare: '65 g (woven HDPE sack)',
      mpe: 150,
      unitPrice: true,
      compliant: true,
      remarks: 'Compliant with Rule 18: Measured deficit of 20g is well within allowable tolerance limit of 150g.',
    },
    TOOR_DAL_1KG: {
      name: 'Desi Toor / Arhar Dal (1 kg poly-pack)',
      declared: '1000 g net',
      measured: '992 g net',
      tare: '8 g (plastic laminate)',
      mpe: 15,
      unitPrice: true,
      compliant: true,
      remarks: 'Compliant: Error (-8g) within Rule 18 allowable negative error margin of 15g.',
    },
    SUGAR_5KG: {
      name: 'Refined White Sugar (5 kg bag)',
      declared: '5000 g net',
      measured: '4890 g net',
      tare: '40 g (bag)',
      mpe: 75,
      unitPrice: false,
      compliant: false,
      remarks: 'Double Infraction: Net deficit 110g exceeds MPE (75g), and mandatory Unit Sale Price (₹/kg) is missing from packaging.',
    },
  };

  const handleTestPackagedItem = () => {
    const item = PACKAGE_ITEMS[packageProduct];
    setPackageTestResult({
      declaredQty: item.declared,
      measuredQty: item.measured,
      tareContainer: item.tare,
      mpeAllowedG: item.mpe,
      deviationG: item.compliant ? -20 : -110,
      unitSalePricePrinted: item.unitPrice,
      isCompliant: item.compliant,
      statutoryRemarks: item.remarks,
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-14 animate-in fade-in duration-200">
      {/* Official Ministry Banner & Emblem Header */}
      <div className="bg-[#001428] text-white p-6 rounded-2xl border border-[#0f2942] shadow-xl relative overflow-hidden">
        {/* Subtle Ashoka & Scales Background Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-5 pointer-events-none flex items-center justify-center text-[180px]">
          ⚖️
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#006781] text-white flex items-center justify-center text-[28px] shadow-md shrink-0 border border-white/20">
              <span className="material-symbols-outlined text-[32px]">policy</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold bg-[#8fdfff] text-[#001428] px-2 py-0.5 rounded uppercase tracking-wider">
                  GOVERNMENT OF INDIA
                </span>
                <span className="text-[11px] text-[#cbdbf5] font-mono">
                  MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
                </span>
              </div>
              <h1 className="text-[22px] sm:text-[24px] font-extrabold text-white mt-1 leading-tight tracking-tight">
                Citizen, Farmer & Public Distribution Command Cockpit
              </h1>
              <p className="text-[12px] sm:text-[13px] text-[#cbdbf5] max-w-3xl mt-0.5 leading-normal">
                Unified enforcement architecture uniting the <strong>Department of Consumer Affairs (DoCA)</strong> Legal Metrology Division with the <strong>Department of Food and Public Distribution (DFPD)</strong> for farmer MSP protection, PMGKAY Fair Price Shop integrity, and citizen grievance redressal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <div className="bg-[#002e1d] border border-[#21a173]/40 px-3.5 py-2 rounded-xl text-right">
              <div className="text-[10px] font-mono text-[#85f8c4] uppercase font-bold flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-[#21a173] animate-pulse" />
                <span>CENTRAL STATUTORY GUARD</span>
              </div>
              <div className="text-[13px] font-mono font-bold text-white">
                OIML R-76 & NFSA 2013
              </div>
            </div>
          </div>
        </div>

        {/* 4 Big Ministry Relatability Stat Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-[12px]">
          <div className="flex flex-col">
            <span className="text-[#cbdbf5] text-[11px]">PMGKAY Ration Beneficiaries</span>
            <span className="text-white font-mono font-bold text-[18px]">81.35 Crore Citizens</span>
            <span className="text-[#85f8c4] text-[10px] font-mono">Protected from bag-shaving</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#cbdbf5] text-[11px]">Fair Price Shops (FPS) Active</span>
            <span className="text-white font-mono font-bold text-[18px]">5.43 Lakh e-PoS Units</span>
            <span className="text-[#8fdfff] text-[10px] font-mono">20Hz Tare Calibration Sync</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#cbdbf5] text-[11px]">Farmer MSP Grain Safeguarded</span>
            <span className="text-white font-mono font-bold text-[18px]">₹8,420+ Crore / Year</span>
            <span className="text-[#85f8c4] text-[10px] font-mono">Eliminating -0.8% Mandi drift</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#cbdbf5] text-[11px]">National Consumer Helpline (NCH)</span>
            <span className="text-white font-mono font-bold text-[18px]">Dial 1915 • e-Daakhil</span>
            <span className="text-[#ffd043] text-[10px] font-mono">Instant Flying Squad Raids</span>
          </div>
        </div>
      </div>

      {/* 4 Interactive Hub Selection Tabs */}
      <div className="bg-white p-2 rounded-xl border border-[#c3c6ce]/30 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveHub('farmer-msp')}
          className={`flex-1 min-w-[200px] py-2.5 px-3 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeHub === 'farmer-msp'
              ? 'bg-[#001428] text-white shadow-sm'
              : 'hover:bg-[#eff4ff] text-[#43474d]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">agriculture</span>
          <span>1. Farmer MSP & Mandi Shield</span>
        </button>

        <button
          onClick={() => setActiveHub('fps-ration')}
          className={`flex-1 min-w-[200px] py-2.5 px-3 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeHub === 'fps-ration'
              ? 'bg-[#001428] text-white shadow-sm'
              : 'hover:bg-[#eff4ff] text-[#43474d]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          <span>2. FPS Ration e-PoS Guard</span>
        </button>

        <button
          onClick={() => setActiveHub('jago-grahak')}
          className={`flex-1 min-w-[220px] py-2.5 px-3 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeHub === 'jago-grahak'
              ? 'bg-[#001428] text-white shadow-sm'
              : 'hover:bg-[#eff4ff] text-[#43474d]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">campaign</span>
          <span>3. Jago Grahak Jago (NCH 1915)</span>
        </button>

        <button
          onClick={() => setActiveHub('pmd-packaged')}
          className={`flex-1 min-w-[200px] py-2.5 px-3 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeHub === 'pmd-packaged'
              ? 'bg-[#001428] text-white shadow-sm'
              : 'hover:bg-[#eff4ff] text-[#43474d]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          <span>4. PMD Packaged Commodities</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* HUB 1: FARMER MSP & MANDI WEIGHMENT SHIELD */}
      {/* ========================================================================= */}
      {activeHub === 'farmer-msp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          {/* Left Column: Interactive Farmer Loss Calculator */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#c3c6ce]/30 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[24px] text-[#006781]">calculate</span>
                <div>
                  <h2 className="text-[16px] font-bold text-[#001428]">
                    Kisan Tol Suraksha: Mandi Weighbridge Deficit Calculator
                  </h2>
                  <span className="text-[11px] text-[#43474d]">
                    Simulate how illegal weighbridge under-weighing systematically extracts money from small farmers during Rabi/Kharif procurement.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#eff4ff] text-[#006781] px-2 py-1 rounded border border-[#c3c6ce]/30">
                FCI & APMC DIRECTIVE
              </span>
            </div>

            {/* Crop Selector */}
            <div>
              <label className="block text-[12px] font-semibold text-[#001428] mb-1.5">
                Select Procurement Crop & Central Govt MSP Rate (2025-26):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(CROP_MSP_RATES).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCropType(key);
                      setRestitutionGenerated(false);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      cropType === key
                        ? 'bg-[#001428] text-white border-[#001428] shadow-xs'
                        : 'bg-[#eff4ff] hover:bg-[#dce9ff] text-[#001428] border-[#c3c6ce]/30'
                    }`}
                  >
                    <div className="text-[12px] font-bold leading-tight">{item.name}</div>
                    <div className="text-[11px] font-mono opacity-80 mt-0.5">
                      ₹{item.msp.toLocaleString()} / Quintal
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders for Lot Size & Error */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f9ff] p-4 rounded-xl border border-[#c3c6ce]/30">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-semibold text-[#001428]">Farmer Harvest Lot Size:</span>
                  <span className="font-mono text-[13px] font-bold text-[#006781]">
                    {farmerLotQuintals} Quintals ({farmerLotQuintals * 100} kg)
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={farmerLotQuintals}
                  onChange={(e) => {
                    setFarmerLotQuintals(Number(e.target.value));
                    setRestitutionGenerated(false);
                  }}
                  className="w-full accent-[#006781] cursor-pointer"
                />
                <span className="text-[10px] text-[#74777e] mt-1 block">
                  Typical tractor trolley = 40-80 Qtl; Truck load = 120-250 Qtl
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-semibold text-[#001428]">Tampered Weighbridge Under-reading:</span>
                  <span className="font-mono text-[13px] font-bold text-[#ba1a1a]">
                    -{underWeighingPct.toFixed(1)}% error
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={2.5}
                  step={0.1}
                  value={underWeighingPct}
                  onChange={(e) => {
                    setUnderWeighingPct(Number(e.target.value));
                    setRestitutionGenerated(false);
                  }}
                  className="w-full accent-[#ba1a1a] cursor-pointer"
                />
                <span className="text-[10px] text-[#74777e] mt-1 block">
                  Legal MPE for Class III weighbridge = ±0.15% Max
                </span>
              </div>
            </div>

            {/* Impact Calculation Output */}
            <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#c3c6ce]/40 flex flex-col gap-3">
              <span className="text-[11px] font-mono font-bold uppercase text-[#006781]">
                Real-Time Evidentiary Impact Matrix:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-[#c3c6ce]/30">
                  <span className="text-[10px] text-[#74777e] block">True Gross Load</span>
                  <span className="text-[14px] font-mono font-bold text-[#001428]">{trueWeightKg.toLocaleString()} kg</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#c3c6ce]/30">
                  <span className="text-[10px] text-[#74777e] block">Weighbridge Stamped</span>
                  <span className="text-[14px] font-mono font-bold text-[#43474d]">{Math.round(recordedWeightKg).toLocaleString()} kg</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#c3c6ce]/30">
                  <span className="text-[10px] text-[#ba1a1a] font-semibold block">Missing Grain</span>
                  <span className="text-[14px] font-mono font-bold text-[#ba1a1a]">-{Math.round(stolenWeightKg)} kg</span>
                </div>
                <div className="bg-[#ba1a1a] text-white p-2.5 rounded-lg shadow-xs">
                  <span className="text-[10px] text-white/80 block">Farmer Loss</span>
                  <span className="text-[15px] font-mono font-bold text-white">₹{farmerLossAmountRs.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[12px] text-[#43474d] leading-relaxed pt-1">
                <strong>Statutory Reality:</strong> On a single harvest load of {farmerLotQuintals} Quintals, an illegal -{underWeighingPct}% calibration offset robs this farmer of <strong>₹{farmerLossAmountRs.toLocaleString()}</strong> ({Math.round(stolenWeightKg)} kg of {selectedCrop.name}). Across 2,400+ mandis, this accounts for over ₹4,280 Crore in annual farmer exploitation.
              </div>
            </div>

            {/* Action Button: Generate Restitution Order */}
            <div className="flex justify-end">
              <button
                onClick={() => setRestitutionGenerated(true)}
                className="px-5 py-2.5 bg-[#001428] hover:bg-[#006781] text-white text-[13px] font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                <span>Issue Statutory Restitution & Seizure Notice (Sec. 15)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Restitution Notice & Enforcement Card */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {restitutionGenerated ? (
              <div className="bg-[#fffdf5] border-2 border-[#b68800] p-5 rounded-2xl shadow-md flex flex-col gap-3 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-[#b68800]/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">⚖️</span>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-[#735100]">
                        FORM IV • RECOVERY NOTICE
                      </span>
                      <h3 className="text-[14px] font-bold text-[#001428] leading-tight">
                        Statutory Mandi Farmer Restitution Order
                      </h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#735100] text-white px-2 py-0.5 rounded">
                    ENFORCEABLE
                  </span>
                </div>

                <div className="font-mono text-[11px] text-[#3e2c00] space-y-1.5 bg-white/70 p-3 rounded-lg border border-[#b68800]/20">
                  <div className="flex justify-between">
                    <span>ORDER REF:</span>
                    <span className="font-bold">LMD-REST-2026-FCI-{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STATUTE:</span>
                    <span>Legal Metrology Act, 2009 (Sec. 15, 24 & 30)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>APMC MANDI:</span>
                    <span className="font-bold">Azadpur Wholesale Mandi (Delhi Node 01)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CROP COMMODITY:</span>
                    <span>{selectedCrop.name} ({selectedCrop.season})</span>
                  </div>
                  <div className="flex justify-between border-t border-[#b68800]/30 pt-1 text-[#ba1a1a]">
                    <span>UNLAWFUL SHORTAGE:</span>
                    <span className="font-bold">-{Math.round(stolenWeightKg)} kg ({stolenWeightQuintals.toFixed(2)} Qtl)</span>
                  </div>
                  <div className="flex justify-between text-[#002e1d] font-bold text-[12px] bg-[#d5f7e6] p-1.5 rounded">
                    <span>IMMEDIATE FARMER REFUND:</span>
                    <span>₹{farmerLossAmountRs.toLocaleString()} + 18% p.a.</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#553c00] leading-relaxed">
                  <strong>Order Directive:</strong> The mandi license holder is hereby directed to immediately credit <strong>₹{farmerLossAmountRs.toLocaleString()}</strong> to the farmer's DBT bank account within 24 hours. The weighbridge has been sealed with an tamper-evident digital seal. Failure to comply invokes prosecution under Section 30 with fine up to ₹50,000 and imprisonment up to 1 year.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#b68800]/20 text-[10px] font-mono text-[#735100]">
                  <span>OFFICER BADGE: {currentPersona?.badgeCode || 'LMD-IND-2026-001'}</span>
                  <span>DISPATCHED TO PFMS / DBT</span>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl border border-[#c3c6ce]/30 shadow-xs flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-[#eff4ff] text-[#006781] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">verified</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#001428]">
                  How ManoSetu-NAWI Protects Farmers at Mandis
                </h3>
                <p className="text-[12px] text-[#43474d] leading-relaxed">
                  Traditional mandi weighbridges are checked only once a year during annual re-stamping. Unscrupulous operators insert hidden 433 MHz RF relay chips or calibrate load-cells with an artificial zero-offset to shave 0.5% - 2.0% off every incoming farmer's harvest.
                </p>
                <div className="bg-[#eff4ff] p-3 rounded-lg border border-[#c3c6ce]/30 text-[11px] text-[#001428] space-y-1">
                  <div className="font-bold flex items-center gap-1 text-[#006781]">
                    <span className="material-symbols-outlined text-[14px]">shield</span>
                    <span>ManoSetu Central Safeguards:</span>
                  </div>
                  <div>• 20Hz continuous serial telemetry logs true weight prior to printing ticket.</div>
                  <div>• 350Ω Wheatstone bridge impedance monitor detects physical resistor taps.</div>
                  <div>• Automated MSP calculation matches e-NAM and FCI procurement databases.</div>
                </div>
              </div>
            )}

            {/* Quick Mandi Enforcement Stats */}
            <div className="bg-white p-4 rounded-xl border border-[#c3c6ce]/30 shadow-xs flex flex-col gap-2">
              <span className="text-[11px] font-mono font-bold text-[#74777e] uppercase">
                2025-26 Mandi Enforcement Tracker:
              </span>
              <div className="flex justify-between items-center text-[12px] border-b border-[#c3c6ce]/20 pb-1.5">
                <span className="text-[#43474d]">APMC Mandis Integrated:</span>
                <span className="font-mono font-bold text-[#001428]">2,418 wholesale mandis</span>
              </div>
              <div className="flex justify-between items-center text-[12px] border-b border-[#c3c6ce]/20 pb-1.5">
                <span className="text-[#43474d]">Direct DBT Restitutions Paid:</span>
                <span className="font-mono font-bold text-[#21a173]">₹42.8 Crore refunded to farmers</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-[#43474d]">Illegal RF Shunts Confiscated:</span>
                <span className="font-mono font-bold text-[#ba1a1a]">842 bypass modules seized</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HUB 2: FAIR PRICE SHOP (FPS) e-PoS WEIGHING GUARD */}
      {/* ========================================================================= */}
      {activeHub === 'fps-ration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#c3c6ce]/30 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[24px] text-[#006781]">storefront</span>
                <div>
                  <h2 className="text-[16px] font-bold text-[#001428]">
                    PMGKAY Fair Price Shop (FPS) e-PoS Scale Sentinel
                  </h2>
                  <span className="text-[11px] text-[#43474d]">
                    Eliminating "Ration Shaving" in subsidized rice and wheat distributed under the National Food Security Act (NFSA 2013).
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#eff4ff] text-[#006781] px-2 py-1 rounded border border-[#c3c6ce]/30">
                5.43 LAKH SHOPS
              </span>
            </div>

            {/* Select State & Shop */}
            <div>
              <label className="block text-[12px] font-semibold text-[#001428] mb-1.5">
                Select State & Monitored Fair Price Shop (FPS) Node:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(FPS_DATA).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedStateFPS(key);
                      setFpsResult(null);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedStateFPS === key
                        ? 'bg-[#001428] text-white border-[#001428] shadow-xs'
                        : 'bg-[#eff4ff] hover:bg-[#dce9ff] text-[#001428] border-[#c3c6ce]/30'
                    }`}
                  >
                    <div className="text-[12px] font-bold">{item.state}</div>
                    <div className="text-[10px] font-mono opacity-80 truncate">{item.shop}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Shop Information Box */}
            <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#c3c6ce]/30 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-[#74777e]">Fair Price Shop Dealer:</span>
                <span className="font-bold text-[#001428]">{FPS_DATA[selectedStateFPS].dealer}</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-[#74777e]">Monthly Grain Entitlement:</span>
                <span className="font-mono font-bold text-[#006781]">35.00 kg (Antyodaya AAY Household)</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-[#74777e]">Standard Jute Gunny Tare:</span>
                <span className="font-mono text-[#001428]">650 grams per empty sack</span>
              </div>
            </div>

            {/* Live Inspection Simulation Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#43474d]">
                Click below to send a remote audit query to this shop's e-PoS connected scale.
              </span>
              <button
                onClick={handleTestFPSScale}
                disabled={fpsInspecting}
                className="px-5 py-2.5 bg-[#001428] hover:bg-[#006781] disabled:opacity-50 text-white text-[13px] font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                {fpsInspecting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Querying e-PoS Terminal...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
                    <span>Audit FPS Scale Live (20Hz RS-232)</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Inspection Output */}
            {fpsResult && (
              <div className={`p-4 rounded-xl border animate-in fade-in duration-150 flex flex-col gap-2.5 ${
                fpsResult.status === 'VERIFIED'
                  ? 'bg-[#d5f7e6] border-[#21a173] text-[#002e1d]'
                  : 'bg-[#ffdad6] border-[#ba1a1a] text-[#410002]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[22px]">
                      {fpsResult.status === 'VERIFIED' ? 'check_circle' : 'warning'}
                    </span>
                    <span className="font-bold text-[14px]">
                      {fpsResult.status === 'VERIFIED'
                        ? 'FPS Scale Fully Compliant (OIML R-76 Approved)'
                        : 'CRITICAL FRAUD DETECTED: Illegal Tare Manipulation'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/10">
                    {fpsResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-[12px] bg-white/80 p-2.5 rounded-lg border border-current/20">
                  <div>
                    <span className="text-[10px] block opacity-70">Statutory Quota</span>
                    <span className="font-bold">{fpsResult.allottedKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] block opacity-70">Scale Dispatched</span>
                    <span className="font-bold">{fpsResult.deliveredKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] block opacity-70">Tare Offset Stolen</span>
                    <span className="font-bold">{fpsResult.tareDetectedG} grams</span>
                  </div>
                </div>

                {fpsResult.lockoutMessage && (
                  <p className="text-[11px] leading-relaxed font-semibold bg-white/60 p-2 rounded">
                    ⚠️ {fpsResult.lockoutMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: NFSA & One Nation One Ration Card Integration */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#c3c6ce]/30 shadow-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-[#eff4ff] text-[#006781] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">food_bank</span>
              </div>
              <h3 className="text-[15px] font-bold text-[#001428]">
                Why e-PoS + Electronic Scale Integration Matters
              </h3>
              <p className="text-[12px] text-[#43474d] leading-relaxed">
                Prior to electronic scale integration, dealers manually entered weight into the e-PoS while placing only 4.5kg of grain on the pan, diverting hundreds of quintals of foodgrain into black market mills every month.
              </p>
              <div className="bg-[#eff4ff] p-3 rounded-lg border border-[#c3c6ce]/30 text-[11px] text-[#001428] space-y-1">
                <div className="font-bold text-[#006781]">MoCAF&PD Mandatory Standard:</div>
                <div>• The e-PoS cannot print the ration slip until the scale reaches motion-free equilibrium.</div>
                <div>• Tare weight cannot exceed certified empty bag limits (650g jute / 80g plastic).</div>
                <div>• All transactions are recorded on the national DigiLocker and NFSA central ledger.</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#c3c6ce]/30 shadow-xs flex flex-col gap-2">
              <span className="text-[11px] font-mono font-bold text-[#74777e] uppercase">
                Annapurti (Grain ATM) Pilot Status:
              </span>
              <div className="flex justify-between items-center text-[12px] border-b border-[#c3c6ce]/20 pb-1.5">
                <span className="text-[#43474d]">Automated Grain ATMs Installed:</span>
                <span className="font-mono font-bold text-[#001428]">48 Pilot Centers</span>
              </div>
              <div className="flex justify-between items-center text-[12px] border-b border-[#c3c6ce]/20 pb-1.5">
                <span className="text-[#43474d]">Weighing Precision:</span>
                <span className="font-mono font-bold text-[#21a173]">±0.05% (Class II OIML)</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-[#43474d]">Dispensing Speed:</span>
                <span className="font-mono font-bold text-[#006781]">25 kg in 40 seconds</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HUB 3: JAGO GRAHAK JAGO & NATIONAL CONSUMER GRIEVANCE ACTION HUB (NCH 1915) */}
      {/* ========================================================================= */}
      {activeHub === 'jago-grahak' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          {/* Top Banner for Jago Grahak Jago */}
          <div className="bg-gradient-to-r from-[#001428] to-[#00344f] text-white p-5 rounded-2xl border border-[#0f2942] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#ffd043] text-[#001428] flex items-center justify-center text-[24px] font-bold shadow-md shrink-0">
                📢
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold bg-[#ffd043] text-[#001428] px-2 py-0.5 rounded uppercase">
                    JAGO GRAHAK JAGO
                  </span>
                  <span className="text-[12px] text-[#cbdbf5]">National Consumer Grievance Action Hub</span>
                </div>
                <h3 className="text-[16px] font-bold text-white mt-0.5">
                  Real-Time Short-Weighing Complaints & Flying Squad Raid Simulator
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-right">
                <span className="text-[10px] text-[#cbdbf5] block">NCH Toll-Free Helpline</span>
                <span className="font-mono font-bold text-[#ffd043] text-[15px]">DIAL 1915</span>
              </div>
            </div>
          </div>

          {/* Grievance Table & Rapid Raid Action */}
          <div className="bg-white p-5 rounded-2xl border border-[#c3c6ce]/30 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3">
              <div>
                <h3 className="text-[15px] font-bold text-[#001428]">
                  Live Statutory Grievance Inflow (Last 24 Hours)
                </h3>
                <span className="text-[11px] text-[#43474d]">
                  Citizens report petrol pump short-delivery, domestic gas underweight cylinders, grocery packaged discrepancies, and mandi cheating.
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#006781] font-bold bg-[#eff4ff] px-2.5 py-1 rounded">
                5 Active Cases Under Review
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#c3c6ce]/30 text-[#74777e] uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Subject / Incident Description</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Reported Shortage</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Enforcement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6ce]/20">
                  {grievances.map((g) => (
                    <tr key={g.id} className="hover:bg-[#f8f9ff] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#006781] whitespace-nowrap">
                        {g.id}
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-[#001428] leading-tight">{g.title}</div>
                        <div className="text-[10px] text-[#74777e] mt-0.5">By: {g.complainant}</div>
                      </td>
                      <td className="py-3 px-3 text-[#43474d] text-[11px] whitespace-nowrap">
                        {g.location}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#ba1a1a] font-semibold text-[11px]">
                        {g.reportedShortage}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          g.status === 'SEIZED_COMPOUNDED'
                            ? 'bg-[#d5f7e6] text-[#002e1d]'
                            : g.status === 'RAID_EXECUTED'
                            ? 'bg-[#ffd043]/30 text-[#553c00]'
                            : 'bg-[#ffdad6] text-[#410002]'
                        }`}>
                          {g.status.replace(/_/g, ' ')}
                        </span>
                        {g.penaltyAmountRs && (
                          <div className="text-[10px] font-mono text-[#21a173] font-bold mt-0.5">
                            Fine: ₹{g.penaltyAmountRs.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {g.status === 'INVESTIGATING' ? (
                          <button
                            onClick={() => handleStartRaid(g)}
                            className="px-3 py-1.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">local_police</span>
                            <span>Execute On-Spot Raid</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-[#21a173] font-semibold flex items-center gap-1 justify-end">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            <span>Case Compounded</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive LMO Flying Squad Raid Simulator Modal / Tray */}
          {activeRaidGrievance && raidStep > 0 && (
            <div className="fixed inset-0 z-50 bg-[#001428]/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-[#c3c6ce]/50 max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center text-[20px]">
                      <span className="material-symbols-outlined">local_police</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-[#ba1a1a] text-white px-2 py-0.5 rounded uppercase">
                        FLYING SQUAD RAID IN PROGRESS
                      </span>
                      <h3 className="text-[16px] font-bold text-[#001428] leading-tight mt-0.5">
                        {activeRaidGrievance.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveRaidGrievance(null)}
                    className="p-1 hover:bg-[#eff4ff] rounded text-[#74777e] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {/* Raid Stepper (1 to 4) */}
                <div className="flex items-center justify-between mb-5 font-mono text-[11px] border-b border-[#c3c6ce]/20 pb-3">
                  <div className={`flex items-center gap-1 font-bold ${raidStep >= 1 ? 'text-[#006781]' : 'text-[#74777e]'}`}>
                    <span>1. Calibrated Proving Test</span>
                  </div>
                  <span className="text-[#c3c6ce]">&rarr;</span>
                  <div className={`flex items-center gap-1 font-bold ${raidStep >= 2 ? 'text-[#006781]' : 'text-[#74777e]'}`}>
                    <span>2. RF Spectrum Scan</span>
                  </div>
                  <span className="text-[#c3c6ce]">&rarr;</span>
                  <div className={`flex items-center gap-1 font-bold ${raidStep >= 3 ? 'text-[#006781]' : 'text-[#74777e]'}`}>
                    <span>3. Statutory Seizure</span>
                  </div>
                  <span className="text-[#c3c6ce]">&rarr;</span>
                  <div className={`flex items-center gap-1 font-bold ${raidStep >= 4 ? 'text-[#21a173]' : 'text-[#74777e]'}`}>
                    <span>4. Penalty & Closure</span>
                  </div>
                </div>

                {/* Step Details */}
                <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#c3c6ce]/30 mb-4 text-[12px] space-y-2">
                  {raidStep === 1 && (
                    <div>
                      <h4 className="font-bold text-[#001428] text-[13px]">
                        Step 1: Volumetric & Standard Weight Proving Test
                      </h4>
                      <p className="text-[#43474d] mt-1 leading-relaxed">
                        Officers arrive with NABL-certified standard measures. A test delivery of 5000ml (5 Litres) confirms a delivery deficit of <strong>-48 ml</strong> (exceeds allowable MPE limit of ±25 ml).
                      </p>
                      <div className="font-mono text-[11px] text-[#ba1a1a] font-bold mt-2">
                        RECORDED ERROR: -0.96% (STATUTORY VIOLATION OF RULE 24)
                      </div>
                    </div>
                  )}

                  {raidStep === 2 && (
                    <div>
                      <h4 className="font-bold text-[#001428] text-[13px]">
                        Step 2: RF Spectrum & Bridge Impedance Sniffer
                      </h4>
                      <p className="text-[#43474d] mt-1 leading-relaxed">
                        The spectrum analyzer detects an unauthorized <strong>433.92 MHz pulse receiver</strong> soldered into the pulser cable junction box. An operator in the control booth was toggling short delivery via a wireless keychain remote!
                      </p>
                      <div className="font-mono text-[11px] text-[#ba1a1a] font-bold mt-2">
                        HARDWARE TAMPERING CONFIRMED (SECTION 30 VIOLATION)
                      </div>
                    </div>
                  )}

                  {raidStep === 3 && (
                    <div>
                      <h4 className="font-bold text-[#001428] text-[13px]">
                        Step 3: Physical Instrument Seizure under Section 15
                      </h4>
                      <p className="text-[#43474d] mt-1 leading-relaxed">
                        The Legal Metrology Officer applies tamper-evident lead seal #SEAL-GOI-2026-9812 to nozzle #3. A formal seizure memo (Form IV) is issued to the dealership manager.
                      </p>
                      <div className="font-mono text-[11px] text-[#006781] font-bold mt-2">
                        DISPENSER LOCKED AND VOIDED FROM COMMERCE
                      </div>
                    </div>
                  )}

                  {raidStep === 4 && (
                    <div className="text-[#002e1d]">
                      <h4 className="font-bold text-[14px] text-[#21a173]">
                        Step 4: Compounding & Case Resolved!
                      </h4>
                      <p className="mt-1 leading-relaxed">
                        The establishment has accepted compounding under Section 48 of the Legal Metrology Act, paying a statutory compounding fine of <strong>₹35,000</strong>. The complainant has been notified via SMS.
                      </p>
                      <div className="font-mono text-[11px] text-[#21a173] font-bold mt-2">
                        CASE RESOLVED • CENTRAL AUDIT TRAIL RECORDED IN MERKLE LEDGER
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] font-mono text-[#74777e]">
                    Location: {activeRaidGrievance.location}
                  </span>
                  {raidStep < 4 ? (
                    <button
                      onClick={() => handleExecuteRaidStep(raidStep)}
                      disabled={isExecutingRaid}
                      className="px-4 py-2 bg-[#001428] hover:bg-[#006781] disabled:opacity-50 text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isExecutingRaid ? (
                        <>
                          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                          <span>Executing Raid Protocol...</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to Next Step ({raidStep + 1}/4)</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveRaidGrievance(null)}
                      className="px-4 py-2 bg-[#21a173] hover:bg-[#1a835c] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Close Raid Dossier</span>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* HUB 4: PRICE MONITORING DIVISION & PACKAGED COMMODITIES (LMPC 2011) */}
      {/* ========================================================================= */}
      {activeHub === 'pmd-packaged' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#c3c6ce]/30 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[24px] text-[#006781]">inventory_2</span>
                <div>
                  <h2 className="text-[16px] font-bold text-[#001428]">
                    Packaged Commodities & Net Quantity Inspector (LMPC 2011)
                  </h2>
                  <span className="text-[11px] text-[#43474d]">
                    Inspect net quantity declarations, tare allowances, and mandatory Unit Sale Price (₹/kg or ₹/litre) under Rule 18 & Schedule II.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#eff4ff] text-[#006781] px-2 py-1 rounded border border-[#c3c6ce]/30">
                22 ESSENTIAL GOODS
              </span>
            </div>

            {/* Select Pre-packaged Good */}
            <div>
              <label className="block text-[12px] font-semibold text-[#001428] mb-1.5">
                Select Pre-Packaged Retail Product to Test:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(PACKAGE_ITEMS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setPackageProduct(key);
                      setPackageTestResult(null);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      packageProduct === key
                        ? 'bg-[#001428] text-white border-[#001428] shadow-xs'
                        : 'bg-[#eff4ff] hover:bg-[#dce9ff] text-[#001428] border-[#c3c6ce]/30'
                    }`}
                  >
                    <div className="text-[12px] font-bold">{item.name}</div>
                    <div className="text-[11px] font-mono opacity-80 mt-0.5">Declared: {item.declared}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Action */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-[#43474d]">
                Run digital net weight verification against LMPC Schedule II tolerances.
              </span>
              <button
                onClick={handleTestPackagedItem}
                className="px-5 py-2.5 bg-[#001428] hover:bg-[#006781] text-white text-[13px] font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">biotech</span>
                <span>Verify Net Quantity & Packaging</span>
              </button>
            </div>

            {/* Test Results Output */}
            {packageTestResult && (
              <div className={`p-4 rounded-xl border animate-in fade-in duration-150 flex flex-col gap-2.5 ${
                packageTestResult.isCompliant
                  ? 'bg-[#d5f7e6] border-[#21a173] text-[#002e1d]'
                  : 'bg-[#ffdad6] border-[#ba1a1a] text-[#410002]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[22px]">
                      {packageTestResult.isCompliant ? 'verified' : 'error'}
                    </span>
                    <span className="font-bold text-[14px]">
                      {packageTestResult.isCompliant
                        ? 'Pass: Compliant with Legal Metrology (Packaged Commodities) Rules'
                        : 'Fail: Non-Compliant / Deficit Beyond Allowable Tolerance'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/10">
                    {packageTestResult.isCompliant ? 'COMPLIANT' : 'INFRACTION'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-white/80 p-2.5 rounded-lg border border-current/20">
                  <div>
                    <span className="text-[10px] opacity-70 block">Declared Net</span>
                    <span className="font-bold">{packageTestResult.declaredQty}</span>
                  </div>
                  <div>
                    <span className="text-[10px] opacity-70 block">Actual Measured</span>
                    <span className="font-bold">{packageTestResult.measuredQty}</span>
                  </div>
                  <div>
                    <span className="text-[10px] opacity-70 block">Tare Packaging</span>
                    <span className="font-bold">{packageTestResult.tareContainer}</span>
                  </div>
                  <div>
                    <span className="text-[10px] opacity-70 block">Allowable MPE</span>
                    <span className="font-bold">±{packageTestResult.mpeAllowedG}g</span>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed bg-white/60 p-2 rounded">
                  <strong>Statutory Analysis:</strong> {packageTestResult.statutoryRemarks}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: 22 Essential Commodities Sentinel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#c3c6ce]/30 shadow-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-[#eff4ff] text-[#006781] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">shopping_basket</span>
              </div>
              <h3 className="text-[15px] font-bold text-[#001428]">
                Price Monitoring Division (PMD) Weight Sentinel
              </h3>
              <p className="text-[12px] text-[#43474d] leading-relaxed">
                The Department of Consumer Affairs monitors daily retail and wholesale prices for 22 essential commodities across 550+ reporting centers nationwide to detect sudden inflation and artificial shortages.
              </p>
              <div className="bg-[#eff4ff] p-3 rounded-lg border border-[#c3c6ce]/30 text-[11px] text-[#001428] space-y-1">
                <div className="font-bold text-[#006781]">Key Packaging Mandates (2022 Amendment):</div>
                <div>• Packages &gt; 1kg must state Unit Sale Price per kg (e.g. ₹68.50 / kg).</div>
                <div>• Standard pre-packed sizes (1kg, 2kg, 5kg) eliminate deceptive package sizing.</div>
                <div>• Mandatory month and year of manufacture/packaging must be clearly legible.</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#c3c6ce]/30 shadow-xs flex flex-col gap-2">
              <span className="text-[11px] font-mono font-bold text-[#74777e] uppercase">
                Packaged Commodity Verification Summary:
              </span>
              <div className="flex justify-between items-center text-[12px] border-b border-[#c3c6ce]/20 pb-1.5">
                <span className="text-[#43474d]">Market Samples Tested (FY 2025):</span>
                <span className="font-mono font-bold text-[#001428]">184,200 packages</span>
              </div>
              <div className="flex justify-between items-center text-[12px] border-b border-[#c3c6ce]/20 pb-1.5">
                <span className="text-[#43474d]">Short-Weight Seizures:</span>
                <span className="font-mono font-bold text-[#ba1a1a]">14,810 notices issued</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-[#43474d]">Compounding Fines Collected:</span>
                <span className="font-mono font-bold text-[#21a173]">₹38.6 Crore into DoCA Fund</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
