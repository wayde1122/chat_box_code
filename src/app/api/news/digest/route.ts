/**
 * 每日热点日报 SSE 流式 API
 * 提供实时日报生成进度推送
 * 
 * 使用 Google News Trends MCP 获取新闻
 */

import { NextRequest } from "next/server";
import { newsCoordinator } from "@/services/news";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, feedUrls } = body as {
      topic?: string;
      feedUrls?: string[];
    };

    // 验证话题
    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "请提供话题关键词" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[News API] 开始生成日报: ${topic}`);

    // 创建 SSE 流
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        /**
         * 发送 SSE 事件
         */
        const sendEvent = (event: string, data: unknown) => {
          const payload = JSON.stringify({ event, data });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        };

        try {
          // 执行日报生成流程
          await newsCoordinator.execute(
            { topic: topic.trim(), feedUrls },
            (newsEvent) => {
              sendEvent(newsEvent.type, newsEvent.data);
            }
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "生成过程出错";
          console.error(`[News API] 错误: ${message}`);
          sendEvent("error", { message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // 禁用 nginx 缓冲
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "请求处理失败";
    console.error(`[News API] 请求错误: ${message}`);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// 不支持 GET 请求
export async function GET() {
  return new Response(
    JSON.stringify({ error: "请使用 POST 请求" }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    }
  );
}
