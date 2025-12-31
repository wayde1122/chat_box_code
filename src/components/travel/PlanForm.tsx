"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { TravelRequest, TravelPreference, BudgetLevel } from "@/types/travel";

/** 偏好选项配置 */
const PREFERENCE_OPTIONS: Array<{
  value: TravelPreference;
  label: string;
  icon: string;
}> = [
  { value: "history", label: "历史文化", icon: "🏛️" },
  { value: "nature", label: "自然风光", icon: "🌲" },
  { value: "food", label: "美食体验", icon: "🍜" },
  { value: "shopping", label: "购物娱乐", icon: "🛍️" },
  { value: "adventure", label: "户外探险", icon: "🏔️" },
  { value: "relax", label: "休闲度假", icon: "🏖️" },
  { value: "family", label: "亲子游玩", icon: "👨‍👩‍👧" },
  { value: "romantic", label: "浪漫之旅", icon: "💑" },
];

/** 预算级别选项 */
const BUDGET_OPTIONS: Array<{
  value: BudgetLevel;
  label: string;
  description: string;
}> = [
  { value: "budget", label: "经济型", description: "¥500-1000/天" },
  { value: "moderate", label: "舒适型", description: "¥1000-2000/天" },
  { value: "luxury", label: "豪华型", description: "¥2000+/天" },
];

/** 验证错误类型 */
interface ValidationErrors {
  destination?: string;
  startDate?: string;
  endDate?: string;
  preferences?: string;
}

interface PlanFormProps {
  onSubmit: (request: TravelRequest) => void;
  loading?: boolean;
}

/**
 * 行程规划表单组件
 */
export function PlanForm({ onSubmit, loading = false }: PlanFormProps) {
  const [destination, setDestination] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [travelers, setTravelers] = React.useState(2);
  const [preferences, setPreferences] = React.useState<Set<TravelPreference>>(
    new Set()
  );
  const [budgetLevel, setBudgetLevel] = React.useState<BudgetLevel>("moderate");
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [touched, setTouched] = React.useState(false);

  // 获取今天的日期字符串
  const today = new Date().toISOString().split("T")[0];

  const handlePreferenceToggle = (pref: TravelPreference) => {
    setPreferences((prev) => {
      const next = new Set(prev);
      if (next.has(pref)) {
        next.delete(pref);
      } else {
        next.add(pref);
      }
      return next;
    });
    // 清除偏好错误
    if (errors.preferences) {
      setErrors((prev) => ({ ...prev, preferences: undefined }));
    }
  };

  /**
   * 验证表单
   */
  const validate = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!destination.trim()) {
      newErrors.destination = "请输入目的地城市";
    }

    if (!startDate) {
      newErrors.startDate = "请选择出发日期";
    }

    if (!endDate) {
      newErrors.endDate = "请选择返回日期";
    } else if (startDate && endDate < startDate) {
      newErrors.endDate = "返回日期不能早于出发日期";
    }

    if (preferences.size === 0) {
      newErrors.preferences = "请至少选择一个旅行偏好";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit({
      destination: destination.trim(),
      startDate,
      endDate,
      travelers,
      preferences: [...preferences],
      budgetLevel,
    });
  };

  const isValid =
    destination.trim() && startDate && endDate && preferences.size > 0;

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 目的地 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <MapPin className="h-4 w-4 text-cyan-400" />
            目的地
            <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            placeholder="输入城市名称，如：北京、上海、杭州"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              if (errors.destination) {
                setErrors((prev) => ({ ...prev, destination: undefined }));
              }
            }}
            className={`bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 cursor-text ${
              errors.destination && touched ? "border-red-500" : ""
            }`}
          />
          {errors.destination && touched && (
            <p className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              {errors.destination}
            </p>
          )}
        </div>

        {/* 日期选择 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Calendar className="h-4 w-4 text-cyan-400" />
              出发日期
              <span className="text-red-400">*</span>
            </label>
            <DatePicker
              value={startDate}
              onChange={(value) => {
                setStartDate(value);
                // 如果返回日期早于新的出发日期，自动调整
                if (endDate && endDate < value) {
                  setEndDate(value);
                }
                if (errors.startDate) {
                  setErrors((prev) => ({ ...prev, startDate: undefined }));
                }
              }}
              min={today}
              placeholder="选择出发日期"
              error={!!(errors.startDate && touched)}
            />
            {errors.startDate && touched && (
              <p className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="h-3 w-3" />
                {errors.startDate}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Calendar className="h-4 w-4 text-cyan-400" />
              返回日期
              <span className="text-red-400">*</span>
            </label>
            <DatePicker
              value={endDate}
              onChange={(value) => {
                setEndDate(value);
                if (errors.endDate) {
                  setErrors((prev) => ({ ...prev, endDate: undefined }));
                }
              }}
              min={startDate || today}
              placeholder="选择返回日期"
              error={!!(errors.endDate && touched)}
            />
            {errors.endDate && touched && (
              <p className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="h-3 w-3" />
                {errors.endDate}
              </p>
            )}
          </div>
        </div>

        {/* 出行人数 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Users className="h-4 w-4 text-cyan-400" />
            出行人数
          </label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTravelers((t) => Math.max(1, t - 1))}
              className="h-9 w-9 p-0 border-slate-600 cursor-pointer hover:bg-slate-700"
            >
              -
            </Button>
            <span className="w-12 text-center text-lg font-semibold text-slate-100">
              {travelers}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTravelers((t) => Math.min(10, t + 1))}
              className="h-9 w-9 p-0 border-slate-600 cursor-pointer hover:bg-slate-700"
            >
              +
            </Button>
            <span className="text-sm text-slate-400">人</span>
          </div>
        </div>

        {/* 旅行偏好 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            旅行偏好（可多选）
            <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PREFERENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePreferenceToggle(option.value)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
                  preferences.has(option.value)
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                    : "bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-800/50"
                } ${
                  errors.preferences && touched && preferences.size === 0
                    ? "border-red-500/50"
                    : ""
                }`}
              >
                <span className="text-xl mb-1">{option.icon}</span>
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
          {errors.preferences && touched && (
            <p className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              {errors.preferences}
            </p>
          )}
        </div>

        {/* 预算级别 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Wallet className="h-4 w-4 text-cyan-400" />
            预算级别
          </label>
          <div className="grid grid-cols-3 gap-3">
            {BUDGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBudgetLevel(option.value)}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all cursor-pointer ${
                  budgetLevel === option.value
                    ? "bg-violet-500/20 border-violet-500 text-violet-300"
                    : "bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-xs opacity-75">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 提交按钮 */}
        <Button
          type="submit"
          disabled={loading}
          className={`w-full h-12 font-semibold cursor-pointer transition-all duration-300 ${
            isValid
              ? "bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white"
              : "bg-slate-700 text-slate-400 hover:bg-slate-600"
          } ${loading ? "cursor-wait" : ""}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="animate-pulse">AI 正在为您规划行程...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              生成智能行程
            </span>
          )}
        </Button>

        {/* 未填写完整时的提示 */}
        {!isValid && touched && (
          <p className="text-center text-xs text-slate-500">
            请填写所有必填项后再生成行程
          </p>
        )}
      </form>
    </Card>
  );
}
