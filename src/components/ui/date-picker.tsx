"use client";

import React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

/** 月份名称 */
const MONTHS = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

/** 星期名称 */
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

/**
 * 自定义日期选择器组件
 * 支持暗色主题
 */
export function DatePicker({
  value,
  onChange,
  min,
  placeholder = "选择日期",
  className,
  error = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(() => {
    if (value) return new Date(value);
    if (min) return new Date(min);
    return new Date();
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  // 解析最小日期
  const minDate = min ? new Date(min) : null;
  if (minDate) {
    minDate.setHours(0, 0, 0, 0);
  }

  // 点击外部关闭
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 当 value 变化时更新视图日期
  React.useEffect(() => {
    if (value) {
      setViewDate(new Date(value));
    }
  }, [value]);

  /**
   * 获取当月的日期网格
   */
  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // 当月第一天
    const firstDay = new Date(year, month, 1);
    // 当月最后一天
    const lastDay = new Date(year, month + 1, 0);

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // 上月填充
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // 当月日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }

    // 下月填充（补齐6行）
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  /**
   * 检查日期是否被禁用
   */
  const isDateDisabled = (date: Date): boolean => {
    if (!minDate) return false;
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < minDate;
  };

  /**
   * 检查日期是否是今天
   */
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  /**
   * 检查日期是否被选中
   */
  const isSelected = (date: Date): boolean => {
    if (!value) return false;
    const selected = new Date(value);
    return (
      date.getFullYear() === selected.getFullYear() &&
      date.getMonth() === selected.getMonth() &&
      date.getDate() === selected.getDate()
    );
  };

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /**
   * 选择日期
   */
  const handleSelectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange(formatDate(date));
    setIsOpen(false);
  };

  /**
   * 切换月份
   */
  const changeMonth = (delta: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  /**
   * 切换年份
   */
  const changeYear = (delta: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(newDate.getFullYear() + delta);
      return newDate;
    });
  };

  /**
   * 格式化显示值
   */
  const displayValue = value
    ? new Date(value).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  const days = getDaysInMonth();

  return (
    <div ref={containerRef} className="relative">
      {/* 输入框 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg",
          "bg-slate-900/50 border text-left transition-all cursor-pointer",
          "hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30",
          error ? "border-red-500" : "border-slate-600",
          className
        )}
      >
        <span className={value ? "text-slate-100" : "text-slate-500"}>
          {displayValue || placeholder}
        </span>
        <Calendar className="h-4 w-4 text-cyan-400 flex-shrink-0" />
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 p-3 rounded-xl bg-slate-800 border border-slate-700 shadow-xl shadow-black/50 animate-in fade-in-0 zoom-in-95">
          {/* 头部：年月导航 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeYear(-1)}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
                title="上一年"
              >
                <ChevronLeft className="h-4 w-4" />
                {/* <ChevronLeft className="h-4 w-4 -ml-2" /> */}
              </button>
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
                title="上个月"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="font-medium text-slate-100">
              {viewDate.getFullYear()} 年 {MONTHS[viewDate.getMonth()]}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
                title="下个月"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => changeYear(1)}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
                title="下一年"
              >
                <ChevronRight className="h-4 w-4" />
                {/* <ChevronRight className="h-4 w-4 -ml-2" /> */}
              </button>
            </div>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs text-slate-500 font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(({ date, isCurrentMonth }, index) => {
              const disabled = isDateDisabled(date);
              const selected = isSelected(date);
              const today = isToday(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  disabled={disabled}
                  className={clsx(
                    "h-8 w-8 flex items-center justify-center rounded-lg text-sm transition-all",
                    !isCurrentMonth && "text-slate-600",
                    isCurrentMonth && !disabled && !selected && "text-slate-200 hover:bg-slate-700 cursor-pointer",
                    disabled && "text-slate-700 cursor-not-allowed",
                    selected && "bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium",
                    today && !selected && "ring-1 ring-cyan-500/50"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* 快捷按钮 */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
            <button
              type="button"
              onClick={() => handleSelectDate(new Date())}
              disabled={minDate ? new Date() < minDate : false}
              className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              今天
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleSelectDate(tomorrow);
              }}
              className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors cursor-pointer"
            >
              明天
            </button>
            <button
              type="button"
              onClick={() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                handleSelectDate(nextWeek);
              }}
              className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors cursor-pointer"
            >
              下周
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

