"use client";

import React from "react";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Search,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { TodoItem, TodoStatus } from "@/types/research";

interface TodoListPanelProps {
  /** 任务列表 */
  todoList: TodoItem[];
  /** 当前选中的任务 ID */
  selectedTaskId?: number;
  /** 任务点击回调 */
  onTaskClick?: (task: TodoItem) => void;
}

/** 状态图标映射 */
const STATUS_ICONS: Record<TodoStatus, React.ReactNode> = {
  pending: <Circle className="h-5 w-5 text-slate-500" />,
  searching: <Search className="h-5 w-5 text-cyan-500 animate-pulse" />,
  summarizing: <FileText className="h-5 w-5 text-violet-500 animate-pulse" />,
  completed: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
};

/** 状态文本映射 */
const STATUS_TEXT: Record<TodoStatus, string> = {
  pending: "等待中",
  searching: "搜索中",
  summarizing: "总结中",
  completed: "已完成",
  error: "失败",
};

export function TodoListPanel({
  todoList,
  selectedTaskId,
  onTaskClick,
}: TodoListPanelProps) {
  // 空状态 - 简单提示，不显示 loading
  if (todoList.length === 0) {
    return (
      <div className="py-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          研究任务
        </h3>
        <p className="text-sm text-slate-500">
          输入研究主题后，AI 将自动规划研究任务
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
        研究任务 ({todoList.filter((t) => t.status === "completed").length}/{todoList.length})
      </h3>

      <div className="space-y-2">
        {todoList.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={task.id === selectedTaskId}
            onClick={() => onTaskClick?.(task)}
          />
        ))}
      </div>
    </div>
  );
}

/** 单个任务项 */
interface TaskItemProps {
  task: TodoItem;
  isSelected: boolean;
  onClick: () => void;
}

function TaskItem({ task, isSelected, onClick }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleClick = () => {
    onClick();
    if (task.status === "completed" && task.summary) {
      setIsExpanded(!isExpanded);
    }
  };

  const isActive = task.status === "searching" || task.status === "summarizing";

  return (
    <div
      className={`
        rounded-lg border transition-all cursor-pointer
        ${isSelected
          ? "bg-violet-500/10 border-violet-500/50"
          : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
        }
        ${isActive ? "ring-2 ring-cyan-500/30" : ""}
      `}
    >
      {/* 任务头部 */}
      <div
        className="flex items-start gap-3 p-3"
        onClick={handleClick}
      >
        <div className="flex-shrink-0 mt-0.5">
          {STATUS_ICONS[task.status]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-200 truncate">
              {task.title}
            </span>
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${task.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : ""}
                ${task.status === "error" ? "bg-red-500/20 text-red-400" : ""}
                ${task.status === "searching" || task.status === "summarizing"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : ""
                }
                ${task.status === "pending" ? "bg-slate-700/50 text-slate-500" : ""}
              `}
            >
              {STATUS_TEXT[task.status]}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
            {task.intent}
          </p>
        </div>
      </div>

      {/* 展开的详情 */}
      {isExpanded && task.status === "completed" && (
        <div className="px-3 pb-3 border-t border-slate-700/50 mt-2 pt-3">
          {/* 来源列表 */}
          {task.sources && task.sources.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-2">参考来源：</p>
              <div className="space-y-1">
                {task.sources.slice(0, 3).map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300
                               truncate group"
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50 group-hover:opacity-100" />
                    <span className="truncate">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 总结预览 */}
          {task.summary && (
            <div className="text-sm text-slate-400 line-clamp-3">
              {task.summary.slice(0, 200)}...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
