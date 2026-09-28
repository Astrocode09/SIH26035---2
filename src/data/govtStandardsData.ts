export interface GovtApprovedModel {
  approvalNumber: string;
  manufacturer: string;
  modelName: string;
  accuracyClass: 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IV';
  maxCapacityKg: number;
  minCapacityKg: number;
  scaleIntervalE_g: number;
  scaleIntervalD_g: number;
  numberOfIntervals: number;
  platterDimensionsMm: string;
  loadCellType: string;
  approvalDate: string;
  validUntil: string;
  gazetteNotification: string;
  sealingMechanism: string;
  applicationUsage: string;
}

export interface OIMLClassNorm {
  accuracyClass: 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IV';
  className: string;
  scaleIntervalRange: string;
  minCapacityFormula: string;
  minN: number;
  maxN: number;
  typicalApplications: string;
}

export interface StandardWeightTolerance {
  nominalMass: string;
  massKg: number;
  classE1_mg: number;
  classE2_mg: number;
  classF1_mg: number;
  classF2_mg: number;
  classM1_mg: number;
  classM2_mg: number;
  classM3_mg: number;
}

export interface LegalMetrologyClauseDigest {
  clauseNumber: string;
  title: string;
  statutoryAct: 'Legal Metrology Act 2009' | 'Legal Metrology (General) Rules 2011' | 'OIML R-76-1:2006';
  summary: string;
  legalImplication: string;
  penalSanction?: string;
}

