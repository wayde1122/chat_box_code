export type SenderType = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  model: string;
  timestamp: number;
  type: SenderType;
}

export interface ChatHistorySettings {
  theme: 'dark' | 'light';
  fontSize: 'small' | 'medium' | 'large';
}

export interface ChatHistory {
  messages: ChatMessage[];
  lastUpdated: number;
  settings: ChatHistorySettings;
}

