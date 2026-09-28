import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import nodemailer, { type Transporter } from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SETU_SYSTEM_INSTRUCTION = `You are Setu, an intelligent, helpful, and courteous assistant for the ManoSetu-NAWI Metrology Operating System (SIH 2026 Problem Statement SIH26035).
Your role is to help users navigate the application, understand legal metrology tests, explain OIML R-76 clauses, and troubleshoot operations.

STYLE GUIDELINE:
You are polite, clear, structured, and focused. You answer questions directly and provide step-by-step navigation guidance. Keep explanations easy to understand for everyone (not overly academic or overly complex).

HOW TO USE THE SITE (Always provide this clear 4-step walkthrough if asked how to use the site):
1. Configure Scale: Set capacity, interval e, or accuracy class in [ACTION:dut-settings|Configure Scale DUT Settings], or switch role in [ACTION:identity-gateway|Switch Role / Create Account].
2. Run Test Suite: Go to [NAV:r-76-automated-test-suite|R-76 Automated Test Suite] and press F5 or click 'Run Automated R-76 Test Suite'.
3. View/Print Certificate: Click 'Issue Form VIII Certificate' and view the digital QR certificate in [NAV:legal-certificate-vault|Form VIII Certificate Vault].
4. Explore Mandis & Ministry Hub: Track mandi compliance in [NAV:national-surveillance-grid|National Surveillance Grid], or file a citizen complaint / simulate farmer MSP losses in [NAV:consumer-food-command|Ministry Citizen & Food Hub].

APPLICATION STRUCTURE & NAVIGATION CAPABILITIES:
The application has 7 primary terminals and 4 global action modals. Whenever you guide a user to a screen or action, include the corresponding clickable tag in your response so the user can click it directly:

1. R-76 Automated Test Suite -> Tag: [NAV:r-76-automated-test-suite|Open R-76 Test Suite]
   - Purpose: Automated execution of Clause A.4.4 standard loading steps (Min, 500e, 1000e, 2000e, Max), Clause A.4.4.3 turning point math (P = I + 0.5e - ΔL), Clause A.4.7 5-point Platter Eccentricity Matrix, and Anti-Tamper Fraud simulation.
   - Shortcut: Press F5 to trigger test execution. Once passed, issue official Form VIII certificate.

2. Ministry Citizen & Food Hub -> Tag: [NAV:consumer-food-command|Open Ministry Citizen & Food Hub]
   - Purpose: Central command uniting DoCA and DFPD. Features:
     • Kisan Tol Suraksha: Mandi weighbridge under-weighing calculator & Section 15 farmer restitution order generator.
     • PMGKAY Fair Price Shop (FPS) e-PoS Scale Guard: Eliminates ration shaving across 5.43 Lakh ration shops.
     • Jago Grahak Jago & NCH 1915: Live citizen grievance feed & 4-step Flying Squad raid simulator.
     • PMD Packaged Commodities: Net quantity & Unit Sale Price (LMPC 2011) compliance checker.

3. National Surveillance Grid -> Tag: [NAV:national-surveillance-grid|Open National Surveillance Grid]
   - Purpose: Pan-India telemetry map monitoring APMC Mandis, seaport weighbridges, grain silos, and highway checkposts.
   - Features: Real-time compliance rates, fraud alerts, anti-tamper RF flying squad dispatches, and economic leakage prevented (₹4,280+ Crore).

4. Legal Certificate Vault -> Tag: [NAV:legal-certificate-vault|Open Form VIII Certificate Vault]
   - Purpose: Search, filter, and inspect verified Schedule VIII Form VIII certificates with dynamic DigiLocker QR codes and printable dossiers.

5. Dashboard & Telemetry Bridge -> Tag: [NAV:dashboard-and-telemetry|Open Telemetry Bridge]
   - Purpose: Live 20Hz RS-232 serial telemetry bridge (COM3 baud 9600 8N1), Wheatstone bridge impedance monitor (350 Ω), and environmental lab sensors.

6. Govt Standards Registry -> Tag: [NAV:govt-standards-registry|Open Govt Standards Registry]
   - Purpose: Directory of Central Government Gazette Model Approvals and interactive OIML Table 3 MPE tolerance limits calculator for Class I, II, III, and IV scales.

7. System Architecture Pitch -> Tag: [NAV:system-architecture|Open System Architecture]
   - Purpose: SIH 2026 Grand Finale pitch presentation, edge IoT pipeline diagrams, and cryptographic verification flow.

8. Global Modals & Actions:
   - Configure Scale Device Under Test (DUT) -> Tag: [ACTION:dut-settings|Configure Scale DUT Settings]
   - Switch User Persona / Register Officer Account -> Tag: [ACTION:identity-gateway|Switch Role / Create Account]
   - Quick Govt Norms & Standards Lookup -> Tag: [ACTION:govt-lookup|Open Standards Lookup]
   - Report Short-Weighing Grievance (NCH 1915) -> Tag: [ACTION:citizen-grievance|Report Short-Weighing (NCH 1915)]

FORMATTING RULE:
Keep responses brief, polite, and easy to scan with bullet points where appropriate. Always include the relevant [NAV:...] or [ACTION:...] tag when guiding the user to a section or explaining a feature.`;

