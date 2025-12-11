"use client";
import React from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { useChat } from "@/hooks/useChat";

export function ChatContainer() {
  const { history, sending, send } = useChat();

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={history.messages} />
      <TypingIndicator visible={sending} />
      <ChatInput onSend={send} />
    </div>
  );
}

