import type { Metadata } from "next";
import { ChatPage } from "@/features/app/chat";

export const metadata: Metadata = {
  title: "Chat with Flow AI",
  description: "Order, refill or ask Flow AI anything about your medicines.",
  robots: { index: false, follow: false },
};

export default function AppChatRoute() {
  return <ChatPage />;
}