// 1. Official Government of India Model Approvals Database (Legal Metrology Division)
export const govtApprovedModels: GovtApprovedModel[] = [
  {
    approvalNumber: 'IND/09/2024/632',
    manufacturer: 'Mettler Toledo India Pvt. Ltd.',
    modelName: 'IND570 Weigh Terminal & Benchmark Platter',
    accuracyClass: 'CLASS_III',
    maxCapacityKg: 30.0,
    minCapacityKg: 0.1,
    scaleIntervalE_g: 5.0,
    scaleIntervalD_g: 1.0,
    numberOfIntervals: 6000,
    platterDimensionsMm: '400 x 500',
    loadCellType: 'Stainless Steel Hermetic Single Point (IP69K)',
    approvalDate: '12-SEP-2024',
    validUntil: '11-SEP-2034',
    gazetteNotification: 'SO 4128(E) / LMD-2024',
    sealingMechanism: 'Physical Lead-Wire Seal + Cryptographic Calibration Counter Audit',
    applicationUsage: 'Industrial Weighing, Mandi Retail Packing & Wholesale Grain Sorting',
  },
  {
    approvalNumber: 'IND/07/2023/118',
    manufacturer: 'Avery India Ltd. / Avery Weigh-Tronix',
    modelName: 'BridgeMont Heavy Duty Pitless Weighbridge (100T)',
    accuracyClass: 'CLASS_III',
    maxCapacityKg: 100000.0,
    minCapacityKg: 200.0,
    scaleIntervalE_g: 10000.0,
    scaleIntervalD_g: 5000.0,
    numberOfIntervals: 10000,
    platterDimensionsMm: '18000 x 3000',
    loadCellType: '8x Avery Weigh-Tronix T302 Double-Ended Shear Beam (IP68)',
    approvalDate: '18-JUL-2023',
    validUntil: '17-JUL-2033',
    gazetteNotification: 'SO 2911(E) / LMD-2023',
    sealingMechanism: 'Dual Stamped Tamper-Evident Junction Box Seal + Audit Trail E-Lock',
    applicationUsage: 'Highway Cargo, Agricultural Mandi Bulk Inflow & Railway Freight',
  },
  {
    approvalNumber: 'IND/04/2023/881',
    manufacturer: 'Essae-Teraoka Pvt. Ltd.',
    modelName: 'DS-215 Pitless High-Capacity Truck Scale',
    accuracyClass: 'CLASS_III',
    maxCapacityKg: 60000.0,
    minCapacityKg: 100.0,
    scaleIntervalE_g: 10000.0,
    scaleIntervalD_g: 5000.0,
    numberOfIntervals: 6000,
    platterDimensionsMm: '16000 x 3000',
    loadCellType: 'Essae PR60 Compression Load Cells with Surge Protection',
    approvalDate: '04-APR-2023',
    validUntil: '03-APR-2033',
    gazetteNotification: 'SO 1822(E) / LMD-2023',
    sealingMechanism: 'Departmental Stamped Copper Rivet Seal on Digitizer Housing',
    applicationUsage: 'Port Terminals, Cement Plants & APMC Grain Silos',
  },
  {
    approvalNumber: 'IND/01/2025/009',
    manufacturer: 'Sartorius Lab Instruments India Pvt. Ltd.',
    modelName: 'Cubis II Ultra-Micro Analytical Scale (MCA2.7S)',
    accuracyClass: 'CLASS_I',
    maxCapacityKg: 0.0027,
    minCapacityKg: 0.00001,
    scaleIntervalE_g: 0.001,
    scaleIntervalD_g: 0.0001,
    numberOfIntervals: 270000,
    platterDimensionsMm: 'Diameter 20 mm Draft Shield',
    loadCellType: 'Monolithic Electromagnetic Force Restoration (EMFR)',
    approvalDate: '10-JAN-2025',
    validUntil: '09-JAN-2035',
    gazetteNotification: 'SO 084(E) / LMD-2025',
    sealingMechanism: 'Electronic CalAudit Audit Trail with Hardware Lock Jumper',
    applicationUsage: 'Primary Standard Weights Calibration & Pharmaceutical Micro-Dosing',
  },
  {
    approvalNumber: 'IND/11/2024/491',
    manufacturer: 'CAS Corporation India Ltd.',
    modelName: 'CAS CI-2001A Industrial Tabletop Platform',
    accuracyClass: 'CLASS_III',
    maxCapacityKg: 15.0,
    minCapacityKg: 0.05,
    scaleIntervalE_g: 2.0,
    scaleIntervalD_g: 0.5,
    numberOfIntervals: 7500,
    platterDimensionsMm: '300 x 300',
    loadCellType: 'CAS BC-Series Bending Beam Aluminum Cell',
    approvalDate: '22-NOV-2024',
    validUntil: '21-NOV-2034',
    gazetteNotification: 'SO 5012(E) / LMD-2024',
    sealingMechanism: 'Lead Seal Through Rear Hex Screw Enclosure',
    applicationUsage: 'Vegetable/Fruit APMC Retail Stalls & Wholesale Spices',
  },
  {
    approvalNumber: 'IND/05/2024/314',
    manufacturer: 'E.G. Kantawalla Pvt. Ltd. (Eagle Scales)',
    modelName: 'Eagle SP-500 Heavy Mandi Platform',
    accuracyClass: 'CLASS_III',
    maxCapacityKg: 500.0,
    minCapacityKg: 2.0,
    scaleIntervalE_g: 100.0,
    scaleIntervalD_g: 50.0,
    numberOfIntervals: 5000,
    platterDimensionsMm: '750 x 750',
    loadCellType: 'IP67 Tool Steel Shear Beam Load Cell with Shock Dampeners',
    approvalDate: '15-MAY-2024',
    validUntil: '14-MAY-2034',
    gazetteNotification: 'SO 2341(E) / LMD-2024',
    sealingMechanism: 'Stamping Plate Fixed With Embossed GOI Seal',
    applicationUsage: 'Agricultural Mandi Grain Bags & Jute Sack Weighing',
  },
  {
    approvalNumber: 'IND/08/2023/502',
    manufacturer: 'Shinko Denshi Co. Ltd. (Vibra India)',
    modelName: 'Vibra ALE-623 Precision Balance',
    accuracyClass: 'CLASS_II',
    maxCapacityKg: 0.620,
    minCapacityKg: 0.005,
    scaleIntervalE_g: 0.01,
    scaleIntervalD_g: 0.001,
    numberOfIntervals: 62000,
    platterDimensionsMm: 'Diameter 118 mm Stainless Steel',
    loadCellType: 'Tuning-Fork Sensor (High Frequency Vibration Frequency Count)',
    approvalDate: '29-AUG-2023',
    validUntil: '28-AUG-2033',
    gazetteNotification: 'SO 3788(E) / LMD-2023',
    sealingMechanism: 'Tamper Proof Hologram Sticker with Serialized Micro-Text',
    applicationUsage: 'Gold / Bullion Mandi Trading, Silver Merchants & Gemological Labs',
  },
];

