/**
 * 酒店推荐 Agent
 * 负责搜索符合用户预算的酒店
 */

import { BaseAgent } from "./baseAgent";
import { amapClient } from "../mcp/amapClient";
import type { Hotel, BudgetLevel } from "@/types/travel";

/** 酒店搜索输入参数 */
export interface HotelSearchInput {
  /** 目的地城市 */
  city: string;
  /** 预算级别 */
  budgetLevel: BudgetLevel;
  /** 入住日期 */
  checkInDate: string;
  /** 离店日期 */
  checkOutDate: string;
  /** 返回数量限制 */
  limit?: number;
}

/** 酒店搜索输出结果 */
export interface HotelSearchOutput {
  hotels: Hotel[];
}

/** 预算级别对应的搜索关键词和价格范围 */
const BUDGET_CONFIG: Record<BudgetLevel, { keywords: string; minPrice: number; maxPrice: number }> = {
  budget: {
    keywords: "经济型酒店 快捷酒店",
    minPrice: 100,
    maxPrice: 300,
  },
  moderate: {
    keywords: "商务酒店 精品酒店",
    minPrice: 300,
    maxPrice: 800,
  },
  luxury: {
    keywords: "豪华酒店 五星级酒店",
    minPrice: 800,
    maxPrice: 5000,
  },
};

/**
 * 酒店推荐专家 Agent
 */
export class HotelAgent extends BaseAgent<HotelSearchInput, HotelSearchOutput> {
  readonly name = "HotelAgent";
  readonly description = "酒店推荐专家，专注于搜索符合用户预算的酒店";

  protected async run(input: HotelSearchInput): Promise<HotelSearchOutput> {
    const { city, budgetLevel, limit = 5 } = input;

    const config = BUDGET_CONFIG[budgetLevel];
    console.log(`[${this.name}] 搜索 ${city} 的 ${budgetLevel} 级别酒店`);

    // 调用高德 MCP 搜索酒店
    const hotels = await amapClient.searchHotels(city, config.keywords, limit * 2);

    if (hotels.length === 0) {
      console.log(`[${this.name}] 未找到酒店，使用默认关键词重试`);
      const defaultHotels = await amapClient.searchHotels(city, "酒店", limit);
      return { hotels: this.filterAndSort(defaultHotels, config, limit) };
    }

    return { hotels: this.filterAndSort(hotels, config, limit) };
  }

  /**
   * 根据预算过滤并排序酒店
   */
  private filterAndSort(
    hotels: Hotel[],
    config: { minPrice: number; maxPrice: number },
    limit: number
  ): Hotel[] {
    // 过滤价格范围
    const filtered = hotels.filter(
      (hotel) =>
        hotel.pricePerNight >= config.minPrice &&
        hotel.pricePerNight <= config.maxPrice
    );

    // 如果过滤后没有酒店，使用原始列表并调整价格
    if (filtered.length === 0) {
      return hotels.slice(0, limit).map((hotel) => ({
        ...hotel,
        pricePerNight: this.estimatePrice(config),
      }));
    }

    // 按评分排序
    const sorted = filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return sorted.slice(0, limit);
  }

  /**
   * 估算价格（当真实价格不可用时）
   */
  private estimatePrice(config: { minPrice: number; maxPrice: number }): number {
    return Math.round((config.minPrice + config.maxPrice) / 2);
  }
}

// 导出单例实例
export const hotelAgent = new HotelAgent();

