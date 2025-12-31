/**
 * 研究协调器
 * 协调三个 Agent 执行完整的研究流程
 */

import {
  todoPlannerAgent,
  taskSummarizerAgent,
  reportWriterAgent,
} from "../agents/research";
import { searchService } from "./searchService";
import type {
  SearchBackend,
  TodoItem,
  SourceItem,
  ResearchRequest,
} from "@/types/research";

/** 研究事件类型 */
export type ResearchEventType =
  | "start"
  | "plan"
  | "progress"
  | "task_complete"
  | "report"
  | "error"
  | "done";

/** 研究事件数据 */
export interface ResearchEvent {
  type: ResearchEventType;
  data: unknown;
}

/** 事件回调类型 */
export type ResearchEventCallback = (event: ResearchEvent) => void;

/**
 * 研究协调器类
 */
class ResearchCoordinator {
  /**
   * 执行研究流程
   * @param request 研究请求
   * @param onEvent 事件回调
   */
  async execute(
    request: ResearchRequest,
    onEvent: ResearchEventCallback
  ): Promise<void> {
    const { topic, searchBackend } = request;

    try {
      // 发送开始事件
      onEvent({
        type: "start",
        data: { topic, searchBackend },
      });

      // 阶段 1: 规划任务
      onEvent({
        type: "progress",
        data: { stage: "planning", percentage: 5, task: "正在分析研究主题..." },
      });

      const planResult = await todoPlannerAgent.execute({ topic });

      if (!planResult.success || !planResult.data) {
        throw new Error(planResult.error ?? "任务规划失败");
      }

      // 初始化任务列表
      const todoList: TodoItem[] = planResult.data.tasks.map((task) => ({
        ...task,
        status: "pending" as const,
      }));

      onEvent({
        type: "plan",
        data: todoList,
      });

      // 阶段 2: 执行每个任务
      const totalTasks = todoList.length;
      const summaries: Map<number, string> = new Map();

      for (let i = 0; i < todoList.length; i++) {
        const task = todoList[i];
        const progressBase = 10 + (i / totalTasks) * 70; // 10% - 80%

        // 更新任务状态为搜索中
        task.status = "searching";
        onEvent({
          type: "progress",
          data: {
            stage: "executing",
            percentage: Math.round(progressBase),
            task: `正在搜索: ${task.title}`,
            taskId: task.id,
          },
        });

        // 执行搜索
        let sources: SourceItem[] = [];
        try {
          sources = await searchService.search(task.query, searchBackend);
          // URL 去重
          const seenUrls = new Set<string>();
          sources = sources.filter((source) => {
            if (seenUrls.has(source.url)) return false;
            seenUrls.add(source.url);
            return true;
          });
        } catch (error) {
          console.error(`[ResearchCoordinator] 搜索失败: ${error}`);
          // 继续执行，使用空结果
        }

        task.sources = sources;

        // 更新任务状态为总结中
        task.status = "summarizing";
        onEvent({
          type: "progress",
          data: {
            stage: "executing",
            percentage: Math.round(progressBase + 35 / totalTasks),
            task: `正在总结: ${task.title}`,
            taskId: task.id,
          },
        });

        // 执行总结
        try {
          const summarizeResult = await taskSummarizerAgent.execute({
            task,
            searchResults: sources,
          });

          if (summarizeResult.success && summarizeResult.data) {
            task.summary = summarizeResult.data.summary;
            task.status = "completed";
            summaries.set(task.id, task.summary);
          } else {
            task.status = "error";
            task.summary = "总结生成失败";
          }
        } catch (error) {
          console.error(`[ResearchCoordinator] 总结失败: ${error}`);
          task.status = "error";
          task.summary = "总结生成失败";
        }

        // 发送任务完成事件
        onEvent({
          type: "task_complete",
          data: {
            taskId: task.id,
            summary: task.summary,
            sources: task.sources,
            status: task.status,
          },
        });
      }

      // 阶段 3: 生成报告
      onEvent({
        type: "progress",
        data: {
          stage: "reporting",
          percentage: 85,
          task: "正在生成研究报告...",
        },
      });

      const completedTasks = todoList.filter(
        (task) => task.status === "completed"
      );

      let report = "";
      if (completedTasks.length > 0) {
        const reportResult = await reportWriterAgent.execute({
          topic,
          tasks: todoList,
        });

        if (reportResult.success && reportResult.data) {
          report = reportResult.data.report;
        } else {
          report = this.generateFallbackReport(topic, todoList);
        }
      } else {
        report = this.generateFallbackReport(topic, todoList);
      }

      onEvent({
        type: "progress",
        data: { stage: "reporting", percentage: 95, task: "报告生成完成" },
      });

      // 发送报告
      onEvent({
        type: "report",
        data: report,
      });

      // 发送完成事件
      onEvent({
        type: "done",
        data: {
          topic,
          tasksCompleted: completedTasks.length,
          totalTasks,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "研究过程出错";
      console.error(`[ResearchCoordinator] 错误: ${message}`);
      onEvent({
        type: "error",
        data: { message },
      });
    }
  }

  /**
   * 生成后备报告 - 当正常报告生成失败时使用
   */
  private generateFallbackReport(topic: string, tasks: TodoItem[]): string {
    const completedTasks = tasks.filter(
      (task) => task.status === "completed" && task.summary
    );

    let content = `# ${topic} 研究报告\n\n`;
    content += `## 摘要\n\n`;
    content += `本报告基于 ${completedTasks.length} 个子任务的研究结果生成。\n\n`;

    if (completedTasks.length > 0) {
      content += `## 研究发现\n\n`;
      for (const task of completedTasks) {
        content += `### ${task.title}\n\n`;
        content += `${task.summary}\n\n`;
      }
    } else {
      content += `## 说明\n\n`;
      content += `由于所有研究任务未能成功完成，无法生成详细报告。\n\n`;
      content += `建议：\n`;
      content += `1. 检查网络连接\n`;
      content += `2. 尝试更换搜索引擎\n`;
      content += `3. 调整研究主题\n\n`;
    }

    content += `---\n*本报告由 AI 研究助手自动生成*`;

    return content;
  }
}

// 导出单例
export const researchCoordinator = new ResearchCoordinator();
export { ResearchCoordinator };
