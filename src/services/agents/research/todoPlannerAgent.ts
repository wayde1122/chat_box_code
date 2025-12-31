/**
 * TodoPlanner Agent
 * 负责将研究主题分解为具体的子任务
 */

import { BaseAgent } from "../baseAgent";
import { llmService } from "../../llmService";
import { TODO_PLANNER_SYSTEM_PROMPT } from "./prompts";
import type { TodoPlannerInput, TodoPlannerOutput, TodoItem } from "@/types/research";

/** 默认任务列表 - 当 LLM 解析失败时使用 */
function getDefaultTasks(topic: string): TodoPlannerOutput["tasks"] {
  return [
    {
      id: 1,
      title: "基础概念",
      intent: "了解研究主题的基本定义和核心概念",
      query: `${topic} 定义 概念 是什么`,
    },
    {
      id: 2,
      title: "现状分析",
      intent: "分析当前发展状态和主要特点",
      query: `${topic} 现状 发展 特点`,
    },
    {
      id: 3,
      title: "应用场景",
      intent: "探索实际应用和案例",
      query: `${topic} 应用 案例 实践`,
    },
    {
      id: 4,
      title: "未来趋势",
      intent: "预测未来发展方向",
      query: `${topic} 趋势 未来 发展方向`,
    },
  ];
}

/**
 * 从 LLM 响应中提取 JSON 数组
 */
function extractJsonArray(text: string): unknown[] | null {
  // 尝试直接解析
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // 继续尝试其他方法
  }

  // 尝试提取 JSON 代码块
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // 继续尝试其他方法
    }
  }

  // 尝试查找 JSON 数组
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // 解析失败
    }
  }

  return null;
}

/**
 * 验证任务项是否有效
 */
function isValidTask(task: unknown): task is Omit<TodoItem, "status" | "summary" | "sources"> {
  if (typeof task !== "object" || task === null) return false;
  const t = task as Record<string, unknown>;
  return (
    typeof t.id === "number" &&
    typeof t.title === "string" &&
    typeof t.intent === "string" &&
    typeof t.query === "string"
  );
}

export class TodoPlannerAgent extends BaseAgent<TodoPlannerInput, TodoPlannerOutput> {
  readonly name = "TodoPlannerAgent";
  readonly description = "将研究主题分解为具体的子任务";

  protected async run(input: TodoPlannerInput): Promise<TodoPlannerOutput> {
    const { topic } = input;

    const prompt = `请为以下研究主题生成研究任务列表：

研究主题：${topic}

请返回 JSON 格式的任务列表。`;

    console.log(`[${this.name}] 正在规划任务: ${topic}`);
    const response = await llmService.generate(prompt, TODO_PLANNER_SYSTEM_PROMPT);

    // 尝试解析 LLM 响应
    const jsonArray = extractJsonArray(response);

    if (!jsonArray) {
      console.warn(`[${this.name}] 无法解析 LLM 响应，使用默认任务列表`);
      return { tasks: getDefaultTasks(topic) };
    }

    // 验证并过滤有效任务
    const validTasks = jsonArray.filter(isValidTask);

    if (validTasks.length === 0) {
      console.warn(`[${this.name}] 没有有效任务，使用默认任务列表`);
      return { tasks: getDefaultTasks(topic) };
    }

    // 确保任务数量在 3-5 个之间
    const tasks = validTasks.slice(0, 5);
    if (tasks.length < 3) {
      console.warn(`[${this.name}] 任务数量不足，补充默认任务`);
      const defaultTasks = getDefaultTasks(topic);
      while (tasks.length < 3 && defaultTasks.length > 0) {
        const defaultTask = defaultTasks.shift();
        if (defaultTask && !tasks.some((t) => t.id === defaultTask.id)) {
          tasks.push({ ...defaultTask, id: tasks.length + 1 });
        }
      }
    }

    console.log(`[${this.name}] 生成了 ${tasks.length} 个任务`);
    return { tasks };
  }
}

// 导出单例
export const todoPlannerAgent = new TodoPlannerAgent();
