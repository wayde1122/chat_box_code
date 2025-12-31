"use client";

import React from "react";
import { PlanForm } from "./PlanForm";
import { ItineraryList } from "./ItineraryList";
import { AMapContainer } from "./AMapContainer";
import { BudgetPanel } from "./BudgetPanel";
import { ExportPanel } from "./ExportPanel";
import { useTravelPlan } from "@/hooks/useTravelPlan";
import { Button } from "@/components/ui/button";
import {
  Plane,
  RotateCcw,
  Clock,
  MapPin,
  Calendar,
  Users,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import type { TravelRequest, Attraction } from "@/types/travel";

/**
 * 智能旅行规划器主组件
 */
export function TravelPlanner() {
  const {
    plan,
    loading,
    error,
    duration,
    generatePlan,
    clearPlan,
    removeItemFromDay,
  } = useTravelPlan();

  const exportContentRef = React.useRef<HTMLDivElement>(null);

  // 从行程中提取所有景点用于地图显示
  const allAttractions = React.useMemo<Attraction[]>(() => {
    if (!plan) return [];

    const attractions: Attraction[] = [];
    for (const day of plan.itinerary) {
      for (const item of day.items) {
        if (item.attraction) {
          attractions.push(item.attraction);
        }
      }
    }
    return attractions;
  }, [plan]);

  const handleSubmit = (request: TravelRequest) => {
    generatePlan(request);
  };

  const handleReset = () => {
    clearPlan();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              返回首页
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500">
                <Plane className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-100">智能旅行助手</span>
            </div>
          </div>

          {plan && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              重新规划
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <p className="font-medium">生成行程失败</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!plan ? (
          /* 输入表单 */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-100 mb-3">
                AI 智能行程规划
              </h1>
              <p className="text-slate-400">
                输入目的地和偏好，AI 将为您生成完美的旅行计划
              </p>
            </div>

            <PlanForm onSubmit={handleSubmit} loading={loading} />

            {/* 特性说明 */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: MapPin, label: "智能景点推荐" },
                { icon: Calendar, label: "天气适配行程" },
                { icon: Users, label: "预算精准计算" },
                { icon: Plane, label: "一键导出分享" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center p-4 rounded-lg bg-slate-800/30 border border-slate-700/50"
                >
                  <item.icon className="h-6 w-6 text-cyan-400 mb-2" />
                  <span className="text-sm text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 行程结果 */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：行程列表 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 行程标题 */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">
                    {plan.destination} 旅行计划
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {plan.startDate} ~ {plan.endDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {plan.travelers} 人
                    </span>
                    {duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        生成耗时 {(duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 行程列表 */}
              <ItineraryList
                itinerary={plan.itinerary}
                onRemoveItem={removeItemFromDay}
              />
            </div>

            {/* 导出用的隐藏内容 */}
            <div
              ref={exportContentRef}
              className="hidden"
              id="export-content"
            >
              {/* 导出专用头部 */}
              <div
                style={{
                  padding: "32px",
                  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                  borderBottom: "2px solid #334155",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Plane style={{ width: "24px", height: "24px", color: "white" }} />
                  </div>
                  <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#f1f5f9", margin: 0 }}>
                      {plan.destination} 旅行计划
                    </h1>
                    <p style={{ fontSize: "14px", color: "#94a3b8", margin: "4px 0 0 0" }}>
                      AI 智能旅行助手 · 精心为您规划
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "24px", fontSize: "14px", color: "#94a3b8" }}>
                  <span>📅 {plan.startDate} ~ {plan.endDate}</span>
                  <span>👥 {plan.travelers} 人出行</span>
                  <span>💰 预算 ¥{plan.budget.total}</span>
                </div>
              </div>

              {/* 导出行程内容 */}
              <div style={{ padding: "24px", background: "#0f172a" }}>
                {plan.itinerary.map((day, index) => (
                  <div
                    key={day.date}
                    style={{
                      marginBottom: "24px",
                      padding: "20px",
                      background: "#1e293b",
                      borderRadius: "12px",
                      border: "1px solid #334155",
                    }}
                  >
                    {/* 日期头部 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
                            borderRadius: "8px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)" }}>DAY</span>
                          <span style={{ fontSize: "18px", fontWeight: "bold", color: "white" }}>{index + 1}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: "500", color: "#f1f5f9" }}>
                            {day.date} {day.dayOfWeek}
                          </div>
                          {day.weather && (
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                              {day.weather.description} {day.weather.minTemp}~{day.weather.maxTemp}°C
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>当日花费</div>
                        <div style={{ fontSize: "20px", fontWeight: "600", color: "#fbbf24" }}>¥{day.dailyCost}</div>
                      </div>
                    </div>

                    {/* 行程项目 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {day.items.map((item) => {
                        const name = item.attraction?.name ?? item.restaurant?.name ?? item.hotel?.name ?? "未命名";
                        const address = item.attraction?.address ?? item.restaurant?.address ?? item.hotel?.address;
                        const typeEmoji = item.type === "attraction" ? "📍" : item.type === "restaurant" ? "🍽️" : item.type === "hotel" ? "🏨" : "🚗";
                        
                        return (
                          <div
                            key={item.id}
                            style={{
                              padding: "12px 16px",
                              background: "#0f172a",
                              borderRadius: "8px",
                              borderLeft: "3px solid #06b6d4",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span>{typeEmoji}</span>
                                <span style={{ fontSize: "14px", fontWeight: "500", color: "#f1f5f9" }}>{name}</span>
                              </div>
                              {item.cost > 0 && (
                                <span style={{ fontSize: "13px", color: "#fbbf24" }}>¥{item.cost}</span>
                              )}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                              ⏰ {item.startTime} - {item.endTime}
                              {address && <span style={{ marginLeft: "12px" }}>{address}</span>}
                            </div>
                            {item.note && (
                              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", lineHeight: "1.5" }}>
                                {item.note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* 预算汇总 */}
                <div
                  style={{
                    padding: "20px",
                    background: "#1e293b",
                    borderRadius: "12px",
                    border: "1px solid #334155",
                  }}
                >
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#f1f5f9", marginBottom: "16px" }}>
                    💰 预算明细
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#0f172a", borderRadius: "6px" }}>
                      <span style={{ color: "#94a3b8" }}>🎫 门票</span>
                      <span style={{ color: "#f1f5f9" }}>¥{plan.budget.attractions}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#0f172a", borderRadius: "6px" }}>
                      <span style={{ color: "#94a3b8" }}>🏨 住宿</span>
                      <span style={{ color: "#f1f5f9" }}>¥{plan.budget.hotels}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#0f172a", borderRadius: "6px" }}>
                      <span style={{ color: "#94a3b8" }}>🍽️ 餐饮</span>
                      <span style={{ color: "#f1f5f9" }}>¥{plan.budget.meals}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#0f172a", borderRadius: "6px" }}>
                      <span style={{ color: "#94a3b8" }}>🚗 交通</span>
                      <span style={{ color: "#f1f5f9" }}>¥{plan.budget.transport}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid #334155",
                    }}
                  >
                    <span style={{ fontSize: "16px", color: "#f1f5f9" }}>总预算</span>
                    <span style={{ fontSize: "24px", fontWeight: "bold", color: "#fbbf24" }}>¥{plan.budget.total}</span>
                  </div>
                </div>
              </div>

              {/* 导出页脚 */}
              <div
                style={{
                  padding: "16px 32px",
                  background: "#0f172a",
                  borderTop: "1px solid #334155",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  由 AI 智能旅行助手生成 · {new Date().toLocaleDateString("zh-CN")}
                </span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  祝您旅途愉快！🌟
                </span>
              </div>
            </div>

            {/* 右侧：地图和预算 */}
            <div className="space-y-6">
              {/* 地图 */}
              {/* <AMapContainer
                attractions={allAttractions}
                className="h-[300px] lg:h-[400px]"
              /> */}

              {/* 预算面板 */}
              <BudgetPanel budget={plan.budget} travelers={plan.travelers} />

              {/* 导出面板 */}
              <ExportPanel plan={plan} contentRef={exportContentRef} />

              {/* 推荐酒店 */}
              {plan.hotels.length > 0 && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">
                    推荐住宿
                  </h3>
                  <div className="space-y-3">
                    {plan.hotels.slice(0, 3).map((hotel) => (
                      <div
                        key={hotel.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="font-medium text-slate-100 text-sm">
                            {hotel.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            ⭐ {hotel.rating} · {hotel.stars}星级
                          </div>
                        </div>
                        <div className="text-amber-400 font-semibold">
                          ¥{hotel.pricePerNight}
                          <span className="text-xs text-slate-500 font-normal">
                            /晚
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

