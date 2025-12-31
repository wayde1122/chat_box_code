// 深度研究助手相关类型定义

/** 搜索后端类型 */
export type SearchBackend = "tavily" | "duckduckgo" | "serper" | "bing";

/** 任务状态 */
export type TodoStatus =
  | "pending"
  | "searching"
  | "summarizing"
  | "completed"
  | "error";

/** 研究状态 */
export type ResearchStatus =
  | "idle"
  | "planning"
  | "executing"
  | "reporting"
  | "completed"
  | "error";

/** SSE 事件类型 */
export type SSEEventType =
  | "start"
  | "plan"
  | "progress"
  | "task_complete"
  | "report"
  | "error"
  | "done";

/** 搜索来源 */
export interface SourceItem {
  /** 来源标题 */
  title: string;
  /** 来源URL */
  url: string;
  /** 摘要片段 */
  snippet: string;
}

/** 研究任务项 */
export interface TodoItem {
  /** 任务ID */
  id: number;
  /** 任务标题 */
  title: string;
  /** 任务意图说明 */
  intent: string;
  /** 搜索查询词 */
  query: string;
  /** 任务状态 */
  status: TodoStatus;
  /** 任务总结 */
  summary?: string;
  /** 搜索来源 */
  sources?: SourceItem[];
}

/** 研究请求参数 */
export interface ResearchRequest {
  /** 研究主题 */
  topic: string;
  /** 搜索后端 */
  searchBackend: SearchBackend;
}

/** 研究状态 */
export interface ResearchState {
  /** 研究主题 */
  topic: string;
  /** 当前状态 */
  status: ResearchStatus;
  /** 进度百分比 0-100 */
  progress: number;
  /** 进度文本描述 */
  progressText: string;
  /** 任务列表 */
  todoList: TodoItem[];
  /** 最终报告 */
  report: string;
  /** 错误信息 */
  error?: string;
}

/** SSE 进度事件数据 */
export interface ProgressEventData {
  /** 当前阶段 */
  stage: "planning" | "executing" | "reporting";
  /** 进度百分比 */
  percentage: number;
  /** 当前任务标题 */
  task?: string;
  /** 任务ID */
  taskId?: number;
}

/** SSE 任务完成事件数据 */
export interface TaskCompleteEventData {
  /** 任务ID */
  taskId: number;
  /** 任务总结 */
  summary: string;
  /** 搜索来源 */
  sources: SourceItem[];
}

/** SSE 事件 */
export interface SSEEvent {
  /** 事件类型 */
  event: SSEEventType;
  /** 事件数据 */
  data: unknown;
}

/** TodoPlanner Agent 输入 */
export interface TodoPlannerInput {
  /** 研究主题 */
  topic: string;
}

/** TodoPlanner Agent 输出 */
export interface TodoPlannerOutput {
  /** 生成的任务列表 */
  tasks: Omit<TodoItem, "status" | "summary" | "sources">[];
}

/** TaskSummarizer Agent 输入 */
export interface TaskSummarizerInput {
  /** 任务信息 */
  task: TodoItem;
  /** 搜索结果 */
  searchResults: SourceItem[];
}

/** TaskSummarizer Agent 输出 */
export interface TaskSummarizerOutput {
  /** 任务总结 */
  summary: string;
}

/** ReportWriter Agent 输入 */
export interface ReportWriterInput {
  /** 研究主题 */
  topic: string;
  /** 所有任务及其总结 */
  tasks: TodoItem[];
}

/** ReportWriter Agent 输出 */
export interface ReportWriterOutput {
  /** 最终报告 */
  report: string;
}