// Setu FAQ Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, currentTab, userRole } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // Check if GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      // Intelligent fallback answer if key is not configured in local environment
      const lower = message.toLowerCase();
      let reply = "";

      if (lower.includes('how to use') || lower.includes('how do i use') || lower.includes('walkthrough') || lower.includes('getting started') || lower.includes('site guide') || lower.includes('how to start') || lower.includes('tutorial')) {
        reply = "Here is a simple 4-step guide to using ManoSetu-NAWI:\n\n" +
          "1. **Check Scale Specs**: Customize your scale capacity (Max) and scale interval (e) via [ACTION:dut-settings|Configure Scale DUT Settings], or switch your operating persona in [ACTION:identity-gateway|Switch Role / Create Account].\n" +
          "2. **Run Automated Test Suite**: Open [NAV:r-76-automated-test-suite|R-76 Automated Test Suite] and click **'Run Automated R-76 Test Suite'** (or press **F5**). It automatically runs standard load points, turning point math (P = I + 0.5e - ΔL), and the 5-point platter test.\n" +
          "3. **Issue & Print Certificate**: When tests pass, click **'Issue Form VIII Certificate'**. You can inspect and print the legal certificate in [NAV:legal-certificate-vault|Form VIII Vault].\n" +
          "4. **Surveillance & Citizen Protection**:\n" +
          "   • Watch live APMC mandi weighbridges in [NAV:national-surveillance-grid|National Surveillance Grid].\n" +
          "   • Simulate farmer harvest losses or report fuel/ration short-weighing in [NAV:consumer-food-command|Ministry Citizen & Food Hub].";
      } else if (lower.includes('what is manosetu') || lower.includes('what is this site') || lower.includes('about this site') || lower.includes('about this app') || lower.includes('what is this app')) {
        reply = "**ManoSetu-NAWI** is the Central Automated Legal Metrology Verification System for Non-Automatic Weighing Instruments (built for SIH 2026 Problem Statement SIH26035).\n\n" +
          "• **100% Statutory Compliance**: Built according to OIML R-76-1:2006 and the Legal Metrology Act, 2009.\n" +
          "• **Automated Accuracy**: Eliminates manual paper errors by capturing turning points (ΔL) and comparing against strict MPE limits.\n" +
          "• **Anti-Tamper Shield**: Detects 433 MHz illegal wireless remotes and load cell bypass shunts.\n" +
          "• **Citizen & Farmer Welfare**: Protects 81+ Crore ration recipients and millions of farmers selling grain at APMC mandis.\n\n" +
          "[NAV:r-76-automated-test-suite|Start with R-76 Test Suite]";
      } else if (lower.includes('shortcut') || lower.includes('f5') || lower.includes('hotkey')) {
        reply = "⚡ **Keyboard Shortcuts in ManoSetu-NAWI**:\n\n" +
          "• **F5**: Press F5 on your keyboard while in the R-76 Test Suite to immediately start the automated verification run!\n" +
          "• You can also use the quick jump buttons at the top of this Setu chat drawer to navigate between terminals anytime.\n\n" +
          "[NAV:r-76-automated-test-suite|Try F5 in R-76 Test Suite]";
      } else if (lower.includes('ministry') || lower.includes('doca') || lower.includes('food') || lower.includes('farmer') || lower.includes('msp') || lower.includes('ration') || lower.includes('fps') || lower.includes('cockpit')) {
        reply = "The **Ministry Citizen & Foodgrain Hub** unites the Department of Consumer Affairs (DoCA) and Department of Food & Public Distribution (DFPD):\n\n" +
          "• **Kisan Tol Suraksha (Farmer MSP Shield)**: Simulates and calculates harvest under-weighing losses on crops (Wheat, Paddy, Mustard) and issues Section 15 statutory restitution notices.\n" +
          "• **PMGKAY Fair Price Shop (FPS) e-PoS Guard**: Secures foodgrain allocations for 80+ Crore citizens across 5.43 Lakh ration shops, locking dealers attempting gunny tare fraud.\n" +
          "• **Jago Grahak Jago & NCH 1915**: Real-time consumer short-weighing complaints and interactive Flying Squad raid simulator.\n" +
          "• **PMD Packaged Commodities**: Net quantity & unit sale price verifier for 22 essential commodities.\n\n" +
          "[NAV:consumer-food-command|Open Ministry Citizen & Food Hub]";
      } else if (lower.includes('complain') || lower.includes('grievance') || lower.includes('nch') || lower.includes('1915') || lower.includes('jago grahak') || lower.includes('petrol pump') || lower.includes('cylinder') || lower.includes('short deliver')) {
        reply = "You can report short-weighing or short-delivery directly through the **National Consumer Helpline (NCH 1915)**:\n\n" +
          "• File complaints for fuel pumps, LPG cylinders, packaged grocery deficits, or mandi weighbridges.\n" +
          "• Computes statutory legal deviation against OIML R-76 MPE limits.\n" +
          "• Generates an official NCH docket and alerts the District Legal Metrology Officer Flying Squad.\n\n" +
          "[ACTION:citizen-grievance|Report Short-Weighing (NCH 1915)]";
      } else if (lower.includes('test') || lower.includes('suite') || lower.includes('run') || lower.includes('how to verify') || lower.includes('clause a.4.4')) {
        reply = "To test a weighing instrument under OIML R-76:\n\n" +
          "1. Go to the **R-76 Automated Test Suite**.\n" +
          "2. Press **F5** or click **'Run Automated R-76 Test Suite'** to execute standard loading steps (Min, 500e, 1000e, 2000e, Max).\n" +
          "3. The software captures turning points (ΔL) and verifies errors against Clause 3.5.1 MPE limits.\n" +
          "4. Run the 5-point Eccentricity Matrix and Tamper Shield tests.\n" +
          "5. Click **'Issue Form VIII Certificate'** once all steps pass.\n\n" +
          "[NAV:r-76-automated-test-suite|Open R-76 Test Suite]";
      } else if (lower.includes('surveillance') || lower.includes('mandi') || lower.includes('map') || lower.includes('leakage') || lower.includes('flying squad')) {
        reply = "The **National Surveillance Grid** monitors commercial weighbridges across APMC mandis, grain silos, and border toll checkposts:\n\n" +
          "• View live compliance rates and daily tonnages across major state nodes (Azadpur, Vashi, Unjha, Khanna).\n" +
          "• Track over ₹4,280+ Crore in prevented economic leakage.\n" +
          "• Dispatch rapid Anti-Fraud Flying Squads to intercept unauthorized 433 MHz RF remotes.\n\n" +
          "[NAV:national-surveillance-grid|Open National Surveillance Grid]";
      } else if (lower.includes('certificate') || lower.includes('form viii') || lower.includes('vault') || lower.includes('qr') || lower.includes('download')) {
        reply = "All statutory certificates are stored in the **Legal Certificate Vault**:\n\n" +
          "• Each Form VIII verification certificate carries a dynamic DigiLocker QR code and SHA-256 Merkle hash.\n" +
          "• Search by scale serial number, certificate number, or mandi location.\n" +
          "• Click any certificate to inspect details, verify against the ledger, or print the official Schedule VIII dossier.\n\n" +
          "[NAV:legal-certificate-vault|Open Form VIII Certificate Vault]";
      } else if (lower.includes('telemetry') || lower.includes('serial') || lower.includes('rs232') || lower.includes('rs-232') || lower.includes('baud') || lower.includes('port')) {
        reply = "The **Dashboard & Telemetry Bridge** streams 20Hz continuous weight data over RS-232 serial connection (COM3, baud 9600 8N1):\n\n" +
          "• Green stability indicator confirms motion-free equilibrium before readings are locked.\n" +
          "• Live Wheatstone bridge impedance monitor (nominal 350.0 Ω) detects physical junction box wire bypasses.\n" +
          "• Ambient environmental sensors record temperature, humidity, pressure, and local gravity (g).\n\n" +
          "[NAV:dashboard-and-telemetry|Open Telemetry Bridge]";
      } else if (lower.includes('model') || lower.includes('gazette') || lower.includes('approval') || lower.includes('standards') || lower.includes('oiml table 3')) {
        reply = "The **Govt Standards Registry** contains Central Government Gazette Model Approvals and statutory tolerances:\n\n" +
          "• Browse verified models (Avery India, Essae-Teraoka, Mettler Toledo, Eagle Scales).\n" +
          "• Calculate MPE limits across Class I, II, III, and IV scales with the interactive OIML Table 3 tool.\n" +
          "• Click 'Load Model to DUT' to immediately apply manufacturer specs to your testing terminal.\n\n" +
          "[NAV:govt-standards-registry|Open Govt Standards Registry]";
      } else if (lower.includes('architecture') || lower.includes('sih') || lower.includes('pitch') || lower.includes('flowchart') || lower.includes('hardware')) {
        reply = "The **System Architecture** section outlines the full technical and policy blueprint for SIH 2026 Problem Statement SIH26035:\n\n" +
          "• Edge IoT telemetry gateway and RS-232 optoisolation architecture.\n" +
          "• SHA-256 cryptographic Merkle tree ledger preventing tampering.\n" +
          "• Statutory alignment with OIML R-76-1:2006 and the Legal Metrology Act, 2009.\n\n" +
          "[NAV:system-architecture|Open System Architecture]";
      } else if (lower.includes('change capacity') || lower.includes('dut') || lower.includes('device setup') || lower.includes('scale setting') || lower.includes('max capacity') || lower.includes('interval')) {
        reply = "You can customize the Device Under Test (DUT) specifications at any time:\n\n" +
          "• Change Maximum Capacity (Max), Verification Scale Interval (e), and Resolution (d).\n" +
          "• Switch Accuracy Class (Class I, II, III, or IV) and Serial Number.\n" +
          "• Access this via the 'DUT Settings' button in the top navigation bar or click below:\n\n" +
          "[ACTION:dut-settings|Configure Scale DUT Settings]";
      } else if (lower.includes('switch role') || lower.includes('persona') || lower.includes('account') || lower.includes('create account') || lower.includes('register') || lower.includes('login') || lower.includes('identity')) {
        reply = "ManoSetu-NAWI supports Role-Based Access Control (RBAC) with 6 pre-configured personas and custom officer account creation:\n\n" +
          "• Pre-configured personas: Evaluator & Jury, Metrology Lab Technician, Flying Squad LMO, Scale OEM Engineer, APMC Mandi Secretary, and Citizen Advocate.\n" +
          "• Custom Account Generation: Register your full name, official designation, department, and jurisdiction with an optional statutory email dispatch.\n\n" +
          "[ACTION:identity-gateway|Switch Role / Create Account]";
      } else if (lower.includes('lookup') || lower.includes('quick reference') || lower.includes('norms')) {
        reply = "Use the **Govt Norms & Standards Lookup** modal for fast statutory reference during calibration without leaving your current workspace:\n\n" +
          "[ACTION:govt-lookup|Open Standards Lookup]";
      } else if (lower.includes('clause a.4.4.3') || lower.includes('turning point') || lower.includes('formula') || lower.includes('p =')) {
        reply = "Under OIML R-76 Clause A.4.4.3, digital scales round weight to whole intervals (e). To determine the true indication (P) before rounding:\n\n" +
          "• Formula: **P = I + 0.5e - ΔL**\n" +
          "  (where I = indicated weight, e = verification scale interval, ΔL = additional weights added until display changes to I + e).\n" +
          "• Raw Error: **E = P - L**\n" +
          "• Corrected Error: **Ec = E - E0** (corrected for zero error).\n\n" +
          "[NAV:r-76-automated-test-suite|Test Clause A.4.4.3 in Suite]";
      } else if (lower.includes('mpe') || lower.includes('error limit') || lower.includes('clause 3.5.1')) {
        reply = "Under OIML R-76 Clause 3.5.1 for Class III Non-Automatic Weighing Instruments (Initial Verification):\n\n" +
          "• Tier 1: 0 to 500e -> MPE is **±0.5e** (e.g. ±2.5 g for e=5g)\n" +
          "• Tier 2: 500e to 2000e -> MPE is **±1.0e** (e.g. ±5.0 g for e=5g)\n" +
          "• Tier 3: 2000e to 6000e -> MPE is **±1.5e** (e.g. ±7.5 g for e=5g)\n\n" +
          "Under Clause 3.5.2, in-service re-verification limits are doubled (±1.0e, ±2.0e, ±3.0e).\n\n" +
          "[ACTION:govt-lookup|Calculate MPE in Norms Lookup]";
      } else if (lower.includes('tamper') || lower.includes('fraud') || lower.includes('rf') || lower.includes('cheat')) {
        reply = "ManoSetu-NAWI protects scales with an active **Anti-Fraud RF Spectrum & Shunt Tamper Shield**:\n\n" +
          "• Monitors Wheatstone bridge impedance (350 Ω) for unauthorized shunt resistor taps.\n" +
          "• Intercepts illegal 433 MHz wireless remote zero-offset manipulation.\n" +
          "• Automatically flags weighbridge tickets as 'VOID / TAMPERED' and notifies enforcement squads.\n\n" +
          "[NAV:r-76-automated-test-suite|Try Tamper Simulation in Suite]";
      } else {
        reply = "Hello! I am Setu, your metrology AI assistant. I can help you test weighing instruments, verify compliance with OIML R-76 clauses, or navigate anywhere in the portal:\n\n" +
          "• Run tests: [NAV:r-76-automated-test-suite|R-76 Automated Test Suite]\n" +
          "• View mandis: [NAV:national-surveillance-grid|National Surveillance Grid]\n" +
          "• Find certificates: [NAV:legal-certificate-vault|Form VIII Vault]\n" +
          "• Change scale settings: [ACTION:dut-settings|Configure Scale DUT]\n" +
          "• Switch role / Register: [ACTION:identity-gateway|Switch Role / Create Account]";
      }

      return res.json({ reply, source: 'fallback' });
    }

    // Build context with history if provided
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.role === 'user' || item.role === 'model') {
          contents.push({
            role: item.role,
            parts: [{ text: item.content }],
          });
        }
      }
    }

    const contextPrefix = currentTab || userRole
      ? `[User Context: Active Workspace = "${currentTab || 'General'}", Role = "${userRole || 'Metrology Officer'}"]\n\n`
      : '';

    contents.push({
      role: 'user',
      parts: [{ text: contextPrefix + message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SETU_SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    const reply = response.text || 'I apologize, I could not generate a response at this moment.';
    return res.json({ reply, source: 'gemini' });
  } catch (error: any) {
    console.error('Error generating response from Setu:', error);
    return res.status(500).json({
      error: 'Failed to generate response.',
      details: error?.message || 'Unknown error',
    });
  }
});

// Official Registration & Login Notification Email Endpoint
app.post('/api/send-registration-email', async (req, res) => {
  try {
    const {
      email,
      name,
      roleBadge,
      designation,
      organization,
      jurisdiction,
      badgeCode,
      defaultTab,
    } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const hostUrl = req.protocol + '://' + req.get('host');
    const loginLink = `${hostUrl}/?badge=${encodeURIComponent(badgeCode || '')}&user=${encodeURIComponent(name || '')}`;
    const timestampStr = new Date().toUTCString();

    const subject = `[ManoSetu-NAWI] Official Onboarding & Sovereign Metrology Badge: ${name} (${badgeCode})`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9ff; margin: 0; padding: 24px; color: #0b1c30; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #c3c6ce; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,20,40,0.06); }
    .header { background: #001428; color: #ffffff; padding: 24px; text-align: center; }
    .crest { font-size: 28px; line-height: 1; margin-bottom: 8px; }
    .ministry { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #8fdfff; font-weight: 700; }
    .system-title { font-size: 24px; font-weight: 800; letter-spacing: 1px; margin: 8px 0 4px; font-family: Georgia, serif; }
    .tagline { font-size: 12px; color: #cbdbf5; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #001428; }
    .lead { font-size: 14px; line-height: 1.6; color: #43474d; margin-bottom: 20px; }
    .credential-card { background: #eff4ff; border: 1px solid #c3c6ce; border-radius: 8px; padding: 18px; margin-bottom: 24px; }
    .badge-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dce9ff; padding-bottom: 10px; margin-bottom: 12px; }
    .role-tag { background: #001428; color: #ffffff; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; font-family: monospace; }
    .badge-id { font-family: monospace; font-size: 12px; font-weight: 700; color: #006781; }
    .detail-row { margin-bottom: 8px; font-size: 13px; line-height: 1.4; }
    .detail-label { color: #74777e; font-size: 11px; text-transform: uppercase; font-family: monospace; display: block; }
    .detail-value { color: #0b1c30; font-weight: 600; }
    .btn-container { text-align: center; margin: 28px 0; }
    .login-btn { display: inline-block; background: #001428; color: #ffffff !important; font-size: 14px; font-weight: 700; padding: 12px 28px; text-decoration: none; border-radius: 6px; }
    .statutory-notice { background: #fff8e1; border-left: 4px solid #ffb300; padding: 12px 16px; font-size: 11px; color: #5d4037; line-height: 1.5; margin-top: 24px; border-radius: 0 4px 4px 0; }
    .footer { background: #f1f3f9; border-top: 1px solid #e0e3ea; padding: 16px 24px; font-size: 11px; color: #74777e; text-align: center; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="crest">⚖️</div>
      <div class="ministry">Department of Consumer Affairs • Legal Metrology Division</div>
      <div class="system-title">MANOSETU-NAWI</div>
      <div class="tagline">Smart India Hackathon 2026 • Problem Statement SIH26035</div>
    </div>

    <div class="content">
      <div class="greeting">Namaste ${name},</div>
      <div class="lead">
        Your digital officer account and statutory metrology credentials have been registered in the <strong>ManoSetu-NAWI Metrology Operating System</strong>.
      </div>

      <div class="credential-card">
        <div class="badge-header">
          <span class="role-tag">${roleBadge || 'LEGAL METROLOGY'}</span>
          <span class="badge-id">${badgeCode}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Officer Full Name</span>
          <span class="detail-value">${name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Official Designation</span>
          <span class="detail-value">${designation}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Department / Organization</span>
          <span class="detail-value">${organization}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Assigned Jurisdiction</span>
          <span class="detail-value">${jurisdiction}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Issuance Timestamp</span>
          <span class="detail-value" style="font-family: monospace;">${timestampStr}</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="${loginLink}" class="login-btn">Access ManoSetu-NAWI Metrology Portal &rarr;</a>
      </div>

      <div class="statutory-notice">
        <strong>Statutory Notice (Legal Metrology Act, 2009):</strong>
        Under Section 24 and the Legal Metrology (General) Rules, 2011, test observations and digital verification certificates (Form VIII) stamped under this registered identity carry statutory weight in legal proceedings and commercial mandi enforcement.
      </div>
    </div>

    <div class="footer">
      ManoSetu-NAWI Metrology OS • OIML R-76-1:2006 (E) Certified<br>
      This is an automated statutory dispatch to ${email}. If you did not register this account, please report to doca-metrology@gov.in.
    </div>
  </div>
</body>
</html>
    `.trim();

    const textContent = `
MANOSETU-NAWI METROLOGY OS
Government of India - Department of Consumer Affairs
Legal Metrology Division (SIH 2026 Problem SIH26035)

Namaste ${name},

Your digital officer account has been registered in the central ManoSetu-NAWI Metrology Operating System.

OFFICIAL CREDENTIALS:
- Officer Name: ${name}
- Role Badge: ${roleBadge}
- Official Designation: ${designation}
- Organization: ${organization}
- Jurisdiction: ${jurisdiction}
- Sovereign Officer Badge: ${badgeCode}
- Issuance Timestamp: ${timestampStr}

Access Portal: ${loginLink}

STATUTORY NOTICE:
Under Section 24 of the Legal Metrology Act, 2009, test records and Form VIII digital certificates stamped with this identity carry legal metrological evidentiary weight.

This is an automated dispatch sent to ${email}.
    `.trim();

    // Setup Transporter
    let transporter: Transporter;
    let previewUrl: string | null = null;
    let sendMethod = 'simulated';

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      sendMethod = 'smtp';
    } else {
      // Use Ethereal test account or JSON fallback transporter for sandbox
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        sendMethod = 'ethereal';
      } catch (testAccountErr) {
        // Fallback to JSON transport
        transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
        sendMethod = 'json_sandbox';
      }
    }

    const mailOptions = {
      from: '"ManoSetu-NAWI Statutory Metrology OS" <noreply@doca.gov.in>',
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    if (sendMethod === 'ethereal') {
      previewUrl = nodemailer.getTestMessageUrl(info) || null;
    }

    console.log(`[Email Dispatched] To: ${email}, Subject: "${subject}", SendMethod: ${sendMethod}, MessageID: ${info.messageId}`);

    return res.json({
      success: true,
      recipient: email,
      messageId: info.messageId,
      sendMethod,
      previewUrl,
      timestamp: timestampStr,
      subject,
      htmlContent,
    });
  } catch (error: any) {
    console.error('Error dispatching registration email:', error);
    return res.status(500).json({
      error: 'Failed to dispatch email.',
      details: error?.message || 'Unknown mail error',
    });
  }
});

// Production static file serving vs Development Vite middleware
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`ManoSetu-NAWI server listening on port ${port} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
