"use client";

import React from "react";
import type {
  TravelRequest,
  TravelPlan,
  TravelPlanResponse,
  ItineraryDay,
  ItineraryItem,
  ImageAttribution,
} from "@/types/travel";

/** 图片 API 响应数据 */
interface ImageData {
  url: string;
  photographer: string;
  photographerUrl: string;
}

/** Hook 状态 */
interface TravelPlanState {
  /** 当前行程计划 */
  plan: TravelPlan | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 是否正在加载图片 */
  loadingImages: boolean;
  /** 错误信息 */
  error: string | null;
  /** 处理耗时 */
  duration: number | null;
}

/** Hook 返回值 */
interface UseTravelPlanReturn extends TravelPlanState {
  /** 生成行程计划 */
  generatePlan: (request: TravelRequest) => Promise<void>;
  /** 清空行程计划 */
  clearPlan: () => void;
  /** 更新行程（添加/删除/修改项目） */
  updateItinerary: (dayIndex: number, items: ItineraryItem[]) => void;
  /** 交换两天的行程 */
  swapDays: (fromIndex: number, toIndex: number) => void;
  /** 删除某一天 */
  removeDay: (dayIndex: number) => void;
  /** 添加景点到某一天 */
  addItemToDay: (dayIndex: number, item: ItineraryItem) => void;
  /** 从某一天删除项目 */
  removeItemFromDay: (dayIndex: number, itemId: string) => void;
}

/**
 * 旅行规划 Hook
 * 管理行程计划的获取和编辑
 */
