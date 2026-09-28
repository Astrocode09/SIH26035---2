import { AccuracyClass, LoadingTestPoint, DeviceUnderTest } from '../types/metrology';

/**
 * Pure 100% Deterministic OIML R-76-1:2006 (E) Calculation Engine
 * Eliminates quantization error before rounding via Sec A.4.4.3
 */

export interface MPEThreshold {
  mpeGrams: number;
  mpeE: number;
  tierDescription: string;
}

/**
 * Calculates Maximum Permissible Error (MPE) as per OIML R-76-1 Clause 3.5.1
 */
export function getMPEForLoad(
  loadKg: number,
  eGrams: number,
  accuracyClass: AccuracyClass = 'CLASS_III',
  isInitialVerification: boolean = true
): MPEThreshold {
  const loadGrams = loadKg * 1000;
  const mInE = loadGrams / eGrams;
  const factor = isInitialVerification ? 1 : 2;

  if (accuracyClass === 'CLASS_III') {
    // Class III (Medium accuracy, n between 500 and 10,000)
    if (mInE <= 500) {
      return {
        mpeGrams: 0.5 * eGrams * factor,
        mpeE: 0.5 * factor,
        tierDescription: '0 ≤ m ≤ 500e',
      };
    } else if (mInE <= 2000) {
      return {
        mpeGrams: 1.0 * eGrams * factor,
        mpeE: 1.0 * factor,
        tierDescription: '500e < m ≤ 2000e',
      };
    } else {
      return {
        mpeGrams: 1.5 * eGrams * factor,
        mpeE: 1.5 * factor,
        tierDescription: '2000e < m ≤ 6000e',
      };
    }
  }

  // Fallback default for Class II
  if (accuracyClass === 'CLASS_II') {
    if (mInE <= 5000) {
      return { mpeGrams: 0.5 * eGrams * factor, mpeE: 0.5 * factor, tierDescription: '0 ≤ m ≤ 5000e' };
    } else if (mInE <= 20000) {
      return { mpeGrams: 1.0 * eGrams * factor, mpeE: 1.0 * factor, tierDescription: '5000e < m ≤ 20000e' };
    } else {
      return { mpeGrams: 1.5 * eGrams * factor, mpeE: 1.5 * factor, tierDescription: '20000e < m ≤ 100000e' };
    }
  }

  // Default standard 1.0e
  return {
    mpeGrams: 1.0 * eGrams * factor,
    mpeE: 1.0 * factor,
    tierDescription: 'Standard Class Band',
  };
}

/**
 * Computes deterministic OIML R-76 Clause A.4.4.3 equations:
 * P = I + 0.5e - deltaL
 * E = P - L
 * Ec = E - E0
 */
export function computeDeterministicStep(
  standardLoadKg: number,
  indicationKg: number,
  turningPointDeltaL_g: number,
  eGrams: number,
  zeroDatumShiftOffsetG: number = 0.5,
  accuracyClass: AccuracyClass = 'CLASS_III'
): {
  trueCalculatedIndicationKg: number;
  rawErrorG: number;
  rawErrorE: number;
  correctedErrorG: number;
  correctedErrorE: number;
  mpeLimitG: number;
  mpeLimitE: number;
  isCompliant: boolean;
  residualHeadroomG: number;
  headroomPct: number;
} {
  const eKg = eGrams / 1000;
  const deltaLKg = turningPointDeltaL_g / 1000;

  // P = I + 0.5e - deltaL
  const trueCalculatedIndicationKg = Number((indicationKg + 0.5 * eKg - deltaLKg).toFixed(5));

  // E = P - L (in grams)
  const rawErrorG = Number(((trueCalculatedIndicationKg - standardLoadKg) * 1000).toFixed(2));
  const rawErrorE = Number((rawErrorG / eGrams).toFixed(2));

  // Ec = E - E0 (in grams)
  const correctedErrorG = Number((rawErrorG - zeroDatumShiftOffsetG).toFixed(2));
  const correctedErrorE = Number((correctedErrorG / eGrams).toFixed(2));

  // MPE
  const mpe = getMPEForLoad(standardLoadKg, eGrams, accuracyClass, true);
  const mpeLimitG = mpe.mpeGrams;
  const mpeLimitE = mpe.mpeE;

  const isCompliant = Math.abs(correctedErrorG) <= mpeLimitG;
  const residualHeadroomG = Number((mpeLimitG - Math.abs(correctedErrorG)).toFixed(2));
  const headroomPct = mpeLimitG > 0 ? Number(((residualHeadroomG / mpeLimitG) * 100).toFixed(1)) : 100;

  return {
    trueCalculatedIndicationKg,
    rawErrorG,
    rawErrorE,
    correctedErrorG,
    correctedErrorE,
    mpeLimitG,
    mpeLimitE,
    isCompliant,
    residualHeadroomG,
    headroomPct,
  };
}

