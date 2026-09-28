import React from 'react';
import { AmbientConditions, UserPersona } from '../types/metrology';

interface TopBarProps {
  ambient: AmbientConditions;
  isConnected: boolean;
  portName: string;
  onTogglePort: () => void;
  onOpenDeviceSetup: () => void;
  onOpenGovtQuickLookup: () => void;
  onOpenGrievanceModal?: () => void;
  onNavigateToMinistryHub?: () => void;
  onToggleMobileMenu?: () => void;
  currentPersona: UserPersona | null;
  onSwitchIdentity: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  ambient,
  isConnected,
  portName,
  onTogglePort,
  onOpenDeviceSetup,
  onOpenGovtQuickLookup,
  onOpenGrievanceModal,
  onNavigateToMinistryHub,
  onToggleMobileMenu,
  currentPersona,
  onSwitchIdentity,
}) => {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#c3c6ce]/30 z-40 px-3 sm:px-6 flex items-center justify-between shadow-[0_1px_8px_rgba(15,41,66,0.03)] no-print">
      <div className="flex items-center gap-3 sm:gap-5">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-[#001428] hover:bg-[#eff4ff] rounded-lg transition-colors cursor-pointer shrink-0"
            title="Open navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        )}

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold bg-[#0f2942] text-white px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
              SIH26035 COMPLIANT
            </span>
            <span className="hidden sm:inline text-[11px] text-[#43474d] font-medium font-mono truncate">
              DOC: MCA-LMD-2025/R76
            </span>
          </div>
          <span className="text-[12px] sm:text-[13px] text-[#0b1c30] font-medium truncate max-w-[220px] sm:max-w-md lg:max-w-lg mt-0.5">
            Ministry of Consumer Affairs, Food & Public Distribution • Legal Metrology Division
          </span>
        </div>

        {/* Ambient Laboratory Telemetry */}
        <div className="hidden xl:flex items-center gap-3.5 px-3 py-1 bg-[#eff4ff] rounded border border-[#c3c6ce]/30">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#006781] text-[16px]">thermostat</span>
            <span className="text-[11px] text-[#43474d]">T:</span>
            <span className="font-mono text-[13px] font-semibold text-[#0b1c30]">{ambient.temperatureC.toFixed(1)}°C</span>
          </div>
          <div className="w-px h-3.5 bg-[#c3c6ce]/50" />
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#006781] text-[16px]">humidity_percentage</span>
            <span className="text-[11px] text-[#43474d]">RH:</span>
            <span className="font-mono text-[13px] font-semibold text-[#0b1c30]">{ambient.relativeHumidityPct}%</span>
          </div>
          <div className="w-px h-3.5 bg-[#c3c6ce]/50" />
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#006781] text-[16px]">compress</span>
            <span className="text-[11px] text-[#43474d]">P:</span>
            <span className="font-mono text-[13px] font-semibold text-[#0b1c30]">{ambient.pressureHPa.toFixed(1)} hPa</span>
          </div>
          <div className="w-px h-3.5 bg-[#c3c6ce]/50" />
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#006781] text-[16px]">public</span>
            <span className="text-[11px] text-[#43474d]">g:</span>
            <span className="font-mono text-[13px] font-semibold text-[#0b1c30]">{ambient.gravityMPerS2.toFixed(3)} m/s²</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePort}
          title="Click to toggle serial hardware bridge"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] rounded border border-[#c3c6ce]/40 text-[#0b1c30] text-xs font-mono transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#21a173] animate-pulse' : 'bg-[#ba1a1a]'}`} />
          <span className="font-bold tracking-tight">
            PORT: {portName} {isConnected ? 'OPEN' : 'OFFLINE'}
          </span>
        </button>

        {onOpenGrievanceModal && (
          <button
            onClick={onOpenGrievanceModal}
            title="Lodge Citizen Short-Weighing Grievance (National Consumer Helpline 1915)"
            className="px-2.5 py-1.5 bg-[#ffd043]/20 hover:bg-[#ffd043]/40 text-[#001428] border border-[#b68800]/40 rounded text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span className="text-[14px]">📢</span>
            <span className="hidden lg:inline">Jago Grahak Jago (1915)</span>
          </button>
        )}

        {onNavigateToMinistryHub && (
          <button
            onClick={onNavigateToMinistryHub}
            title="Open Ministry Citizen & Foodgrain Command (DoCA & FCI Hub)"
            className="px-2.5 py-1.5 bg-[#001428] hover:bg-[#006781] text-white rounded text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-[#8fdfff]">policy</span>
            <span className="hidden sm:inline">Ministry Cockpit</span>
          </button>
        )}

        <button
          onClick={onOpenGovtQuickLookup}
          title="Quick lookup for Government Approved Models, OIML R-76 MPE & Standards"
          className="px-2.5 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#001428] border border-[#c3c6ce]/40 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[#006781] text-[16px]">menu_book</span>
          <span className="hidden sm:inline">Govt Norms</span>
        </button>

        <button
          onClick={onOpenDeviceSetup}
          title="Configure Device Under Test (DUT)"
          className="px-2.5 py-1.5 bg-[#0f2942] hover:bg-[#001428] text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span className="hidden sm:inline">DUT Settings</span>
        </button>

        {/* User Identity / Persona Badge & Switch Action */}
        {currentPersona ? (
          <button
            onClick={onSwitchIdentity}
            title="Click to switch operating role or identity"
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#c3c6ce]/40 rounded-full transition-all group shadow-xs"
          >
            <div className="w-7 h-7 rounded-full bg-[#001428] group-hover:bg-[#006781] transition-colors flex items-center justify-center text-white text-[16px] shrink-0">
              <span className="material-symbols-outlined text-[16px]">{currentPersona.avatarIcon}</span>
            </div>
            <div className="flex flex-col text-left max-w-[130px] hidden md:flex">
              <span className="text-[11px] font-bold text-[#001428] truncate leading-tight">
                {currentPersona.name}
              </span>
              <span className="text-[9px] font-mono text-[#006781] font-semibold truncate leading-tight">
                {currentPersona.roleBadge}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#74777e] group-hover:text-[#001428]">
              swap_horiz
            </span>
          </button>
        ) : (
          <button
            onClick={onSwitchIdentity}
            className="px-3 py-1.5 bg-[#001428] hover:bg-[#0f2942] text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">badge</span>
            <span>Select Identity</span>
          </button>
        )}
      </div>
    </header>
  );
};
