import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { R76TestSuite } from './components/R76TestSuite';
import { DashboardTelemetry } from './components/DashboardTelemetry';
import { LegalCertificateVault } from './components/LegalCertificateVault';
import { NationalSurveillanceGrid } from './components/NationalSurveillanceGrid';
import { GovtStandardsRegistry } from './components/GovtStandardsRegistry';
import { SystemArchitecture } from './components/SystemArchitecture';
import { MinistryConsumerFoodCommand } from './components/MinistryConsumerFoodCommand';
import { FormVIIICertificateModal } from './components/modals/FormVIIICertificateModal';
import { LedgerVerificationModal } from './components/modals/LedgerVerificationModal';
import { DeviceSetupModal } from './components/modals/DeviceSetupModal';
import { GovtQuickLookupModal } from './components/modals/GovtQuickLookupModal';
import { CitizenGrievanceModal } from './components/modals/CitizenGrievanceModal';
import { SetuAIBot } from './components/SetuAIBot';
import { IdentityGateway } from './components/IdentityGateway';
import {
  initialDeviceUnderTest,
  initialAmbient,
  sampleCertificates,
  initialAuditTrail,
} from './data/metrologyData';
import { DeviceUnderTest, FormVIIICertificate, StatutoryAuditRecord, UserPersona, PRACTICAL_PERSONAS } from './types/metrology';