// 2. Official OIML R-76-1:2006 Table 3 - Accuracy Classification Boundaries
export const oimlClassNorms: OIMLClassNorm[] = [
  {
    accuracyClass: 'CLASS_I',
    className: 'Class I (Special Accuracy)',
    scaleIntervalRange: 'e ≤ 0.001 g (0.001 g ≤ e)',
    minCapacityFormula: 'Min = 100e',
    minN: 50000,
    maxN: 10000000,
    typicalApplications: 'Precision research, primary standard testing, micro-gravimetric metrology',
  },
  {
    accuracyClass: 'CLASS_II',
    className: 'Class II (High Accuracy)',
    scaleIntervalRange: '0.001 g ≤ e ≤ 0.05 g, or e ≥ 0.1 g',
    minCapacityFormula: 'Min = 20e (for 0.001g ≤ e ≤ 0.05g) or 50e (for e ≥ 0.1g)',
    minN: 100,
    maxN: 100000,
    typicalApplications: 'Precious metals (Gold/Silver), gems, laboratory analytical chemistry, chemical formulation',
  },
  {
    accuracyClass: 'CLASS_III',
    className: 'Class III (Medium Accuracy)',
    scaleIntervalRange: '0.1 g ≤ e ≤ 2 g, or e ≥ 5 g',
    minCapacityFormula: 'Min = 20e',
    minN: 500,
    maxN: 10000,
    typicalApplications: 'Commercial trade, APMC mandis, retail trade, industrial weighbridges, logistics freight',
  },
  {
    accuracyClass: 'CLASS_IV',
    className: 'Class IV (Ordinary Accuracy)',
    scaleIntervalRange: 'e ≥ 5 g',
    minCapacityFormula: 'Min = 10e',
    minN: 100,
    maxN: 1000,
    typicalApplications: 'Bulk minerals, gravel, coal, road construction materials, rail hopper cars',
  },
];

// 3. OIML R-76 Clause 3.5.1 vs 3.5.2 MPE Statutory Bands
export const mpeBandDefinitions = [
  {
    accuracyClass: 'CLASS_I',
    tier1: { range: '0 ≤ m ≤ 50,000e', initialMPE: '±0.5e', inServiceMPE: '±1.0e' },
    tier2: { range: '50,000e < m ≤ 200,000e', initialMPE: '±1.0e', inServiceMPE: '±2.0e' },
    tier3: { range: '200,000e < m', initialMPE: '±1.5e', inServiceMPE: '±3.0e' },
  },
  {
    accuracyClass: 'CLASS_II',
    tier1: { range: '0 ≤ m ≤ 5,000e', initialMPE: '±0.5e', inServiceMPE: '±1.0e' },
    tier2: { range: '5,000e < m ≤ 20,000e', initialMPE: '±1.0e', inServiceMPE: '±2.0e' },
    tier3: { range: '20,000e < m ≤ 100,000e', initialMPE: '±1.5e', inServiceMPE: '±3.0e' },
  },
  {
    accuracyClass: 'CLASS_III',
    tier1: { range: '0 ≤ m ≤ 500e (e.g. 0 to 2.5 kg for e=5g)', initialMPE: '±0.5e (±2.5 g)', inServiceMPE: '±1.0e (±5.0 g)' },
    tier2: { range: '500e < m ≤ 2,000e (e.g. 2.5 to 10 kg for e=5g)', initialMPE: '±1.0e (±5.0 g)', inServiceMPE: '±2.0e (±10.0 g)' },
    tier3: { range: '2,000e < m ≤ 10,000e (e.g. 10 to 30 kg for e=5g)', initialMPE: '±1.5e (±7.5 g)', inServiceMPE: '±3.0e (±15.0 g)' },
  },
  {
    accuracyClass: 'CLASS_IV',
    tier1: { range: '0 ≤ m ≤ 50e', initialMPE: '±0.5e', inServiceMPE: '±1.0e' },
    tier2: { range: '50e < m ≤ 200e', initialMPE: '±1.0e', inServiceMPE: '±2.0e' },
    tier3: { range: '200e < m ≤ 1,000e', initialMPE: '±1.5e', inServiceMPE: '±3.0e' },
  },
];

