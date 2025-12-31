# 深度研究助手

自动化深度研究智能体，基于 TODO 驱动的研究范式，能够自动分解研究任务、搜索资料、总结信息，并生成结构化的研究报告。

## 功能特性

### 核心能力

1. **问题剖析**：将用户的开放主题拆解为 3-5 个可检索的子任务
2. **多轮信息采集**：使用多种搜索引擎（Tavily、DuckDuckGo、Serper、Bing）持续挖掘资料
3. **反思与总结**：对每个子任务的搜索结果进行结构化总结
4. **报告生成**：整合所有子任务的总结，生成完整的研究报告

### 技术架构

```
用户输入研究主题
       ↓
┌─────────────────────────────────────────┐
│  阶段1: 规划 (TodoPlanner Agent)         │
│  将主题分解为 3-5 个子任务                 │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  阶段2: 执行 (循环每个子任务)              │
│  ├─ SearchService: 搜索资料              │
│  └─ TaskSummarizer Agent: 总结结果       │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  阶段3: 报告 (ReportWriter Agent)        │
│  整合所有总结，生成结构化报告              │
└─────────────────────────────────────────┘
       ↓
    输出研究报告
```

### 三 Agent 协作系统

| Agent          | 职责         | 输入              | 输出                |
| -------------- | ------------ | ----------------- | ------------------- |
| TodoPlanner    | 规划研究任务 | 研究主题          | JSON 格式子任务列表 |
| TaskSummarizer | 总结搜索结果 | 子任务 + 搜索结果 | Markdown 格式总结   |
| ReportWriter   | 生成研究报告 | 所有子任务总结    | 结构化研究报告      |

## 快速开始

### 1. 配置环境变量

在 `.env.local` 文件中配置搜索 API 密钥：

```env
# LLM 配置
LLM_API_KEY=your_llm_api_key
LLM_BASE_URL=https://api-inference.modelscope.cn/v1
LLM_MODEL=deepseek-ai/DeepSeek-V3.2

# 搜索 API 配置（至少配置一个）
TAVILY_API_KEY=your_tavily_key
SERPER_API_KEY=your_serper_key
BING_SEARCH_KEY=your_bing_key

# 默认搜索引擎
DEFAULT_SEARCH_BACKEND=tavily
```

### 2. 启动项目

```bash
npm run dev
```

### 3. 访问研究助手

打开浏览器访问 `http://localhost:3000/research`

## 使用示例

### 示例研究主题

- "多模态大模型的最新进展"
- "2024 年 AI 发展趋势"
- "RAG 技术原理与应用"

### 研究流程

1. 输入研究主题
2. 选择搜索引擎（可选）
3. 点击"开始研究"
4. 查看实时进度和任务状态
5. 研究完成后查看报告
6. 可复制或下载报告

## 项目结构

```
src/
├── types/
│   └── research.ts              # 研究相关类型定义
├── services/
│   ├── research/
│   │   ├── searchService.ts     # 搜索调度服务
│   │   ├── researchCoordinator.ts # 研究协调器
│   │   └── index.ts
│   └── agents/
│       └── research/
│           ├── prompts.ts       # Agent Prompt 模板
│           ├── todoPlannerAgent.ts
│           ├── taskSummarizerAgent.ts
│           ├── reportWriterAgent.ts
│           └── index.ts
├── hooks/
│   └── useResearch.ts           # 研究状态 Hook
├── components/
│   └── research/
│       ├── ResearchForm.tsx     # 输入表单
│       ├── TodoListPanel.tsx    # 任务列表
│       ├── ProgressBar.tsx      # 进度条
│       ├── ReportPanel.tsx      # 报告面板
│       └── index.ts
└── app/
    ├── research/
    │   └── page.tsx             # 研究页面
    └── api/
        └── research/
            └── stream/
                └── route.ts     # SSE API 端点
```

## 搜索引擎对比

| 搜索引擎   | 特点                     | 需要 API Key |
| ---------- | ------------------------ | ------------ |
| Tavily     | 专为 AI 设计，结果质量高 | ✅           |
| DuckDuckGo | 免费，隐私友好           | ❌           |
| Serper     | Google 搜索结果          | ✅           |
| Bing       | 微软搜索引擎             | ✅           |

## API 接口

### POST /api/research/stream

开始研究并通过 SSE 流式返回进度和结果。

**请求体：**

```json
{
  "topic": "研究主题",
  "searchBackend": "tavily"
}
```

**SSE 事件类型：**

| 事件             | 说明         | 数据                           |
| ---------------- | ------------ | ------------------------------ |
| plan             | 规划完成     | `{ todoList: TodoItem[] }`     |
| progress         | 进度更新     | `{ stage, percentage, text }`  |
| task_searching   | 任务搜索中   | `{ taskId }`                   |
| task_summarizing | 任务总结中   | `{ taskId, sources }`          |
| task_complete    | 任务完成     | `{ taskId, summary, sources }` |
| report           | 报告生成完成 | `{ report }`                   |
| error            | 发生错误     | `{ message, taskId? }`         |
| done             | 研究完成     | `null`                         |

### GET /api/research/stream

获取可用的搜索引擎列表。

**响应：**

```json
{
  "availableBackends": ["tavily", "duckduckgo", "serper", "bing"],
  "defaultBackend": "tavily"
}
```

## 扩展指南

### 添加新的搜索引擎

1. 在 `searchService.ts` 中添加新的搜索方法
2. 在 `SearchBackend` 类型中添加新选项
3. 在 `getAvailableBackends` 中添加可用性检查

### 自定义 Agent Prompt

编辑 `src/services/agents/research/prompts.ts` 文件中的 Prompt 模板。

### 调整任务数量

在 `todoPlannerAgent.ts` 中修改 `validateTasks` 方法的限制。

## 注意事项

1. 研究过程可能需要 1-3 分钟，取决于主题复杂度和搜索引擎响应速度
2. 搜索结果的质量受限于搜索引擎的能力
3. LLM 生成的内容可能存在不准确之处，建议核实重要信息
4. 建议使用 Tavily 或 Serper 获得更好的搜索结果质量
