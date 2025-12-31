"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Trash2,
  GripVertical,
  Sun,
  Cloud,
  CloudRain,
  Utensils,
  Hotel,
  Navigation,
} from "lucide-react";
import type { ItineraryDay, ItineraryItem, WeatherInfo } from "@/types/travel";

interface ItineraryListProps {
  itinerary: ItineraryDay[];
  onRemoveItem: (dayIndex: number, itemId: string) => void;
  onSelectAttraction?: (item: ItineraryItem) => void;
}

/**
 * 获取天气图标
 */
function WeatherIcon({ weather }: { weather?: WeatherInfo }) {
  if (!weather) return null;

  const desc = weather.description.toLowerCase();
  if (desc.includes("雨")) {
    return <CloudRain className="h-4 w-4 text-blue-400" />;
  }
  if (desc.includes("云") || desc.includes("阴")) {
    return <Cloud className="h-4 w-4 text-slate-400" />;
  }
  return <Sun className="h-4 w-4 text-amber-400" />;
}

/**
 * 获取项目类型图标
 */
function ItemIcon({ type }: { type: ItineraryItem["type"] }) {
  switch (type) {
    case "attraction":
      return <MapPin className="h-4 w-4 text-cyan-400" />;
    case "restaurant":
      return <Utensils className="h-4 w-4 text-orange-400" />;
    case "hotel":
      return <Hotel className="h-4 w-4 text-violet-400" />;
    case "transport":
      return <Navigation className="h-4 w-4 text-green-400" />;
    default:
      return <MapPin className="h-4 w-4 text-slate-400" />;
  }
}

/**
 * 单个行程项目组件
 */
function ItineraryItemCard({
  item,
  onRemove,
  onSelect,
}: {
  item: ItineraryItem;
  onRemove: () => void;
  onSelect?: () => void;
}) {
  const name =
    item.attraction?.name ??
    item.restaurant?.name ??
    item.hotel?.name ??
    "未命名";

  const address =
    item.attraction?.address ??
    item.restaurant?.address ??
    item.hotel?.address;

  // 获取图片 URL
  const imageUrl = item.attraction?.imageUrl ?? item.hotel?.imageUrl;

  return (
    <div
      className="group flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      {/* 景点图片 */}
      {imageUrl ? (
        <div className="flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-slate-700">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // 图片加载失败时隐藏
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <>
          {/* 拖拽手柄 */}
          <div className="flex-shrink-0 pt-1 opacity-0 group-hover:opacity-50 cursor-grab">
            <GripVertical className="h-4 w-4 text-slate-500" />
          </div>

          {/* 图标 */}
          <div className="flex-shrink-0 pt-1">
            <ItemIcon type={item.type} />
          </div>
        </>
      )}

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {imageUrl && (
            <div className="flex-shrink-0">
              <ItemIcon type={item.type} />
            </div>
          )}
          <span className="font-medium text-slate-100 truncate">{name}</span>
          {item.cost > 0 && (
            <span className="flex-shrink-0 text-xs text-amber-400">
              ¥{item.cost}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {item.startTime} - {item.endTime}
          </span>
          {address && (
            <span className="truncate">{address}</span>
          )}
        </div>
        {item.note && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.note}</p>
        )}
      </div>

      {/* 删除按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 h-10 w-10 min-w-10 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer rounded-full"
        title="删除此项"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
}

/**
 * 单日行程组件
 */
function DayCard({
  day,
  dayIndex,
  onRemoveItem,
  onSelectAttraction,
}: {
  day: ItineraryDay;
  dayIndex: number;
  onRemoveItem: (itemId: string) => void;
  onSelectAttraction?: (item: ItineraryItem) => void;
}) {
  return (
    <Card className="p-4 bg-slate-900/50 border-slate-700">
      {/* 日期头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500">
            <span className="text-xs text-white/80">DAY</span>
            <span className="text-lg font-bold text-white">{dayIndex + 1}</span>
          </div>
          <div>
            <div className="font-medium text-slate-100">
              {day.date} {day.dayOfWeek}
            </div>
            {day.weather && (
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <WeatherIcon weather={day.weather} />
                <span>{day.weather.description}</span>
                <span>
                  {day.weather.minTemp}~{day.weather.maxTemp}°C
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">当日花费</div>
          <div className="text-lg font-semibold text-amber-400">
            ¥{day.dailyCost}
          </div>
        </div>
      </div>

      {/* 行程列表 */}
      <div className="space-y-2">
        {day.items.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            暂无行程安排，点击地图上的景点添加
          </div>
        ) : (
          day.items.map((item) => (
            <ItineraryItemCard
              key={item.id}
              item={item}
              onRemove={() => onRemoveItem(item.id)}
              onSelect={() => onSelectAttraction?.(item)}
            />
          ))
        )}
      </div>
    </Card>
  );
}

/**
 * 行程列表组件
 */
export function ItineraryList({
  itinerary,
  onRemoveItem,
  onSelectAttraction,
}: ItineraryListProps) {
  if (itinerary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <MapPin className="h-12 w-12 mb-4 opacity-50" />
        <p>暂无行程安排</p>
        <p className="text-sm">填写表单后点击"生成智能行程"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {itinerary.map((day, index) => (
        <DayCard
          key={day.date}
          day={day}
          dayIndex={index}
          onRemoveItem={(itemId) => onRemoveItem(index, itemId)}
          onSelectAttraction={onSelectAttraction}
        />
      ))}
    </div>
  );
}

