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
  X,
  ZoomIn,
  ExternalLink,
} from "lucide-react";
import type { ItineraryDay, ItineraryItem, WeatherInfo, ImageAttribution } from "@/types/travel";

/** 预览图片信息 */
interface PreviewImage {
  url: string;
  name: string;
  attribution?: ImageAttribution;
}

interface ItineraryListProps {
  itinerary: ItineraryDay[];
  onRemoveItem: (dayIndex: number, itemId: string) => void;
  onSelectAttraction?: (item: ItineraryItem) => void;
}

/**
 * 图片预览模态框
 */
function ImagePreviewModal({
  image,
  onClose,
}: {
  image: PreviewImage;
  onClose: () => void;
}) {
  // 按 ESC 键关闭
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 阻止背景滚动
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 h-10 w-10 p-0 text-white/80 hover:text-white hover:bg-white/10 rounded-full z-10"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* 图片容器 */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 景点名称 */}
        <div className="text-center mb-3">
          <h3 className="text-lg font-medium text-white">{image.name}</h3>
        </div>

        {/* 图片 */}
        <div className="relative rounded-lg overflow-hidden shadow-2xl">
          <img
            src={image.url}
            alt={image.name}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* 归属信息 */}
        {image.attribution && (
          <div className="mt-3 flex items-center justify-center gap-4 text-sm text-white/80">
            <span>
              Photo by{" "}
              <a
                href={`${image.attribution.photographerUrl}?utm_source=ai_agent_hub&utm_medium=referral`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1"
              >
                {image.attribution.photographer}
                <ExternalLink className="h-3 w-3" />
              </a>
            </span>
            <span>on</span>
            <a
              href={`${image.attribution.sourceUrl}?utm_source=ai_agent_hub&utm_medium=referral`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1"
            >
              {image.attribution.source}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* 提示文字 */}
        <p className="mt-2 text-center text-xs text-white/50">
          按 ESC 或点击空白处关闭
        </p>
      </div>
    </div>
  );
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
 * 图片归属组件（Unsplash 要求）
 */
function PhotoAttribution({ attribution }: { attribution?: ImageAttribution }) {
  if (!attribution) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 bg-black/60 text-[9px] text-white/80 truncate">
      Photo by{" "}
      <a
        href={`${attribution.photographerUrl}?utm_source=ai_agent_hub&utm_medium=referral`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {attribution.photographer}
      </a>
      {" on "}
      <a
        href={`${attribution.sourceUrl}?utm_source=ai_agent_hub&utm_medium=referral`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {attribution.source}
      </a>
    </div>
  );
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
  onPreviewImage,
}: {
  item: ItineraryItem;
  onRemove: () => void;
  onSelect?: () => void;
  onPreviewImage?: (image: PreviewImage) => void;
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

  // 获取图片 URL 和归属信息
  const imageUrl = item.attraction?.imageUrl ?? item.hotel?.imageUrl;
  const imageAttribution = item.attraction?.imageAttribution;

  // 处理图片点击预览
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imageUrl && onPreviewImage) {
      onPreviewImage({
        url: imageUrl,
        name,
        attribution: imageAttribution,
      });
    }
  };

  return (
    <div
      className="group flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      {/* 景点图片（含 Unsplash 归属信息） */}
      {imageUrl ? (
        <div
          className="relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-slate-700 group/image cursor-zoom-in"
          onClick={handleImageClick}
          title="点击预览大图"
        >
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform group-hover/image:scale-105"
            loading="lazy"
            onError={(e) => {
              // 图片加载失败时隐藏
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {/* 放大图标提示 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/image:bg-black/30 transition-colors">
            <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover/image:opacity-100 transition-opacity" />
          </div>
          {/* Unsplash 归属标注 */}
          <PhotoAttribution attribution={imageAttribution} />
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
  onPreviewImage,
}: {
  day: ItineraryDay;
  dayIndex: number;
  onRemoveItem: (itemId: string) => void;
  onSelectAttraction?: (item: ItineraryItem) => void;
  onPreviewImage?: (image: PreviewImage) => void;
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
              onPreviewImage={onPreviewImage}
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
  // 图片预览状态
  const [previewImage, setPreviewImage] = React.useState<PreviewImage | null>(null);

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
    <>
      <div className="space-y-4">
        {itinerary.map((day, index) => (
          <DayCard
            key={day.date}
            day={day}
            dayIndex={index}
            onRemoveItem={(itemId) => onRemoveItem(index, itemId)}
            onSelectAttraction={onSelectAttraction}
            onPreviewImage={setPreviewImage}
          />
        ))}
      </div>

      {/* 图片预览模态框 */}
      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
}

