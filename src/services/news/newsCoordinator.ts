/**
 * 新闻协调器
 * 协调热点新闻获取和日报生成流程
 * 
 * 使用 Google News RSS 获取国际新闻（纯 TypeScript 实现）
 */

import { googleNewsService } from "./googleNewsService";
import { digestWriterAgent } from "../agents/news";
import type { DigestRequest } from "@/types/news";

/** 新闻事件类型 */
export type NewsEventType = "start" | "progress" | "digest" | "error" | "done";

/** 新闻事件数据 */
export interface NewsEvent {
  type: NewsEventType;
  data: unknown;
}

/** 事件回调类型 */
export type NewsEventCallback = (event: NewsEvent) => void;

/**
 * 新闻协调器类
 */
class NewsCoordinator {
  /**
   * 执行日报生成流程
   * @param request 日报请求
   * @param onEvent 事件回调
   */
  async execute(
    request: DigestRequest,
    onEvent: NewsEventCallback
  ): Promise<void> {
    const { topic } = request;

    try {
      // 发送开始事件
      onEvent({
        type: "start",
        data: { topic },
      });

      // 阶段 1: 获取新闻
      onEvent({
        type: "progress",
        data: {
          stage: "fetching",
          percentage: 5,
          task: "正在连接 Google News 服务...",
        },
      });

      let newsMarkdown = "";
      let dataSourceFailed = false;

      try {
        onEvent({
          type: "progress",
          data: {
            stage: "fetching",
            percentage: 15,
            task: `正在根据话题「${topic}」获取相关新闻...`,
          },
        });

        // 使用 Google News RSS 服务
        newsMarkdown = await googleNewsService.getNewsByUserTopic(topic);

        // 调试：打印获取到的内容长度
        console.log(
          `[NewsCoordinator] 新闻数据获取成功，内容长度: ${
            newsMarkdown?.length ?? 0
          }`
        );
        if (newsMarkdown) {
          console.log(
            `[NewsCoordinator] 内容预览:\n${newsMarkdown.substring(0, 800)}...`
          );
        }

        onEvent({
          type: "progress",
          data: {
            stage: "fetching",
            percentage: 50,
            task: "新闻数据获取完成",
          },
        });
      } catch (error) {
        console.error("[NewsCoordinator] Google News 获取失败:", error);
        dataSourceFailed = true;
        newsMarkdown = this.getMockNews(topic);
      }

      // 如果是模拟数据，在内容中标注
      if (dataSourceFailed) {
        newsMarkdown = `⚠️ 注意：以下为模拟数据，Google News 服务连接失败\n\n${newsMarkdown}`;
      }

      // 阶段 2: 生成日报
      onEvent({
        type: "progress",
        data: {
          stage: "generating",
          percentage: 60,
          task: "正在生成日报...",
        },
      });

      const digestResult = await digestWriterAgent.execute({
        topic,
        hotNewsMarkdown: newsMarkdown,
      });

      if (!digestResult.success || !digestResult.data) {
        throw new Error(digestResult.error ?? "日报生成失败");
      }

      onEvent({
        type: "progress",
        data: {
          stage: "generating",
          percentage: 95,
          task: "日报生成完成",
        },
      });

      // 发送日报
      onEvent({
        type: "digest",
        data: digestResult.data.digest,
      });

      // 发送完成事件
      onEvent({
        type: "done",
        data: { topic },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "生成过程出错";
      console.error(`[NewsCoordinator] 错误: ${message}`);
      onEvent({
        type: "error",
        data: { message },
      });
    }
  }

  /**
   * 获取模拟新闻数据（当 MCP 不可用时使用）
   */
  private getMockNews(topic: string): string {
    return `# News Headlines

## Top Stories

1. [Latest developments in ${topic} industry](https://news.google.com) - Trending
2. [Experts analyze ${topic} trends](https://news.google.com) - Hot
3. [${topic} related news makes headlines](https://news.google.com) - Popular

## Technology

1. [Breaking: ${topic} innovation announced](https://news.google.com)
2. [Industry leaders discuss ${topic} future](https://news.google.com)
3. [New research on ${topic} published](https://news.google.com)

## Business

1. [${topic} market analysis report](https://news.google.com)
2. [Investment opportunities in ${topic}](https://news.google.com)
3. [${topic} sector growth predictions](https://news.google.com)

---
*Mock data - Google News MCP service unavailable*`;
  }
}

// 导出单例
export const newsCoordinator = new NewsCoordinator();
export { NewsCoordinator };