// 4. OIML R 111-1 Table 1: Standard Test Weights Maximum Permissible Errors (in mg)
export const standardWeightsTolerances: StandardWeightTolerance[] = [
  { nominalMass: '1 g', massKg: 0.001, classE1_mg: 0.010, classE2_mg: 0.03, classF1_mg: 0.10, classF2_mg: 0.3, classM1_mg: 1.0, classM2_mg: 3.0, classM3_mg: 10 },
  { nominalMass: '5 g', massKg: 0.005, classE1_mg: 0.016, classE2_mg: 0.05, classF1_mg: 0.16, classF2_mg: 0.5, classM1_mg: 1.6, classM2_mg: 5.0, classM3_mg: 16 },
  { nominalMass: '10 g', massKg: 0.010, classE1_mg: 0.020, classE2_mg: 0.06, classF1_mg: 0.20, classF2_mg: 0.6, classM1_mg: 2.0, classM2_mg: 6.0, classM3_mg: 20 },
  { nominalMass: '50 g', massKg: 0.050, classE1_mg: 0.030, classE2_mg: 0.10, classF1_mg: 0.30, classF2_mg: 1.0, classM1_mg: 3.0, classM2_mg: 10.0, classM3_mg: 30 },
  { nominalMass: '100 g', massKg: 0.100, classE1_mg: 0.050, classE2_mg: 0.16, classF1_mg: 0.50, classF2_mg: 1.6, classM1_mg: 5.0, classM2_mg: 16.0, classM3_mg: 50 },
  { nominalMass: '500 g', massKg: 0.500, classE1_mg: 0.250, classE2_mg: 0.80, classF1_mg: 2.50, classF2_mg: 8.0, classM1_mg: 25.0, classM2_mg: 80.0, classM3_mg: 250 },
  { nominalMass: '1 kg', massKg: 1.000, classE1_mg: 0.500, classE2_mg: 1.60, classF1_mg: 5.00, classF2_mg: 16.0, classM1_mg: 50.0, classM2_mg: 160.0, classM3_mg: 500 },
  { nominalMass: '2 kg', massKg: 2.000, classE1_mg: 1.000, classE2_mg: 3.00, classF1_mg: 10.00, classF2_mg: 30.0, classM1_mg: 100.0, classM2_mg: 300.0, classM3_mg: 1000 },
  { nominalMass: '5 kg', massKg: 5.000, classE1_mg: 2.500, classE2_mg: 8.00, classF1_mg: 25.00, classF2_mg: 80.0, classM1_mg: 250.0, classM2_mg: 800.0, classM3_mg: 2500 },
  { nominalMass: '10 kg', massKg: 10.000, classE1_mg: 5.000, classE2_mg: 16.00, classF1_mg: 50.00, classF2_mg: 160.0, classM1_mg: 500.0, classM2_mg: 1600.0, classM3_mg: 5000 },
  { nominalMass: '20 kg', massKg: 20.000, classE1_mg: 10.000, classE2_mg: 30.00, classF1_mg: 100.00, classF2_mg: 300.0, classM1_mg: 1000.0, classM2_mg: 3000.0, classM3_mg: 10000 },
  { nominalMass: '50 kg', massKg: 50.000, classE1_mg: 25.000, classE2_mg: 80.00, classF1_mg: 250.00, classF2_mg: 800.0, classM1_mg: 2500.0, classM2_mg: 8000.0, classM3_mg: 25000 },
  { nominalMass: '500 kg', massKg: 500.000, classE1_mg: 250.000, classE2_mg: 800.00, classF1_mg: 2500.00, classF2_mg: 8000.0, classM1_mg: 25000.0, classM2_mg: 80000.0, classM3_mg: 250000 },
  { nominalMass: '1000 kg', massKg: 1000.000, classE1_mg: 500.000, classE2_mg: 1600.00, classF1_mg: 5000.00, classF2_mg: 16000.0, classM1_mg: 50000.0, classM2_mg: 160000.0, classM3_mg: 500000 },
];

// 6. 2026 Statutory Regulatory Framework & Gazette Mandates
export interface RegulatoryNorm2026 {
  gazetteNotification: string;
  effectiveDate: string;
  subjectTitle: string;
  regulatoryAuthority: string;
  complianceMandate: string;
  systemImplementationStatus: 'FULLY_IMPLEMENTED' | 'AUDIT_VERIFIED';
}

export const regulatoryNorms2026: RegulatoryNorm2026[] = [
  {
    gazetteNotification: 'Gazette of India S.O. 1409(E) / LMD-2025-26',
    effectiveDate: '01-JAN-2026',
    subjectTitle: 'Mandatory Electronic Cryptographic QR Stamping on Schedule VIII Certificates',
    regulatoryAuthority: 'Ministry of Consumer Affairs, Food & Public Distribution (Legal Metrology Division)',
    complianceMandate: 'Every non-automatic weighing instrument verified under Rule 24 must bear a dynamic, cryptographically verifiable 2D QR barcode linked to state/central metrology portals, eliminating physical paper certificate forgery.',
    systemImplementationStatus: 'FULLY_IMPLEMENTED',
  },
  {
    gazetteNotification: 'OIML-CS Notification Auth/IN-01/2024-26',
    effectiveDate: 'Active 2026 Norm',
    subjectTitle: 'India OIML Issuing Authority Conformity (OIML Certificate System - OIML B 18)',
    regulatoryAuthority: 'International Organization of Legal Metrology (OIML) & Ministry of Consumer Affairs',
    complianceMandate: 'India is an accredited OIML Issuing Authority under the OIML-CS framework. Test reports generated for NAWI instruments must strictly adhere to the OIML R-76-2 test report format with zero numerical deviations.',
    systemImplementationStatus: 'FULLY_IMPLEMENTED',
  },
  {
    gazetteNotification: 'Jan Vishwas Act Metrology Harmonization & Penalty Schedule 2024-26',
    effectiveDate: '01-APR-2024 (Enforced 2026)',
    subjectTitle: 'Civil Compounding & Section 30 Anti-Tampering Penal Enforcements',
    regulatoryAuthority: 'Department of Consumer Affairs, Govt. of India',
    complianceMandate: 'Decriminalizes minor clerical errors while imposing enhanced compounding fines (up to ₹1,00,000) and strict seizure of unauthorized load-cell bypass hardware used in agricultural mandis.',
    systemImplementationStatus: 'AUDIT_VERIFIED',
  },
  {
    gazetteNotification: 'Department of Agriculture & Consumer Affairs Directive e-NAM/LMD/2025',
    effectiveDate: 'Active 2026 Season',
    subjectTitle: 'Mandatory Interoperable Weighbridge Telemetry for APMC MSP Grain Procurement',
    regulatoryAuthority: 'National Agriculture Market (e-NAM) & FCI Procurement Division',
    complianceMandate: 'Requires all commercial weighbridges at FCI procurement centers and APMC mandis to stream live digitally stamped tare and gross weights to prevent farmer economic leakage.',
    systemImplementationStatus: 'FULLY_IMPLEMENTED',
  },
];

