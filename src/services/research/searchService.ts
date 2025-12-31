/**
 * 搜索服务
 * 支持多搜索引擎切换，统一返回格式
 */

import type { SearchBackend, SourceItem } from "@/types/research";

/** Tavily API 响应格式 */
interface TavilyResponse {
  results: Array<{
    title: string;
    url: string;
    content: string;
  }>;
}

/** Serper API 响应格式 */
interface SerperResponse {
  organic: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
}

/** DuckDuckGo API 响应格式 */
interface DuckDuckGoResponse {
  RelatedTopics: Array<{
    Text?: string;
    FirstURL?: string;
  }>;
  AbstractText?: string;
  AbstractURL?: string;
}

/** Bing API 响应格式 */
interface BingResponse {
  webPages?: {
    value: Array<{
      name: string;
      url: string;
      snippet: string;
    }>;
  };
}

/**
 * 搜索服务类
 */
class SearchService {
  /**
   * 执行搜索
   * @param query 搜索查询词
   * @param backend 搜索引擎
   * @returns 搜索结果列表
   */
  async search(query: string, backend: SearchBackend): Promise<SourceItem[]> {
    console.log(`[SearchService] 使用 ${backend} 搜索: ${query}`);

    try {
      switch (backend) {
        case "tavily":
          return await this.searchTavily(query);
        case "serper":
          return await this.searchSerper(query);
        case "duckduckgo":
          return await this.searchDuckDuckGo(query);
        case "bing":
          return await this.searchBing(query);
        default:
          console.warn(`[SearchService] 不支持的搜索引擎: ${backend}，使用 Tavily`);
          return await this.searchTavily(query);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "搜索失败";
      console.error(`[SearchService] 搜索错误: ${message}`);
      return [];
    }
  }

  /**
   * 使用 Tavily API 搜索
   */
  private async searchTavily(query: string): Promise<SourceItem[]> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      console.error("[SearchService] 未配置 TAVILY_API_KEY");
      return this.getMockResults(query);
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API 错误: ${response.status}`);
    }

    const data: TavilyResponse = await response.json();

    return data.results.map((item) => ({
      title: item.title,
      url: item.url,
      snippet: item.content,
    }));
  }

  /**
   * 使用 Serper API 搜索
   */
  private async searchSerper(query: string): Promise<SourceItem[]> {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      console.error("[SearchService] 未配置 SERPER_API_KEY");
      return this.getMockResults(query);
    }

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        q: query,
        gl: "cn",
        hl: "zh-cn",
        num: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API 错误: ${response.status}`);
    }

    const data: SerperResponse = await response.json();

    return (data.organic ?? []).map((item) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    }));
  }

  /**
   * 使用 DuckDuckGo API 搜索
   */
  private async searchDuckDuckGo(query: string): Promise<SourceItem[]> {
    // DuckDuckGo Instant Answer API (免费但功能有限)
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1`
    );

    if (!response.ok) {
      throw new Error(`DuckDuckGo API 错误: ${response.status}`);
    }

    const data: DuckDuckGoResponse = await response.json();
    const results: SourceItem[] = [];

    // 提取摘要信息
    if (data.AbstractText && data.AbstractURL) {
      results.push({
        title: query,
        url: data.AbstractURL,
        snippet: data.AbstractText,
      });
    }

    // 提取相关主题
    for (const topic of data.RelatedTopics ?? []) {
      if (topic.Text && topic.FirstURL) {
        results.push({
          title: topic.Text.split(" - ")[0] ?? topic.Text,
          url: topic.FirstURL,
          snippet: topic.Text,
        });
      }
      if (results.length >= 5) break;
    }

    // DuckDuckGo 结果较少时，返回模拟结果
    if (results.length === 0) {
      return this.getMockResults(query);
    }

    return results;
  }

  /**
   * 使用 Bing API 搜索
   */
  private async searchBing(query: string): Promise<SourceItem[]> {
    const apiKey = process.env.BING_SEARCH_KEY;
    if (!apiKey) {
      console.error("[SearchService] 未配置 BING_SEARCH_KEY");
      return this.getMockResults(query);
    }

    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.bing.microsoft.com/v7.0/search?q=${encodedQuery}&count=5&mkt=zh-CN`,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Bing API 错误: ${response.status}`);
    }

    const data: BingResponse = await response.json();

    return (data.webPages?.value ?? []).map((item) => ({
      title: item.name,
      url: item.url,
      snippet: item.snippet,
    }));
  }

  /**
   * 获取模拟搜索结果 - 用于开发和测试
   */
  private getMockResults(query: string): SourceItem[] {
    console.warn("[SearchService] 使用模拟搜索结果");
    return [
      {
        title: `关于「${query}」的搜索结果 1`,
        url: "https://example.com/result-1",
        snippet: `这是关于「${query}」的第一条搜索结果摘要。包含相关信息和背景介绍，帮助理解这个主题的基本概念。`,
      },
      {
        title: `${query} - 维基百科`,
        url: "https://zh.wikipedia.org/wiki/example",
        snippet: `${query}是一个重要的研究领域。本文介绍了其发展历程、主要特点和应用场景。`,
      },
      {
        title: `深入理解${query}`,
        url: "https://example.com/deep-dive",
        snippet: `本文深入分析了${query}的技术细节和实现原理，适合有一定基础的读者阅读。`,
      },
      {
        title: `${query}的最新进展`,
        url: "https://example.com/latest",
        snippet: `2024年${query}领域取得了重大突破，本文汇总了最新的研究成果和行业动态。`,
      },
      {
        title: `${query}实践指南`,
        url: "https://example.com/guide",
        snippet: `这是一份关于${query}的实践指南，包含具体的操作步骤和最佳实践建议。`,
      },
    ];
  }
}

// 导出单例
export const searchService = new SearchService();
export { SearchService };
