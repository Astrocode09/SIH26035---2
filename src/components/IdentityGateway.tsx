import React, { useState, useEffect } from 'react';
import { UserPersona, PersonaRole, PRACTICAL_PERSONAS } from '../types/metrology';

interface IdentityGatewayProps {
  currentPersona: UserPersona | null;
  onSelectPersona: (persona: UserPersona) => void;
  onContinueCurrent?: () => void;
}

const ROLE_PRESETS: Record<
  PersonaRole,
  {
    roleBadge: string;
    avatarIcon: string;
    defaultDesignation: string;
    defaultOrg: string;
    defaultJurisdiction: string;
    defaultTab: UserPersona['defaultTab'];
    actions: string[];
    futureScope: string;
    description: string;
  }
> = {
  EVALUATOR: {
    roleBadge: 'EVALUATOR & JURY',
    avatarIcon: 'fact_check',
    defaultDesignation: 'Deputy Director / SIH 2026 Grand Finale Jury',
    defaultOrg: 'Department of Consumer Affairs / IILM Ranchi',
    defaultJurisdiction: 'National Central Metrology Evaluation Wing',
    defaultTab: 'r-76-automated-test-suite',
    actions: ['Audit OIML Algorithms', 'Sign Test Reports', 'Verify SHA-256 Merkle Proofs', 'Simulate Fraud Attacks'],
    futureScope: 'AI & Quantum Metrology Audit Ready',
    description: 'Statutory evaluation of OIML R-76 algorithmic compliance, turning-point mathematical proofs, and cryptographic ledger integrity.',
  },
  LAB_TECHNICIAN: {
    roleBadge: 'METROLOGY LAB TECHNICIAN',
    avatarIcon: 'science',
    defaultDesignation: 'Senior Metrology Verification Officer',
    defaultOrg: 'Regional Reference Standards Laboratory (RRSL)',
    defaultJurisdiction: 'State Reference Standards Lab Complex',
    defaultTab: 'r-76-automated-test-suite',
    actions: ['Capture 20Hz Serial Weights', 'Execute Clause A.4.4 Steps', 'Run Clause A.4.7 Matrix', 'Issue Form VIII Dossiers'],
    futureScope: 'NABL ISO/IEC 17025 Automated Compliance',
    description: 'Precision laboratory calibration and statutory verification of Class I, II, III and IV weighing instruments.',
  },
  FIELD_INSPECTOR: {
    roleBadge: 'FLYING SQUAD ENFORCEMENT LMO',
    avatarIcon: 'security',
    defaultDesignation: 'Assistant Controller of Legal Metrology',
    defaultOrg: 'Legal Metrology Enforcement Flying Squad',
    defaultJurisdiction: 'Regional APMC Mandi & Highway Weighbridge Circle',
    defaultTab: 'national-surveillance-grid',
    actions: ['Intercept 433MHz Shunt Jammers', 'Dispatch Rapid LMO Squads', 'Revoke Non-Compliant Stamps', 'Log Mandi Violations'],
    futureScope: 'Real-time 433MHz RF Sensor Grid',
    description: 'Unannounced field audits, remote RF shunt jammer interception, and weighbridge seizure under Section 15.',
  },
  MANUFACTURER_OEM: {
    roleBadge: 'SCALE OEM & R&D ENGINEER',
    avatarIcon: 'precision_manufacturing',
    defaultDesignation: 'Chief Systems Metrology Engineer',
    defaultOrg: 'Weighing Scale OEM Manufacturing Division',
    defaultJurisdiction: 'Make In India Scale Manufacturing Hub',
    defaultTab: 'govt-standards-registry',
    actions: ['Model Approval Dossier Testing', 'Validate OIML Table 3 Limits', 'Check Shunt Resilience', 'Generate OIML-CS Type Dossier'],
    futureScope: 'OIML-CS International Mutual Recognition',
    description: 'Design and statutory prototype testing of weighing instruments for Central Government Model Approval.',
  },
  MANDI_SUPERINTENDENT: {
    roleBadge: 'APMC MANDI SECRETARY',
    avatarIcon: 'storefront',
    defaultDesignation: 'Secretary & Joint Director (Agricultural Marketing)',
    defaultOrg: 'APMC Wholesale Grain & Produce Terminal',
    defaultJurisdiction: 'e-NAM Agricultural Procurement Hub',
    defaultTab: 'national-surveillance-grid',
    actions: ['Monitor Weighbridge Inflows', 'Track Farmer MSP Loss Prevention', 'View Daily Economic ROI', 'Verify e-NAM Integration'],
    futureScope: 'e-NAM Interoperable Digital Tare Protocol',
    description: 'Supervising fair farmer transactions, preventing fractional weighbridge fraud, and monitoring daily grain arrivals.',
  },
  CITIZEN_OBSERVER: {
    roleBadge: 'FARMER & CITIZEN ADVOCATE',
    avatarIcon: 'verified_user',
    defaultDesignation: 'Citizen Metrology Observer & Consumer Advocate',
    defaultOrg: 'Farmer Transparency Network & Consumer Rights Forum',
    defaultJurisdiction: 'Pan-India Citizen Public Registry',
    defaultTab: 'legal-certificate-vault',
    actions: ['Scan Form VIII QR Code', 'Query Model Gazette', 'Calculate Fair MSP Weight', 'Consult Setu AI Assistant'],
    futureScope: 'DigiLocker Citizen Sovereign Credential',
    description: 'Independent citizen verification of commercial scales, QR certificate authenticity checks, and anti-fraud reporting.',
  },
};

