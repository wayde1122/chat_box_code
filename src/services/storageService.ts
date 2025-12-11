import { ChatHistory } from "@/types/chat";

const STORAGE_KEY = "faq-chat-history";

export const StorageService = {
  getChatHistory(): ChatHistory {
    if (typeof window === "undefined") {
      return getDefaultHistory();
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : getDefaultHistory();
  },

  saveChatHistory(history: ChatHistory): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },

  clearChatHistory(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};

export function getDefaultHistory(): ChatHistory {
  return {
    messages: [],
    lastUpdated: Date.now(),
    settings: {
      theme: "dark",
      fontSize: "medium",
    },
  };
}

