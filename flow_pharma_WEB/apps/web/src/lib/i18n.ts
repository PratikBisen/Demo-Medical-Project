/**
 * Flow Pharma - Centralized Internationalization (i18n)
 * Supported languages: en (English), hi (Hindi), mr (Marathi)
 */

export type Language = "en" | "hi" | "mr";

export interface TranslationDictionary {
  brand: {
    name: string;
    tagline: string;
    ai_status_online: string;
    ai_status_processing: string;
  };
  nav: {
    home: string;
    howItWorks: string;
    services: string;
    order: string;
    sell: string;
    about: string;
    contact: string;
    login: string;
    register: string;
    dashboard: string;
    chat: string;
    orders: string;
    medicines: string;
    calendar: string;
    prescriptions: string;
    refills: string;
    sellerPortal: string;
    adminPortal: string;
    logout: string;
  };
  hero: {
    title: string;
    highlight: string;
    subtitle: string;
    inputPlaceholder: string;
    voiceButton: string;
    sendButton: string;
    listening: string;
    processing: string;
    tapToSpeak: string;
    quickPrompts: string[];
    pathwayOrderTitle: string;
    pathwayOrderDesc: string;
    pathwaySellTitle: string;
    pathwaySellDesc: string;
  };
  chat: {
    title: string;
    subtitle: string;
    emptyGreeting: string;
    emptyPrompt: string;
    aiAgentOnline: string;
    listeningState: string;
    processingState: string;
    speakResponse: string;
    stopVoice: string;
    inputPlaceholder: string;
    send: string;
    clearChat: string;
    orderApproved: string;
    orderUnderReview: string;
    orderBlocked: string;
    safetyChecksPassed: string;
    prescriptionRequiredBadge: string;
    uploadPrescription: string;
    viewOrderDetails: string;
    quantity: string;
    total: string;
    inStock: string;
    outOfStock: string;
  };
  safety: {
    centerTitle: string;
    deterministicEngine: string;
    approved: string;
    blocked: string;
    needsReview: string;
    prescriptionCheck: string;
    stockCheck: string;
    policyCheck: string;
    maxQuantityCheck: string;
    jurisdictionNote: string;
  };
  refill: {
    title: string;
    upcomingRefill: string;
    daysRemaining: string;
    depletionDate: string;
    reorderNow: string;
    dosageInstruction: string;
    confidenceHigh: string;
    confidenceMedium: string;
  };
  calendar: {
    title: string;
    month: string;
    week: string;
    agenda: string;
    refillEvent: string;
    medicationEvent: string;
    askFlowAi: string;
    markCompleted: string;
  };
  seller: {
    title: string;
    incomingOrders: string;
    stockManagement: string;
    procurementTrigger: string;
    fulfillOrder: string;
    markDispatched: string;
  };
  admin: {
    title: string;
    activeUsers: string;
    safetyDecisions: string;
    agentTraces: string;
    reviewQueue: string;
    policyEditor: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    brand: {
      name: "FLOW PHARMA",
      tagline: "Autonomous Multi-Agent Pharmacy Ecosystem",
      ai_status_online: "FLOW AI ● ONLINE",
      ai_status_processing: "FLOW AI ● PROCESSING",
    },
    nav: {
      home: "Home",
      howItWorks: "How It Works",
      services: "Services",
      order: "Order Medicine",
      sell: "Sell / Pharmacy",
      about: "About",
      contact: "Contact",
      login: "Sign In",
      register: "Register",
      dashboard: "Dashboard",
      chat: "AI Chat Order",
      orders: "My Orders",
      medicines: "Medicine Catalog",
      calendar: "Medication Calendar",
      prescriptions: "Prescriptions",
      refills: "Refill Intelligence",
      sellerPortal: "Seller Portal",
      adminPortal: "Admin Center",
      logout: "Sign Out",
    },
    hero: {
      title: "Pharmacy That Understands",
      highlight: "Every Word You Speak.",
      subtitle: "Speak or type in English, Hindi, or Marathi. Our 4-agent AI handles medicine resolution, deterministic safety policies, prescription validation, and automated fulfillment.",
      inputPlaceholder: "Tell Flow AI what you need (e.g. 'I need 2 strips of Paracetamol 500mg' or 'BP medicine refill')...",
      voiceButton: "Voice Input",
      sendButton: "Send Request",
      listening: "Listening to your voice... Speak now",
      processing: "Flow AI agents are verifying medicine and policy...",
      tapToSpeak: "Tap to Speak",
      quickPrompts: [
        "Need 2 strips of Paracetamol 500mg",
        "Refill my regular blood pressure medicine",
        "Crocin 650 for headache",
        "Dolo 650 stock check",
      ],
      pathwayOrderTitle: "Order Medicine",
      pathwayOrderDesc: "Conversational text & voice ordering with autonomous multi-agent safety checks and smart refills.",
      pathwaySellTitle: "Sell Medicine / Pharmacy Portal",
      pathwaySellDesc: "Connect pharmacy inventory, fulfill automated verified orders, and automate supplier procurement.",
    },
    chat: {
      title: "Flow AI Pharmacy Assistant",
      subtitle: "Deterministic safety verification & conversational ordering",
      emptyGreeting: "Hello! I am your Flow Pharma AI Assistant.",
      emptyPrompt: "You can describe the medication you need, request a refill, or upload a doctor's prescription.",
      aiAgentOnline: "All 4 AI Agents Connected",
      listeningState: "Listening... (Click microphone to stop)",
      processingState: "Analyzing inquiry across safety policies...",
      speakResponse: "Read Aloud",
      stopVoice: "Stop Audio",
      inputPlaceholder: "Type in English, Hindi (हिंदी), or Marathi (मराठी)...",
      send: "Send",
      clearChat: "Clear Chat",
      orderApproved: "Order Approved & Placed",
      orderUnderReview: "Under Pharmacist Review",
      orderBlocked: "Order Blocked by Safety Rule",
      safetyChecksPassed: "All deterministic safety checks passed",
      prescriptionRequiredBadge: "Prescription Required",
      uploadPrescription: "Upload Prescription",
      viewOrderDetails: "View Order",
      quantity: "Qty",
      total: "Total",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
    },
    safety: {
      centerTitle: "Deterministic Safety Center",
      deterministicEngine: "Backend Policy Engine (Zero Hallucination)",
      approved: "APPROVED",
      blocked: "BLOCKED",
      needsReview: "NEEDS REVIEW",
      prescriptionCheck: "Prescription Validity",
      stockCheck: "Inventory Availability",
      policyCheck: "Jurisdiction Policy",
      maxQuantityCheck: "Maximum Dosage Limit",
      jurisdictionNote: "Evaluated under configured India CDSCO / Drugs Act safety rules.",
    },
    refill: {
      title: "Predictive Refill Intelligence",
      upcomingRefill: "Upcoming Refill Due",
      daysRemaining: "days supply remaining",
      depletionDate: "Expected Depletion",
      reorderNow: "Reorder with 1-Click",
      dosageInstruction: "Daily dosage calculation",
      confidenceHigh: "High Confidence (Consistent Interval)",
      confidenceMedium: "Medium Confidence",
    },
    calendar: {
      title: "Medication & Refill Calendar",
      month: "Month",
      week: "Week",
      agenda: "List View",
      refillEvent: "Refill Reminder",
      medicationEvent: "Scheduled Dose",
      askFlowAi: "Ask Flow AI to Reorder",
      markCompleted: "Mark Taken",
    },
    seller: {
      title: "Pharmacy Seller Management",
      incomingOrders: "Active Verified Orders",
      stockManagement: "Inventory & Batch Levels",
      procurementTrigger: "Autonomous Procurement",
      fulfillOrder: "Dispatch Order",
      markDispatched: "Mark as Dispatched",
    },
    admin: {
      title: "Platform & Safety Control Center",
      activeUsers: "Registered Patients & Sellers",
      safetyDecisions: "Safety Audit Decisions",
      agentTraces: "Multi-Agent Observability",
      reviewQueue: "Pharmacist Review Queue",
      policyEditor: "Medicine Policy Rules",
    },
  },
  hi: {
    brand: {
      name: "FLOW PHARMA",
      tagline: "मल्टी-एजेंट एआई संचालित स्वायत्त फार्मेसी",
      ai_status_online: "फ्लो एआई ● ऑनलाइन",
      ai_status_processing: "फ्लो एआई ● प्रोसेसिंग",
    },
    nav: {
      home: "होम",
      howItWorks: "यह कैसे काम करता है",
      services: "सेवाएं",
      order: "दवाई ऑर्डर करें",
      sell: "दवा विक्रेता पोर्टल",
      about: "हमारे बारे में",
      contact: "संपर्क करें",
      login: "लॉग इन",
      register: "रजिस्टर",
      dashboard: "डैशबोर्ड",
      chat: "एआई चैट ऑर्डर",
      orders: "मेरे ऑर्डर्स",
      medicines: "दवाइयों की सूची",
      calendar: "दवा कैलेंडर",
      prescriptions: "पर्चे (Rx)",
      refills: "स्मार्ट रीफिल",
      sellerPortal: "सेलर पोर्टल",
      adminPortal: "व्यवस्थापक केंद्र",
      logout: "लॉग आउट",
    },
    hero: {
      title: "फार्मेसी जो समझती है",
      highlight: "आपकी हर एक बात।",
      subtitle: "हिंदी, मराठी या अंग्रेजी में बोलें या लिखें। हमारा 4-एजेंट एआई दवा पहचान, सुरक्षा नियम, पर्चा सत्यापन और सुरक्षित डिलीवरी सुनिश्चित करता है।",
      inputPlaceholder: "फ्लो एआई को बताएं आपको क्या चाहिए (उदा. 'मुझे 2 पत्ते पैरासिटामोल 500 चाहिए' या 'बीपी की दवाई फिर से भेजो')...",
      voiceButton: "आवाज़ से बोलें",
      sendButton: "भेजें",
      listening: "आपकी आवाज़ सुन रहे हैं... कृपया बोलें",
      processing: "फ्लो एआई दवा और सुरक्षा नियमों की जांच कर रहा है...",
      tapToSpeak: "बोलने के लिए टैप करें",
      quickPrompts: [
        "मुझे 2 पत्ते Paracetamol 500 चाहिए",
        "मेरी नियमित बीपी की दवाई रीफिल करें",
        "सिरदर्द के लिए क्रोसिन 650",
        "Dolo 650 का स्टॉक चेक करें",
      ],
      pathwayOrderTitle: "दवाई ऑर्डर करें",
      pathwayOrderDesc: "बोलकर या लिखकर आसानी से दवाई मंगाएं। पूरी सुरक्षा और सटीक रीफिल के साथ।",
      pathwaySellTitle: "दवा विक्रेता / फार्मेसी पोर्टल",
      pathwaySellDesc: "अपनी फार्मेसी इन्वेंट्री जोड़ें, सत्यापित ऑर्डर्स प्रोसेस करें और स्वचालित री-स्टॉक पाएं।",
    },
    chat: {
      title: "फ्लो एआई फार्मेसी सहायक",
      subtitle: "सुरक्षित, सटीक और त्वरित दवा सहायता",
      emptyGreeting: "नमस्ते! मैं आपका फ्लो फार्मा एआई सहायक हूँ।",
      emptyPrompt: "आप अपनी आवश्यक दवाई का नाम लिख सकते हैं, पिछला पर्चा दोहरा सकते हैं या डॉक्टर का पर्चा अपलोड कर सकते हैं।",
      aiAgentOnline: "सभी 4 एआई एजेंट सक्रिय हैं",
      listeningState: "सुन रहे हैं... (माइक पर क्लिक करके रोकें)",
      processingState: "सुरक्षा नीतियों की पुष्टि की जा रही है...",
      speakResponse: "सुनें",
      stopVoice: "ऑडियो रोकें",
      inputPlaceholder: "हिंदी (Hindi), मराठी (Marathi) या English में लिखें...",
      send: "भेजें",
      clearChat: "चैट साफ़ करें",
      orderApproved: "ऑर्डर स्वीकृत और बुक हो गया",
      orderUnderReview: "फार्मासिस्ट समीक्षा में",
      orderBlocked: "सुरक्षा नीति द्वारा रोका गया",
      safetyChecksPassed: "सभी सुरक्षा परीक्षण सफल",
      prescriptionRequiredBadge: "डॉक्टर का पर्चा आवश्यक",
      uploadPrescription: "पर्चा अपलोड करें",
      viewOrderDetails: "ऑर्डर देखें",
      quantity: "मात्रा",
      total: "कुल",
      inStock: "उपलब्ध",
      outOfStock: "स्टॉक में नहीं",
    },
    safety: {
      centerTitle: "सुरक्षा नियंत्रण केंद्र",
      deterministicEngine: "बैकएंड पॉलिसी इंजन (100% सटीक)",
      approved: "स्वीकृत (APPROVED)",
      blocked: "अवरुद्ध (BLOCKED)",
      needsReview: "समीक्षा आवश्यक (NEEDS REVIEW)",
      prescriptionCheck: "पर्चे की वैधता",
      stockCheck: "इन्वेंट्री उपलब्धता",
      policyCheck: "सरकारी नीति व नियम",
      maxQuantityCheck: "अधिकतम अनुमत सीमा",
      jurisdictionNote: "भारतीय औषधि एवं प्रसाधन सामग्री नियमों के तहत परीक्षित।",
    },
    refill: {
      title: "स्मार्ट रीफिल पूर्वानुमान",
      upcomingRefill: "आगामी रीफिल अलर्ट",
      daysRemaining: "दिनों की दवा शेष",
      depletionDate: "अनुमानित समाप्ति तिथि",
      reorderNow: "1-क्लिक में दोबारा मंगाएं",
      dosageInstruction: "दैनिक खुराक की गणना",
      confidenceHigh: "उच्च सटीकता",
      confidenceMedium: "मध्यम सटीकता",
    },
    calendar: {
      title: "दवा और रीफिल कैलेंडर",
      month: "महीना",
      week: "सप्ताह",
      agenda: "सूची",
      refillEvent: "रीफिल रिमाइंडर",
      medicationEvent: "दवा का समय",
      askFlowAi: "फ्लो एआई से दोबारा मंगाएं",
      markCompleted: "दवा ली गई",
    },
    seller: {
      title: "फार्मेसी सेलर पोर्टल",
      incomingOrders: "नए सत्यापित ऑर्डर्स",
      stockManagement: "स्टॉक और बैच प्रबंधन",
      procurementTrigger: "स्वचालित खरीद आर्डर",
      fulfillOrder: "ऑर्डर डिस्पैच करें",
      markDispatched: "डिस्पैच मार्क करें",
    },
    admin: {
      title: "प्रशासक एवं सुरक्षा केंद्र",
      activeUsers: "सक्रिय ग्राहक और विक्रेता",
      safetyDecisions: "सुरक्षा निर्णय रिकॉर्ड",
      agentTraces: "एआई एजेंट मॉनिटरिंग",
      reviewQueue: "फार्मासिस्ट रिव्यू कतार",
      policyEditor: "दवा सुरक्षा नीतियां",
    },
  },
  mr: {
    brand: {
      name: "FLOW PHARMA",
      tagline: "मल्टी-एजंट एआय द्वारे संचलित स्वायत्त फार्मसी",
      ai_status_online: "फ्लो एआय ● ऑनलाइन",
      ai_status_processing: "फ्लो एआय ● प्रोसेसिंग",
    },
    nav: {
      home: "मुख्यपृष्ठ",
      howItWorks: "कसे चालते",
      services: "सेवा",
      order: "औषध मागवा",
      sell: "विक्रेता पोर्टल",
      about: "आमच्याबद्दल",
      contact: "संपर्क",
      login: "लॉग इन",
      register: "नोंदणी",
      dashboard: "डॅशबोर्ड",
      chat: "एआय चॅट ऑर्डर",
      orders: "माझ्या ऑर्डर्स",
      medicines: "औषधांची यादी",
      calendar: "औषध दिनदर्शिका",
      prescriptions: "प्रिस्क्रिप्शन्स (Rx)",
      refills: "स्मार्ट रीफिल",
      sellerPortal: "विक्रेता पोर्टल",
      adminPortal: "प्रशासक केंद्र",
      logout: "लॉग आउट",
    },
    hero: {
      title: "फार्मसी जी समजून घेते",
      highlight: "तुमचा प्रत्येक शब्द.",
      subtitle: "मराठी, हिंदी किंवा इंग्रजीत बोला किंवा टाईप करा. आमची 4-एजंट एआय औषध शोध, अचूक सुरक्षा नियम, प्रिस्क्रिप्शन पडताळणी आणि घरपोच डिलिव्हरी करते.",
      inputPlaceholder: "फ्लो एआय ला सांगा आपल्याला काय हवे आहे (उदा. 'मला २ पत्ते Paracetamol 500mg हवे आहेत' किंवा 'रक्तदाबाची औषधं पुन्हा पाठवा')...",
      voiceButton: "आवाजाने सांगा",
      sendButton: "पाठवा",
      listening: "तुमचा आवाज ऐकत आहे... कृपया बोला",
      processing: "फ्लो एआय औषध आणि सुरक्षा नियमांची पडताळणी करत आहे...",
      tapToSpeak: "बोलण्यासाठी दाबा",
      quickPrompts: [
        "मला २ पत्ते Paracetamol 500 हवे आहेत",
        "माझी रक्तदाबाची औषधं पुन्हा मागवा",
        "डोकेदुखीसाठी Crocin 650",
        "Dolo 650 चा स्टॉक तपासा",
      ],
      pathwayOrderTitle: "औषध मागवा",
      pathwayOrderDesc: "बोलून किंवा लिहून अत्यंत सोप्या पद्धतीने औषध मागवा. पूर्ण सुरक्षा आणि वेळेवर रीफिल रिमाइंडर्ससह.",
      pathwaySellTitle: "औषध विक्रेता / फार्मसी पोर्टल",
      pathwaySellDesc: "आपली फार्मसी इन्व्हेंटरी जोडा, सुरक्षित ऑर्डर्स पूर्ण करा आणि स्वयंचलित पुरवठा मिळवा.",
    },
    chat: {
      title: "फ्लो एआय फार्मसी सहाय्यक",
      subtitle: "अचूक सुरक्षा तपासणी आणि संभाषणात्मक ऑर्डर",
      emptyGreeting: "नमस्कार! मी आपला फ्लो फार्मा एआय सहाय्यक आहे.",
      emptyPrompt: "आपण आपल्याला आवश्यक असणाऱ्या औषधाचे नाव सांगू शकता, जुनी ऑर्डर पुन्हा मागवू शकता किंवा डॉक्टरांची चिठ्ठी अपलोड करू शकता.",
      aiAgentOnline: "सर्व 4 एआय एजंट सक्रिय आहेत",
      listeningState: "ऐकत आहे... (थांबवण्यासाठी माईकवर दाबा)",
      processingState: "सुरक्षा नियमांची पडताळणी सुरु आहे...",
      speakResponse: "ऐका",
      stopVoice: "आवाज थांबवा",
      inputPlaceholder: "मराठी (Marathi), हिंदी (Hindi) किंवा English मध्ये टाईप करा...",
      send: "पाठवा",
      clearChat: "चॅट साफ करा",
      orderApproved: "ऑर्डर मंजूर आणि नोंदवली गेली",
      orderUnderReview: "फार्मासिस्ट तपासणी सुरु",
      orderBlocked: "सुरक्षा नियमामुळे रोखण्यात आले",
      safetyChecksPassed: "सर्व सुरक्षा निकष पूर्ण",
      prescriptionRequiredBadge: "डॉक्टरांची चिठ्ठी आवश्यक",
      uploadPrescription: "प्रिस्क्रिप्शन अपलोड करा",
      viewOrderDetails: "ऑर्डर पहा",
      quantity: "प्रमाण",
      total: "एकूण",
      inStock: "उपलब्ध",
      outOfStock: "स्टॉकमध्ये नाही",
    },
    safety: {
      centerTitle: "सुरक्षा नियंत्रण केंद्र",
      deterministicEngine: "बॅकएंड पॉलिसी इंजिन (१००% अचूक)",
      approved: "मंजूर (APPROVED)",
      blocked: "प्रतिबंधित (BLOCKED)",
      needsReview: "पुनरावलोकन आवश्यक (NEEDS REVIEW)",
      prescriptionCheck: "प्रिस्क्रिप्शन वैधता",
      stockCheck: "स्टॉक उपलब्धता",
      policyCheck: "शासकीय नियमावली",
      maxQuantityCheck: "कमाल मर्यादा",
      jurisdictionNote: "भारतीय औषध नियम आणि मानकांनुसार तपासणी.",
    },
    refill: {
      title: "स्मार्ट रीफिल अंदाज",
      upcomingRefill: "पुढील रीफिल अलर्ट",
      daysRemaining: "दिवसांची औषधे शिल्लक",
      depletionDate: "अपेक्षित समाप्ती तारीख",
      reorderNow: "१-क्लिकमध्ये पुन्हा मागवा",
      dosageInstruction: "दररोजच्या मात्रेची अचूक गणना",
      confidenceHigh: "उच्च अचूकता",
      confidenceMedium: "मध्यम अचूकता",
    },
    calendar: {
      title: "औषध व रीफिल दिनदर्शिका",
      month: "महिना",
      week: "आठवडा",
      agenda: "यादी",
      refillEvent: "रीफिल रिमाइंडर्स",
      medicationEvent: "औषधाची वेळ",
      askFlowAi: "फ्लो एआय कडून पुन्हा मागवा",
      markCompleted: "औषध घेतले",
    },
    seller: {
      title: "फार्मसी विक्रेता पोर्टल",
      incomingOrders: "सत्यापित नवीन ऑर्डर्स",
      stockManagement: "स्टॉक आणि बॅच व्यवस्थापन",
      procurementTrigger: "स्वयंचलित पुरवठा मागणी",
      fulfillOrder: "ऑर्डर पाठवा",
      markDispatched: "डिसपॅच चिन्हांकित करा",
    },
    admin: {
      title: "प्रशासक आणि सुरक्षा नियंत्रण",
      activeUsers: "नोंदणीकृत ग्राहक आणि विक्रेते",
      safetyDecisions: "सुरक्षा निर्णय नोंदी",
      agentTraces: "एआय एजंट कार्यक्षमता",
      reviewQueue: "फार्मासिस्ट पुनरावलोकन",
      policyEditor: "औषध सुरक्षा नियम",
    },
  },
};