export default function App() {
  const [currentPersona, setCurrentPersona] = useState<UserPersona | null>(() => {
    const saved = localStorage.getItem('manosetu_persona_id');
    if (saved) {
      return PRACTICAL_PERSONAS.find((p) => p.id === saved) || null;
    }
    return null;
  });
  const [isIdentityGatewayOpen, setIsIdentityGatewayOpen] = useState<boolean>(() => {
    return !localStorage.getItem('manosetu_persona_id');
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('r-76-automated-test-suite');
  const [device, setDevice] = useState<DeviceUnderTest>(initialDeviceUnderTest);
  const [ambient] = useState(initialAmbient);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [portName] = useState<string>('COM3');
  const [certificates] = useState<FormVIIICertificate[]>(sampleCertificates);
  const [selectedCertForModal, setSelectedCertForModal] = useState<FormVIIICertificate>(sampleCertificates[0]);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState<boolean>(false);
  const [isDeviceSetupModalOpen, setIsDeviceSetupModalOpen] = useState<boolean>(false);
  const [isGovtQuickLookupOpen, setIsGovtQuickLookupOpen] = useState<boolean>(false);
  const [isGrievanceModalOpen, setIsGrievanceModalOpen] = useState<boolean>(false);
  const [auditTrail, setAuditTrail] = useState<StatutoryAuditRecord[]>(initialAuditTrail);

  const handleSelectPersona = (persona: UserPersona) => {
    setCurrentPersona(persona);
    localStorage.setItem('manosetu_persona_id', persona.id);
    setActiveTab(persona.defaultTab);
    setIsIdentityGatewayOpen(false);
  };

  // Toggle port bridge
  const handleTogglePort = () => {
    setIsConnected((prev) => !prev);
  };

  const handleOpenCertificateModal = (cert?: FormVIIICertificate) => {
    if (cert) setSelectedCertForModal(cert);
    setIsCertificateModalOpen(true);
  };

  const handleAddAuditRecord = (record: StatutoryAuditRecord) => {
    setAuditTrail((prev) => [record, ...prev]);
  };

  // Keyboard shortcut listener (F5 for quick suite execution)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5' && activeTab === 'r-76-automated-test-suite') {
        e.preventDefault();
        const runBtn = document.getElementById('btn-run-suite');
        if (runBtn) runBtn.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  if (!currentPersona || isIdentityGatewayOpen) {
    return (
      <IdentityGateway
        currentPersona={currentPersona}
        onSelectPersona={handleSelectPersona}
        onContinueCurrent={currentPersona ? () => setIsIdentityGatewayOpen(false) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans selection:bg-[#8fdfff] selection:text-[#00647d]">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isConnected={isConnected}
        currentPersona={currentPersona}
        onSwitchIdentity={() => setIsIdentityGatewayOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="pl-72 flex flex-col min-h-screen">
        {/* Fixed Top Statutory Header */}
        <TopBar
          ambient={ambient}
          isConnected={isConnected}
          portName={portName}
          onTogglePort={handleTogglePort}
          onOpenDeviceSetup={() => setIsDeviceSetupModalOpen(true)}
          onOpenGovtQuickLookup={() => setIsGovtQuickLookupOpen(true)}
          onOpenGrievanceModal={() => setIsGrievanceModalOpen(true)}
          onNavigateToMinistryHub={() => setActiveTab('consumer-food-command')}
          currentPersona={currentPersona}
          onSwitchIdentity={() => setIsIdentityGatewayOpen(true)}
        />

        {/* Dynamic Screen Viewport */}
        <main className="pt-24 px-6 flex-1 w-full max-w-[1720px] mx-auto">
          {/* Active Operating Persona Context Bar */}
          <div className="mb-4 bg-white p-2.5 px-3.5 rounded border border-[#c3c6ce]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 no-print">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#21a173] animate-pulse" />
              <span className="text-[11px] font-mono font-bold bg-[#001428] text-white px-2 py-0.5 rounded uppercase">
                {currentPersona.roleBadge}
              </span>
              <span className="text-[12px] font-semibold text-[#001428]">
                Active Identity: {currentPersona.name} ({currentPersona.organization})
              </span>
              <span className="hidden lg:inline text-[11px] text-[#43474d] font-mono">
                • {currentPersona.badgeCode}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentPersona.futureScopeBadge && (
                <span className="text-[10px] font-mono text-[#006781] bg-[#eff4ff] px-2 py-0.5 rounded font-semibold border border-[#c3c6ce]/20 hidden md:inline">
                  🚀 {currentPersona.futureScopeBadge}
                </span>
              )}
              <button
                onClick={() => setIsIdentityGatewayOpen(true)}
                className="text-[11px] text-[#006781] hover:text-[#001428] hover:underline font-semibold font-mono flex items-center gap-1"
                title="Switch to another role or persona"
              >
                <span>Switch Role</span>
                <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
              </button>
            </div>
          </div>

          {activeTab === 'r-76-automated-test-suite' && (
            <R76TestSuite
              device={device}
              onOpenLedgerModal={() => setIsLedgerModalOpen(true)}
              onOpenCertificateModal={() => handleOpenCertificateModal(selectedCertForModal)}
              auditTrail={auditTrail}
              onAddAuditRecord={handleAddAuditRecord}
              onOpenGovtLookup={() => setIsGovtQuickLookupOpen(true)}
            />
          )}

          {activeTab === 'dashboard-and-telemetry' && (
            <DashboardTelemetry
              device={device}
              ambient={ambient}
              isConnected={isConnected}
              onTogglePort={handleTogglePort}
              portName={portName}
            />
          )}

          {activeTab === 'legal-certificate-vault' && (
            <LegalCertificateVault
              certificates={certificates}
              onOpenCertificateModal={handleOpenCertificateModal}
              onOpenLedgerModal={() => setIsLedgerModalOpen(true)}
            />
          )}

          {activeTab === 'national-surveillance-grid' && (
            <NationalSurveillanceGrid />
          )}

          {activeTab === 'govt-standards-registry' && (
            <GovtStandardsRegistry
              onSelectModelToDUT={(newDev) => setDevice(newDev)}
            />
          )}

          {activeTab === 'system-architecture' && (
            <SystemArchitecture />
          )}

          {activeTab === 'consumer-food-command' && (
            <MinistryConsumerFoodCommand
              currentPersona={currentPersona}
              onOpenGrievanceModal={() => setIsGrievanceModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <FormVIIICertificateModal
        certificate={selectedCertForModal}
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
      />

      <LedgerVerificationModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        auditTrail={auditTrail}
      />

      <DeviceSetupModal
        currentDevice={device}
        isOpen={isDeviceSetupModalOpen}
        onClose={() => setIsDeviceSetupModalOpen(false)}
        onSelectDevice={setDevice}
      />

      <GovtQuickLookupModal
        isOpen={isGovtQuickLookupOpen}
        onClose={() => setIsGovtQuickLookupOpen(false)}
        onApplyModelToDUT={(newDev) => setDevice(newDev)}
      />

      <CitizenGrievanceModal
        isOpen={isGrievanceModalOpen}
        onClose={() => setIsGrievanceModalOpen(false)}
        onViewCommandCenter={() => setActiveTab('consumer-food-command')}
      />

      {/* Setu AI FAQ & Navigation Assistant */}
      <SetuAIBot
        activeTab={activeTab}
        currentPersona={currentPersona}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenDeviceSetup={() => setIsDeviceSetupModalOpen(true)}
        onOpenGovtLookup={() => setIsGovtQuickLookupOpen(true)}
        onOpenPersonaGateway={() => setIsIdentityGatewayOpen(true)}
        onOpenGrievanceModal={() => setIsGrievanceModalOpen(true)}
      />
    </div>
  );
}
