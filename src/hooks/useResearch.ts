"use client";

import React from "react";
import type {
  ResearchState,
  TodoItem,
  SearchBackend,
  ProgressEventData,
  TaskCompleteEventData,
  SSEEventType,
} from "@/types/research";

/** 初始状态 */
const initialState: ResearchState = {
  topic: "",
  status: "idle",
  progress: 0,
  progressText: "",
  todoList: [],
  report: "",
};

/** SSE 事件数据 */
interface SSEMessage {
  event: SSEEventType;
  data: unknown;
}

/** Hook 返回值类型 */
interface UseResearchReturn extends ResearchState {
  /** 开始研究 */
  startResearch: (topic: string, searchBackend: SearchBackend) => void;
  /** 重置状态 */
  reset: () => void;
  /** 是否正在研究中 */
  isResearching: boolean;
}

/**
 * 研究状态管理 Hook
 */
export function useResearch(): UseResearchReturn {
  const [state, setState] = React.useState<ResearchState>(initialState);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  /**
   * 开始研究
   */
  const startResearch = React.useCallback(
    (topic: string, searchBackend: SearchBackend) => {
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
        status: "planning",
        progress: 0,
        progressText: "正在初始化研究...",
        todoList: [],
        report: "",
      });

      // 发起 SSE 请求
      fetch("/api/research/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, searchBackend }),
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
                console.error("[useResearch] 解析 SSE 消息失败:", parseError);
              }
            }
          }
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            console.log("[useResearch] 请求已取消");
            return;
          }

          const message = error instanceof Error ? error.message : "网络错误";
          console.error("[useResearch] 请求错误:", message);
          setState((prev) => ({
            ...prev,
            status: "error",
            error: message,
            progressText: `错误: ${message}`,
          }));
        });
    },
    []
  );

  /**
   * 处理 SSE 事件
   */
  const handleSSEEvent = React.useCallback((message: SSEMessage) => {
    const { event, data } = message;

    switch (event) {
      case "start":
        setState((prev) => ({
          ...prev,
          status: "planning",
          progressText: "研究开始...",
        }));
        break;

      case "plan":
        setState((prev) => ({
          ...prev,
          status: "executing",
          todoList: data as TodoItem[],
          progress: 10,
          progressText: "任务规划完成，开始执行...",
        }));
        break;

      case "progress": {
        const progressData = data as ProgressEventData;
        setState((prev) => {
          let status = prev.status;
          if (progressData.stage === "planning") status = "planning";
          else if (progressData.stage === "executing") status = "executing";
          else if (progressData.stage === "reporting") status = "reporting";

          // 更新对应任务的状态
          let updatedTodoList = prev.todoList;
          if (progressData.taskId !== undefined) {
            updatedTodoList = prev.todoList.map((task) => {
              if (task.id === progressData.taskId) {
                const statusText = progressData.task ?? "";
                if (statusText.includes("搜索")) {
                  return { ...task, status: "searching" as const };
                }
                if (statusText.includes("总结")) {
                  return { ...task, status: "summarizing" as const };
                }
              }
              return task;
            });
          }

          return {
            ...prev,
            status,
            todoList: updatedTodoList,
            progress: progressData.percentage,
            progressText: progressData.task ?? "",
          };
        });
        break;
      }

      case "task_complete": {
        const taskData = data as TaskCompleteEventData & { status?: string };
        setState((prev) => ({
          ...prev,
          todoList: prev.todoList.map((task) =>
            task.id === taskData.taskId
              ? {
                  ...task,
                  status:
                    taskData.status === "error"
                      ? ("error" as const)
                      : ("completed" as const),
                  summary: taskData.summary,
                  sources: taskData.sources,
                }
              : task
          ),
        }));
        break;
      }

      case "report":
        setState((prev) => ({
          ...prev,
          status: "reporting",
          report: data as string,
          progress: 95,
          progressText: "报告生成完成",
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
          progressText: "研究完成",
        }));
        break;

      default:
        console.warn("[useResearch] 未知事件类型:", event);
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

  // 计算是否正在研究中
  const isResearching =
    state.status === "planning" ||
    state.status === "executing" ||
    state.status === "reporting";

  return {
    ...state,
    startResearch,
    reset,
    isResearching,
  };
}
