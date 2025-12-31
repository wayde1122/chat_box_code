"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { useAMap } from "@/hooks/useAMap";
import { Loader2, MapPin, AlertCircle, Navigation, ZoomOut } from "lucide-react";
import type { Attraction } from "@/types/travel";

interface AMapContainerProps {
  attractions?: Attraction[];
  className?: string;
}

/**
 * 高德地图容器组件
 * 支持地图显示失败时的降级显示
 */
export function AMapContainer({ attractions, className = "" }: AMapContainerProps) {
  const { containerRef, loaded, error, markAttractions, resize, fitView } = useAMap();

  // 当景点数据变化时更新标注
  React.useEffect(() => {
    if (loaded && attractions && attractions.length > 0) {
      // 延迟标注确保地图完全加载
      const timer = setTimeout(() => {
        markAttractions(attractions);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [loaded, attractions, markAttractions]);

  // 组件挂载后触发 resize
  React.useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => {
        resize();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loaded, resize]);

  // 如果地图加载失败，显示景点列表作为降级方案
  if (error) {
    return (
      <Card className={`relative overflow-hidden bg-slate-900/50 border-slate-700 ${className}`}>
        <div className="p-4 h-full">
          <div className="flex items-center gap-2 mb-4 text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">地图加载失败，显示景点列表</span>
          </div>
          
          {attractions && attractions.length > 0 ? (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {attractions.map((attraction, index) => (
                <div
                  key={attraction.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-100 truncate">
                      {attraction.name}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {attraction.address}
                    </div>
                    {attraction.ticketPrice > 0 && (
                      <div className="text-xs text-amber-400 mt-1">
                        门票 ¥{attraction.ticketPrice}
                      </div>
                    )}
                  </div>
                  <a
                    href={`https://uri.amap.com/marker?position=${attraction.location.longitude},${attraction.location.latitude}&name=${encodeURIComponent(attraction.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 text-xs text-cyan-400 hover:text-cyan-300 rounded bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                  >
                    <Navigation className="h-3 w-3" />
                    导航
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <MapPin className="h-10 w-10 mb-2 opacity-50" />
              <span className="text-sm">暂无景点数据</span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden bg-slate-900/50 border-slate-700 ${className}`} style={{ minHeight: "400px" }}>
      {/* 地图容器 */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ 
          background: "#1e293b",
          height: "100%",
          minHeight: "400px",
        }}
      />

      {/* 加载状态 */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-3" />
          <span className="text-sm text-slate-400">加载地图中...</span>
        </div>
      )}

      {/* 空状态 */}
      {loaded && (!attractions || attractions.length === 0) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 pointer-events-none z-10">
          <MapPin className="h-12 w-12 text-slate-600 mb-3" />
          <span className="text-sm text-slate-500">生成行程后显示地图标注</span>
        </div>
      )}

      {/* 地图控制按钮 */}
      {loaded && attractions && attractions.length > 0 && (
        <>
          {/* 重置视图按钮 */}
          <button
            onClick={() => fitView()}
            className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shadow-lg"
            title="显示所有景点"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          {/* 景点数量提示 */}
          <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-slate-900/90 text-xs text-slate-300 shadow-lg">
            <MapPin className="inline h-3 w-3 mr-1.5 text-cyan-400" />
            已标注 <span className="font-medium text-cyan-400">{attractions.length}</span> 个景点
          </div>

          {/* 图例说明 */}
          <div className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-slate-900/90 text-xs text-slate-400 shadow-lg">
            点击标注查看详情
          </div>
        </>
      )}
    </Card>
  );
}
