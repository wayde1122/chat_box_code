// Agent 相关类型定义

/** 工具调用参数 */
export interface ToolCallArgs {
  city?: string;
  date?: string;
  weather?: string;
}

/** 工具调用记录 */
export interface ToolCall {
  name: string;
  args: ToolCallArgs;
  result: string;
}

/** Agent 思考步骤 */
export interface AgentStep {
  thought: string;
  action: string;
  observation?: string;
}

/** Agent 响应 */
export interface AgentResponse {
  /** 最终答案 */
  answer: string;
  /** 思考过程 */
  steps: AgentStep[];
  /** 使用的模型 */
  model: string;
  /** 是否使用了工具 */
  usedTools: boolean;
}

/** LLM 配置 */
export interface LLMConfig {
  model: string;
  apiKey: string;
  baseURL: string;
}

/** 天气数据 */
export interface WeatherData {
  city: string;
  date?: string;
  description: string;
  temperature: string;
  maxTemp?: string;
  minTemp?: string;
}

/** 景点推荐 */
export interface AttractionResult {
  title: string;
  content: string;
  url?: string;
}
