// 每日热点助手相关类型定义

/** RSS 条目 */
export interface RSSEntry {
  /** 标题 */
  title: string;
  /** 链接 */
  link: string;
  /** 发布日期 */
  pubDate: string;
  /** 摘要 */
  summary: string;
}

/** RSS Feed 响应 */
export interface RSSFeedResponse {
  /** Feed 标题 */
  title: string;
  /** 条目列表 */
  entries: RSSEntry[];
}

/** 文章内容响应 */
export interface ArticleContentResponse {
  /** 标题 */
  title: string;
  /** Markdown 格式内容 */
  content: string;
  /** 原始 URL */
  source: string;
  /** 提取时间 */
  timestamp: string;
}

/** 日报生成状态 */
export type DigestStatus =
  | "idle"
  | "fetching"
  | "filtering"
  | "generating"
  | "completed"
  | "error";

/** SSE 事件类型 */
export type DigestSSEEventType =
  | "start"
  | "progress"
  | "digest"
  | "error"
  | "done";

/** 日报请求参数 */
export interface DigestRequest {
  /** 用户输入的话题 */
  topic: string;
  /** RSS 源 URL 列表（可选，使用默认源） */
  feedUrls?: string[];
}

/** 日报状态 */
export interface DigestState {
  /** 用户话题 */
  topic: string;
  /** 当前状态 */
  status: DigestStatus;
  /** 进度百分比 0-100 */
  progress: number;
  /** 进度文本描述 */
  progressText: string;
  /** 最终日报内容 */
  digest: string;
  /** 错误信息 */
  error?: string;
}

/** SSE 进度事件数据 */
export interface DigestProgressEventData {
  /** 当前阶段 */
  stage: "fetching" | "filtering" | "generating";
  /** 进度百分比 */
  percentage: number;
  /** 当前任务描述 */
  task?: string;
  /** 已获取的条目数 */
  fetchedCount?: number;
}

/** SSE 事件 */
export interface DigestSSEEvent {
  /** 事件类型 */
  event: DigestSSEEventType;
  /** 事件数据 */
  data: unknown;
}

/** DigestAgent 输入 */
export interface DigestAgentInput {
  /** 用户话题 */
  topic: string;
  /** 热点新闻 Markdown 内容 */
  hotNewsMarkdown: string;
}

/** DigestAgent 输出 */
export interface DigestAgentOutput {
  /** 生成的日报 Markdown */
  digest: string;
}

/** 预设 RSS 源 */
export interface RSSSource {
  /** 源名称 */
  name: string;
  /** 源 URL */
  url: string;
  /** 源类别 */
  category: "news" | "paper" | "opensource" | "general";
}
