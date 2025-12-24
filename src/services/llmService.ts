import OpenAI from "openai";
import type { LLMConfig } from "@/types/agent";

/**
 * OpenAI 兼容的 LLM 客户端服务
 * 支持任何兼容 OpenAI 接口的模型服务
 */
class LLMService {
  private client: OpenAI;
  private model: string;

  constructor(config: LLMConfig) {
    this.model = config.model;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: false, // 仅服务端使用
    });
  }

  /**
   * 调用 LLM API 生成回应
   * @param prompt - 用户提示
   * @param systemPrompt - 系统提示
   * @returns LLM 生成的回应
   */
  async generate(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        stream: false,
      });

      return response.choices[0]?.message?.content ?? "";
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      console.error(`调用 LLM API 时发生错误: ${message}`);
      return "错误：调用语言模型服务时出错。";
    }
  }
}

// 默认配置 - 使用环境变量或默认值
const defaultConfig: LLMConfig = {
  apiKey: process.env.LLM_API_KEY ?? "ms-584e709a-b528-4e51-90a2-fe769070eb5c",
  baseURL: process.env.LLM_BASE_URL ?? "https://api-inference.modelscope.cn/v1",
  model: process.env.LLM_MODEL ?? "deepseek-ai/DeepSeek-V3.2",
};

// 导出单例实例
export const llmService = new LLMService(defaultConfig);
export { LLMService };