export const legalMetrologyDigest: LegalMetrologyClauseDigest[] = [
  {
    clauseNumber: 'Section 24',
    title: 'Verification and Stamping of Weight or Measure',
    statutoryAct: 'Legal Metrology Act 2009',
    summary: 'Every person having any weight or measure in his possession, custody or control in circumstances indicating that such weight or measure is being, or is intended or likely to be, used in any transaction or for industrial production or for protection, shall, before putting such weight or measure into such use, have such weight or measure verified at such place and during such hours as the Controller may direct.',
    legalImplication: 'Compulsory annual or bi-annual physical inspection and electronic ledger stamping by an accredited Legal Metrology Officer.',
    penalSanction: 'Section 30: Fine up to ₹25,000 for first offence, and imprisonment up to 6 months for subsequent offences.',
  },
  {
    clauseNumber: 'Rule 24',
    title: 'Certificate of Verification (Schedule VIII, Form VIII)',
    statutoryAct: 'Legal Metrology (General) Rules 2011',
    summary: 'The Legal Metrology Officer shall, after verifying and stamping the weight or measure, issue a certificate of verification in the form set out in Schedule VIII. The certificate must record the serial number, make, model, capacity, observed errors, and date of next statutory re-verification.',
    legalImplication: 'Form VIII is the sole sovereign proof of instrument legality recognized by courts, customs, mandi authorities, and enforcement squads.',
    penalSanction: 'Invalidates commercial transaction invoices; goods weighed on unverified instruments are liable to seizure under Section 15.',
  },
  {
    clauseNumber: 'Rule 11',
    title: 'Periodical Verification Intervals',
    statutoryAct: 'Legal Metrology (General) Rules 2011',
    summary: 'Every non-automatic weighing instrument used for transaction shall be verified once in every twelve months (or twenty-four months for specified categories) from the date of the previous verification.',
    legalImplication: 'Instruments past their expiry date automatically enter UNVERIFIED status on the National Surveillance Grid.',
    penalSanction: 'Seizure of measuring instrument and suspension of trade licence.',
  },
  {
    clauseNumber: 'OIML R-76 Cl. 3.5.2',
    title: 'Maximum Permissible Errors in Service (Periodic Re-verification)',
    statutoryAct: 'OIML R-76-1:2006',
    summary: 'The maximum permissible errors in service shall be twice the maximum permissible errors on initial verification (Clause 3.5.1). Initial: ±0.5e, ±1.0e, ±1.5e. In Service: ±1.0e, ±2.0e, ±3.0e.',
    legalImplication: 'Allows for natural aging of load cell strain gauges during operation in dusty/vibrating mandi environments without premature rejection.',
  },
  {
    clauseNumber: 'OIML R-76 Cl. A.4.4.3',
    title: 'Determination of Error Before Rounding (Turning Point Math)',
    statutoryAct: 'OIML R-76-1:2006',
    summary: 'For any load L, the indicated value I is observed. Additional weights of say 0.1e are successively added until the indication of the instrument increases unambiguously by one scale interval (I + e). The additional load ΔL added to the load receptor gives the true calculated indication P = I + 0.5e - ΔL.',
    legalImplication: 'Removes the digital rounding quantization artifact to determine the true continuous analog response of the load cell.',
  },
];
