export type AccuracyClass = 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IV';

export interface DeviceUnderTest {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  accuracyClass: AccuracyClass;
  maxCapacityKg: number;
  minCapacityKg: number;
  scaleIntervalE_g: number; // e in grams
  scaleIntervalD_g: number; // d in grams
  serialNumber: string;
  indicatorSerial: string;
  approvalNumber: string;
  numberOfIntervals: number; // n = Max / e
}

export interface AmbientConditions {
  temperatureC: number;
  relativeHumidityPct: number;
  pressureHPa: number;
  gravityMPerS2: number;
  locationName: string;
}

export interface LoadingTestPoint {
  step: number;
  name: string;
  clause: string;
  standardLoadKg: number;
  indicationKg: number;
  turningPointDeltaL_g: number;
  trueCalculatedIndicationKg: number; // P = I + 0.5e - deltaL
  rawErrorG: number;                  // E = P - L (in grams)
  zeroDatumShiftOffsetG: number;      // E0 in grams
  correctedErrorG: number;            // Ec = E - E0 in grams
  correctedErrorE: number;            // Ec in multiples of e
  mpeLimitG: number;                  // MPE limit in grams
  mpeLimitE: number;                  // MPE limit in e (0.5, 1.0, 1.5)
  isCompliant: boolean;
  status: 'COMPLETED' | 'LIVE' | 'PENDING';
}

export interface EccentricityPoint {
  position: 'Pos 1 (Center)' | 'Pos 2 (TL)' | 'Pos 3 (TR)' | 'Pos 4 (BL)' | 'Pos 5 (BR)';
  code: string;
  loadKg: number;
  indicationKg: number;
  deltaG: number;
  deltaE: number;
  isCompliant: boolean;
  isDatum?: boolean;
}

export interface StatutoryAuditRecord {
  id: string;
  timestamp: string;
  testVector: string;
  clause: string;
  standardLoadKg: string;
  indicationKg: string;
  deltaLTurn_g: string;
  correctedErrorEc: string;
  mpeLimit: string;
  result: 'COMPLIANT' | 'NON-COMPLIANT';
  hash: string;
}

export interface FormVIIICertificate {
  certNumber: string;
  issuer: string;
  issuingDepartment: string;
  jurisdiction: string;
  validFrom: string;
  validUntil: string;
  ledgerBlock: string;
  merkleRootHash: string;
  qrPayload: string;
  inspectorName: string;
  inspectorDesignation: string;
  sealId: string;
  device: DeviceUnderTest;
  ambient: AmbientConditions;
  maxEccentricityErrorG: number;
  maxLoadingErrorG: number;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REVOKED';
}

