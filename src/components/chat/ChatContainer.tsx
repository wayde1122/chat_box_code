"use client";
import React from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { useChat } from "@/hooks/useChat";
import { ChatLayout } from "@/components/layout/ChatLayout";

export function ChatContainer() {
  const { history, sending, send, clear } = useChat();
  const [inputValue, setInputValue] = React.useState("");

  const handleSelectExample = React.useCallback((text: string) => {
    setInputValue(text);
  }, []);

  const handleSend = React.useCallback(
    (question: string) => {
      send(question);
      setInputValue(""); // 清空初始值
    },
    [send]
  );

  return (
    <ChatLayout onClear={clear} onSelectExample={handleSelectExample}>
      <div className="flex h-full flex-col">
        <MessageList messages={history.messages} />
        <TypingIndicator visible={sending} />
        <ChatInput 
          onSend={handleSend} 
          disabled={sending} 
          initialValue={inputValue}
        />
      </div>
    </ChatLayout>
  );
}
