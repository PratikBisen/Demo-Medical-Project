# PRD — Agentic Pharmacy AI System

## 1. Overview

Traditional pharmacy websites work like a search-and-click store: the customer
searches a medicine, clicks "add to cart," and checks out. There's no
intelligence involved — no one checks if the medicine is safe to sell without
a prescription, no one notices when a regular customer is about to run out of
their medication, and no one talks back if the order is unclear.

This project turns that static pharmacy site into an **autonomous agentic
system**. Instead of a human clicking through menus, a set of AI agents work
together like pharmacy staff would: one listens to what the customer needs,
one checks whether the order is even allowed, one keeps an eye on who's
running low on medicine, and one actually gets the order processed and moving
in the backend — with minimal human involvement.

This is a **practice / demo build**. The goal is to learn agentic AI concepts
(multi-agent systems, tool use, observability) by building a working system
end-to-end, with the option of taking it into an actual hackathon later if it
turns out well.

---

## 2. Goals

- Build a working demo where a customer can order medicine through natural
  conversation (text, voice is a stretch goal) instead of clicking through a
  catalog.
- Every order must be checked against real rules (stock available?
  prescription required?) before it's approved — not just blindly accepted.
- The system should notice on its own when a customer is likely running out
  of a medicine and start that conversation, instead of waiting to be asked.
- Every agent decision must be traceable — a judge (or us, while debugging)
  should be able to see *why* an agent approved or rejected something.
- Ship something demoable: a working chat interface + a small admin view
  showing inventory and proactive refill alerts.

## 3. Non-Goals (Out of Scope)

- **Security** (auth, encryption, access control, HIPAA-style compliance) —
  explicitly excluded for this build. We are focusing on the agentic
  behavior, not production hardening.
- Real payment processing — mock/simulated checkout only.
- Real pharmacy inventory integration — we use the provided mock
  Excel/CSV data, not a live system.
- A polished, production-grade UI — a simple functional UI is enough.

---

## 4. Users / Personas

| Persona | What they do in this system |
|---|---|
| **Customer** | Orders medicine via chat (text/voice), gets asked for a prescription if required, gets a refill reminder when they're running low |
| **Pharmacy Admin (us, for the demo)** | Views mock inventory levels, sees proactive refill alerts the system generated, monitors agent trace logs |

---

## 5. Agents & Responsibilities

The system is split into **4 agents**, each mapped directly to one of the
core functional requirements in the problem statement:

| Agent | Responsibility |
|---|---|
| **Conversation Agent** | Handles the natural text/voice interface. Extracts medicine name, dosage, and quantity from messy, human-like input (e.g. "I need something for my dad's BP, the 40mg ones, like 2 strips"). |
| **Safety / Policy Agent** | Source of truth = the Medicine Excel Sheet. Decides if an order can proceed based on current stock level and the "Prescription Required" flag. Rejects or asks for more info if rules aren't met. |
| **Predictive / Refill Agent** | Reads the Mock Customer History. Proactively identifies customers who are likely running low on a medicine (based on past purchase + dosage frequency) and initiates a refill conversation or alert. |
| **Action Agent** | Executes real backend actions once an order is approved: updates the mock database/inventory, triggers a webhook (mock webhook or n8n/Zapier), sends order confirmation (email/WhatsApp — bonus). |

**LLM Provider:** TBD — to be decided in `architecture.md` once the team has
explored Claude API vs OpenAI API.

---

## 6. Functional Requirements

Broken into checkable requirements from the 4 core capabilities:

### 6.1 Conversational Ordering
- [ ] Accept text-based input describing a medicine order in natural language
- [ ] (Stretch) Accept voice input and transcribe it
- [ ] Extract medicine name, dosage, and quantity even from vague/incomplete phrasing
- [ ] Ask a clarifying question if the extracted info is incomplete or ambiguous

### 6.2 Safety & Policy Enforcement
- [ ] Read the Medicine Excel Sheet as the single source of truth for stock + prescription rules
- [ ] Block an order automatically if stock is insufficient
- [ ] Block or pause an order if "Prescription Required" is true and no prescription has been provided
- [ ] Clearly explain to the customer *why* an order was blocked

### 6.3 Predictive Intelligence
- [ ] Read Mock Customer History (past purchases + dosage frequency)
- [ ] Calculate/estimate when a customer is expected to run out
- [ ] Proactively trigger a refill conversation or alert before being asked
- [ ] Surface these proactive alerts in the Admin View

### 6.4 Real-World Action (Tool Use)
- [ ] Update the mock database when an order is approved
- [ ] Trigger a mock webhook (warehouse fulfillment request) when an order is finalized
- [ ] (Bonus) Send an order confirmation via email or WhatsApp

### 6.5 Observability (Mandatory)
- [ ] Integrate an observability platform (e.g. Langfuse) to log agent activity
- [ ] Every agent-to-agent handoff must be traceable — judges must be able to see the Chain of Thought: how Agent A talked to Agent B, and why a request was approved/rejected
- [ ] Provide a live/public trace log link in the final submission

### 6.6 Minimal UI
- [ ] Chat-based interface (text) for placing orders
- [ ] (Stretch) Voice capability
- [ ] Admin View showing mock inventory levels
- [ ] Admin View showing proactive refill alerts generated by the system

---

## 7. Data Assets

| Asset | Format | Contains |
|---|---|---|
| **Medicine Master Data** | Excel/CSV | Medicine list, current stock levels, unit types, "Prescription Required" flags |
| **Consumer Order History** | Excel/CSV | Historical purchase data per patient — what they bought, purchase date, dosage frequency |

Both are provided as mock data — no live pharmacy database integration.

---

## 8. Backend

- No CMS provided — we build a mock backend ourselves.
- **Stack: FastAPI (Python)** — chosen for strong alignment with Python-first
  agentic frameworks (LangChain / LangGraph / CrewAI) and built-in Swagger UI
  for easy demoing.
- Agents interact with this backend to read inventory, check customer
  history, and write new orders.

---

## 9. Submission Checklist (from problem statement)

- [ ] GitHub repo with clean code + README for the mock APIs
- [ ] Public observability link (trace logs)
- [ ] Working chat-based UI
- [ ] Admin view (inventory + proactive alerts)
- [ ] Webhook trigger on order finalization

---

## 10. Open Questions (carry into next docs)

- LLM provider — Claude vs OpenAI (decide in `architecture.md`)
- Agentic framework — LangChain vs LangGraph vs CrewAI (decide in `architecture.md`)
- How agents communicate with each other — direct function calls vs a
  message-passing/orchestrator pattern (decide in `architecture.md`)
- Exact refill-prediction logic — simple day-count math vs something smarter (decide in `rules.md`)
