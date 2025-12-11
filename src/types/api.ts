export interface ChatResponse {
  model: string;
  question: string;
  answer: string;
}

export interface ChatRequestBody {
  question: string;
  model?: string;
}

