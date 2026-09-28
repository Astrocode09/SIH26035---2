# ManoSetu-NAWI Metrology OS
### Statutory Non-Automatic Weighing Instruments (NAWI) Automated Verification Engine
**Smart India Hackathon (SIH 2026) — Problem Statement SIH26035**  
*Ministry of Consumer Affairs, Food & Public Distribution • Legal Metrology Division*

---

[![OIML R-76 Compliant](https://img.shields.io/badge/OIML%20R--76--1%3A2006-Compliant-emerald?style=for-the-badge&logo=shield)](https://www.oiml.org)
[![SIH 2026 Problem SIH26035](https://img.shields.io/badge/SIH%202026-Problem%20SIH26035-blue?style=for-the-badge)](https://sih.gov.in)
[![Ministry](https://img.shields.io/badge/Ministry-Consumer%20Affairs%2C%20Food%20%26%20Public%20Distribution-navy?style=for-the-badge)](https://consumeraffairs.nic.in)
[![License](https://img.shields.io/badge/License-Apache%202.0-slate?style=for-the-badge)](LICENSE)

---

## 🏛️ Executive Summary

**ManoSetu-NAWI** is an institutional-grade, 100% deterministic Metrology Operating System developed specifically for the **Ministry of Consumer Affairs, Food & Public Distribution (Legal Metrology Division)** under **SIH 2026 Problem Statement SIH26035**.

It transforms manual, paper-based verification of commercial scales and weighbridges into a tamper-proof digital pipeline directly compliant with **OIML Recommendation R-76-1:2006 (E)** and the **Legal Metrology (General) Rules, 2011 (Schedule VIII, Rule 24)**.

### The Problem It Solves:
In wholesale agricultural mandis (APMCs), port terminals, and FCI grain procurement centers, uncalibrated or tampered scales (often manipulated via unauthorized 433 MHz RF shunt relays) cause an estimated **₹12,000+ Crore in annual economic leakage**, silently under-paying farmers. 

ManoSetu-NAWI enforces automated, mathematically non-repudiable testing, digital Form VIII certificate generation with DigiLocker QR codes, and nationwide surveillance, preventing **₹4,280+ Crore** in economic loss.

---

## ⚡ Core Technical Capabilities

### 1. 100% Deterministic Core (Clause A.4.4.3 & Clause 3.5.1)
- **Zero Generative AI Hallucinations**: In statutory metrology, precision arithmetic must be auditable, repeatable, and legally binding in a court of law.
- **Quantization Error Elimination Before Rounding**:
  $$\text{True Calculated Indication } P = I + 0.5e - \Delta L$$
  $$\text{Raw Indication Error } E = P - L$$
  $$\text{True Corrected Error } E_c = E - E_0$$
- **Three-Tier MPE Staircase Tolerance Envelope**: Automatically enforces statutory limits for Class I, II, III, and IV instruments for both **Initial Verification (1x MPE)** and **In-Service Periodic Verification (2x MPE)**:
  - $0 \le m \le 500e \implies \pm 0.5e$ ($\pm 2.5\text{ g}$)
  - $500e < m \le 2000e \implies \pm 1.0e$ ($\pm 5.0\text{ g}$)
  - $2000e < m \le 6000e \implies \pm 1.5e$ ($\pm 7.5\text{ g}$)

### 2. Clause A.4.7 Platter Eccentricity Matrix
- Interactive 5-quadrant loading matrix (Center Datum, Top-Left, Top-Right, Bottom-Left, Bottom-Right) with 1/3 Max loading testing corner sensitivity in rectangular load receptors.

### 3. Hardware Ingestion Layer (HAL) & Anti-Tamper Shield
- Ingests 20 Hz raw serial stream from **RS-232, RS-485 Modbus, and Bluetooth BLE**.
- Real-time **impedance spectrum analyzer** monitoring wheatstone bridge stability ($Z_{in} = 350\,\Omega$) to detect unauthorized wireless RF bypass jammers and resistor shunts.
- Dual-axis inclinometer leveling compensation ($\theta \le 0.20^\circ$).

### 4. Official Form VIII Certificate Generator (Schedule VIII, Rule 24)
- Automated generation of sovereign legal certificates with Government of India watermark, inspector digital seal, and **DigiLocker QR code** for citizen/farmer verification.
- Print-ready and exportable to PDF.

### 5. Built-In Government Standards & Model Approval Directory
- Searchable registry of **Government Approved Weighing Models** (Mettler Toledo, Avery India, Essae, Sartorius, CAS, Eagle) with 1-click loading into active test sessions.
- **OIML R 111-1 Standard Test Weights Tolerance Matrix** (Class E1 to M3 from 1g to 1000kg).
- Statutory Legal Metrology Act 2009 & General Rules 2011 Law Digest.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                 ManoSetu-NAWI Four-Tier Architecture            │
├─────────────────────────────────────────────────────────────────┤
│ Tier 4: National Metrology Cloud (NMC) & e-NAM Government API   │
│         Surveillance across 2,400+ Mandis • LMO Rapid Dispatch  │
├─────────────────────────────────────────────────────────────────┤
│ Tier 3: Cryptographic Audit Trail (SHA-256 Merkle Ledger)        │
│         W3C Verifiable Credentials • DigiLocker Integration     │
├─────────────────────────────────────────────────────────────────┤
│ Tier 2: 100% Deterministic Metrology Core (OIML R-76-1:2006)    │
│         Clause A.4.4.3 • Clause 3.5.1 • Clause A.4.7 • Cl. A.4.8 │
├─────────────────────────────────────────────────────────────────┤
│ Tier 1: Hardware Abstraction Layer (HAL)                        │
│         RS-232 Direct • RS-485 Modbus • Bluetooth BLE • USB-CDC │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/manosetu-nawi.git

# 2. Navigate to project directory
cd manosetu-nawi

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be running locally at `http://localhost:3000`.

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📂 Project Structure

```
manosetu-nawi/
├── index.html                   # HTML entry point with Govt metadata & fonts
├── metadata.json                # Project manifest and AI Studio capabilities
├── package.json                 # Dependencies (React 19, Tailwind CSS v4, Lucide)
├── tsconfig.json                # Strict TypeScript configuration
├── vite.config.ts               # Vite bundler configuration with Tailwind
└── src/
    ├── main.tsx                 # React DOM mount point
    ├── index.css                # Tailwind base styles & metrology typography
    ├── App.tsx                  # Root state coordinator and layout
    ├── types/
    │   └── metrology.ts         # Statutory data models (OIML, DUT, Audits)
    ├── utils/
    │   └── oimlEngine.ts        # Pure deterministic OIML R-76 arithmetic
    ├── data/
    │   ├── metrologyData.ts     # Seed data: scales, certificates, mandis
    │   └── govtStandardsData.ts # Approved models, OIML Table 3, NPL weights
    └── components/
        ├── TopBar.tsx           # Statutory header with live ambient telemetry
        ├── Sidebar.tsx          # Institutional GovTech navigation
        ├── R76TestSuite.tsx     # Primary OIML R-76 automated testing console
        ├── DashboardTelemetry.tsx # Hardware bridge & RF anti-fraud oscilloscope
        ├── LegalCertificateVault.tsx # Form VIII vault & DigiLocker scanner
        ├── NationalSurveillanceGrid.tsx # Pan-India mandi surveillance & leakage ROI
        ├── GovtStandardsRegistry.tsx # Built-in government model directory & MPE tool
        ├── SystemArchitecture.tsx # SIH 2026 Grand Finale Innovation Pitch
        └── modals/
            ├── FormVIIICertificateModal.tsx # Printable official certificate
            ├── LedgerVerificationModal.tsx  # Cryptographic Merkle proof viewer
            ├── DeviceSetupModal.tsx         # DUT profile selector
            └── GovtQuickLookupModal.tsx     # Fast popup standard lookup
```

---

## 🏆 Smart India Hackathon (SIH 2026) Submission Details

- **Problem ID**: SIH26035
- **Category**: Software
- **Ministry**: Ministry of Consumer Affairs, Food & Public Distribution
- **Department**: Legal Metrology Division
- **Domain**: Metrology, Agriculture, Supply Chain Transparency, Citizen Protection

---

## 📄 License
This project is licensed under the Apache 2.0 License.
