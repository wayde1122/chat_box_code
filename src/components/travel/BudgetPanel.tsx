"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Ticket,
  Hotel,
  Utensils,
  Car,
  MoreHorizontal,
  Wallet,
} from "lucide-react";
import type { BudgetBreakdown } from "@/types/travel";

interface BudgetPanelProps {
  budget: BudgetBreakdown;
  travelers: number;
}

/** 预算项配置 */
const BUDGET_ITEMS = [
  {
    key: "attractions" as const,
    label: "门票",
    icon: Ticket,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    barColor: "#22d3ee", // cyan-400
  },
  {
    key: "hotels" as const,
    label: "住宿",
    icon: Hotel,
    color: "text-violet-400",
    bgColor: "bg-violet-500/20",
    barColor: "#a78bfa", // violet-400
  },
  {
    key: "meals" as const,
    label: "餐饮",
    icon: Utensils,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    barColor: "#fb923c", // orange-400
  },
  {
    key: "transport" as const,
    label: "交通",
    icon: Car,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    barColor: "#4ade80", // green-400
  },
  {
    key: "others" as const,
    label: "其他",
    icon: MoreHorizontal,
    color: "text-slate-400",
    bgColor: "bg-slate-500/20",
    barColor: "#94a3b8", // slate-400
  },
];

/**
 * 预算面板组件
 */
export function BudgetPanel({ budget, travelers }: BudgetPanelProps) {
  const perPerson = Math.round(budget.total / travelers);

  return (
    <Card className="p-5 bg-slate-800/50 border-slate-700">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-100 mb-4">
        <Wallet className="h-5 w-5 text-amber-400" />
        预算明细
      </h3>

      {/* 预算项列表 */}
      <div className="space-y-3">
        {BUDGET_ITEMS.map((item) => {
          const value = budget[item.key];
          const percentage = budget.total > 0 ? (value / budget.total) * 100 : 0;
          const Icon = item.icon;

          return (
            <div key={item.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${item.bgColor}`}>
                    <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                  </div>
                  <span className="text-sm text-slate-300">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-slate-100">
                  ¥{value.toLocaleString()}
                </span>
              </div>
              {/* 进度条 */}
              <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: item.barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 分隔线 */}
      <div className="my-4 border-t border-slate-700" />

      {/* 总计 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">总计</span>
          <span className="text-2xl font-bold text-amber-400">
            ¥{budget.total.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">人均</span>
          <span className="text-slate-300">
            ¥{perPerson.toLocaleString()} / 人
          </span>
        </div>
      </div>

      {/* 饼图可视化 */}
      <div className="mt-5 flex justify-center">
        <BudgetPieChart budget={budget} />
      </div>
    </Card>
  );
}

/** Tooltip 数据类型 */
interface TooltipData {
  label: string;
  value: number;
  percentage: number;
  color: string;
  x: number;
  y: number;
}

/**
 * 简易饼图组件
 */
function BudgetPieChart({ budget }: { budget: BudgetBreakdown }) {
  const [tooltip, setTooltip] = React.useState<TooltipData | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const total = budget.total || 1;

  // 饼图颜色配置
  const colors: Record<string, string> = {
    attractions: "#22d3ee",
    hotels: "#a78bfa",
    meals: "#fb923c",
    transport: "#4ade80",
    others: "#94a3b8",
  };

  // 计算各扇形的角度
  let currentAngle = 0;
  const segments = BUDGET_ITEMS.map((item) => {
    const value = budget[item.key];
    const angle = (value / total) * 360;
    const segment = {
      key: item.key,
      label: item.label,
      value,
      percentage: (value / total) * 100,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: colors[item.key],
    };
    currentAngle += angle;
    return segment;
  }).filter((s) => s.value > 0); // 过滤掉值为 0 的项

  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const innerR = r * 0.55;

  // 极坐标转笛卡尔坐标
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // 生成环形扇区路径
  const createDonutPath = (
    startAngle: number,
    endAngle: number
  ): string => {
    // 处理完整圆的情况
    if (endAngle - startAngle >= 359.99) {
      return [
        `M ${cx} ${cy - r}`,
        `A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`,
        `L ${cx - 0.01} ${cy - innerR}`,
        `A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR}`,
        "Z",
      ].join(" ");
    }

    const outerStart = polarToCartesian(cx, cy, r, startAngle);
    const outerEnd = polarToCartesian(cx, cy, r, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${innerEnd.x} ${innerEnd.y}`,
      "Z",
    ].join(" ");
  };

  // 处理鼠标移入
  const handleMouseEnter = (
    e: React.MouseEvent<SVGPathElement>,
    segment: typeof segments[0]
  ) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setTooltip({
      label: segment.label,
      value: segment.value,
      percentage: segment.percentage,
      color: segment.color,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<SVGPathElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !tooltip) return;
    
    setTooltip((prev) =>
      prev
        ? {
            ...prev,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          }
        : null
    );
  };

  // 处理鼠标移出
  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="flex items-center gap-4">
      {/* 饼图容器 */}
      <div ref={containerRef} className="relative">
        <svg width={size} height={size} style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}>
          {segments.map((segment) => (
            <path
              key={segment.key}
              d={createDonutPath(segment.startAngle, segment.endAngle)}
              fill={segment.color}
              style={{ opacity: tooltip?.label === segment.label ? 1 : 0.85 }}
              className="transition-opacity cursor-pointer"
              onMouseEnter={(e) => handleMouseEnter(e, segment)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          ))}
          {/* 中心文字 */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            style={{ fill: "#94a3b8", fontSize: "11px" }}
          >
            总计
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            style={{ fill: "#fbbf24", fontSize: "14px", fontWeight: "bold" }}
          >
            ¥{budget.total >= 10000 
              ? `${(budget.total / 10000).toFixed(1)}w` 
              : budget.total.toLocaleString()}
          </text>
        </svg>

        {/* 自定义 Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg shadow-xl"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 40,
              backgroundColor: "#1e293b",
              border: `2px solid ${tooltip.color}`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: tooltip.color }}
              />
              <span className="text-sm font-medium text-slate-100">
                {tooltip.label}
              </span>
            </div>
            <div className="mt-1 text-center">
              <span className="text-amber-400 font-bold">
                ¥{tooltip.value.toLocaleString()}
              </span>
              <span className="text-slate-400 text-xs ml-2">
                ({tooltip.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 图例 */}
      <div className="flex flex-col gap-1.5">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-slate-400 whitespace-nowrap">
              {segment.label}
            </span>
            <span className="text-slate-300 font-medium">
              {segment.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

