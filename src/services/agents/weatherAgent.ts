/**
 * 天气查询 Agent
 * 负责查询目的地天气预报
 */

import { BaseAgent } from "./baseAgent";
import { amapClient } from "../mcp/amapClient";
import type { WeatherInfo } from "@/types/travel";

/** 天气查询输入参数 */
export interface WeatherQueryInput {
  /** 目的地城市 */
  city: string;
  /** 开始日期 YYYY-MM-DD */
  startDate: string;
  /** 结束日期 YYYY-MM-DD */
  endDate: string;
}

/** 天气查询输出结果 */
export interface WeatherQueryOutput {
  weather: WeatherInfo[];
}

/**
 * 天气查询专家 Agent
 */
export class WeatherQueryAgent extends BaseAgent<
  WeatherQueryInput,
  WeatherQueryOutput
> {
  readonly name = "WeatherQueryAgent";
  readonly description = "天气查询专家，专注于查询目的地的天气预报信息";

  protected async run(input: WeatherQueryInput): Promise<WeatherQueryOutput> {
    const { city, startDate, endDate } = input;

    console.log(`[${this.name}] 查询 ${city} 从 ${startDate} 到 ${endDate} 的天气`);

    // 调用高德 MCP 查询天气
    const weatherData = await amapClient.queryWeather(city);

    if (weatherData.length === 0) {
      console.log(`[${this.name}] 未获取到天气数据，使用模拟数据`);
      return { weather: this.generateMockWeather(startDate, endDate) };
    }

    // 过滤出用户需要的日期范围
    const filteredWeather = this.filterByDateRange(weatherData, startDate, endDate);

    // 如果过滤后数据不足，补充模拟数据
    if (filteredWeather.length === 0) {
      return { weather: this.generateMockWeather(startDate, endDate) };
    }

    return { weather: filteredWeather };
  }

  /**
   * 根据日期范围过滤天气数据
   */
  private filterByDateRange(
    weather: WeatherInfo[],
    startDate: string,
    endDate: string
  ): WeatherInfo[] {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return weather.filter((w) => {
      const date = new Date(w.date).getTime();
      return date >= start && date <= end;
    });
  }

  /**
   * 生成模拟天气数据
   * 当无法获取真实天气时使用
   */
  private generateMockWeather(startDate: string, endDate: string): WeatherInfo[] {
    const weather: WeatherInfo[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const weatherTypes = [
      { description: "晴", suggestion: "天气晴朗，适合户外活动" },
      { description: "多云", suggestion: "多云天气，温度适宜" },
      { description: "阴", suggestion: "阴天，建议携带薄外套" },
      { description: "小雨", suggestion: "有小雨，请携带雨伞" },
    ];

    let current = new Date(start);
    while (current <= end) {
      const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      const baseTemp = 15 + Math.floor(Math.random() * 15); // 15-30度

      weather.push({
        date: current.toISOString().split("T")[0],
        description: randomWeather.description,
        maxTemp: baseTemp + 5,
        minTemp: baseTemp - 5,
        suggestion: randomWeather.suggestion,
      });

      current.setDate(current.getDate() + 1);
    }

    return weather;
  }
}

// 导出单例实例
export const weatherAgent = new WeatherQueryAgent();

