import type { AgentStep } from "./agent";

export interface ChatResponse {
  model: string;
  question: string;
  answer: string;
  /** Agent 模式下的思考步骤 */
  steps?: AgentStep[];
  /** 是否使用了工具 */
  usedTools?: boolean;
}

export interface ChatRequestBody {
  question: string;
  /** 模型选择: "faq-matcher" | "travel-agent" */
  model?: string;
}
