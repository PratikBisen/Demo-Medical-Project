# Mobile App PRD — Agentic Pharmacy AI (User Interface)

## 1. App Overview & Goals
The mobile application serves as the dedicated storefront for the pharmacy's customers. Instead of a traditional catalog, the app provides a smart, chat-based interface powered by backend AI agents. The goal is to make ordering medication feel like texting a highly knowledgeable pharmacist, while also providing smart reminders and history tracking.

**Technology Stack:** Dart (Flutter)

## 2. Target Persona & Scope
*   **Target User:** The Customer
*   **Primary Actions:** Orders medicine via chat, provides prescriptions when prompted, receives automated refill reminders, manages recurring orders, and tracks order history.
*   **Out of Scope for App:** Admin dashboard (inventory management, system-wide alerts), security hardening (auth, encryption, HIPAA), and real payment processing.

## 3. Core Functional Requirements

### 3.1 Conversational Ordering UI
*   **Chat Interface:** A primary text-based chat interface for placing orders using natural language.
*   **Interactive Prompts:** Display clarifying questions from the Conversation Agent if an order is ambiguous.
*   **Stretch Goal (Voice):** A microphone feature to accept voice input and transcribe it into text.

### 3.2 Safety, Policy & Prescriptions
*   **Prescription Handling:** Support prompts from the Safety Agent requesting prescription uploads for restricted medications.
*   **Transparent Blocking:** Clearly display explanations in the chat detailing *why* an order was blocked (e.g., insufficient stock, missing prescription).

### 3.3 Smart Reminders & Proactive Engagement (Automated)
*   **Expiration/Low Stock Alerts:** The app must proactively alert users when their current supply is estimated to run out (e.g., reminding a diabetic patient to reorder regular medication). These reminders initiate automatically without user prompting.
*   **Auto-Pay/Subscription Confirmation:** For users with recurring monthly orders, the app must send a proactive reminder *before* the automated order is processed to secure final confirmation from the user.

### 3.4 Medicine Calendar & History Tracking
*   **Visual Calendar:** A dedicated calendar view showing historical order dates.
*   **Visual Indicators:** Dates with previous orders will display a small dot indicator below the date (e.g., an order placed on July 31, 2025, will be marked).
*   **Detailed Order View:** Tapping a marked date opens a table displaying the specific medication names and their respective costs for that transaction.

### 3.5 Checkout Mockup
*   **Simulated Checkout:** A simple mock checkout flow to complete the order process (no real payment gateway integration required).
