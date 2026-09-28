import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab } from './Sidebar';
import { UserPersona } from '../types/metrology';

interface ChatMessage {
  id: string;
  sender: 'user' | 'setu';
  text: string;
  timestamp: string;
}

interface SetuAIBotProps {
  activeTab?: ActiveTab;
  currentPersona?: UserPersona | null;
  onNavigate?: (tab: ActiveTab) => void;
  onOpenDeviceSetup?: () => void;
  onOpenGovtLookup?: () => void;
  onOpenPersonaGateway?: () => void;
  onOpenGrievanceModal?: () => void;
}

const FAQ_SUGGESTIONS = [
  'How to use this site?',
  'What is ManoSetu-NAWI?',
  'How do I test a scale?',
  'Where are Form VIII certificates?',
  'How does the Ministry protect farmers?',
  'Report short-weighing (NCH 1915)',
  'How do I change scale capacity & e?',
  'What are the keyboard shortcuts?',
  'What is Clause A.4.4.3 turning point?',
];

const NAVIGATION_SHORTCUTS: {
  label: string;
  icon: string;
  tab?: ActiveTab;
  action?: 'dut' | 'gateway' | 'lookup' | 'grievance';
}[] = [
  { label: 'Run Test Suite', icon: 'speed', tab: 'r-76-automated-test-suite' },
  { label: 'Ministry Hub', icon: 'policy', tab: 'consumer-food-command' },
  { label: 'Jago Grahak 1915', icon: 'campaign', action: 'grievance' },
  { label: 'Mandi Grid', icon: 'grid_view', tab: 'national-surveillance-grid' },
  { label: 'Form VIII Vault', icon: 'verified', tab: 'legal-certificate-vault' },
  { label: '20Hz Telemetry', icon: 'monitoring', tab: 'dashboard-and-telemetry' },
  { label: 'Govt Models', icon: 'menu_book', tab: 'govt-standards-registry' },
  { label: 'Scale DUT Setup', icon: 'tune', action: 'dut' },
  { label: 'Switch Role', icon: 'person_switch', action: 'gateway' },
  { label: 'Norms Lookup', icon: 'auto_stories', action: 'lookup' },
];

