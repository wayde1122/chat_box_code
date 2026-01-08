# 📰 每日热点助手 - 完整文档

> AI 驱动的每日热点日报生成系统，基于 Google News RSS 获取国际新闻，自动筛选整合，生成结构化日报。

---

## 📖 目录

- [功能概览](#-功能概览)
- [系统架构](#-系统架构)
- [Agent 设计](#-agent-设计)
- [API 接口](#-api-接口)
- [组件说明](#-组件说明)
- [数据类型](#-数据类型)
- [配置说明](#-配置说明)
- [使用指南](#-使用指南)

---

## ✨ 功能概览

### 核心功能

| 功能 | 描述 | 状态 |
|------|------|------|
| 🔍 **话题搜索** | 根据用户输入的话题关键词获取相关新闻 | ✅ 已完成 |
| 📡 **多源聚合** | 从 Google News RSS 获取多分类新闻 | ✅ 已完成 |
| 🤖 **智能筛选** | AI 自动筛选与话题高度相关的内容 | ✅ 已完成 |
| 📝 **日报生成** | 生成结构化的 Markdown 格式日报 | ✅ 已完成 |
| 📋 **复制下载** | 支持复制到剪贴板和下载 Markdown 文件 | ✅ 已完成 |
| 🔄 **实时进度** | SSE 流式推送生成进度 | ✅ 已完成 |

### 技术亮点

- **纯 TypeScript 实现** - 无需外部 MCP 服务器依赖
- **Google News RSS** - 直接解析 RSS 获取国际新闻
- **智能话题匹配** - 自动将用户话题映射到新闻分类
- **SSE 流式响应** - 实时推送生成进度，提升用户体验
- **Markdown 渲染** - 内置轻量级 Markdown 渲染器

---

## 🏗️ 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           用户界面层                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  DigestForm  │  │  ProgressBar │  │  DigestPanel │              │
│  │  (表单输入)   │  │  (进度展示)   │  │  (日报展示)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           Hooks 层                                   │
│                    useNewsDigest (状态管理)                          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           API 路由层                                 │
│                   /api/news/digest (SSE 流式接口)                    │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         协调器层                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    NewsCoordinator                          │   │
│  │                    (新闻协调器)                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│           ┌────────────────────┼────────────────────┐              │
│           ▼                                         ▼              │
│  ┌─────────────────┐                     ┌─────────────────┐       │
│  │GoogleNewsService│                     │DigestWriterAgent│       │
│  │  (新闻获取)      │                     │  (日报生成)      │       │
│  └─────────────────┘                     └─────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          外部服务层                                  │
│  ┌──────────────────┐              ┌──────────────────┐            │
│  │  Google News RSS │              │    LLM 服务       │            │
│  │   (新闻数据源)    │              │   (智能生成)      │            │
│  └──────────────────┘              └──────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

### 数据流

```
用户输入话题 → DigestForm → /api/news/digest
                                   │
                                   ▼
                    ┌─────────────────────────┐
                    │    NewsCoordinator      │
                    │      (协调器)            │
                    └─────────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                        ▼
     ┌─────────────────┐                    ┌─────────────────┐
     │阶段1: 获取新闻   │                    │阶段2: 生成日报   │
     │GoogleNewsService│        ──→         │DigestWriterAgent│
     └─────────────────┘                    └─────────────────┘
              │                                        │
              ▼                                        ▼
       Google News RSS                           LLM 服务
      (话题/关键词搜索)                        (筛选 + 生成)
              │                                        │
              └────────────────────┬───────────────────┘
                                   ▼
                         SSE 事件流推送
                                   │
                                   ▼
                    ┌─────────────────────────┐
                    │     DigestPanel         │
                    │    (Markdown 渲染)       │
                    └─────────────────────────┘
```

---

## 🤖 Agent 设计

### Agent 概览

| Agent | 职责 | 输入 | 输出 |
|-------|------|------|------|
| `DigestWriterAgent` | 将热点新闻整合为每日日报 | 话题 + 新闻 Markdown | 结构化日报 |

### DigestWriterAgent (日报编辑专家)

**职责：** 根据用户指定的话题，从热点新闻中筛选高度相关的内容，生成结构化日报

**输入：**

```typescript
interface DigestAgentInput {
  /** 用户话题 */
  topic: string;
  /** 热点新闻 Markdown 内容 */
  hotNewsMarkdown: string;
}
```

**输出：**

```typescript
interface DigestAgentOutput {
  /** 生成的日报 Markdown */
  digest: string;
}
```

**日报格式规范：**

1. 标题格式：`# AI日报 | YYYY年M月D日 | by@wayde`
2. 按来源平台分板块（知乎、微博、百度等）
3. 每条热点必须添加独特的 Emoji 表情
4. 包含原始链接和热度指数
5. 结尾添加生成说明

**示例输出：**

```markdown
# AI日报 | 2026年1月8日 | by@wayde

## 🔥 Google News Headlines

### 🤖 OpenAI 发布最新模型引发热议
讨论最新 AI 技术突破及其影响
[点击查看](https://news.google.com/...) · 热度: 极高

### 📱 苹果发布会重点内容汇总
详解新品特性与创新亮点
[点击查看](https://news.google.com/...) · 热度: 热门

---
*本日报由 AI 热点助手自动生成 | 数据来源：Google News*
```

---

## 🔌 API 接口

### POST /api/news/digest

通过 SSE 流式生成每日热点日报

**请求：**

```typescript
interface DigestRequest {
  /** 用户输入的话题 */
  topic: string;
  /** RSS 源 URL 列表（可选，使用默认源） */
  feedUrls?: string[];
}
```

**请求示例：**

```json
{
  "topic": "人工智能"
}
```

**SSE 事件类型：**

| 事件 | 说明 | 数据 |
|------|------|------|
| `start` | 开始生成 | `{ topic }` |
| `progress` | 进度更新 | `{ stage, percentage, task }` |
| `digest` | 日报生成完成 | `string` (Markdown 内容) |
| `error` | 发生错误 | `{ message }` |
| `done` | 流程完成 | `{ topic }` |

**进度阶段 (stage)：**

| 阶段 | 说明 | 进度范围 |
|------|------|----------|
| `fetching` | 获取新闻 | 0% - 50% |
| `filtering` | 筛选内容 | 50% - 60% |
| `generating` | 生成日报 | 60% - 100% |

**SSE 响应示例：**

```
data: {"event":"start","data":{"topic":"人工智能"}}

data: {"event":"progress","data":{"stage":"fetching","percentage":15,"task":"正在根据话题「人工智能」获取相关新闻..."}}

data: {"event":"progress","data":{"stage":"generating","percentage":60,"task":"正在生成日报..."}}

data: {"event":"digest","data":"# AI日报 | 2026年1月8日 | by@wayde\n\n..."}

data: {"event":"done","data":{"topic":"人工智能"}}
```

---

## 🧩 组件说明

### 页面组件

| 组件 | 路径 | 说明 |
|------|------|------|
| `NewsPage` | `app/news/page.tsx` | 每日热点主页面 |

### 功能组件

| 组件 | 说明 |
|------|------|
| `DigestForm` | 话题输入表单（关键词输入 + 热门话题快捷按钮） |
| `ProgressBar` | 进度条展示（状态图标 + 进度百分比 + 重试按钮） |
| `DigestPanel` | 日报展示面板（Markdown 渲染 + 复制/下载功能） |

### 组件详情

#### DigestForm

```typescript
interface DigestFormProps {
  /** 提交回调 */
  onSubmit: (topic: string) => void;
  /** 是否正在生成中 */
  isGenerating: boolean;
}
```

**功能特性：**
- 话题关键词输入框
- 热门话题快捷按钮（Technology, AI, Business, Sports 等）
- 生成状态禁用控制

#### ProgressBar

```typescript
interface ProgressBarProps {
  /** 进度百分比 0-100 */
  progress: number;
  /** 进度文本 */
  progressText: string;
  /** 当前状态 */
  status: DigestStatus;
  /** 错误信息 */
  error?: string;
  /** 重试回调 */
  onRetry?: () => void;
}
```

**状态样式：**
- 进行中：琥珀色渐变 + 旋转加载图标
- 已完成：翠绿色渐变 + 成功图标
- 错误：红色渐变 + 错误图标 + 重试按钮

#### DigestPanel

```typescript
interface DigestPanelProps {
  /** 日报内容 (Markdown) */
  digest: string;
  /** 用户话题 */
  topic: string;
  /** 当前状态 */
  status: DigestStatus;
}
```

**功能特性：**
- 内置 Markdown 渲染器
- 复制到剪贴板
- 下载为 `.md` 文件
- 加载状态展示

### Hooks

| Hook | 说明 |
|------|------|
| `useNewsDigest` | 每日热点日报状态管理 |

#### useNewsDigest

```typescript
interface UseNewsDigestReturn extends DigestState {
  /** 开始生成日报 */
  generateDigest: (topic: string) => void;
  /** 重置状态 */
  reset: () => void;
  /** 是否正在生成中 */
  isGenerating: boolean;
}
```

**功能特性：**
- SSE 流式数据接收
- 自动解析 SSE 事件
- 请求中断控制（AbortController）
- 组件卸载自动清理

---

## 📦 数据类型

### DigestState (日报状态)

```typescript
interface DigestState {
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
```

### DigestStatus (状态枚举)

```typescript
type DigestStatus =
  | "idle"        // 空闲
  | "fetching"    // 获取新闻中
  | "filtering"   // 筛选内容中
  | "generating"  // 生成日报中
  | "completed"   // 已完成
  | "error";      // 错误
```

### GoogleNewsArticle (新闻文章)

```typescript
interface GoogleNewsArticle {
  /** 标题 */
  title: string;
  /** 链接 */
  link: string;
  /** 发布时间 */
  pubDate: string;
  /** 来源 */
  source: string;
  /** 描述/摘要 */
  description: string;
}
```

### NewsTopic (新闻主题)

```typescript
type NewsTopic =
  | "WORLD"         // 国际
  | "NATION"        // 国内
  | "BUSINESS"      // 商业
  | "TECHNOLOGY"    // 科技
  | "ENTERTAINMENT" // 娱乐
  | "SPORTS"        // 体育
  | "SCIENCE"       // 科学
  | "HEALTH";       // 健康
```

### 话题到主题的映射

| 用户输入 | 匹配主题 |
|----------|----------|
| 科技、AI、互联网、人工智能、编程 | TECHNOLOGY |
| 商业、经济、金融、股票、投资 | BUSINESS |
| 娱乐、明星、电影、音乐、游戏 | ENTERTAINMENT |
| 体育、篮球、足球、NBA | SPORTS |
| 科学、研究、学术 | SCIENCE |
| 健康、医疗、养生 | HEALTH |
| 国际、世界、全球 | WORLD |
| 国内、中国 | NATION |

---

## ⚙️ 配置说明

### 环境变量

在 `.env.local` 中配置：

```bash
# ===== LLM 配置 =====
LLM_API_KEY=你的LLM_API_Key
LLM_BASE_URL=https://api-inference.modelscope.cn/v1
LLM_MODEL=deepseek-ai/DeepSeek-V3.2

# ===== RSS MCP 配置（可选，备用方案）=====
RSS_MCP_URL=https://mcp.api-inference.modelscope.net/xxx/sse
```

### 数据源说明

| 数据源 | 说明 | 需要配置 |
|--------|------|----------|
| Google News RSS | 主数据源，直接获取 RSS | ❌ 无需配置 |
| RSS Reader MCP | 备用数据源 | ⚠️ 可选配置 |

### Google News RSS 端点

```
# 头条新闻
https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en

# 按主题
https://news.google.com/rss/headlines/section/topic/{TOPIC}?hl=en-US&gl=US&ceid=US:en

# 关键词搜索
https://news.google.com/rss/search?q={KEYWORD}&hl=en-US&gl=US&ceid=US:en
```

---

## 📱 使用指南

### 1. 输入话题关键词

- 在输入框中输入感兴趣的话题，如："人工智能"、"科技"、"体育"
- 或点击热门话题按钮快速选择

### 2. 生成日报

点击"生成日报"按钮，系统将：
1. 根据话题匹配新闻分类或进行关键词搜索
2. 从 Google News RSS 获取相关新闻
3. AI 智能筛选与话题高度相关的内容
4. 生成结构化的 Markdown 日报

### 3. 查看进度

- 实时进度条展示当前阶段
- 可查看详细的任务描述
- 错误时可点击重试

### 4. 操作日报

- **复制** - 复制 Markdown 内容到剪贴板
- **下载** - 下载为 `.md` 文件
- **新日报** - 重置状态，开始新的生成

---

## 📁 项目结构

```
src/
├── types/
│   └── news.ts                  # 新闻相关类型定义
├── services/
│   ├── news/
│   │   ├── googleNewsService.ts # Google News RSS 服务
│   │   ├── newsCoordinator.ts   # 新闻协调器
│   │   └── index.ts
│   ├── mcp/
│   │   └── rssMcpClient.ts      # RSS MCP 客户端（备用）
│   └── agents/
│       └── news/
│           ├── prompts.ts       # Agent Prompt 模板
│           ├── digestAgent.ts   # 日报生成 Agent
│           └── index.ts
├── hooks/
│   └── useNewsDigest.ts         # 日报状态 Hook
├── components/
│   └── news/
│       ├── DigestForm.tsx       # 输入表单
│       ├── ProgressBar.tsx      # 进度条
│       ├── DigestPanel.tsx      # 日报面板
│       └── index.ts
└── app/
    ├── news/
    │   └── page.tsx             # 新闻页面
    └── api/
        └── news/
            └── digest/
                └── route.ts     # SSE API 端点
```

---

## 🔧 扩展指南

### 添加新的数据源

1. 在 `services/news/` 中创建新的服务类
2. 实现 `getNewsByUserTopic(topic: string): Promise<string>` 方法
3. 在 `newsCoordinator.ts` 中集成新数据源

### 自定义 Agent Prompt

编辑 `src/services/agents/news/prompts.ts` 文件中的 Prompt 模板：

- `DIGEST_WRITER_SYSTEM_PROMPT` - 日报生成系统提示词
- `CONTENT_FILTER_SYSTEM_PROMPT` - 内容过滤提示词（备用）

### 添加新的话题映射

在 `googleNewsService.ts` 中的 `TOPIC_MAPPING` 添加新的关键词映射：

```typescript
const TOPIC_MAPPING: Record<string, NewsTopic> = {
  // 添加新的映射
  "新关键词": "TECHNOLOGY",
  // ...
};
```

---

## ⚠️ 注意事项

1. **网络依赖** - Google News RSS 需要网络访问，部分地区可能受限
2. **生成耗时** - 完整流程通常需要 10-30 秒，取决于 LLM 响应速度
3. **内容准确性** - AI 生成的内容可能存在偏差，建议核实重要信息
4. **语言限制** - 当前默认获取英文新闻（en-US），可通过修改 RSS URL 支持其他语言
5. **频率限制** - 避免频繁调用，以免触发 Google 的访问限制

---

## 🔗 相关链接

- [返回主文档](../README.md)
- [深度研究助手](./RESEARCH_ASSISTANT.md)
- [智能旅行助手](./TRAVEL_ASSISTANT.md)
- [Google News RSS](https://news.google.com/)

---

## 📝 更新日志

### v1.0.0 (2026-01)

- ✅ 完成 Google News RSS 集成
- ✅ 实现 DigestWriterAgent 日报生成
- ✅ 实现 SSE 流式进度推送
- ✅ 支持话题智能匹配
- ✅ 内置 Markdown 渲染器
- ✅ 支持复制和下载日报
