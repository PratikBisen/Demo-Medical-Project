export interface Dict {
  dir: "ltr";
  brand: { name: string; tagline: string; aiOnline: string; aiProcessing: string };
  nav: {
    home: string; howItWorks: string; services: string; order: string; sell: string;
    about: string; contact: string; signIn: string; faq: string;
  };
  common: {
    loading: string; saving: string; cancel: string; confirm: string; save: string;
    edit: string; delete: string; back: string; next: string; close: string;
    search: string; filter: string; sort: string; viewAll: string; learnMore: string;
    demo: string; demoData: string; askFlowAi: string; viewMedicine: string;
    viewOrder: string; status: string; date: string; actions: string; language: string;
    theme: string; light: string; dark: string; system: string; english: string;
    hindi: string; marathi: string; notifications: string; markAllRead: string;
    noData: string; retry: string; tryAgain: string; all: string; none: string;
    high: string; medium: string; low: string; predicted: string; confirmed: string;
    upload: string; download: string; copy: string; share: string; refresh: string;
    today: string; tomorrow: string; units: string; quantity: string; total: string;
    price: string; medicine: string; generic: string; strength: string; form: string;
    stock: string; prescription: string; refill: string; order: string;
    account: string; settings: string; profile: string; logout: string; languageName: string;
  };
  home: {
    heroTitle: string; heroHighlight: string; heroSubtitle: string; heroInputPlaceholder: string;
    heroPrompt: string; listening: string; youSaid: string; edit: string; confirm: string;
    aiStatusOnline: string; aiStatusProcessing: string; quickPrompts: string[];
    orderCardTitle: string; orderCardCopy: string; orderCardCta: string;
    sellCardTitle: string; sellCardCopy: string; sellCardCta: string;
    howTitle: string; howSubtitle: string; howSteps: { title: string; desc: string }[];
    servicesTitle: string; servicesSubtitle: string;
    servicesItems: { title: string; desc: string }[];
    agentsTitle: string; agentsSubtitle: string; agents: { name: string; desc: string }[];
    orchestrator: string; userNode: string;
    safetyTitle: string; safetySubtitle: string; safetyDesc: string;
    approved: string; blocked: string; review: string;
    approvedDesc: string; blockedDesc: string; reviewDesc: string;
    calendarTitle: string; calendarSubtitle: string; calendarCta: string;
    trustTitle: string; trustSubtitle: string; trustItems: string[];
    faqTitle: string; faqSubtitle: string; faqCta: string;
    demoBadge: string;
  };
  how: { title: string; subtitle: string; steps: { title: string; desc: string }[]; cta: string };
  services: { title: string; subtitle: string; items: { title: string; desc: string }[] };
  about: { title: string; subtitle: string; sections: { title: string; desc: string }[]; concept: string[] };
  contact: {
    title: string; subtitle: string; name: string; email: string; subject: string;
    message: string; send: string; successTitle: string; successBody: string; demoNote: string;
    nameRequired: string; emailInvalid: string; subjectRequired: string; messageRequired: string;
  };
  faq: { title: string; subtitle: string; items: { q: string; a: string }[] };
  auth: {
    loginTitle: string; loginSubtitle: string; email: string; password: string;
    show: string; hide: string; remember: string; forgot: string; signIn: string;
    noAccount: string; register: string; demoAccounts: string; adminDemo: string;
    loginSuccess: string; loginError: string;
    registerTitle: string; registerSubtitle: string; name: string; phone: string;
    confirmPassword: string; preferredLanguage: string; accountType: string;
    customer: string; seller: string; haveAccount: string; createAccount: string;
    nameRequired: string; emailInvalid: string; phoneRequired: string; phoneInvalid: string;
    passwordMin: string; passwordMismatch: string; registerSuccess: string; registerError: string;
    fillAll: string;
  };
  app: {
    nav: {
      dashboard: string; chat: string; orders: string; medicines: string; calendar: string;
      refills: string; prescriptions: string; profile: string; settings: string;
    };
    greetingMorning: string; greetingAfternoon: string; greetingEvening: string;
    howCanHelp: string; nextRefill: string; activeOrder: string; recentMedicines: string;
    notifications: string; viewAll: string; chatTitle: string; chatSubtitle: string;
    chatPlaceholder: string; chatSend: string; chatClear: string; typing: string;
    suggestedPrompts: string[]; thinking: string;
    ordersTitle: string; ordersSubtitle: string; active: string; previous: string;
    requestReceived: string; medicineIdentified: string; safetyCheck: string;
    prescriptionStep: string; inventory: string; approved: string; processing: string;
    fulfillment: string; delivered: string;
    medicinesTitle: string; medicinesSubtitle: string; dosage: string; refillStatus: string;
    requestRefill: string; viewCalendar: string;
    calendarTitle: string; calendarSubtitle: string; monthView: string; agendaView: string;
    upcomingEvents: string; eventDetails: string; markComplete: string; predictedNote: string;
    refillsTitle: string; refillsSubtitle: string; expectedRefill: string; confidence: string;
    prescriptionsTitle: string; prescriptionsSubtitle: string; uploadPrescription: string;
    relatedMedicines: string; expires: string;
    profileTitle: string; profileSubtitle: string; settingsTitle: string; settingsSubtitle: string;
    notificationsPref: string; privacy: string; deleteAccount: string;
  };
  seller: {
    title: string; subtitle: string; dashboard: string; orders: string; inventory: string;
    procurement: string; analytics: string; profile: string; settings: string;
    pending: string; approved: string; processing: string; fulfillment: string; completed: string;
    totalOrders: string; lowStock: string; outOfStock: string; incomingOrders: string;
    reserved: string; available: string; updateStock: string; orderProcurement: string;
    requested: string; failed: string; supplier: string; updateStockDone: string;
  };
  admin: {
    title: string; subtitle: string; dashboard: string; users: string; sellers: string;
    medicines: string; policies: string; orders: string; inventory: string; prescriptions: string;
    reviews: string; refills: string; agents: string; audit: string; analytics: string;
    settings: string; totalUsers: string; totalSellers: string; totalOrders: string;
    pendingReviews: string; blockedOrders: string; inventoryAlerts: string; refillAlerts: string;
    agentActivity: string; safetyCenter: string; filters: string; policyReason: string;
    decision: string; traceId: string; reason: string; timestamp: string;
    savePolicy: string; warningPolicy: string; confirmEdit: string;
    agentStatusRunning: string; agentStatusCompleted: string; agentStatusWaiting: string;
    agentStatusError: string; agentStatusReview: string; orderVolume: string;
    approvalRate: string; blockedRate: string; reviewRate: string; agentPerformance: string;
  };
  notifications: {
    refillReminder: string; orderUpdate: string; prescriptionRequest: string;
    safetyBlock: string; reviewRequest: string; empty: string; emptyCta: string;
  };
  status: {
    active: string; completed: string; review: string; blocked: string; pending: string;
    verified: string; rejected: string; needsReview: string; inStock: string;
    lowStock: string; outOfStock: string; upcoming: string; predicted: string;
    dismissed: string; scheduled: string; running: string; waiting: string; error: string;
    requested: string; fulfilled: string; discontinued: string; draft: string;
  };
}
