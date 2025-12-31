"use client";

import React from "react";
import { Copy, Check, Download, FileText, Loader2 } from "lucide-react";
import type { ResearchStatus } from "@/types/research";

interface ReportPanelProps {
  /** 报告内容 (Markdown) */
  report: string;
  /** 研究主题 */
  topic: string;
  /** 当前状态 */
  status: ResearchStatus;
}

export function ReportPanel({ report, topic, status }: ReportPanelProps) {
  const [copied, setCopied] = React.useState(false);

  // 复制报告
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  }, [report]);

  // 下载报告
  const handleDownload = React.useCallback(() => {
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.replace(/[/\\?%*:|"<>]/g, "-")}_研究报告.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [report, topic]);

  // 空状态 - 简洁提示
  if (!report && status === "idle") {
    return (
      <div className="py-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          研究报告
        </h3>
        <div className="text-slate-500">
          <FileText className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">
            输入研究主题，AI 将自动生成研究报告
          </p>
        </div>
      </div>
    );
  }

  // 加载状态
  if (!report && status !== "idle" && status !== "completed") {
    return (
      <div className="py-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          研究报告
        </h3>
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
          <span>
            {status === "planning" && "正在分析研究主题..."}
            {status === "executing" && "正在搜索和整理资料..."}
            {status === "reporting" && "正在生成研究报告..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* 工具栏 */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 flex-shrink-0">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          研究报告
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!report}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400
                       hover:text-slate-200 bg-slate-800/50 rounded-lg border
                       border-slate-700 hover:border-slate-600 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                复制
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={!report}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400
                       hover:text-slate-200 bg-slate-800/50 rounded-lg border
                       border-slate-700 hover:border-slate-600 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            下载
          </button>
        </div>
      </div>

      {/* 报告内容 - 超出滚动 */}
      <div className="flex-1 overflow-y-auto mt-4 pr-2 min-h-0">
        <MarkdownRenderer content={report} />
      </div>
    </div>
  );
}

/** 简易 Markdown 渲染器 */
interface MarkdownRendererProps {
  content: string;
}

function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // 将 Markdown 转换为 HTML 元素
  const elements = React.useMemo(() => {
    const lines = content.split("\n");
    const result: React.ReactNode[] = [];
    let key = 0;
    let inCodeBlock = false;
    let codeContent: string[] = [];

    for (const line of lines) {
      // 代码块处理
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          result.push(
            <pre
              key={key++}
              className="bg-slate-900 p-4 rounded-lg overflow-x-auto my-4 text-sm"
            >
              <code className="text-slate-300">{codeContent.join("\n")}</code>
            </pre>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // 标题
      if (line.startsWith("# ")) {
        result.push(
          <h1 key={key++} className="text-2xl font-bold text-slate-100 mt-6 mb-4 gradient-text">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        result.push(
          <h2 key={key++} className="text-xl font-semibold text-slate-200 mt-5 mb-3 border-b border-slate-700/50 pb-2">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        result.push(
          <h3 key={key++} className="text-lg font-medium text-slate-300 mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      }
      // 无序列表
      else if (line.startsWith("- ")) {
        result.push(
          <li key={key++} className="text-slate-400 ml-4 mb-1 list-disc">
            {renderInlineElements(line.slice(2))}
          </li>
        );
      }
      // 有序列表
      else if (/^\d+\. /.test(line)) {
        const text = line.replace(/^\d+\. /, "");
        result.push(
          <li key={key++} className="text-slate-400 ml-4 mb-1 list-decimal">
            {renderInlineElements(text)}
          </li>
        );
      }
      // 分隔线
      else if (line.startsWith("---")) {
        result.push(
          <hr key={key++} className="border-slate-700 my-6" />
        );
      }
      // 引用
      else if (line.startsWith("> ")) {
        result.push(
          <blockquote
            key={key++}
            className="border-l-4 border-violet-500 pl-4 py-2 my-4 text-slate-400 italic bg-slate-800/30 rounded-r-lg"
          >
            {renderInlineElements(line.slice(2))}
          </blockquote>
        );
      }
      // 普通段落
      else if (line.trim()) {
        result.push(
          <p key={key++} className="text-slate-400 mb-3 leading-relaxed">
            {renderInlineElements(line)}
          </p>
        );
      }
      // 空行
      else {
        result.push(<div key={key++} className="h-2" />);
      }
    }

    return result;
  }, [content]);

  return <div className="prose-invert max-w-none">{elements}</div>;
}

/** 渲染行内元素 (加粗、斜体、链接等) */
function renderInlineElements(text: string): React.ReactNode {
  // 简单处理：加粗、斜体、行内代码
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // 加粗 **text**
  while (remaining.includes("**")) {
    const start = remaining.indexOf("**");
    const end = remaining.indexOf("**", start + 2);
    if (end === -1) break;

    if (start > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, start)}</span>);
    }
    parts.push(
      <strong key={key++} className="text-slate-200 font-semibold">
        {remaining.slice(start + 2, end)}
      </strong>
    );
    remaining = remaining.slice(end + 2);
  }

  // 行内代码 `code`
  while (remaining.includes("`")) {
    const start = remaining.indexOf("`");
    const end = remaining.indexOf("`", start + 1);
    if (end === -1) break;

    if (start > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, start)}</span>);
    }
    parts.push(
      <code key={key++} className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 text-sm">
        {remaining.slice(start + 1, end)}
      </code>
    );
    remaining = remaining.slice(end + 1);
  }

  if (remaining) {
    parts.push(<span key={key++}>{remaining}</span>);
  }

  return parts.length > 0 ? parts : text;
}