export const MAJOR_DESIGNATIONS: { category: string; options: string[] }[] = [
  {
    category: 'Statutory Metrology Officers & Directorate (DoCA & States)',
    options: [
      'Legal Metrology Officer (LMO)',
      'Senior Legal Metrology Testing Officer',
      'Assistant Controller of Legal Metrology',
      'Deputy Controller of Legal Metrology',
      'Joint Controller of Legal Metrology',
      'Controller of Legal Metrology',
      'Deputy Director (Legal Metrology) - DoCA',
      'Director of Legal Metrology (Govt. of India)',
    ],
  },
  {
    category: 'Standards & Calibration Labs (RRSL / CSIR-NPL / NABL)',
    options: [
      'Senior Metrology Calibration Lead',
      'Verification Officer (Regional Reference Standards Lab - RRSL)',
      'Scientific Officer / Metrologist (CSIR-NPL New Delhi)',
      'Quality Manager / NABL Lead Assessor (ISO/IEC 17025)',
      'Calibration Lab Testing Technician',
    ],
  },
  {
    category: 'Grand Finale Evaluation, Audit & Jury (SIH 2026)',
    options: [
      'SIH 2026 Grand Finale Jury & Technical Evaluator',
      'Ministry Technical Auditor & Software Reviewer',
      'Academic Metrology Research Fellow',
      'Metrology Systems Audit Lead (OIML R-76)',
    ],
  },
  {
    category: 'Market Enforcement & Agricultural Mandis (APMC / e-NAM / FCI)',
    options: [
      'Flying Squad Rapid Intercept Officer (Anti-Tampering)',
      'APMC Mandi Secretary / Grain Procurement Lead',
      'FCI Commercial Weighbridge Inspector',
      'State Border Toll Weighbridge Auditor',
    ],
  },
  {
    category: 'Scale Manufacturing & OEM (Make In India)',
    options: [
      'Chief Systems Metrology Architect & Model Approval Lead',
      'Weighing Instrument R&D Engineer',
      'Pattern Approval Quality Assurance Manager',
      'Embedded Firmware & Load-Cell Calibration Engineer',
    ],
  },
  {
    category: 'Public Transparency & Consumer Rights',
    options: [
      'Citizen Metrology Observer & Consumer Advocate',
      'Farmer Trade Transparency Representative',
    ],
  },
];

