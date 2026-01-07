"use client";

import React from "react";
import { Copy, Check, Download, FileText, Loader2 } from "lucide-react";
import type { DigestStatus } from "@/types/news";

interface DigestPanelProps {
  /** 日报内容 (Markdown) */
  digest: string;
  /** 用户话题 */
  topic: string;
  /** 当前状态 */
  status: DigestStatus;
}

export function DigestPanel({ digest, topic, status }: DigestPanelProps) {
  const [copied, setCopied] = React.useState(false);

  // 复制日报
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(digest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  }, [digest]);

  // 下载日报
  const handleDownload = React.useCallback(() => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const blob = new Blob([digest], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.replace(/[/\\?%*:|"<>]/g, "-")}_日报_${dateStr}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [digest, topic]);

  // 空状态 - 简洁提示
  if (!digest && status === "idle") {
    return (
      <div className="py-8 text-center">
        <FileText className="h-16 w-16 mx-auto mb-4 text-slate-600 opacity-50" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">
          每日热点日报
        </h3>
        <p className="text-sm text-slate-500">
          输入话题关键词，AI 将为您生成今日热点日报
        </p>
      </div>
    );
  }

  // 加载状态
  if (!digest && status !== "idle" && status !== "completed") {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          <span className="text-lg">
            {status === "fetching" && "正在获取热点新闻..."}
            {status === "filtering" && "正在整理内容..."}
            {status === "generating" && "正在生成日报..."}
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
          日报预览
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!digest}
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
            disabled={!digest}
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

      {/* 日报内容 - 超出滚动 */}
      <div className="flex-1 overflow-y-auto mt-4 pr-2 min-h-0">
        <MarkdownRenderer content={digest} />
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
          <h1 key={key++} className="text-2xl font-bold text-slate-100 mt-6 mb-4 gradient-text-warm">
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
            className="border-l-4 border-amber-500 pl-4 py-2 my-4 text-slate-400 italic bg-slate-800/30 rounded-r-lg"
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
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // 处理链接 [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // 添加链接前的文本
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++}>
          {processInlineStyles(text.slice(lastIndex, match.index))}
        </span>
      );
    }

    // 添加链接
    parts.push(
      <a
        key={key++}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
      >
        {match[1]}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // 添加剩余文本
  if (lastIndex < text.length) {
    parts.push(
      <span key={key++}>
        {processInlineStyles(text.slice(lastIndex))}
      </span>
    );
  }

  return parts.length > 0 ? parts : processInlineStyles(text);
}

/** 处理行内样式 (加粗、行内代码) */
function processInlineStyles(text: string): React.ReactNode {
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
      <code key={key++} className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 text-sm">
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
