/**
 * 景点搜索 Agent
 * 负责根据用户偏好搜索景点信息
 * 
 * 注意：图片获取已移至前端，在计划生成后异步加载
 */

import { BaseAgent, type AgentResult } from "./baseAgent";
import { amapClient } from "../mcp/amapClient";
import type { Attraction, TravelPreference } from "@/types/travel";

/** 景点搜索输入参数 */
export interface AttractionSearchInput {
  /** 目的地城市 */
  city: string;
  /** 用户偏好 */
  preferences: TravelPreference[];
  /** 返回数量限制 */
  limit?: number;
}

/** 景点搜索输出结果 */
export interface AttractionSearchOutput {
  attractions: Attraction[];
}

/** 偏好到搜索关键词的映射 */
const PREFERENCE_KEYWORDS: Record<TravelPreference, string[]> = {
  history: ["历史", "古迹", "博物馆", "故宫", "文化遗址"],
  nature: ["公园", "自然风光", "山", "湖", "森林"],
  food: ["美食街", "小吃", "特色餐厅"],
  shopping: ["商场", "购物中心", "步行街"],
  adventure: ["探险", "户外", "漂流", "攀岩"],
  relax: ["温泉", "度假村", "休闲"],
  family: ["游乐园", "动物园", "海洋馆", "儿童乐园"],
  romantic: ["浪漫", "夜景", "观景台"],
};

/**
 * 景点搜索专家 Agent
 */
export class AttractionSearchAgent extends BaseAgent<
  AttractionSearchInput,
  AttractionSearchOutput
> {
  readonly name = "AttractionSearchAgent";
  readonly description = "景点搜索专家，专注于搜索符合用户偏好的景点信息";

  protected async run(input: AttractionSearchInput): Promise<AttractionSearchOutput> {
    const { city, preferences, limit = 10 } = input;

    // 根据偏好生成搜索关键词
    const keywords = this.buildSearchKeywords(preferences);
    console.log(`[${this.name}] 搜索关键词: ${keywords}`);

    // 调用高德 MCP 搜索景点
    let attractions = await amapClient.searchAttractions(city, keywords, limit);

    if (attractions.length === 0) {
      console.log(`[${this.name}] 未找到景点，使用默认关键词重试`);
      // 使用默认关键词重试
      attractions = await amapClient.searchAttractions(
        city,
        "景点 旅游",
        limit
      );
    }

    console.log(`[${this.name}] 找到 ${attractions.length} 个景点`);
    return { attractions };
  }

  /**
   * 根据用户偏好构建搜索关键词
   */
  private buildSearchKeywords(preferences: TravelPreference[]): string {
    if (preferences.length === 0) {
      return "景点 旅游 必游";
    }

    const allKeywords: string[] = [];
    for (const pref of preferences) {
      const keywords = PREFERENCE_KEYWORDS[pref];
      if (keywords) {
        // 每个偏好取前两个关键词
        allKeywords.push(...keywords.slice(0, 2));
      }
    }

    // 去重并限制数量
    const uniqueKeywords = [...new Set(allKeywords)].slice(0, 5);
    return uniqueKeywords.join(" ");
  }
}

// 导出单例实例
export const attractionAgent = new AttractionSearchAgent();