export const IdentityGateway: React.FC<IdentityGatewayProps> = ({
  currentPersona,
  onSelectPersona,
  onContinueCurrent,
}) => {
  const [activeView, setActiveView] = useState<'browse' | 'create'>('browse');
  const [customAccounts, setCustomAccounts] = useState<UserPersona[]>([]);

  // Designation selection state (dropdown + custom "Others" input)
  const [selectedDesignationOption, setSelectedDesignationOption] = useState<string>(
    ROLE_PRESETS.LAB_TECHNICIAN.defaultDesignation
  );
  const [customDesignationText, setCustomDesignationText] = useState<string>('');

  // Form State for generating new account (phone removed, email optional)
  const [formData, setFormData] = useState({
    name: '',
    role: 'LAB_TECHNICIAN' as PersonaRole,
    designation: ROLE_PRESETS.LAB_TECHNICIAN.defaultDesignation,
    organization: ROLE_PRESETS.LAB_TECHNICIAN.defaultOrg,
    email: '',
    jurisdiction: ROLE_PRESETS.LAB_TECHNICIAN.defaultJurisdiction,
    badgeCode: `LMD-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    defaultTab: 'r-76-automated-test-suite' as UserPersona['defaultTab'],
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [dispatchedReceipt, setDispatchedReceipt] = useState<{
    recipient: string;
    subject: string;
    messageId?: string;
    previewUrl?: string | null;
    timestamp: string;
    htmlContent?: string;
    persona: UserPersona;
  } | null>(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState<boolean>(false);

  // Load custom accounts on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('manosetu_custom_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCustomAccounts(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading custom accounts:', e);
    }
  }, []);

  // Update default presets when role changes
  const handleRoleChange = (newRole: PersonaRole) => {
    const preset = ROLE_PRESETS[newRole];
    setSelectedDesignationOption(preset.defaultDesignation);
    setCustomDesignationText('');
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      designation: preset.defaultDesignation,
      organization: preset.defaultOrg,
      jurisdiction: preset.defaultJurisdiction,
      defaultTab: preset.defaultTab,
      badgeCode: `${newRole.slice(0, 3)}-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
  };

  const handleGenerateBadgeCode = () => {
    setFormData((prev) => ({
      ...prev,
      badgeCode: `${prev.role.slice(0, 3)}-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    const effectiveDesignation =
      selectedDesignationOption === 'OTHERS'
        ? customDesignationText.trim()
        : selectedDesignationOption.trim();

    if (!effectiveDesignation) {
      setFormError('Please select or specify your official designation.');
      return;
    }

    if (!formData.organization.trim()) {
      setFormError('Please enter your organization or department.');
      return;
    }

    setFormError(null);
    const preset = ROLE_PRESETS[formData.role];

    const newPersona: UserPersona = {
      id: `custom-${Date.now()}`,
      role: formData.role,
      roleBadge: preset.roleBadge,
      name: formData.name.trim(),
      designation: effectiveDesignation,
      organization: formData.organization.trim() || preset.defaultOrg,
      jurisdiction: formData.jurisdiction.trim() || preset.defaultJurisdiction,
      badgeCode: formData.badgeCode.trim() || `LMD-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      avatarIcon: preset.avatarIcon,
      description: preset.description,
      authorizedActions: preset.actions,
      defaultTab: formData.defaultTab,
      futureScopeBadge: preset.futureScope,
      email: formData.email.trim() || undefined,
      isCustomAccount: true,
      createdAt: new Date().toISOString(),
    };

    // Save to custom accounts list in localStorage
    const updated = [newPersona, ...customAccounts];
    setCustomAccounts(updated);
    try {
      localStorage.setItem('manosetu_custom_accounts', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not save custom accounts to localStorage', err);
    }

    // Check if email was provided (optional)
    if (newPersona.email) {
      setIsSendingEmail(true);
      try {
        const response = await fetch('/api/send-registration-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newPersona.email,
            name: newPersona.name,
            roleBadge: newPersona.roleBadge,
            designation: newPersona.designation,
            organization: newPersona.organization,
            jurisdiction: newPersona.jurisdiction,
            badgeCode: newPersona.badgeCode,
            defaultTab: newPersona.defaultTab,
          }),
        });

        const data = await response.json();
        setDispatchedReceipt({
          recipient: newPersona.email,
          subject: data.subject || `[ManoSetu-NAWI] Official Onboarding & Sovereign Badge: ${newPersona.name}`,
          messageId: data.messageId,
          previewUrl: data.previewUrl,
          timestamp: data.timestamp || new Date().toUTCString(),
          htmlContent: data.htmlContent,
          persona: newPersona,
        });
      } catch (mailErr) {
        console.warn('Failed to send registration email:', mailErr);
        // Even if email network fails in sandbox, we still provision the account
        onSelectPersona(newPersona);
      } finally {
        setIsSendingEmail(false);
      }
    } else {
      // No email provided -> immediate entrance
      onSelectPersona(newPersona);
    }
  };

  const handleDeleteCustomAccount = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = customAccounts.filter((a) => a.id !== id);
    setCustomAccounts(updated);
    try {
      localStorage.setItem('manosetu_custom_accounts', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not update localStorage', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-12 relative overflow-hidden font-sans">
      {/* Background Subtle Metrological Grid Watermark */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#001428 1px, transparent 1px), radial-gradient(#001428 1px, #f8f9ff 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {/* Top Ministry & Hackathon Header */}
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 pb-6 border-b border-[#c3c6ce]/30 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#001428] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[24px]">balance</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-mono font-bold tracking-widest text-[#001428] uppercase">
              DEPARTMENT OF CONSUMER AFFAIRS • GOVERNMENT OF INDIA
            </span>
            <span className="text-[11px] text-[#43474d] font-medium">
              Legal Metrology Division • Statutory Standards & Model Approval Directorate
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold bg-[#001428] text-white px-2.5 py-1 rounded tracking-wider uppercase">
            SIH 2026 • PROBLEM ID SIH26035
          </span>
          <span className="text-[11px] font-mono font-bold text-[#006781] bg-[#eff4ff] border border-[#c3c6ce]/30 px-2.5 py-1 rounded">
            OIML R-76-1:2006 CORE
          </span>
        </div>
      </div>

      {/* Center Hero & Persona Selection / Account Creation */}
      <div className="max-w-7xl mx-auto w-full my-auto py-6 flex flex-col items-center text-center relative z-10">
        {/* Emblem / Scale Icon */}
        <div className="w-16 h-16 rounded-full bg-white border-2 border-[#001428] p-1 shadow-md flex items-center justify-center mb-3">
          <div className="w-full h-full rounded-full border border-dashed border-[#006781] flex items-center justify-center bg-[#eff4ff]/60">
            <span className="material-symbols-outlined text-[32px] text-[#001428]">scale</span>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#006781] mb-1">
          LEGAL METROLOGY • STATUTORY PORTAL & IDENTITY GATEWAY
        </span>

        <h1 className="text-[34px] sm:text-[42px] font-bold text-[#001428] tracking-tight font-serif uppercase">
          MANOSETU-NAWI
        </h1>

        <p className="max-w-3xl text-[13px] sm:text-[14px] text-[#43474d] leading-relaxed mt-1 mb-5">
          Select an authorized pre-configured metrology persona or generate a personalized officer account with your own credentials to access the laboratory test suite, tamper surveillance grid, and legal certificate vault.
        </p>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white border border-[#c3c6ce]/40 rounded-xl shadow-xs mb-6">
          <button
            onClick={() => setActiveView('browse')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-all ${
              activeView === 'browse'
                ? 'bg-[#001428] text-white shadow-xs'
                : 'text-[#43474d] hover:text-[#001428]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">groups</span>
            <span>Pre-Configured Personas</span>
            <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded">6</span>
          </button>

          <button
            onClick={() => setActiveView('create')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-all ${
              activeView === 'create'
                ? 'bg-[#006781] text-white shadow-xs'
                : 'text-[#006781] hover:text-[#001428] font-bold'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Generate Custom Officer Account</span>
            <span className="text-[9px] font-mono bg-[#21a173] text-white px-1.5 py-0.5 rounded font-bold uppercase">
              NEW
            </span>
          </button>
        </div>

        {/* ---------------- VIEW 1: BROWSE PERSONAS ---------------- */}
        {activeView === 'browse' && (
          <div className="w-full flex flex-col gap-6">
            {/* Custom Accounts Section (if user previously created any) */}
            {customAccounts.length > 0 && (
              <div className="flex flex-col gap-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#001428] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#006781]">badge</span>
                    Your Custom Registered Accounts ({customAccounts.length})
                  </span>
                  <button
                    onClick={() => setActiveView('create')}
                    className="text-[11px] font-mono font-bold text-[#006781] hover:underline flex items-center gap-1"
                  >
                    + Register Another Account
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customAccounts.map((account) => {
                    const isCurrent = currentPersona?.id === account.id;
                    return (
                      <div
                        key={account.id}
                        onClick={() => onSelectPersona(account)}
                        className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                          isCurrent
                            ? 'border-[#006781] ring-2 ring-[#006781]/30 bg-[#eff4ff]/30'
                            : 'border-[#c3c6ce]/40 hover:border-[#001428]/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#c3c6ce]/20">
                            <span className="text-[9px] font-mono font-bold bg-[#006781] text-white px-2 py-0.5 rounded uppercase">
                              {account.roleBadge}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-mono text-[#006781] font-semibold">
                                {account.badgeCode}
                              </span>
                              <button
                                onClick={(e) => handleDeleteCustomAccount(e, account.id)}
                                className="p-0.5 text-[#74777e] hover:text-[#ba1a1a] rounded"
                                title="Delete saved account"
                              >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-[#001428] text-white flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[20px]">
                                {account.avatarIcon}
                              </span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="font-bold text-[15px] text-[#001428] truncate leading-tight">
                                {account.name}
                              </h4>
                              <span className="text-[11px] text-[#43474d] truncate mt-0.5">
                                {account.designation}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-[#74777e] font-mono mb-2 truncate">
                            🏛️ {account.organization}
                          </div>

                          {account.email && (
                            <div className="text-[10px] text-[#43474d] font-mono mb-2 truncate">
                              ✉️ {account.email}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 bg-[#eff4ff] group-hover:bg-[#001428] text-[#001428] group-hover:text-white transition-all mt-2"
                        >
                          <span>Enter Portal As {account.name}</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Pre-configured Personas Section */}
            <div className="flex flex-col gap-3 text-left">
              <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#001428] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#001428]">domain</span>
                Official Statutory Personas (Pre-Configured)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full text-left">
                {PRACTICAL_PERSONAS.map((persona) => {
                  const isCurrent = currentPersona?.id === persona.id;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => onSelectPersona(persona)}
                      className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                        isCurrent
                          ? 'border-[#006781] ring-2 ring-[#006781]/30 bg-gradient-to-b from-white to-[#eff4ff]/40'
                          : 'border-[#c3c6ce]/40 hover:border-[#001428]/60 hover:-translate-y-1'
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-0 right-0 bg-[#006781] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl">
                          ACTIVE SESSION
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#c3c6ce]/20">
                          <span className="text-[10px] font-mono font-bold bg-[#001428] text-white px-2 py-0.5 rounded uppercase tracking-wider">
                            {persona.roleBadge}
                          </span>
                          <span className="text-[10px] font-mono text-[#006781] font-semibold truncate max-w-[140px]">
                            {persona.badgeCode}
                          </span>
                        </div>

                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] group-hover:bg-[#001428] group-hover:text-white transition-colors flex items-center justify-center text-[#001428] shrink-0 border border-[#c3c6ce]/30">
                            <span className="material-symbols-outlined text-[22px]">
                              {persona.avatarIcon}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h3 className="font-bold text-[17px] text-[#001428] group-hover:text-[#006781] transition-colors leading-tight truncate">
                              {persona.name}
                            </h3>
                            <span className="text-[12px] text-[#43474d] font-medium leading-tight truncate mt-0.5">
                              {persona.designation}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-[#74777e] font-mono mb-2 truncate">
                          🏛️ {persona.organization}
                        </div>

                        <p className="text-[12px] text-[#43474d] leading-relaxed mb-3 line-clamp-3">
                          {persona.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {persona.authorizedActions.slice(0, 3).map((act, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono bg-[#eff4ff] text-[#001428] px-1.5 py-0.5 rounded border border-[#c3c6ce]/30"
                            >
                              ✓ {act}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#c3c6ce]/20 flex flex-col gap-2">
                        {persona.futureScopeBadge && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#21a173] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#21a173] animate-pulse" />
                            <span>Future Scope: {persona.futureScopeBadge}</span>
                          </div>
                        )}

                        <button
                          type="button"
                          className={`w-full py-2 px-3 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            isCurrent
                              ? 'bg-[#006781] text-white shadow-sm'
                              : 'bg-[#eff4ff] group-hover:bg-[#001428] text-[#001428] group-hover:text-white'
                          }`}
                        >
                          <span>{isCurrent ? 'Continue As' : 'Enter Portal As'} {persona.role.replace('_', ' ')}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- VIEW 2: GENERATE CUSTOM OFFICER ACCOUNT ---------------- */}
        {activeView === 'create' && (
          <div className="w-full max-w-4xl bg-white rounded-2xl border border-[#c3c6ce]/40 shadow-xl p-6 sm:p-8 text-left animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-[#c3c6ce]/30 gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold bg-[#001428] text-white px-2 py-0.5 rounded uppercase tracking-wider">
                  STATUTORY REGISTRATION FORM
                </span>
                <h2 className="text-[22px] font-bold text-[#001428] mt-1">
                  Generate Metrology Officer / User Account
                </h2>
                <p className="text-[12px] text-[#43474d] mt-0.5">
                  Enter your official details to provision a digital credentials badge, access rights, and personalized statutory signature on Form VIII certificates.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('browse')}
                className="px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#001428] rounded-lg text-[12px] font-semibold flex items-center gap-1 self-start sm:self-auto transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Personas</span>
              </button>
            </div>

            {formError && (
              <div className="mb-5 p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-[12px] font-medium flex items-center gap-2 border border-[#ba1a1a]/30">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccountSubmit} className="space-y-5">
              {/* Row 1: Full Name & Role Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#001428] mb-1">
                    Full Name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/50 rounded-lg text-[13px] text-[#001428] focus:outline-none focus:border-[#006781]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#001428] mb-1">
                    Occupation / Role Category <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as PersonaRole)}
                    className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/50 rounded-lg text-[13px] text-[#001428] focus:outline-none focus:border-[#006781] font-semibold"
                  >
                    <option value="LAB_TECHNICIAN">Metrology Lab Technician (Calibration & Verification)</option>
                    <option value="EVALUATOR">Evaluator / Grand Finale Jury (Audit & Algorithm Review)</option>
                    <option value="FIELD_INSPECTOR">Flying Squad Enforcement LMO (Mandi Raids & Seizures)</option>
                    <option value="MANUFACTURER_OEM">Scale Manufacturer & OEM R&D Engineer (Model Approval)</option>
                    <option value="MANDI_SUPERINTENDENT">APMC Mandi Secretary (e-NAM Procurement & MSP)</option>
                    <option value="CITIZEN_OBSERVER">Citizen & Farmer Trade Advocate (Public Verification)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Official Designation & Department / Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[12px] font-semibold text-[#001428]">
                      Official Designation <span className="text-[#ba1a1a]">*</span>
                    </label>
                    {selectedDesignationOption === 'OTHERS' && (
                      <span className="text-[10px] font-mono text-[#006781] font-bold bg-[#eff4ff] px-1.5 py-0.2 rounded border border-[#c3c6ce]/30">
                        Custom Text Mode
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedDesignationOption}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedDesignationOption(val);
                      if (val !== 'OTHERS') {
                        setFormData((prev) => ({ ...prev, designation: val }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          designation: customDesignationText || 'Custom Designation',
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/50 rounded-lg text-[13px] text-[#001428] focus:outline-none focus:border-[#006781] font-medium"
                  >
                    {MAJOR_DESIGNATIONS.map((group, gIdx) => (
                      <optgroup key={gIdx} label={group.category} className="font-bold text-[#001428]">
                        {group.options.map((opt) => (
                          <option key={opt} value={opt} className="font-normal text-[#0b1c30]">
                            {opt}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <optgroup label="Custom / Other Options" className="font-bold text-[#006781]">
                      <option value="OTHERS" className="font-bold text-[#006781]">
                        ✏️ Others (Specify Custom Designation as Text)
                      </option>
                    </optgroup>
                  </select>

                  {/* Dynamic Custom Text Input if "Others" is selected */}
                  {selectedDesignationOption === 'OTHERS' && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="Type your custom official designation here..."
                        value={customDesignationText}
                        onChange={(e) => {
                          const text = e.target.value;
                          setCustomDesignationText(text);
                          setFormData((prev) => ({
                            ...prev,
                            designation: text || 'Custom Designation',
                          }));
                        }}
                        className="w-full px-3 py-2 bg-white border border-[#006781] rounded-lg text-[13px] text-[#001428] focus:outline-none ring-2 ring-[#006781]/20 shadow-xs"
                      />
                      <span className="text-[10px] text-[#43474d] mt-1 block font-medium">
                        ℹ️ This custom designation will be stamped on your digital sovereign badge and Form VIII audit certificates.
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#001428] mb-1">
                    Department / Organization <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Regional Reference Standards Laboratory / DoCA"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/50 rounded-lg text-[13px] text-[#001428] focus:outline-none focus:border-[#006781]"
                  />
                </div>
              </div>

              {/* Row 3: Official Email (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[12px] font-semibold text-[#001428]">
                    Official Email Address <span className="text-[#74777e] font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#006781] font-semibold bg-[#eff4ff] px-2 py-0.5 rounded border border-[#c3c6ce]/30">
                    Standard Login & Dispatch Receipt
                  </span>
                </div>
                <input
                  type="email"
                  placeholder="e.g. officer@doca.gov.in (Leave blank if not required)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/50 rounded-lg text-[13px] text-[#001428] focus:outline-none focus:border-[#006781]"
                />
                <span className="text-[10px] text-[#43474d] mt-1 block">
                  ℹ️ Optional: If provided, a standard official login link and statutory sovereign badge dossier will be dispatched automatically to this email.
                </span>
              </div>

              {/* Row 4: Jurisdiction & Sovereign Badge Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#001428] mb-1">
                    State / Region Jurisdiction
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi NCR / Maharashtra Western Zone"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/50 rounded-lg text-[13px] text-[#001428] focus:outline-none focus:border-[#006781]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[12px] font-semibold text-[#001428]">
                      Officer Sovereign Badge ID
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateBadgeCode}
                      className="text-[10px] font-mono text-[#006781] hover:underline font-bold"
                    >
                      ↻ Regenerate ID
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.badgeCode}
                    onChange={(e) => setFormData({ ...formData, badgeCode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/50 rounded-lg text-[13px] font-mono font-bold text-[#006781] focus:outline-none focus:border-[#006781]"
                  />
                </div>
              </div>

              {/* Row 5: Default Operational Terminal */}
              <div>
                <label className="block text-[12px] font-semibold text-[#001428] mb-1">
                  Default Starting Terminal / Workspace
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'r-76-automated-test-suite', label: 'R-76 Automated Test Suite', icon: 'speed' },
                    { id: 'national-surveillance-grid', label: 'National Mandi Surveillance', icon: 'grid_view' },
                    { id: 'legal-certificate-vault', label: 'Form VIII Legal Vault', icon: 'verified' },
                    { id: 'dashboard-and-telemetry', label: '20Hz Serial Telemetry Bridge', icon: 'monitoring' },
                    { id: 'govt-standards-registry', label: 'Govt Approved Models Directory', icon: 'menu_book' },
                    { id: 'system-architecture', label: 'SIH 2026 Architecture Pitch', icon: 'architecture' },
                  ].map((terminal) => (
                    <button
                      key={terminal.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, defaultTab: terminal.id as any })}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        formData.defaultTab === terminal.id
                          ? 'border-[#006781] bg-[#eff4ff] text-[#001428] font-bold ring-1 ring-[#006781]'
                          : 'border-[#c3c6ce]/30 hover:border-[#001428]/40 text-[#43474d]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#006781]">
                        {terminal.icon}
                      </span>
                      <span className="text-[11px] truncate">{terminal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Badge Preview */}
              <div className="p-4 bg-[#eff4ff]/60 rounded-xl border border-[#c3c6ce]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#001428] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[26px]">
                      {ROLE_PRESETS[formData.role].avatarIcon}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px] text-[#001428]">
                        {formData.name || 'Your Full Name'}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-[#006781] text-white px-2 py-0.2 rounded">
                        {ROLE_PRESETS[formData.role].roleBadge}
                      </span>
                    </div>
                    <span className="text-[12px] text-[#43474d]">
                      {formData.designation} • {formData.organization}
                    </span>
                    <span className="text-[10px] font-mono text-[#006781] font-semibold mt-0.5">
                      Badge: {formData.badgeCode} • Scope: {ROLE_PRESETS[formData.role].futureScope}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#21a173] font-bold bg-white px-2.5 py-1 rounded border border-[#21a173]/30">
                  ● READY TO PROVISION
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#c3c6ce]/30">
                <button
                  type="button"
                  onClick={() => setActiveView('browse')}
                  className="px-4 py-2.5 rounded-lg border border-[#c3c6ce]/40 hover:bg-[#eff4ff] text-[#43474d] text-[13px] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-6 py-2.5 rounded-lg bg-[#001428] hover:bg-[#006781] disabled:opacity-60 text-white text-[13px] font-bold flex items-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                >
                  {isSendingEmail ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      <span>Dispatching Credentials Email...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      <span>Generate Account & Enter Metrology Portal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Session Continue (if persona is already selected) */}
        {currentPersona && onContinueCurrent && activeView === 'browse' && (
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onContinueCurrent}
              className="px-5 py-2.5 bg-[#001428] hover:bg-[#0f2942] text-white rounded-lg text-[13px] font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Return to Active Session ({currentPersona.name})</span>
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
            </button>
          </div>
        )}
      </div>

      {/* Dispatched Email Success Notification Modal */}
      {dispatchedReceipt && (
        <div className="fixed inset-0 z-50 bg-[#001428]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#c3c6ce]/50 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#c3c6ce]/30">
              <div className="w-12 h-12 rounded-full bg-[#002e1d] text-[#85f8c4] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">mark_email_read</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold bg-[#001428] text-white px-2 py-0.5 rounded uppercase self-start">
                  OFFICIAL DISPATCH CONFIRMED
                </span>
                <h3 className="text-[18px] font-bold text-[#001428] mt-1 leading-tight">
                  Registration & Login Email Dispatched
                </h3>
              </div>
            </div>

            <p className="text-[13px] text-[#43474d] leading-relaxed mb-4">
              A standard statutory onboarding email containing your sovereign badge, designated jurisdiction, and magic login link has been dispatched to:
            </p>

            <div className="bg-[#eff4ff] p-3.5 rounded-xl border border-[#c3c6ce]/40 mb-4 font-mono text-[12px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#74777e]">RECIPIENT:</span>
                <span className="font-bold text-[#001428]">{dispatchedReceipt.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#74777e]">SOVEREIGN ID:</span>
                <span className="font-bold text-[#006781]">{dispatchedReceipt.persona.badgeCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#74777e]">TIMESTAMP:</span>
                <span className="text-[#0b1c30] truncate max-w-[240px]">{dispatchedReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#74777e]">STATUS:</span>
                <span className="text-[#21a173] font-bold">200 OK • DELIVERED</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(true)}
                className="flex-1 py-2.5 px-3 rounded-lg border border-[#c3c6ce]/50 hover:bg-[#eff4ff] text-[#001428] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>View Email Dispatch Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = dispatchedReceipt.persona;
                  setDispatchedReceipt(null);
                  onSelectPersona(p);
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#001428] hover:bg-[#006781] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <span>Enter Portal Now</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rendered Email Receipt Modal Preview */}
      {showEmailPreviewModal && dispatchedReceipt && (
        <div className="fixed inset-0 z-50 bg-[#001428]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#c3c6ce]/50 max-w-2xl w-full h-[650px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#001428] text-white p-3.5 px-5 flex items-center justify-between border-b border-[#0f2942]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#8fdfff]">outgoing_mail</span>
                <span className="font-bold text-[13px] text-white">
                  Statutory Dispatch Preview: {dispatchedReceipt.recipient}
                </span>
              </div>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="p-1 hover:bg-[#0f2942] rounded text-[#cbdbf5]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-[#f8f9ff]">
              {dispatchedReceipt.htmlContent ? (
                <iframe
                  title="Dispatched Email Receipt"
                  srcDoc={dispatchedReceipt.htmlContent}
                  className="w-full h-full min-h-[480px] bg-white rounded-lg border border-[#c3c6ce]/30 shadow-inner"
                />
              ) : (
                <div className="p-4 bg-white rounded-lg border text-[13px]">
                  <strong>Subject:</strong> {dispatchedReceipt.subject}<br />
                  <strong>To:</strong> {dispatchedReceipt.recipient}<br />
                  <strong>Timestamp:</strong> {dispatchedReceipt.timestamp}
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-[#c3c6ce]/30 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#74777e]">
                Standard DoCA Statutory Dispatch Protocol
              </span>
              <button
                type="button"
                onClick={() => {
                  const p = dispatchedReceipt.persona;
                  setShowEmailPreviewModal(false);
                  setDispatchedReceipt(null);
                  onSelectPersona(p);
                }}
                className="px-4 py-2 bg-[#001428] hover:bg-[#006781] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Enter Metrology Portal</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Legal & Future Scope Footnote */}
      <div className="max-w-7xl mx-auto w-full pt-6 border-t border-[#c3c6ce]/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#74777e] font-mono relative z-10 text-center sm:text-left">
        <div>
          Role-Based Access Control (RBAC) enforces statutory demarcation between lab calibration, field enforcement & public verification.
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#21a173] font-semibold">● SOVEREIGN CREDENTIAL READY</span>
          <span>•</span>
          <span>W3C VC & DIGILOCKER SPEC 2026</span>
        </div>
      </div>
    </div>
  );
};
