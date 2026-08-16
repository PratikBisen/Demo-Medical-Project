export const siteConfig = {
  name: "Flow Pharma",
  brand: "FLOW PHARMA",
  url: "https://flowpharma.example",
  description:
    "An autonomous pharmacy ecosystem. Order medicines by natural voice or text in English, Hindi and Marathi — with AI-powered workflows, smart refills and safety-aware handling.",
  ogImage: "/og.png",
  links: {
    github: "https://github.com",
  },
  aiStatus: {
    online: "FLOW AI",
    suffixOnline: "ONLINE",
    suffixProcessing: "PROCESSING",
  },
  supportedLanguages: ["en", "hi", "mr"] as const,
  demoNotice:
    "Demo environment — data shown is simulated locally and will be replaced by the production backend.",
} as const;

export const languageNames: Record<string, string> = {
  en: "English",
  hi: "हिंदी (Hindi)",
  mr: "मराठी (Marathi)",
};
