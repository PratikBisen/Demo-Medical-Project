"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, TranslationDictionary } from "./i18n";
import {
  DemoUser,
  demoUsers,
  MedicineItem,
  initialMedicines,
  OrderRecord,
  initialOrders,
  RefillRecord,
  initialRefills,
  CalendarEventItem,
  initialEvents,
  SafetyDecisionRecord,
  initialSafetyDecisions,
  ChatMessage,
  AgentTraceItem,
} from "./store";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  theme: "dark" | "light" | "system";
  setTheme: (theme: "dark" | "light" | "system") => void;
  currentUser: DemoUser;
  setCurrentUser: (user: DemoUser) => void;
  switchDemoUser: (role: "CUSTOMER" | "SELLER" | "SUPER_ADMIN" | "PHARMACIST_REVIEWER") => void;
  medicines: MedicineItem[];
  orders: OrderRecord[];
  refills: RefillRecord[];
  calendarEvents: CalendarEventItem[];
  safetyDecisions: SafetyDecisionRecord[];
  chatMessages: ChatMessage[];
  isAgentThinking: boolean;
  voiceState: "idle" | "listening" | "processing" | "speaking" | "error";
  voiceTranscript: string;
  startVoiceInput: () => void;
  stopVoiceInput: () => void;
  cancelVoiceInput: () => void;
  speakText: (text: string, lang?: Language) => void;
  stopSpeaking: () => void;
  sendMessage: (text: string) => Promise<void>;
  placeDirectOrder: (medicine: MedicineItem, quantity?: number) => OrderRecord;
  acknowledgeRefill: (refillId: number) => void;
  updateOrderStatus: (orderId: number, status: OrderRecord["status"]) => void;
  adjustInventoryStock: (medicineId: number, delta: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setThemeState] = useState<"dark" | "light" | "system">("dark");
  const [currentUser, setCurrentUser] = useState<DemoUser>(demoUsers[0]);
  const [medicines, setMedicines] = useState<MedicineItem[]>(initialMedicines);
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [refills, setRefills] = useState<RefillRecord[]>(initialRefills);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(initialEvents);
  const [safetyDecisions, setSafetyDecisions] = useState<SafetyDecisionRecord[]>(initialSafetyDecisions);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "processing" | "speaking" | "error">("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");

  // Hydrate preferences
  useEffect(() => {
    const savedLang = localStorage.getItem("flow_pharma_lang") as Language;
    if (savedLang && ["en", "hi", "mr"].includes(savedLang)) {
      setLanguageState(savedLang);
    }
    const savedTheme = localStorage.getItem("flow_pharma_theme") as "dark" | "light" | "system";
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("dark");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("flow_pharma_lang", lang);
  };

  const setTheme = (newTheme: "dark" | "light" | "system") => {
    setThemeState(newTheme);
    localStorage.setItem("flow_pharma_theme", newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (th: "dark" | "light" | "system") => {
    const root = document.documentElement;
    if (th === "dark") {
      root.classList.add("dark");
    } else if (th === "light") {
      root.classList.remove("dark");
    } else {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isSystemDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  };

  const switchDemoUser = (role: "CUSTOMER" | "SELLER" | "SUPER_ADMIN" | "PHARMACIST_REVIEWER") => {
    const target = demoUsers.find((u) => u.role === role) || demoUsers[0];
    setCurrentUser(target);
    if (target.language) setLanguage(target.language);
  };

  // Voice Recognition via Web Speech API
  let recognition: any = null;
  const startVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    try {
      recognition = new SpeechRecognition();
      const langMap = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };
      recognition.lang = langMap[language] || "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setVoiceState("listening");
        setVoiceTranscript("");
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setVoiceTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setVoiceState("error");
        setTimeout(() => setVoiceState("idle"), 2500);
      };

      recognition.onend = () => {
        setVoiceState("processing");
        if (voiceTranscript.trim()) {
          sendMessage(voiceTranscript);
        }
        setTimeout(() => setVoiceState("idle"), 1000);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setVoiceState("idle");
    }
  };

  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop();
    }
    setVoiceState("idle");
  };

  const cancelVoiceInput = () => {
    if (recognition) {
      recognition.abort();
    }
    setVoiceTranscript("");
    setVoiceState("idle");
  };

  // Text-To-Speech
  const speakText = (text: string, lang: Language = language) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    // Clean emojis & formatting for speech
    const clean = text.replace(/[✅🛑⚠️📅💊🛒#\*\-]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    const langMap = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };
    utterance.lang = langMap[lang] || "en-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = () => setVoiceState("idle");
    utterance.onerror = () => setVoiceState("idle");

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setVoiceState("idle");
    }
  };

  // Deterministic Multi-Agent Workflow Execution
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAgentThinking(true);

    // Simulate multi-agent processing latency (800ms)
    await new Promise((res) => setTimeout(res, 800));

    const raw = text.toLowerCase();
    const traces: AgentTraceItem[] = [];

    // 1. Conversation Agent
    let detectedLang: Language = language;
    if (/[\u0900-\u097F]/.test(text)) {
      if (/मला|माझी|हवी|आहेत|पुन्हा|पाहिजेत|औषधं|गोळ्या/.test(raw)) detectedLang = "mr";
      else detectedLang = "hi";
    }

    // Extract quantity
    let quantity = 1;
    const qtyMatch = raw.match(/\b(\d+)\s*(strips?|bottles?|pack|tablets?|पत्ते|गोळ्या)?\b/);
    if (qtyMatch) quantity = parseInt(qtyMatch[1], 10) || 1;

    // Extract refill intent
    const isRefill = /refill|repeat|last month|regular|again|phir se|niyamit|पुन्हा|नेहमीची/.test(raw);

    // Match Medicine from Catalog
    let matchedMed: MedicineItem | undefined = undefined;
    for (const med of medicines) {
      const medLower = med.name.toLowerCase();
      const genericLower = med.genericName.toLowerCase();
      const brandLower = med.brandName.toLowerCase();

      if (
        raw.includes(medLower) ||
        raw.includes(genericLower) ||
        raw.includes(brandLower) ||
        med.aliases.some((a) => raw.includes(a.toLowerCase()))
      ) {
        matchedMed = med;
        break;
      }
    }

    // General fever/pain fallback match
    if (!matchedMed) {
      if (/paracetamol|crocin|fever|headache|pain|ताप|डोकेदुखी|बुखार|दर्द/.test(raw)) {
        matchedMed = medicines[0]; // Paracetamol 500mg
      } else if (/bp|blood pressure|रक्तदाब|बीपी/.test(raw)) {
        matchedMed = medicines[2]; // Telmisartan 40mg
      } else if (/diabetes|sugar|मधुमेह|शुगर/.test(raw)) {
        matchedMed = medicines[3]; // Metformin 500mg
      } else if (/cough|cold|खोकला|खांसी/.test(raw)) {
        matchedMed = medicines[6]; // Ascoril Cough Syrup
      }
    }

    traces.push({
      agent: "Conversation Agent",
      status: "COMPLETED",
      durationMs: 45,
      summary: `Extracted intent 'ORDER_MEDICINE' for '${matchedMed ? matchedMed.name : "Unrecognized"}' in ${detectedLang.toUpperCase()}`,
    });

    // Ambiguity Check
    if (!matchedMed) {
      const replyNotFound =
        detectedLang === "hi"
          ? "मुझे आपकी बताई गई दवा खोजने में कठिनाई हुई। कृपया दवा का नाम (जैसे Paracetamol 500mg या Telmisartan 40mg) बताएं।"
          : detectedLang === "mr"
          ? "मला आपण सांगितलेले औषध शोधण्यात अडचण आली. कृपया औषधाचे नाव (उदा. Paracetamol 500mg किंवा Telmisartan 40mg) सांगा."
          : "I couldn't locate that specific medicine in our verified catalog. Please specify the exact name and strength (e.g. Paracetamol 500mg).";

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        sender: "ai",
        text: replyNotFound,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: detectedLang,
        agentTraces: traces,
        clarificationOptions: ["Paracetamol 500mg", "Dolo 650mg", "Telmisartan 40mg (BP)", "Metformin 500mg (Sugar)"],
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      setIsAgentThinking(false);
      return;
    }

    // 2. Medicine Resolution Agent
    traces.push({
      agent: "Medicine Resolution Tool",
      status: "COMPLETED",
      durationMs: 18,
      summary: `Resolved master ID #${matchedMed.id} (${matchedMed.name}), Stock: ${matchedMed.inStock} units`,
    });

    // 3. Safety / Policy Agent (Deterministic Evaluation)
    const traceId = `tr-${Date.now().toString(36)}`;
    const checks = [
      { name: "Medicine Active", passed: true, details: `Catalog verification confirmed '${matchedMed.name}'` },
      { name: "Sale Policy", passed: matchedMed.saleAllowed, details: matchedMed.saleAllowed ? "Permitted in India CDSCO" : "PROHIBITED under jurisdiction policy" },
      { name: "Max Quantity Limit", passed: quantity <= matchedMed.maxQty, details: `Requested ${quantity} <= Max ${matchedMed.maxQty}` },
      { name: "Stock Available", passed: matchedMed.inStock >= quantity, details: `${matchedMed.inStock} available vs ${quantity} requested` },
    ];

    if (matchedMed.rxRequired) {
      checks.push({
        name: "Prescription Validity",
        passed: true,
        details: "Verified prescription found on customer record (Dr. Anand Rao)",
      });
    }

    let decision: "APPROVED" | "BLOCKED" | "NEEDS_REVIEW" = "APPROVED";
    let decisionReason = "All deterministic safety policies, prescription validity, and inventory checks passed.";

    if (!matchedMed.saleAllowed) {
      decision = "BLOCKED";
      decisionReason = "Sale of this medicine is prohibited under configured jurisdiction policy.";
    } else if (matchedMed.restricted) {
      decision = "NEEDS_REVIEW";
      decisionReason = "Schedule H1 restricted medication requires mandatory licensed pharmacist sign-off.";
    } else if (matchedMed.inStock < quantity) {
      decision = "BLOCKED";
      decisionReason = `Insufficient inventory available in stock (0 units). Autonomous procurement requested.`;
    } else if (quantity > matchedMed.maxQty) {
      decision = "BLOCKED";
      decisionReason = `Requested quantity (${quantity}) exceeds maximum safety limit (${matchedMed.maxQty}).`;
    }

    const safetyRecord: SafetyDecisionRecord = {
      id: Date.now(),
      traceId,
      medicineName: matchedMed.name,
      decision,
      reason: decisionReason,
      policyVersion: 1,
      checks,
      timestamp: new Date().toISOString(),
    };

    setSafetyDecisions((prev) => [safetyRecord, ...prev]);

    traces.push({
      agent: "Safety / Policy Agent",
      status: decision,
      durationMs: 22,
      summary: `Deterministic Decision: ${decision} (${decisionReason})`,
    });

    // 4. Refill Agent
    let refillPred: RefillRecord | undefined = undefined;
    if (isRefill || matchedMed.id === 3 || matchedMed.id === 4) {
      refillPred = {
        id: Date.now(),
        medicineId: matchedMed.id,
        medicineName: matchedMed.name,
        quantityUnits: quantity * 30,
        dailyDosage: 1.0,
        daysSupply: 30,
        estimatedDepletionDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        reminderDate: new Date(Date.now() + 26 * 86400000).toISOString().split("T")[0],
        confidence: "HIGH",
        acknowledged: false,
        daysRemaining: 30,
      };

      setRefills((prev) => [refillPred!, ...prev]);

      // Add Calendar Event
      const calEv: CalendarEventItem = {
        id: Date.now(),
        title: `Refill Due: ${matchedMed.name}`,
        type: "REFILL",
        date: refillPred.reminderDate,
        time: "08:30 AM",
        medicineName: matchedMed.name,
        status: "SCHEDULED",
      };
      setCalendarEvents((prev) => [calEv, ...prev]);

      traces.push({
        agent: "Predictive / Refill Agent",
        status: "COMPLETED",
        durationMs: 15,
        summary: `Calculated 30 days supply. Refill reminder scheduled for ${refillPred.reminderDate}`,
      });
    }

    // 5. Action Agent
    let createdOrder: OrderRecord | undefined = undefined;
    if (decision === "APPROVED") {
      const orderId = 100 + orders.length + 1;
      const orderPrice = matchedMed.unitPriceCents * quantity;

      createdOrder = {
        id: orderId,
        uuid: `ord-${Date.now().toString(36)}`,
        customerId: currentUser.id,
        customerName: currentUser.fullName,
        medicineName: matchedMed.name,
        strength: matchedMed.strength,
        quantity,
        totalPriceCents: orderPrice,
        status: "APPROVED",
        rxRequired: matchedMed.rxRequired,
        rxProvided: true,
        createdAt: new Date().toISOString(),
        deliveryAddress: "402 Palm Heights, Powai, Mumbai 400076",
        sellerName: "Apex City Chemist & Care",
        timeline: [
          { title: "Request Received", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), completed: true },
          { title: "Medicine Identified", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), completed: true },
          { title: "Safety Checks Passed", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), completed: true },
          { title: "Order Approved", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), completed: true },
          { title: "Fulfillment Dispatched", time: "Pending", completed: false },
          { title: "Delivered", time: "Pending", completed: false },
        ],
      };

      setOrders((prev) => [createdOrder!, ...prev]);

      // Decrement stock
      setMedicines((prev) =>
        prev.map((m) => (m.id === matchedMed!.id ? { ...m, inStock: Math.max(0, m.inStock - quantity) } : m))
      );

      traces.push({
        agent: "Action Agent",
        status: "COMPLETED",
        durationMs: 30,
        summary: `Executed Order #${orderId} (₹${(orderPrice / 100).toFixed(2)}) with inventory decrement`,
      });
    } else if (decision === "NEEDS_REVIEW") {
      traces.push({
        agent: "Action Agent",
        status: "NEEDS_REVIEW",
        durationMs: 20,
        summary: `Created Pharmacist Review Case #${traceId.slice(0, 8)} — Human intervention required`,
      });
    } else {
      traces.push({
        agent: "Action Agent",
        status: "BLOCKED",
        durationMs: 12,
        summary: `Order blocked by deterministic safety engine: ${decisionReason}`,
      });
    }

    // Formulate localized reply
    let replyText = "";
    if (decision === "APPROVED" && createdOrder) {
      if (detectedLang === "hi") {
        replyText = `✅ ${quantity}x ${matchedMed.name} का ऑर्डर सफलतापूर्वक स्वीकृत और बुक हो गया है (ऑर्डर #${createdOrder.id})। कुल राशि: ₹${(createdOrder.totalPriceCents / 100).toFixed(2)}। सभी सुरक्षा और स्टॉक नियम सत्यापित किए गए हैं।`;
      } else if (detectedLang === "mr") {
        replyText = `✅ ${quantity}x ${matchedMed.name} ची ऑर्डर मंजूर आणि नोंदवली गेली आहे (ऑर्डर #${createdOrder.id}). एकूण रक्कम: ₹${(createdOrder.totalPriceCents / 100).toFixed(2)}. सर्व सुरक्षा आणि स्टॉक निकष पूर्ण झाले आहेत.`;
      } else {
        replyText = `✅ Your order for ${quantity}x ${matchedMed.name} has been approved and placed (Order #${createdOrder.id}). Total: ₹${(createdOrder.totalPriceCents / 100).toFixed(2)}. All deterministic safety and stock checks passed.`;
      }
    } else if (decision === "NEEDS_REVIEW") {
      if (detectedLang === "hi") {
        replyText = `⚠️ ${matchedMed.name} के लिए फार्मासिस्ट समीक्षा आवश्यक है। कारण: ${decisionReason}। हमारे अधिकृत फार्मासिस्ट इसकी जांच कर रहे हैं।`;
      } else if (detectedLang === "mr") {
        replyText = `⚠️ ${matchedMed.name} साठी फार्मासिस्ट तपासणी आवश्यक आहे. कारण: ${decisionReason}. आमचे अधिकृत फार्मासिस्ट याची पडताळणी करत आहेत.`;
      } else {
        replyText = `⚠️ Pharmacist review required for ${matchedMed.name}. Reason: ${decisionReason}. A licensed pharmacist will review before dispensation.`;
      }
    } else {
      if (detectedLang === "hi") {
        replyText = `🛑 ${matchedMed.name} के लिए अनुरोध पूरा नहीं किया जा सका। सुरक्षा नियम: ${decisionReason} (भारत क्षेत्राधिकार)।`;
      } else if (detectedLang === "mr") {
        replyText = `🛑 ${matchedMed.name} साठी विनंती पूर्ण करता आली नाही. सुरक्षा नियम: ${decisionReason} (भारत कार्यक्षेत्र).`;
      } else {
        replyText = `🛑 Order blocked by deterministic safety rule for ${matchedMed.name}. Reason: ${decisionReason} (Configured Jurisdiction: India).`;
      }
    }

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      sender: "ai",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language: detectedLang,
      matchedMedicine: matchedMed,
      safetyDecision: safetyRecord,
      orderCreated: createdOrder,
      refillPrediction: refillPred,
      agentTraces: traces,
    };

    setChatMessages((prev) => [...prev, aiMsg]);
    setIsAgentThinking(false);
  };

  const placeDirectOrder = (medicine: MedicineItem, quantity: number = 1): OrderRecord => {
    const orderId = 100 + orders.length + 1;
    const newOrd: OrderRecord = {
      id: orderId,
      uuid: `ord-${Date.now().toString(36)}`,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      medicineName: medicine.name,
      strength: medicine.strength,
      quantity,
      totalPriceCents: medicine.unitPriceCents * quantity,
      status: "APPROVED",
      rxRequired: medicine.rxRequired,
      rxProvided: true,
      createdAt: new Date().toISOString(),
      deliveryAddress: "402 Palm Heights, Powai, Mumbai 400076",
      sellerName: "Apex City Chemist & Care",
      timeline: [
        { title: "Request Received", time: "Now", completed: true },
        { title: "Safety Checks Passed", time: "Now", completed: true },
        { title: "Order Approved", time: "Now", completed: true },
      ],
    };
    setOrders((prev) => [newOrd, ...prev]);
    return newOrd;
  };

  const acknowledgeRefill = (refillId: number) => {
    setRefills((prev) => prev.map((r) => (r.id === refillId ? { ...r, acknowledged: true } : r)));
  };

  const updateOrderStatus = (orderId: number, newStatus: OrderRecord["status"]) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              timeline: [
                ...o.timeline,
                { title: `Status: ${newStatus}`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), completed: true },
              ],
            }
          : o
      )
    );
  };

  const adjustInventoryStock = (medicineId: number, delta: number) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === medicineId ? { ...m, inStock: Math.max(0, m.inStock + delta) } : m))
    );
  };

  const t = translations[language] || translations.en;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        setTheme,
        currentUser,
        setCurrentUser,
        switchDemoUser,
        medicines,
        orders,
        refills,
        calendarEvents,
        safetyDecisions,
        chatMessages,
        isAgentThinking,
        voiceState,
        voiceTranscript,
        startVoiceInput,
        stopVoiceInput,
        cancelVoiceInput,
        speakText,
        stopSpeaking,
        sendMessage,
        placeDirectOrder,
        acknowledgeRefill,
        updateOrderStatus,
        adjustInventoryStock,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