export function useTravelPlan(): UseTravelPlanReturn {
  const [state, setState] = React.useState<TravelPlanState>({
    plan: null,
    loading: false,
    loadingImages: false,
    error: null,
    duration: null,
  });

  /**
   * 异步获取景点图片
   */
  const fetchAttractionImages = React.useCallback(
    async (plan: TravelPlan) => {
      // 收集所有景点
      const attractions: Array<{ id: string; name: string }> = [];
      
      for (const day of plan.itinerary) {
        for (const item of day.items) {
          if (item.attraction && !item.attraction.imageUrl) {
            attractions.push({
              id: item.attraction.id,
              name: item.attraction.name,
            });
          }
        }
      }

      if (attractions.length === 0) {
        console.log("[useTravelPlan] 没有需要获取图片的景点");
        return;
      }

      console.log(`[useTravelPlan] 开始获取 ${attractions.length} 个景点的图片`);
      setState((prev) => ({ ...prev, loadingImages: true }));

      try {
        const response = await fetch("/api/travel/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attractions,
            city: plan.destination,
          }),
        });

        const data: { images: Record<string, ImageData> } = await response.json();
        const imageMap = new Map(Object.entries(data.images ?? {}));

        console.log(`[useTravelPlan] 获取到 ${imageMap.size} 张图片`);

        // 更新计划中的图片（包含归属信息）
        setState((prev) => {
          if (!prev.plan) return { ...prev, loadingImages: false };

          const newItinerary = prev.plan.itinerary.map((day) => ({
            ...day,
            items: day.items.map((item) => {
              if (item.attraction && imageMap.has(item.attraction.id)) {
                const imageData = imageMap.get(item.attraction.id)!;
                // 构建归属信息
                const attribution: ImageAttribution = {
                  photographer: imageData.photographer,
                  photographerUrl: imageData.photographerUrl,
                  source: "Unsplash",
                  sourceUrl: "https://unsplash.com",
                };
                return {
                  ...item,
                  attraction: {
                    ...item.attraction,
                    imageUrl: imageData.url,
                    imageAttribution: attribution,
                  },
                };
              }
              return item;
            }),
          }));

          return {
            ...prev,
            loadingImages: false,
            plan: {
              ...prev.plan,
              itinerary: newItinerary,
            },
          };
        });
      } catch (error) {
        console.error("[useTravelPlan] 获取图片失败:", error);
        setState((prev) => ({ ...prev, loadingImages: false }));
      }
    },
    []
  );

  /**
   * 生成行程计划
   */
  const generatePlan = React.useCallback(async (request: TravelRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch("/api/travel/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data: TravelPlanResponse = await response.json();

      if (!data.success || !data.plan) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: data.error ?? "生成行程失败",
          duration: data.duration ?? null,
        }));
        return;
      }

      // 先设置计划（不等待图片）
      setState({
        plan: data.plan,
        loading: false,
        loadingImages: false,
        error: null,
        duration: data.duration ?? null,
      });

      // 异步获取图片（不阻塞主流程）
      fetchAttractionImages(data.plan);
    } catch (error) {
      const message = error instanceof Error ? error.message : "网络错误";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, [fetchAttractionImages]);

  /**
   * 清空行程计划
   */
  const clearPlan = React.useCallback(() => {
    setState({
      plan: null,
      loading: false,
      loadingImages: false,
      error: null,
      duration: null,
    });
  }, []);

  /**
   * 更新行程（替换某一天的全部项目）
   */
  const updateItinerary = React.useCallback(
    (dayIndex: number, items: ItineraryItem[]) => {
      setState((prev) => {
        if (!prev.plan) return prev;

        const newItinerary = [...prev.plan.itinerary];
        if (dayIndex < 0 || dayIndex >= newItinerary.length) return prev;

        const dailyCost = items.reduce((sum, item) => sum + item.cost, 0);
        newItinerary[dayIndex] = {
          ...newItinerary[dayIndex],
          items,
          dailyCost,
        };

        return {
          ...prev,
          plan: {
            ...prev.plan,
            itinerary: newItinerary,
            budget: recalculateBudget(newItinerary, prev.plan),
            updatedAt: Date.now(),
          },
        };
      });
    },
    []
  );

  /**
   * 交换两天的行程
   */
  const swapDays = React.useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      if (!prev.plan) return prev;

      const newItinerary = [...prev.plan.itinerary];
      if (
        fromIndex < 0 ||
        fromIndex >= newItinerary.length ||
        toIndex < 0 ||
        toIndex >= newItinerary.length
      ) {
        return prev;
      }

      // 交换行程项目，但保持日期不变
      const fromItems = newItinerary[fromIndex].items;
      const toItems = newItinerary[toIndex].items;

      newItinerary[fromIndex] = {
        ...newItinerary[fromIndex],
        items: toItems,
        dailyCost: toItems.reduce((sum, item) => sum + item.cost, 0),
      };
      newItinerary[toIndex] = {
        ...newItinerary[toIndex],
        items: fromItems,
        dailyCost: fromItems.reduce((sum, item) => sum + item.cost, 0),
      };

      return {
        ...prev,
        plan: {
          ...prev.plan,
          itinerary: newItinerary,
          updatedAt: Date.now(),
        },
      };
    });
  }, []);

  /**
   * 删除某一天
   */
  const removeDay = React.useCallback((dayIndex: number) => {
    setState((prev) => {
      if (!prev.plan) return prev;

      const newItinerary = prev.plan.itinerary.filter((_, i) => i !== dayIndex);

      return {
        ...prev,
        plan: {
          ...prev.plan,
          itinerary: newItinerary,
          budget: recalculateBudget(newItinerary, prev.plan),
          updatedAt: Date.now(),
        },
      };
    });
  }, []);

  /**
   * 添加项目到某一天
   */
  const addItemToDay = React.useCallback(
    (dayIndex: number, item: ItineraryItem) => {
      setState((prev) => {
        if (!prev.plan) return prev;

        const newItinerary = [...prev.plan.itinerary];
        if (dayIndex < 0 || dayIndex >= newItinerary.length) return prev;

        const newItems = [...newItinerary[dayIndex].items, item];
        const dailyCost = newItems.reduce((sum, i) => sum + i.cost, 0);

        newItinerary[dayIndex] = {
          ...newItinerary[dayIndex],
          items: newItems,
          dailyCost,
        };

        return {
          ...prev,
          plan: {
            ...prev.plan,
            itinerary: newItinerary,
            budget: recalculateBudget(newItinerary, prev.plan),
            updatedAt: Date.now(),
          },
        };
      });
    },
    []
  );

  /**
   * 从某一天删除项目
   */
  const removeItemFromDay = React.useCallback(
    (dayIndex: number, itemId: string) => {
      setState((prev) => {
        if (!prev.plan) return prev;

        const newItinerary = [...prev.plan.itinerary];
        if (dayIndex < 0 || dayIndex >= newItinerary.length) return prev;

        const newItems = newItinerary[dayIndex].items.filter(
          (item) => item.id !== itemId
        );
        const dailyCost = newItems.reduce((sum, item) => sum + item.cost, 0);

        newItinerary[dayIndex] = {
          ...newItinerary[dayIndex],
          items: newItems,
          dailyCost,
        };

        return {
          ...prev,
          plan: {
            ...prev.plan,
            itinerary: newItinerary,
            budget: recalculateBudget(newItinerary, prev.plan),
            updatedAt: Date.now(),
          },
        };
      });
    },
    []
  );

  return {
    ...state,
    generatePlan,
    clearPlan,
    updateItinerary,
    swapDays,
    removeDay,
    addItemToDay,
    removeItemFromDay,
  };
}

/**
 * 重新计算预算
 */
function recalculateBudget(
  itinerary: ItineraryDay[],
  plan: TravelPlan
): TravelPlan["budget"] {
  let attractions = 0;
  let meals = 0;

  for (const day of itinerary) {
    for (const item of day.items) {
      if (item.type === "attraction") {
        attractions += item.cost;
      } else if (item.type === "restaurant") {
        meals += item.cost;
      }
    }
  }

  const nights = Math.max(0, itinerary.length - 1);
  const hotelPerNight = plan.hotels[0]?.pricePerNight ?? 300;
  const hotels = nights * hotelPerNight;

  const transport = itinerary.length * 100 * plan.travelers;
  const others = Math.round((attractions + meals + hotels + transport) * 0.1);
  const total = attractions + hotels + meals + transport + others;

  return {
    attractions,
    hotels,
    meals,
    transport,
    others,
    total,
  };
}