export interface SurveillanceNode {
  id: string;
  name: string;
  type: 'APMC Mandi' | 'Grain Silos' | 'Seaport Weighbridge' | 'State Border Toll';
  state: string;
  city: string;
  activeScales: number;
  complianceRatePct: number;
  lastInspected: string;
  tamperingAlerts: number;
  dailyWeighmentVolumeTonnes: number;
  economicLeakagePreventedCr: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export type PersonaRole =
  | 'EVALUATOR'
  | 'LAB_TECHNICIAN'
  | 'FIELD_INSPECTOR'
  | 'MANUFACTURER_OEM'
  | 'MANDI_SUPERINTENDENT'
  | 'CITIZEN_OBSERVER';

export interface UserPersona {
  id: string;
  role: PersonaRole;
  roleBadge: string;
  name: string;
  designation: string;
  organization: string;
  jurisdiction: string;
  badgeCode: string;
  avatarIcon: string;
  description: string;
  authorizedActions: string[];
  defaultTab: 'r-76-automated-test-suite' | 'dashboard-and-telemetry' | 'legal-certificate-vault' | 'national-surveillance-grid' | 'govt-standards-registry' | 'system-architecture' | 'consumer-food-command';
  futureScopeBadge?: string;
  email?: string;
  isCustomAccount?: boolean;
  createdAt?: string;
}

export const PRACTICAL_PERSONAS: UserPersona[] = [
  {
    id: 'evaluator-jury',
    role: 'EVALUATOR',
    roleBadge: 'EVALUATOR & JURY',
    name: 'Dr. Vikram Mehta',
    designation: 'Deputy Director (Legal Metrology) & SIH Grand Finale Evaluator',
    organization: 'Indian Institute of Legal Metrology (IILM Ranchi) / DoCA',
    jurisdiction: 'National Central Standards & Accreditation Wing',
    badgeCode: 'EVAL-GOI-2026-001',
    avatarIcon: 'fact_check',
    description: 'Inspect full OIML R-76 algorithmic compliance, evaluate Clause A.4.4.3 mathematical proofs, verify SHA-256 Merkle audits, and review tamper-resilience scores.',
    authorizedActions: ['Audit All Algorithms', 'Sign Test Reports', 'Verify Cryptographic Merkle Proofs', 'Simulate Fraud Injections'],
    defaultTab: 'r-76-automated-test-suite',
    futureScopeBadge: 'AI & Quantum Metrology Audit Ready',
  },
  {
    id: 'lab-technician',
    role: 'LAB_TECHNICIAN',
    roleBadge: 'METROLOGY LAB TECHNICIAN',
    name: 'Ananya Rao',
    designation: 'Senior Legal Metrology Testing Officer & Calibration Lead',
    organization: 'Regional Reference Standards Laboratory (RRSL Ahmedabad)',
    jurisdiction: 'Western Regional Metrology Laboratory Complex',
    badgeCode: 'TECH-RRSL-2026-442',
    avatarIcon: 'science',
    description: 'Execute standard Clause A.4.4 loading sequences, capture turning point ΔL weights, calibrate 5-point eccentricity matrices, and test tare & zero-tracking stability.',
    authorizedActions: ['Run RS-232 20Hz Telemetry', 'Record Standard Weight Steps', 'Execute Clause A.4.7 Matrix', 'Issue Form VIII Dossiers'],
    defaultTab: 'r-76-automated-test-suite',
    futureScopeBadge: 'NABL ISO/IEC 17025 Automated Compliance',
  },
  {
    id: 'field-inspector',
    role: 'FIELD_INSPECTOR',
    roleBadge: 'FLYING SQUAD ENFORCEMENT LMO',
    name: 'Rajeshwar Patil',
    designation: 'Assistant Controller & Anti-Fraud Flying Squad Lead',
    organization: 'Legal Metrology Enforcement Directorate (Maharashtra Mandis)',
    jurisdiction: 'Vashi Wholesale Market & Pune Agricultural Hub',
    badgeCode: 'LMO-ENF-MH-9018',
    avatarIcon: 'security',
    description: 'Conduct surprise weighbridge raids in agricultural mandis, intercept unauthorized 433 MHz wireless load-cell shunt remotes, and issue on-spot seizure orders under Section 15.',
    authorizedActions: ['Trigger Anti-Tamper RF Intercept', 'Dispatch Rapid LMO Squads', 'Revoke Non-Compliant Form VIII Stamps', 'Log Mandi Violations'],
    defaultTab: 'national-surveillance-grid',
    futureScopeBadge: 'Real-time 433MHz RF Sensor Grid',
  },
  {
    id: 'manufacturer-oem',
    role: 'MANUFACTURER_OEM',
    roleBadge: 'SCALE OEM & R&D ENGINEER',
    name: 'Vikrant Deshmukh',
    designation: 'Chief Systems Architect & Model Approval Lead',
    organization: 'Mettler Toledo / Avery Weigh-Tronix OEM Division',
    jurisdiction: 'Make In India Scale Manufacturing Facility (Pune)',
    badgeCode: 'OEM-DES-IND-570',
    avatarIcon: 'precision_manufacturing',
    description: 'Verify new weighing instrument prototypes for Gazette Model Approval, ensure compliance with OIML-CS international mutual recognition standards, and run temperature creep simulations.',
    authorizedActions: ['Model Approval Dossier Testing', 'Validate OIML Table 3 Limits', 'Check Load Cell Shunt Resilience', 'Generate OIML-CS Type Dossier'],
    defaultTab: 'govt-standards-registry',
    futureScopeBadge: 'OIML-CS International Mutual Recognition',
  },
  {
    id: 'mandi-superintendent',
    role: 'MANDI_SUPERINTENDENT',
    roleBadge: 'APMC MANDI SECRETARY',
    name: 'Suresh Choudhary',
    designation: 'Secretary & Joint Director (Agricultural Marketing)',
    organization: 'Azadpur APMC Wholesale Fruit & Grain Terminal (e-NAM Hub)',
    jurisdiction: 'National Capital Region Agricultural Procurement Hub',
    badgeCode: 'APMC-AZD-2026-110',
    avatarIcon: 'storefront',
    description: 'Ensure fair farmer transactions, prevent fractional under-weighing on MSP grain arrivals, monitor daily 45,000+ Tonne weighbridge flows, and prevent economic leakage.',
    authorizedActions: ['Monitor Live Weighbridge Inflow', 'Track Farmer MSP Loss Prevention', 'View Daily Economic Leakage ROI', 'Verify e-NAM Integration'],
    defaultTab: 'national-surveillance-grid',
    futureScopeBadge: 'e-NAM Interoperable Digital Tare Protocol',
  },
  {
    id: 'citizen-observer',
    role: 'CITIZEN_OBSERVER',
    roleBadge: 'FARMER & CITIZEN ADVOCATE',
    name: 'Kisan Sahayak & Transparency Portal',
    designation: 'Public Metrology Observer & Farmer Trade Representative',
    organization: 'Bhartiya Kisan Transparency Network & Consumer Rights Forum',
    jurisdiction: 'Pan-India Citizen Public Registry',
    badgeCode: 'PUB-VERIFY-IND-2026',
    avatarIcon: 'verified_user',
    description: 'Verify the authenticity of any commercial scale or weighbridge ticket by scanning the QR code, review the central government model approval database, and report tampering anonymously.',
    authorizedActions: ['Scan Form VIII QR Code', 'Query Model Approval Gazette', 'Calculate Fair MSP Weight', 'Consult Setu AI Assistant'],
    defaultTab: 'legal-certificate-vault',
    futureScopeBadge: 'DigiLocker Citizen Sovereign Credential',
  },
];