/**
 * Default standard test loading matrix for 30kg Class III scale (Steps 1 to 10)
 */
export function getDefaultLoadingMatrix(eGrams: number = 5): LoadingTestPoint[] {
  const rawSteps = [
    { step: 1, name: 'Zero Reference Point', clause: 'A.4.4.1', load: 0.000, indic: 0.000, dL: 2.0, e0: 0.0, status: 'COMPLETED' as const },
    { step: 2, name: 'Min Capacity', clause: 'A.4.4.2', load: 0.100, indic: 0.100, dL: 2.3, e0: 0.5, status: 'COMPLETED' as const },
    { step: 3, name: 'Tier 1 Limit m = 500e', clause: 'A.4.4.3', load: 2.500, indic: 2.501, dL: 2.0, e0: 0.5, status: 'COMPLETED' as const },
    { step: 4, name: 'Intermediate Load', clause: 'A.4.4.3', load: 5.000, indic: 5.001, dL: 2.0, e0: 0.5, status: 'COMPLETED' as const },
    { step: 5, name: 'Tier 2 Limit m = 2000e', clause: 'A.4.4.3', load: 10.000, indic: 10.001, dL: 1.5, e0: 0.5, status: 'COMPLETED' as const },
    { step: 6, name: 'Half Capacity 1/2 Max', clause: 'A.4.4.3', load: 15.000, indic: 15.002, dL: 2.0, e0: 0.5, status: 'LIVE' as const },
    { step: 7, name: 'Three-Quarter Capacity', clause: 'A.4.4.3', load: 20.000, indic: 20.002, dL: 1.8, e0: 0.5, status: 'PENDING' as const },
    { step: 8, name: 'Near-Max Test Point', clause: 'A.4.4.3', load: 25.000, indic: 25.003, dL: 2.1, e0: 0.5, status: 'PENDING' as const },
    { step: 9, name: 'Maximum Capacity (Max)', clause: 'A.4.4.3', load: 30.000, indic: 30.003, dL: 2.0, e0: 0.5, status: 'PENDING' as const },
    { step: 10, name: 'Descending Hysteresis Return', clause: 'A.4.4.4', load: 15.000, indic: 15.001, dL: 2.2, e0: 0.5, status: 'PENDING' as const },
  ];

  return rawSteps.map((s) => {
    const calc = computeDeterministicStep(s.load, s.indic, s.dL, eGrams, s.e0, 'CLASS_III');
    return {
      step: s.step,
      name: `${s.name} (${s.load.toFixed(3)} kg)`,
      clause: s.clause,
      standardLoadKg: s.load,
      indicationKg: s.indic,
      turningPointDeltaL_g: s.dL,
      trueCalculatedIndicationKg: calc.trueCalculatedIndicationKg,
      rawErrorG: calc.rawErrorG,
      zeroDatumShiftOffsetG: s.e0,
      correctedErrorG: calc.correctedErrorG,
      correctedErrorE: calc.correctedErrorE,
      mpeLimitG: calc.mpeLimitG,
      mpeLimitE: calc.mpeLimitE,
      isCompliant: calc.isCompliant,
      status: s.status,
    };
  });
}

/**
 * SHA-256 hash generator simulator for immutable audit trail
 */
export function pseudoSha256(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}a9f732de09b2e3b0c44298fc1c149afb${hex}`;
}
