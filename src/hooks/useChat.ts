"use client";
import React from "react";
import type { ChatMessage, ChatHistory } from "@/types/chat";
import { StorageService, getDefaultHistory } from "@/services/storageService";
import { sendChat } from "@/services/chatService";

export function useChat() {
  const [history, setHistory] = React.useState<ChatHistory>(getDefaultHistory());
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    setHistory(StorageService.getChatHistory());
  }, []);

  const addMessage = React.useCallback((msg: ChatMessage) => {
    setHistory((prev) => {
      const next = { ...prev, messages: [...prev.messages, msg], lastUpdated: Date.now() };
      StorageService.saveChatHistory(next);
      return next;
    });
  }, []);

  const clear = React.useCallback(() => {
    StorageService.clearChatHistory();
    setHistory(getDefaultHistory());
  }, []);

  const send = React.useCallback(async (question: string) => {
    setSending(true);
    try {
      const resp = await sendChat(question);
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        question,
        answer: "",
        model: resp.model,
        timestamp: Date.now(),
        type: "user",
      };
      addMessage(userMsg);

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        question: resp.question,
        answer: resp.answer,
        model: resp.model,
        timestamp: Date.now(),
        type: "assistant",
      };
      addMessage(botMsg);
    } finally {
      setSending(false);
    }
  }, [addMessage]);

  return { history, sending, send, clear } as const;
}