export const SetuAIBot: React.FC<SetuAIBotProps> = ({
  activeTab,
  currentPersona,
  onNavigate,
  onOpenDeviceSetup,
  onOpenGovtLookup,
  onOpenPersonaGateway,
  onOpenGrievanceModal,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [navNotification, setNavNotification] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const personaName = currentPersona?.name ? `, ${currentPersona.name}` : '';
    return [
      {
        id: 'welcome',
        sender: 'setu',
        text: `Namaste${personaName}! I am Setu, your metrology AI assistant.

I can guide you anywhere across the ManoSetu-NAWI platform. Tap **"How to use this site?"** below for a fast 4-step walkthrough, or ask me any question about testing scales, certificates, mandi monitoring, or citizen rights!

How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Clear navigation notification toast after 3 seconds
  useEffect(() => {
    if (navNotification) {
      const timer = setTimeout(() => setNavNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [navNotification]);

  const handleExecuteNav = (tab: ActiveTab, label: string) => {
    if (onNavigate) {
      onNavigate(tab);
      setNavNotification(`Navigated to: ${label}`);
    }
  };

  const handleExecuteAction = (actionId: string, label: string) => {
    if (actionId === 'dut-settings' && onOpenDeviceSetup) {
      onOpenDeviceSetup();
      setNavNotification(`Opened: ${label}`);
    } else if (actionId === 'identity-gateway' && onOpenPersonaGateway) {
      onOpenPersonaGateway();
      setNavNotification(`Opened: ${label}`);
    } else if (actionId === 'govt-lookup' && onOpenGovtLookup) {
      onOpenGovtLookup();
      setNavNotification(`Opened: ${label}`);
    } else if (actionId === 'citizen-grievance' && onOpenGrievanceModal) {
      onOpenGrievanceModal();
      setNavNotification(`Opened: ${label}`);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    setMessages(newMessages);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const history = newMessages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          history,
          currentTab: activeTab,
          userRole: currentPersona?.roleBadge || currentPersona?.name || 'Metrology Officer',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || 'I am having trouble answering right now. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: `setu-${Date.now()}`,
          sender: 'setu',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.warn('Setu API error, using smart fallback with navigation tokens:', err);
      const lower = query.toLowerCase();
      let fallback = '';

      if (lower.includes('how to use') || lower.includes('how do i use') || lower.includes('walkthrough') || lower.includes('getting started') || lower.includes('guide') || lower.includes('tutorial') || lower.includes('how to start')) {
        fallback = "Here is a simple 4-step guide to using ManoSetu-NAWI:\n\n" +
          "1. **Check Scale Specs**: Customize your scale capacity (Max) and scale interval (e) via [ACTION:dut-settings|Configure Scale DUT Settings], or switch your operating persona in [ACTION:identity-gateway|Switch Role / Create Account].\n" +
          "2. **Run Automated Test Suite**: Open [NAV:r-76-automated-test-suite|R-76 Automated Test Suite] and click **'Run Automated R-76 Test Suite'** (or press **F5**). It automatically runs standard load points, turning point math (P = I + 0.5e - ΔL), and the 5-point platter test.\n" +
          "3. **Issue & Print Certificate**: When tests pass, click **'Issue Form VIII Certificate'**. You can inspect and print the legal certificate in [NAV:legal-certificate-vault|Form VIII Vault].\n" +
          "4. **Surveillance & Citizen Protection**:\n" +
          "   • Watch live APMC mandi weighbridges in [NAV:national-surveillance-grid|National Surveillance Grid].\n" +
          "   • Simulate farmer harvest losses or report fuel/ration short-weighing in [NAV:consumer-food-command|Ministry Citizen & Food Hub].";
      } else if (lower.includes('what is manosetu') || lower.includes('what is this site') || lower.includes('about this site') || lower.includes('about this app') || lower.includes('what is this app')) {
        fallback = "**ManoSetu-NAWI** is the Central Automated Legal Metrology Verification System for Non-Automatic Weighing Instruments (built for SIH 2026 Problem Statement SIH26035).\n\n" +
          "• **100% Statutory Compliance**: Built according to OIML R-76-1:2006 and the Legal Metrology Act, 2009.\n" +
          "• **Automated Accuracy**: Eliminates manual paper errors by capturing turning points (ΔL) and comparing against strict MPE limits.\n" +
          "• **Anti-Tamper Shield**: Detects 433 MHz illegal wireless remotes and load cell bypass shunts.\n" +
          "• **Citizen & Farmer Welfare**: Protects 81+ Crore ration recipients and millions of farmers selling grain at APMC mandis.\n\n" +
          "[NAV:r-76-automated-test-suite|Start with R-76 Test Suite]";
      } else if (lower.includes('shortcut') || lower.includes('f5') || lower.includes('hotkey')) {
        fallback = "⚡ **Keyboard Shortcuts in ManoSetu-NAWI**:\n\n" +
          "• **F5**: Press F5 on your keyboard while in the R-76 Test Suite to immediately start the automated verification run!\n" +
          "• You can also use the quick jump buttons at the top of this Setu chat drawer to navigate between terminals anytime.\n\n" +
          "[NAV:r-76-automated-test-suite|Try F5 in R-76 Test Suite]";
      } else if (lower.includes('ministry') || lower.includes('doca') || lower.includes('food') || lower.includes('farmer') || lower.includes('msp') || lower.includes('ration') || lower.includes('fps')) {
        fallback = "The **Ministry of Consumer Affairs, Food & Public Distribution** command center unites DoCA and DFPD:\n\n" +
          "• **Farmer MSP & Mandi Shield**: Prevents systemic -0.8% weighbridge cheating during grain harvest procurement.\n" +
          "• **FPS Ration e-PoS Guard**: Secures monthly PMGKAY rice & wheat distribution for 80+ Crore citizens.\n" +
          "• **Jago Grahak Jago (NCH 1915)**: Rapid Flying Squad raids on short-weighing petrol pumps, domestic gas cylinders, and grocery packages.\n\n" +
          "[NAV:consumer-food-command|Open Ministry Citizen & Food Hub]";
      } else if (lower.includes('complain') || lower.includes('cheat') || lower.includes('grievance') || lower.includes('petrol') || lower.includes('jago grahak') || lower.includes('1915')) {
        fallback = "You can lodge a direct short-weighing grievance with the **National Consumer Helpline (NCH 1915)**:\n\n" +
          "• Report short-delivery at fuel stations, grocery net weight deficit, or LPG cylinder tare tampering.\n" +
          "• Calculates legal deviation from OIML R-76 MPE and triggers district LMO Flying Squad action.\n\n" +
          "[ACTION:citizen-grievance|Report Short-Weighing (NCH 1915)]";
      } else if (lower.includes('test') || lower.includes('suite') || lower.includes('run') || lower.includes('verify scale')) {
        fallback = "You can test any weighing instrument in the **R-76 Automated Test Suite**:\n\n" +
          "• Press **F5** or click 'Run Automated R-76 Test Suite'.\n" +
          "• Captures turning points (ΔL) and verifies errors against Clause 3.5.1 MPE limits.\n" +
          "• Once passed, issue the official Form VIII certificate.\n\n" +
          "[NAV:r-76-automated-test-suite|Open R-76 Test Suite]";
      } else if (lower.includes('surveillance') || lower.includes('mandi') || lower.includes('map') || lower.includes('flying squad')) {
        fallback = "The **National Surveillance Grid** tracks commercial weighbridges across APMC mandis:\n\n" +
          "• Real-time compliance rates & daily tonnages across major state hubs.\n" +
          "• Intercept illegal 433 MHz RF cheats and dispatch flying squads.\n\n" +
          "[NAV:national-surveillance-grid|Open National Surveillance Grid]";
      } else if (lower.includes('certificate') || lower.includes('form viii') || lower.includes('vault') || lower.includes('qr')) {
        fallback = "All statutory certificates are stored in the **Legal Certificate Vault**:\n\n" +
          "• Search by scale serial number or location.\n" +
          "• Dynamic QR verification and SHA-256 Merkle audit proof.\n\n" +
          "[NAV:legal-certificate-vault|Open Form VIII Certificate Vault]";
      } else if (lower.includes('capacity') || lower.includes('dut') || lower.includes('scale setting') || lower.includes('interval') || lower.includes('max')) {
        fallback = "To customize scale capacity (Max), interval (e), or accuracy class:\n\n" +
          "[ACTION:dut-settings|Configure Scale DUT Settings]";
      } else if (lower.includes('switch role') || lower.includes('persona') || lower.includes('account') || lower.includes('register') || lower.includes('login')) {
        fallback = "ManoSetu-NAWI supports Role-Based Access Control (RBAC) with 6 pre-configured personas and custom officer account creation:\n\n" +
          "[ACTION:identity-gateway|Switch Role / Create Account]";
      } else if (lower.includes('clause a.4.4.3') || lower.includes('turning point')) {
        fallback = "Under OIML R-76 Clause A.4.4.3, true indication before rounding is **P = I + 0.5e - ΔL**, raw error is **E = P - L**, and corrected error is **Ec = E - E0**.\n\n" +
          "[NAV:r-76-automated-test-suite|Test Clause A.4.4.3 in Suite]";
      } else {
        fallback = "I can help you navigate anywhere in ManoSetu-NAWI or answer metrology questions:\n\n" +
          "• Run tests: [NAV:r-76-automated-test-suite|R-76 Automated Test Suite]\n" +
          "• Mandi map: [NAV:national-surveillance-grid|National Surveillance Grid]\n" +
          "• Certificates: [NAV:legal-certificate-vault|Certificate Vault]\n" +
          "• Scale settings: [ACTION:dut-settings|Configure Scale DUT]\n" +
          "• Switch identity: [ACTION:identity-gateway|Switch Role / Create Account]";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `setu-${Date.now()}`,
          sender: 'setu',
          text: fallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Helper function to parse plain text and render [NAV:tab|label] and [ACTION:act|label]
   * as interactive clickable buttons right inside the chat bubble.
   */
  const renderMessageContent = (text: string) => {
    // Regex matches [NAV:targetTab|Label] or [ACTION:actionId|Label]
    const tokenRegex = /\[(NAV|ACTION):([^\|]+)\|([^\]]+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Push text preceding the tag
      if (matchIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, matchIndex)}
          </span>
        );
      }

      const type = match[1];
      const target = match[2];
      const label = match[3];

      if (type === 'NAV') {
        parts.push(
          <button
            key={`nav-${matchIndex}`}
            type="button"
            onClick={() => handleExecuteNav(target as ActiveTab, label)}
            className="my-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#001428] hover:bg-[#006781] text-white rounded-lg text-[11px] font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-95 text-left border border-[#8fdfff]/30 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-[#8fdfff]">
              arrow_forward_ios
            </span>
            <span>{label}</span>
          </button>
        );
      } else if (type === 'ACTION') {
        parts.push(
          <button
            key={`act-${matchIndex}`}
            type="button"
            onClick={() => handleExecuteAction(target, label)}
            className="my-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006781] hover:bg-[#001428] text-white rounded-lg text-[11px] font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-95 text-left border border-white/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-[#85f8c4]">
              tune
            </span>
            <span>{label}</span>
          </button>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>
      );
    }

    return parts;
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 no-print flex flex-col items-end">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#001428] hover:bg-[#0f2942] text-white rounded-full shadow-lg border border-[#8fdfff]/40 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
            title="Ask Setu - AI Metrology & Navigation Guide"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#006781] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#21a173] rounded-full border-2 border-[#001428] animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-[13px] text-white tracking-tight flex items-center gap-1">
                Ask Setu
                <span className="text-[10px] font-mono text-[#85f8c4] bg-[#002e1d] px-1 rounded">AI GUIDE</span>
              </span>
              <span className="text-[10px] text-[#cbdbf5]">App Help & Metrology FAQs</span>
            </div>
          </button>
        )}

        {/* Chat Drawer Window */}
        {isOpen && (
          <div className="bg-white rounded-2xl border border-[#c3c6ce]/50 shadow-2xl w-[390px] sm:w-[440px] h-[600px] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Window Header */}
            <div className="bg-[#001428] text-white p-3.5 flex items-center justify-between border-b border-[#0f2942]">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#006781] flex items-center justify-center text-white shadow-inner">
                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#21a173] rounded-full border-2 border-[#001428]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[14px] text-white">Setu</span>
                    <span className="text-[9px] font-mono font-bold bg-[#21a173] text-[#002114] px-1.5 py-0.2 rounded">
                      NAV & FAQ AI
                    </span>
                  </div>
                  <span className="text-[11px] text-[#b0c9e8] truncate max-w-[200px]">
                    {activeTab
                      ? `Active: ${activeTab.replace(/-/g, ' ')}`
                      : 'ManoSetu-NAWI Assistant'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'welcome-reset',
                        sender: 'setu',
                        text: 'Conversation reset. How can I guide you or help you test scales today?',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      },
                    ])
                  }
                  className="p-1 hover:bg-[#0f2942] rounded text-[#cbdbf5] text-[12px] cursor-pointer"
                  title="Clear conversation"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[#0f2942] rounded text-[#cbdbf5] cursor-pointer"
                  title="Minimize"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* In-chat Navigation Notification Toast */}
            {navNotification && (
              <div className="bg-[#21a173] text-white px-3 py-1.5 text-[11px] font-mono font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  <span>{navNotification}</span>
                </div>
                <button
                  onClick={() => setNavNotification(null)}
                  className="p-0.5 hover:bg-black/10 rounded cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}

            {/* Quick Navigation Jump Bar */}
            <div className="bg-[#eff4ff] px-3 py-2 border-b border-[#c3c6ce]/30 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[11px]">
              <span className="text-[10px] text-[#74777e] font-bold shrink-0 uppercase tracking-wider flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px] text-[#006781]">explore</span>
                Jump:
              </span>
              {NAVIGATION_SHORTCUTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.tab) {
                      handleExecuteNav(item.tab, item.label);
                    } else if (item.action === 'dut') {
                      handleExecuteAction('dut-settings', 'DUT Settings');
                    } else if (item.action === 'gateway') {
                      handleExecuteAction('identity-gateway', 'Persona Gateway');
                    } else if (item.action === 'lookup') {
                      handleExecuteAction('govt-lookup', 'Standards Lookup');
                    } else if (item.action === 'grievance') {
                      handleExecuteAction('citizen-grievance', 'NCH 1915 Grievance');
                    }
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 border transition-colors shrink-0 cursor-pointer ${
                    activeTab === item.tab
                      ? 'bg-[#001428] text-white border-[#001428]'
                      : 'bg-white hover:bg-[#dce9ff] text-[#001428] border-[#c3c6ce]/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-3.5 overflow-y-auto bg-[#f8f9ff] flex flex-col gap-3">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[90%] ${
                      isUser ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl text-[12px] leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-[#001428] text-white rounded-br-xs'
                          : 'bg-white text-[#0b1c30] border border-[#c3c6ce]/30 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {renderMessageContent(m.text)}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#74777e] mt-1 px-1">
                      {isUser ? 'You' : 'Setu AI'} • {m.timestamp}
                    </span>
                  </div>
                );
              })}

              {isLoading && (
                <div className="self-start flex items-center gap-2 bg-white p-2.5 rounded-xl border border-[#c3c6ce]/30 text-[11px] text-[#43474d] shadow-xs">
                  <span className="material-symbols-outlined text-[16px] text-[#006781] animate-spin">
                    progress_activity
                  </span>
                  <span>Setu is analyzing statutory rules & app routes...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-white border-t border-[#c3c6ce]/20 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[11px]">
              <span className="text-[10px] text-[#74777e] font-semibold shrink-0">Ask:</span>
              {FAQ_SUGGESTIONS.map((faq, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(faq)}
                  disabled={isLoading}
                  className="px-2 py-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#001428] rounded border border-[#c3c6ce]/30 text-[11px] transition-colors shrink-0 truncate max-w-[220px] cursor-pointer"
                >
                  {faq}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-white border-t border-[#c3c6ce]/30 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Setu (e.g. 'Take me to test suite', 'How to test scale')..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-[#eff4ff] border border-[#c3c6ce]/40 rounded-lg text-[12px] text-[#001428] focus:outline-none focus:border-[#006781]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2 bg-[#001428] hover:bg-[#006781] disabled:opacity-40 text-white rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                title="Send message"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
