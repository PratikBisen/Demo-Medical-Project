# 🌿 FLOW PHARMA — Autonomous Multi-Agent Pharmacy Ecosystem

**Flow Pharma** is an autonomous pharmacy and healthcare ecosystem powered by 4-agent AI, deterministic safety policy verification, native multilingual voice ordering (English, Hindi, Marathi), and automated supply chain replenishment.

---

## 🚀 Key Features

1. **Multilingual Conversational Ordering**
   - Natural language interaction in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
   - Speech-to-Text with Web Speech API and live glowing voice visualizer orb.
   - Voice UI states: `idle`, `listening`, `processing`, `speaking`, `error`.
   - Text-to-Speech (TTS) audio readout in native Indian accents.

2. **4 Core AI Agents**
   - **Conversation Agent**: Intent & entity extraction across brand names, generics, strengths, dosages, and Hindi/Marathi transliterations.
   - **Safety / Policy Agent**: Deterministic rule evaluation against CDSCO India regulations, Schedule H/H1 prescription mandates, and age limits.
   - **Predictive Refill Agent**: Deterministic dosage depletion arithmetic forecasting exact depletion dates and scheduling calendar reminders.
   - **Action Agent**: Idempotent order placement, atomic inventory reservation, notification emission, and automated procurement.

3. **Deterministic Safety Policy Engine**
   - **Zero Hallucination**: AI never decides whether a medication is legally or medically safe to sell.
   - States: `APPROVED`, `BLOCKED`, `NEEDS_REVIEW`.
   - Dedicated **Safety Center** (`/admin/safety`) to inspect every check breakdown, policy version, and trace ID.

4. **Interactive Portals**
   - **Public Website**: Hero conversational interface, 10-section scroll story, two pathways (`Order` vs `Sell`), How it Works, Services, FAQ, Privacy, Terms, and Medical Safety.
   - **Patient Portal (`/app`)**: AI Chat, Orders with step-by-step verified timelines, Medicine Catalog with multilingual aliases, Medication Calendar (Month/Week/Agenda views), Encrypted Prescriptions, and 1-Click Refills.
   - **Pharmacy Seller Portal (`/seller`)**: Live inventory management, batch tracking, stock adjustments, pre-verified incoming orders, fulfillment dispatch, and automated distributor procurement.
   - **Admin Control Center (`/admin`)**: Safety decisions inspection, policy rule configuration, multi-agent trace observability, pharmacist review queue, and immutable audit logs.

---

## 🔑 Demo Accounts (1-Click Switchable in UI)

| Persona | Email | Role | Features |
| :--- | :--- | :--- | :--- |
| **Patient (Customer)** | `customer@flowpharma.local` | `CUSTOMER` | Voice ordering, calendar, prescriptions, refills |
| **Pharmacy Partner (Seller)** | `seller@flowpharma.local` | `SELLER` | Inventory management, batch levels, fulfillment |
| **Super Administrator** | `admin@flowpharma.local` | `SUPER_ADMIN` | Safety center, policy configuration, audit logs |
| **Pharmacist Reviewer** | `pharmacist@flowpharma.local` | `PHARMACIST_REVIEWER`| Review case queue, prescription approval |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend / Database Engine**: Python FastAPI, SQLAlchemy 2, SQLite & PostgreSQL support, Pydantic v2.
- **AI Architecture**: LangGraph typed state graph, local open-weight model abstraction (vLLM / Qwen / local heuristic fallback).
- **Speech**: Web Speech API STT + SpeechSynthesis TTS.

---

## 🏃 Running Locally

```bash
# 1. Clone repository
cd flow-pharma/apps/web

# 2. Install dependencies (if not already installed)
npm install

# 3. Start development server
npm run dev

# Or build and run production server
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
