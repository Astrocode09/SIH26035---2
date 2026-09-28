import React from 'react';
import { UserPersona } from '../types/metrology';

export type ActiveTab =
  | 'dashboard-and-telemetry'
  | 'r-76-automated-test-suite'
  | 'consumer-food-command'
  | 'legal-certificate-vault'
  | 'national-surveillance-grid'
  | 'govt-standards-registry'
  | 'system-architecture';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isConnected: boolean;
  currentPersona?: UserPersona | null;
  onSwitchIdentity?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isConnected,
  currentPersona,
  onSwitchIdentity,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard-and-telemetry' as ActiveTab,
      label: 'Dashboard & Telemetry',
      icon: 'speed',
    },
    {
      id: 'r-76-automated-test-suite' as ActiveTab,
      label: 'R-76 Automated Test Suite',
      icon: 'rule',
    },
    {
      id: 'consumer-food-command' as ActiveTab,
      label: 'Ministry Citizen & Food Hub',
      icon: 'policy',
      highlightBadge: 'DoCA & FCI',
    },
    {
      id: 'legal-certificate-vault' as ActiveTab,
      label: 'Legal Certificate Vault',
      icon: 'verified',
    },
    {
      id: 'national-surveillance-grid' as ActiveTab,
      label: 'National Surveillance Grid',
      icon: 'travel_explore',
    },
    {
      id: 'govt-standards-registry' as ActiveTab,
      label: 'Govt Standards & Approvals',
      icon: 'menu_book',
    },
    {
      id: 'system-architecture' as ActiveTab,
      label: 'System Architecture',
      icon: 'hub',
    },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-[#c3c6ce]/30 z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(15,41,66,0.04)] no-print transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      <div className="flex flex-col">
        {/* Brand header */}
        <div className="h-20 px-4 border-b border-[#c3c6ce]/20 flex items-center justify-between bg-[#eff4ff]/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              alt="ManoSetu-NAWI Metrology Emblem"
              className="h-9 w-auto object-contain shrink-0"
              src="https://lh3.googleusercontent.com/aida/AEtjO1VT4JjrsZpRt_PLvcRkVnHW_4P6n0ifqPxGi_GPO2QIFW9jNdVOI-6yGT2JBoxT-IIfq5_qcHm_fpuA6jizOCQB-tQ1af64s8shom5YdfkZThTiGt3IDhC9LohQlgZ54c_BLmRQWOPn8hncJEg_0JY4Zz6B0sFvOXh963-ypnRPWZZqErQqqfV8hJyD1IOTaej1q3Ke_KydupnxkwQ_nyORUjVvbDQOVleZ15UubDrQAEpttsL-dCgtFHs"
              onError={(e) => {
                // Graceful fallback if external link is restricted
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[16px] tracking-tight text-[#001428] leading-tight truncate">
                ManoSetu-NAWI
              </span>
              <span className="text-[11px] text-[#43474d] uppercase tracking-wider truncate font-semibold">
                OIML R-76 Statutory Core
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#43474d] hover:bg-[#dce9ff] rounded-lg transition-colors cursor-pointer"
              title="Close menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Hardware Status Strip */}
        <div className="px-4 pt-3 pb-1">
          <div className="bg-[#eff4ff] p-2 rounded border border-[#c3c6ce]/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#006781] animate-pulse' : 'bg-[#ba1a1a]'}`} />
              <span className="font-mono text-[11px] font-bold text-[#006781] uppercase">
                RS-232 / BLE
              </span>
            </div>
            <span className="text-[10px] text-[#21a173] bg-white px-1.5 py-0.5 rounded border border-[#c3c6ce]/20 font-mono font-semibold">
              SYNC 9600-8N1
            </span>
          </div>
        </div>

        {/* Section title */}
        <div className="px-4 pt-2">
          <span className="text-[10px] text-[#43474d] uppercase tracking-widest font-semibold">
            Metrology Framework
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1 px-3 mt-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile?.();
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-[14px] text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0f2942] text-white font-semibold shadow-sm'
                    : 'text-[#43474d] hover:bg-[#dce9ff] hover:text-[#0b1c30]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="truncate flex-1">{item.label}</span>
                {item.highlightBadge && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider ${
                    isActive ? 'bg-[#8fdfff] text-[#001428]' : 'bg-[#e0f3ff] text-[#006781]'
                  }`}>
                    {item.highlightBadge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom statutory stamp box & persona switcher */}
      <div className="p-4 border-t border-[#c3c6ce]/30 bg-white flex flex-col gap-2">
        {currentPersona && onSwitchIdentity && (
          <button
            onClick={onSwitchIdentity}
            className="p-2 bg-[#eff4ff] hover:bg-[#dce9ff] rounded border border-[#c3c6ce]/30 flex items-center justify-between text-left transition-colors group"
            title="Click to switch active role"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-[#001428] text-white flex items-center justify-center text-[14px] shrink-0">
                <span className="material-symbols-outlined text-[14px]">{currentPersona.avatarIcon}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-[#001428] truncate">{currentPersona.name}</span>
                <span className="text-[9px] font-mono text-[#006781] truncate">{currentPersona.roleBadge}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#74777e] group-hover:text-[#001428]">
              swap_horiz
            </span>
          </button>
        )}

        <div className="bg-[#eff4ff] p-2.5 rounded border border-[#c3c6ce]/20 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#43474d]">STAMP HASH</span>
            <span className="font-mono text-[11px] font-bold text-[#0b1c30]">
              0x9B4E…A17
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#43474d]">
            <span>OIML CLASS III</span>
            <span className="text-[#21a173] font-semibold">CERT-VERIFIED</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
