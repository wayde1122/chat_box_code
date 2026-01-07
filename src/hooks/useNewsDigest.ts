"use client";

import React from "react";
import type {
  DigestState,
  DigestStatus,
  DigestSSEEventType,
  DigestProgressEventData,
} from "@/types/news";

/** 初始状态 */
const initialState: DigestState = {
  topic: "",
  status: "idle",
  progress: 0,
  progressText: "",
  digest: "",
};

/** SSE 事件数据 */
interface SSEMessage {
  event: DigestSSEEventType;
  data: unknown;
}

/** Hook 返回值类型 */
interface UseNewsDigestReturn extends DigestState {
  /** 开始生成日报 */
  generateDigest: (topic: string) => void;
  /** 重置状态 */
  reset: () => void;
  /** 是否正在生成中 */
  isGenerating: boolean;
}

/**
 * 每日热点日报状态管理 Hook
 */
export function useNewsDigest(): UseNewsDigestReturn {
  const [state, setState] = React.useState<DigestState>(initialState);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  /**
   * 开始生成日报
   */
  const generateDigest = React.useCallback((topic: string) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // 重置状态
    setState({
      topic,
      status: "fetching",
      progress: 0,
      progressText: "正在初始化...",
      digest: "",
    });

    // 发起 SSE 请求
    fetch("/api/news/digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("无法获取响应流");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // 解析 SSE 消息
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            try {
              const jsonStr = line.slice(6);
              const message: SSEMessage = JSON.parse(jsonStr);
              handleSSEEvent(message);
            } catch (parseError) {
              console.error("[useNewsDigest] 解析 SSE 消息失败:", parseError);
            }
          }
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("[useNewsDigest] 请求已取消");
          return;
        }

        const message = error instanceof Error ? error.message : "网络错误";
        console.error("[useNewsDigest] 请求错误:", message);
        setState((prev) => ({
          ...prev,
          status: "error",
          error: message,
          progressText: `错误: ${message}`,
        }));
      });
  }, []);

  /**
   * 处理 SSE 事件
   */
  const handleSSEEvent = React.useCallback((message: SSEMessage) => {
    const { event, data } = message;

    switch (event) {
      case "start":
        setState((prev) => ({
          ...prev,
          status: "fetching",
          progressText: "开始生成日报...",
        }));
        break;

      case "progress": {
        const progressData = data as DigestProgressEventData;
        let status: DigestStatus = "fetching";
        if (progressData.stage === "fetching") status = "fetching";
        else if (progressData.stage === "filtering") status = "filtering";
        else if (progressData.stage === "generating") status = "generating";

        setState((prev) => ({
          ...prev,
          status,
          progress: progressData.percentage,
          progressText: progressData.task ?? "",
        }));
        break;
      }

      case "digest":
        setState((prev) => ({
          ...prev,
          status: "generating",
          digest: data as string,
          progress: 95,
          progressText: "日报生成完成",
        }));
        break;

      case "error": {
        const errorData = data as { message: string };
        setState((prev) => ({
          ...prev,
          status: "error",
          error: errorData.message,
          progressText: `错误: ${errorData.message}`,
        }));
        break;
      }

      case "done":
        setState((prev) => ({
          ...prev,
          status: "completed",
          progress: 100,
          progressText: "生成完成",
        }));
        break;

      default:
        console.warn("[useNewsDigest] 未知事件类型:", event);
    }
  }, []);

  /**
   * 重置状态
   */
  const reset = React.useCallback(() => {
    // 取消进行中的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(initialState);
  }, []);

  // 组件卸载时取消请求
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 计算是否正在生成中
  const isGenerating =
    state.status === "fetching" ||
    state.status === "filtering" ||
    state.status === "generating";

  return {
    ...state,
    generateDigest,
    reset,
    isGenerating,
  };
}
