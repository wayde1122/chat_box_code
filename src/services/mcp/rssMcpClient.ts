/**
 * RSS Reader MCP 客户端
 * 通过 SSE 协议调用 RSS Reader 服务
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type {
  RSSEntry,
  RSSFeedResponse,
  ArticleContentResponse,
} from "@/types/news";

/** MCP 服务配置 */
const RSS_MCP_URL =
  process.env.RSS_MCP_URL ??
  "https://mcp.api-inference.modelscope.net/a03addbe55174d/sse";

/** MCP 工具调用结果 */
interface McpToolResult {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

/**
 * RSS Reader MCP 客户端类
 * 使用 SSE 协议与 RSS Reader 服务通信
 */
class RSSMCPClient {
  private client: Client | null = null;
  private transport: SSEClientTransport | null = null;
  private connecting: Promise<void> | null = null;
  private connected = false;

  /**
   * 连接到 MCP 服务
   */
  async connect(): Promise<void> {
    if (this.connected && this.client) {
      return;
    }

    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = this.doConnect();
    return this.connecting;
  }

  private async doConnect(): Promise<void> {
    try {
      console.log("[RSSMCPClient] 正在连接 MCP 服务...");

      // 创建 SSE 传输
      this.transport = new SSEClientTransport(new URL(RSS_MCP_URL));

      // 创建客户端
      this.client = new Client(
        { name: "news-digest", version: "1.0.0" },
        { capabilities: {} }
      );

      // 连接
      await this.client.connect(this.transport);
      this.connected = true;
      console.log("[RSSMCPClient] MCP 服务连接成功");

      // 列出可用工具（调试用）
      try {
        const tools = await this.client.listTools();
        console.log("[RSSMCPClient] 可用工具列表:");
        for (const tool of tools.tools) {
          console.log(`  - ${tool.name}:`);
          console.log(`    描述: ${tool.description}`);
          console.log(
            `    参数 schema:`,
            JSON.stringify(tool.inputSchema, null, 2)
          );
        }
      } catch (e) {
        console.log("[RSSMCPClient] 无法列出工具:", e);
      }
    } catch (error) {
      this.connected = false;
      const message = error instanceof Error ? error.message : "未知错误";
      console.error("[RSSMCPClient] 连接失败:", message);
      throw new Error(`MCP 服务连接失败: ${message}`);
    } finally {
      this.connecting = null;
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
    this.connected = false;
  }

  /**
   * 强制重新连接
   */
  private async reconnect(): Promise<void> {
    console.log("[RSSMCPClient] 正在重新连接...");
    await this.disconnect();
    await this.connect();
  }

  /**
   * 调用 MCP 工具（带自动重连）
   */
  private async callTool<T>(
    name: string,
    args: Record<string, unknown>,
    retryCount = 0
  ): Promise<T> {
    await this.connect();

    if (!this.client) {
      throw new Error("MCP 客户端未初始化");
    }

    try {
      console.log(`[RSSMCPClient] 调用工具 ${name}:`, args);

      const result = (await this.client.callTool({
        name,
        arguments: args,
      })) as McpToolResult;

      // 解析返回内容
      if (result.content && Array.isArray(result.content)) {
        const textContent = result.content.find(
          (c): c is { type: "text"; text: string } => c.type === "text"
        );
        if (textContent?.text) {
          try {
            const parsed = JSON.parse(textContent.text) as T;
            console.log(`[RSSMCPClient] 工具 ${name} 返回成功`);
            return parsed;
          } catch {
            // 如果不是 JSON，尝试解析为 RSS 格式的对象
            console.log(
              `[RSSMCPClient] 工具 ${name} 返回非 JSON 内容，尝试解析`
            );
            // 返回空结构，让调用方处理
            return { title: "Unknown", entries: [] } as unknown as T;
          }
        }
      }

      throw new Error("无效的响应格式");
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      console.error(`[RSSMCPClient] 调用工具 ${name} 失败: ${message}`);

      // 如果是连接相关错误，尝试重连一次
      if (
        retryCount < 1 &&
        (message.includes("Invalid request") ||
          message.includes("timeout") ||
          message.includes("连接"))
      ) {
        console.log(`[RSSMCPClient] 尝试重连后重试...`);
        this.connected = false; // 标记为断开
        await this.reconnect();
        return this.callTool<T>(name, args, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * 获取 RSS Feed 条目
   * @param url RSS feed URL
   * @param limit 最大条目数（默认 10，最大 100）
   */
  async fetchFeedEntries(url: string, limit = 10): Promise<RSSFeedResponse> {
    try {
      // 确保 limit 是整数类型，符合 MCP schema 要求
      const safeLimit = Math.floor(Math.min(limit, 100));
      const result = await this.callTool<RSSFeedResponse>(
        "fetch_feed_entries",
        {
          url,
          limit: safeLimit,
        }
      );

      // 验证结果格式
      if (!result || typeof result !== "object") {
        console.warn(`[RSSMCPClient] Feed ${url} 返回无效格式`);
        return { title: "Unknown Feed", entries: [] };
      }

      // 确保 entries 是数组
      const entries = Array.isArray(result.entries) ? result.entries : [];

      return {
        title: result.title ?? "Unknown Feed",
        entries: entries.map((entry) => ({
          title: entry?.title ?? "",
          link: entry?.link ?? "",
          pubDate: entry?.pubDate ?? "",
          summary: entry?.summary ?? "",
        })),
      };
    } catch (error) {
      console.error("[RSSMCPClient] 获取 Feed 失败:", error);
      return { title: "Error", entries: [] };
    }
  }

  /**
   * 获取文章完整内容
   * @param url 文章 URL
   */
  async fetchArticleContent(
    url: string
  ): Promise<ArticleContentResponse | null> {
    try {
      const result = await this.callTool<ArticleContentResponse>(
        "fetch_article_content",
        { url }
      );

      return {
        title: result.title ?? "",
        content: result.content ?? "",
        source: result.source ?? url,
        timestamp: result.timestamp ?? new Date().toISOString(),
      };
    } catch (error) {
      console.error("[RSSMCPClient] 获取文章内容失败:", error);
      return null;
    }
  }

  /**
   * 列出可用的 RSS 源
   */
  async listFeeds(): Promise<string[]> {
    try {
      const result = await this.callTool<{ feeds: string[] }>("list_feeds", {});
      return result.feeds ?? [];
    } catch (error) {
      console.error("[RSSMCPClient] 列出 Feed 失败:", error);
      return [];
    }
  }

  /**
   * 搜索 RSS 源
   * @param keyword 搜索关键词
   */
  async searchFeeds(keyword: string): Promise<string[]> {
    try {
      const result = await this.callTool<{ feeds: string[] }>("search_feeds", {
        keyword,
      });
      return result.feeds ?? [];
    } catch (error) {
      console.error("[RSSMCPClient] 搜索 Feed 失败:", error);
      return [];
    }
  }

  /**
   * 批量获取多个 RSS 源的条目
   * @param urls RSS feed URL 列表
   * @param limitPerFeed 每个 feed 的最大条目数
   */
  async fetchMultipleFeeds(
    urls: string[],
    limitPerFeed = 10
  ): Promise<RSSEntry[]> {
    const allEntries: RSSEntry[] = [];

    // 使用 Promise.allSettled 并行获取所有源
    const results = await Promise.allSettled(
      urls.map((url) => this.fetchFeedEntries(url, limitPerFeed))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        allEntries.push(...result.value.entries);
      }
    }

    // 按发布日期排序（最新在前）
    allEntries.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });

    return allEntries;
  }

  /**
   * 批量获取多个 RSS 源的条目（支持每个源自定义 limit）
   * @param sources RSS 源配置列表
   */
  async fetchMultipleFeedsWithLimits(
    sources: Array<{ url: string; limit: number }>
  ): Promise<RSSEntry[]> {
    const allEntries: RSSEntry[] = [];

    // 使用 Promise.allSettled 并行获取所有源
    const results = await Promise.allSettled(
      sources.map((source) => this.fetchFeedEntries(source.url, source.limit))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        allEntries.push(...result.value.entries);
      }
    }

    // 按发布日期排序（最新在前）
    allEntries.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });

    return allEntries;
  }
}

// 导出单例实例
export const rssMcpClient = new RSSMCPClient();
export { RSSMCPClient };
