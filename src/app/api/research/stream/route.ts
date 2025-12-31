/**
 * 研究 SSE 流式 API
 * 提供实时研究进度推送
 */

import { NextRequest } from "next/server";
import { researchCoordinator } from "@/services/research";
import type { SearchBackend } from "@/types/research";

/** 验证搜索后端 */
function isValidSearchBackend(value: unknown): value is SearchBackend {
  return (
    typeof value === "string" &&
    ["tavily", "duckduckgo", "serper", "bing"].includes(value)
  );
}

/** 默认搜索后端 */
const DEFAULT_SEARCH_BACKEND: SearchBackend =
  (process.env.DEFAULT_SEARCH_BACKEND as SearchBackend) ?? "tavily";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, searchBackend: rawBackend } = body as {
      topic?: string;
      searchBackend?: unknown;
    };

    // 验证研究主题
    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "请提供研究主题" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 验证搜索后端
    const searchBackend = isValidSearchBackend(rawBackend)
      ? rawBackend
      : DEFAULT_SEARCH_BACKEND;

    console.log(`[Research API] 开始研究: ${topic}, 搜索引擎: ${searchBackend}`);

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
          // 执行研究流程
          await researchCoordinator.execute(
            { topic: topic.trim(), searchBackend },
            (researchEvent) => {
              sendEvent(researchEvent.type, researchEvent.data);
            }
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "研究过程出错";
          console.error(`[Research API] 错误: ${message}`);
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
    console.error(`[Research API] 请求错误: ${message}`);
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
