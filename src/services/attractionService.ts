import { tavily } from "@tavily/core";

// Tavily API Key - 使用环境变量或默认值
const TAVILY_API_KEY = process.env.TAVILY_API_KEY ?? "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";

interface TavilyResult {
  title: string;
  content: string;
  url?: string;
}

interface TavilyResponse {
  answer?: string;
  results?: TavilyResult[];
}

/**
 * 景点推荐服务 - 通过 Tavily API 搜索城市景点
 * @param city - 城市名称
 * @param weather - 天气状况
 * @returns 景点推荐信息
 */
export async function searchAttraction(city: string, weather: string): Promise<string> {
  const client = tavily({ apiKey: TAVILY_API_KEY });
  const query = `'${city}' 在'${weather}'天气下最值得去的旅游景点推荐及理由`;

  try {
    const response = (await client.search(query, {
      searchDepth: "basic",
      includeAnswer: true,
    })) as TavilyResponse;

    // Tavily 返回的结果已经非常干净，可以直接使用
    if (response.answer) {
      return response.answer;
    }

    // 如果没有综合性回答，则格式化原始结果
    const formattedResults: string[] = [];
    for (const result of response.results ?? []) {
      formattedResults.push(`- ${result.title}: ${result.content}`);
    }

    if (formattedResults.length === 0) {
      return "抱歉，没有找到相关的旅游景点推荐。";
    }

    return `关于'${city}'在'${weather}'天气下最值得去的旅游景点推荐及理由：\n${formattedResults.join("\n")}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return `错误：搜索景点时遇到问题 - ${message}`;
  }
}

