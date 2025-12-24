import type { AgentStep } from "./agent";

export type SenderType = "user" | "assistant";

export interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  model: string;
  timestamp: number;
  type: SenderType;
  /** Agent 模式下的思考步骤 */
  steps?: AgentStep[];
  /** 是否使用了工具 */
  usedTools?: boolean;
}

export interface ChatHistorySettings {
  theme: "dark" | "light";
  fontSize: "small" | "medium" | "large";
}

export interface ChatHistory {
  messages: ChatMessage[];
  lastUpdated: number;
  settings: ChatHistorySettings;
}
