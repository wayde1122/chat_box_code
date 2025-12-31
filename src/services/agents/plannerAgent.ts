/**
 * 行程规划 Agent
 * 负责整合其他 Agent 的结果并调用 LLM 生成完整行程
 */

import { BaseAgent } from "./baseAgent";
import { attractionAgent, type AttractionSearchOutput } from "./attractionAgent";
import { weatherAgent, type WeatherQueryOutput } from "./weatherAgent";
import { hotelAgent, type HotelSearchOutput } from "./hotelAgent";
import { llmService } from "../llmService";
import type {
  TravelRequest,
  TravelPlan,
  ItineraryDay,
  ItineraryItem,
  BudgetBreakdown,
  Attraction,
  Hotel,
  WeatherInfo,
} from "@/types/travel";

/** 行程规划输入参数 */
export interface PlannerInput {
  request: TravelRequest;
}

/** 行程规划输出结果 */
export interface PlannerOutput {
  plan: TravelPlan;
}

/** Agent 查询结果汇总 */
interface AgentResults {
  attractions: AttractionSearchOutput;
  weather: WeatherQueryOutput;
  hotels: HotelSearchOutput;
}

/**
 * 行程规划专家 Agent
 * 整合景点、天气、酒店信息，调用 LLM 生成完整旅行计划
 */
export class PlannerAgent extends BaseAgent<PlannerInput, PlannerOutput> {
  readonly name = "PlannerAgent";
  readonly description = "行程规划专家，整合所有信息生成完整的旅行计划";

  protected async run(input: PlannerInput): Promise<PlannerOutput> {
    const { request } = input;
    
    console.log(`[${this.name}] 开始规划 ${request.destination} 行程`);

    // 1. 并行调用三个 Agent 获取数据
    const agentResults = await this.queryAgents(request);

    // 2. 调用 LLM 生成行程安排
    const itinerary = await this.generateItinerary(request, agentResults);

    // 3. 计算预算
    const budget = this.calculateBudget(
      itinerary,
      agentResults.hotels.hotels,
      request.travelers
    );

    // 4. 构建完整计划
    const plan: TravelPlan = {
      id: crypto.randomUUID(),
      destination: request.destination,
      startDate: request.startDate,
      endDate: request.endDate,
      travelers: request.travelers,
      itinerary,
      hotels: agentResults.hotels.hotels,
      budget,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return { plan };
  }

  /**
   * 并行调用三个 Agent 获取数据
   */
  private async queryAgents(request: TravelRequest): Promise<AgentResults> {
    console.log(`[${this.name}] 并行查询 Agents...`);

    const [attractionResult, weatherResult, hotelResult] = await Promise.all([
      attractionAgent.execute({
        city: request.destination,
        preferences: request.preferences,
        limit: 15,
      }),
      weatherAgent.execute({
        city: request.destination,
        startDate: request.startDate,
        endDate: request.endDate,
      }),
      hotelAgent.execute({
        city: request.destination,
        budgetLevel: request.budgetLevel,
        checkInDate: request.startDate,
        checkOutDate: request.endDate,
        limit: 5,
      }),
    ]);

    return {
      attractions: attractionResult.data ?? { attractions: [] },
      weather: weatherResult.data ?? { weather: [] },
      hotels: hotelResult.data ?? { hotels: [] },
    };
  }

  /**
   * 调用 LLM 生成行程安排
   */
  private async generateItinerary(
    request: TravelRequest,
    results: AgentResults
  ): Promise<ItineraryDay[]> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(request, results);

    console.log(`[${this.name}] 调用 LLM 生成行程...`);

    try {
      const llmResponse = await llmService.generate(userPrompt, systemPrompt);
      const parsedItinerary = this.parseItineraryFromLLM(
        llmResponse,
        request,
        results
      );
      return parsedItinerary;
    } catch (error) {
      console.error(`[${this.name}] LLM 调用失败，使用默认行程:`, error);
      return this.generateDefaultItinerary(request, results);
    }
  }

  /**
   * 构建系统提示
   */
  private buildSystemPrompt(): string {
    return `你是一个专业的旅行规划师。你的任务是根据用户的需求、景点信息、天气预报和酒店信息，生成一个详细的每日行程安排。

请严格按照以下 JSON 格式输出行程（不要输出其他内容）：
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "items": [
        {
          "type": "attraction",
          "attractionIndex": 0,
          "startTime": "09:00",
          "endTime": "11:00",
          "note": "游玩建议"
        },
        {
          "type": "restaurant",
          "name": "餐厅名称",
          "startTime": "12:00",
          "endTime": "13:00",
          "cost": 100
        }
      ]
    }
  ]
}

注意事项：
1. attractionIndex 是景点在提供列表中的索引（从0开始）
2. 每天安排 2-3 个景点，合理安排用餐时间
3. 考虑天气因素，雨天优先安排室内景点
4. 时间安排要合理，留出交通和休息时间
5. 只输出 JSON，不要有其他文字`;
  }

  /**
   * 构建用户提示
   */
  private buildUserPrompt(
    request: TravelRequest,
    results: AgentResults
  ): string {
    const { attractions } = results.attractions;
    const { weather } = results.weather;
    const { hotels } = results.hotels;

    const attractionList = attractions
      .map((a, i) => `${i}. ${a.name}（${a.type}）- 门票¥${a.ticketPrice}，建议游玩${a.duration}小时`)
      .join("\n");

    const weatherList = weather
      .map((w) => `${w.date}: ${w.description}，${w.minTemp}~${w.maxTemp}°C`)
      .join("\n");

    const hotelInfo = hotels[0]
      ? `推荐酒店：${hotels[0].name}，¥${hotels[0].pricePerNight}/晚`
      : "暂无推荐酒店";

    return `请为以下旅行需求规划详细行程：

【基本信息】
- 目的地：${request.destination}
- 日期：${request.startDate} 至 ${request.endDate}
- 人数：${request.travelers} 人
- 偏好：${request.preferences.join("、")}
- 预算级别：${request.budgetLevel}

【可选景点】
${attractionList}

【天气预报】
${weatherList}

【住宿信息】
${hotelInfo}

请生成每日详细行程安排（JSON格式）：`;
  }

  /**
   * 解析 LLM 输出的行程
   */
  private parseItineraryFromLLM(
    llmResponse: string,
    request: TravelRequest,
    results: AgentResults
  ): ItineraryDay[] {
    try {
      // 提取 JSON 内容
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("未找到 JSON 内容");
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        days: Array<{
          date: string;
          items: Array<{
            type: string;
            attractionIndex?: number;
            name?: string;
            startTime: string;
            endTime: string;
            note?: string;
            cost?: number;
          }>;
        }>;
      };

      const { attractions } = results.attractions;
      const { weather } = results.weather;

      return parsed.days.map((day) => {
        const dayWeather = weather.find((w) => w.date === day.date);
        
        const items: ItineraryItem[] = day.items.map((item) => {
          const baseItem: ItineraryItem = {
            id: crypto.randomUUID(),
            type: item.type as ItineraryItem["type"],
            startTime: item.startTime,
            endTime: item.endTime,
            note: item.note,
            cost: item.cost ?? 0,
          };

          if (item.type === "attraction" && item.attractionIndex !== undefined) {
            const attraction = attractions[item.attractionIndex];
            if (attraction) {
              baseItem.attraction = attraction;
              baseItem.cost = attraction.ticketPrice * request.travelers;
            }
          }

          if (item.type === "restaurant") {
            baseItem.restaurant = {
              id: crypto.randomUUID(),
              name: item.name ?? "当地餐厅",
              address: request.destination,
              location: { longitude: 0, latitude: 0 },
              avgPrice: item.cost ?? 80,
              cuisine: "当地美食",
            };
            baseItem.cost = (item.cost ?? 80) * request.travelers;
          }

          return baseItem;
        });

        const dailyCost = items.reduce((sum, item) => sum + item.cost, 0);

        return {
          date: day.date,
          dayOfWeek: this.getDayOfWeek(day.date),
          weather: dayWeather,
          items,
          dailyCost,
        };
      });
    } catch (error) {
      console.error(`[${this.name}] 解析 LLM 输出失败:`, error);
      return this.generateDefaultItinerary(request, results);
    }
  }

  /**
   * 生成默认行程（当 LLM 解析失败时使用）
   */
  private generateDefaultItinerary(
    request: TravelRequest,
    results: AgentResults
  ): ItineraryDay[] {
    const { attractions } = results.attractions;
    const { weather } = results.weather;
    const days: ItineraryDay[] = [];

    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    let attractionIndex = 0;

    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const dayWeather = weather.find((w) => w.date === dateStr);
      const items: ItineraryItem[] = [];

      // 每天安排 2-3 个景点
      const attractionsPerDay = Math.min(3, attractions.length - attractionIndex);
      for (let i = 0; i < attractionsPerDay; i++) {
        const attraction = attractions[attractionIndex];
        if (!attraction) break;

        const startHour = 9 + i * 3;
        items.push({
          id: crypto.randomUUID(),
          type: "attraction",
          startTime: `${startHour.toString().padStart(2, "0")}:00`,
          endTime: `${(startHour + 2).toString().padStart(2, "0")}:00`,
          attraction,
          cost: attraction.ticketPrice * request.travelers,
        });

        attractionIndex++;
      }

      // 添加午餐
      items.push({
        id: crypto.randomUUID(),
        type: "restaurant",
        startTime: "12:00",
        endTime: "13:00",
        restaurant: {
          id: crypto.randomUUID(),
          name: "当地特色餐厅",
          address: request.destination,
          location: { longitude: 0, latitude: 0 },
          avgPrice: 80,
          cuisine: "当地美食",
        },
        cost: 80 * request.travelers,
      });

      const dailyCost = items.reduce((sum, item) => sum + item.cost, 0);

      days.push({
        date: dateStr,
        dayOfWeek: this.getDayOfWeek(dateStr),
        weather: dayWeather,
        items,
        dailyCost,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  /**
   * 计算预算明细
   */
  private calculateBudget(
    itinerary: ItineraryDay[],
    hotels: Hotel[],
    travelers: number
  ): BudgetBreakdown {
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

    // 酒店费用（住宿天数 = 行程天数 - 1）
    const nights = Math.max(0, itinerary.length - 1);
    const hotelPerNight = hotels[0]?.pricePerNight ?? 300;
    const hotelsCost = nights * hotelPerNight;

    // 交通费用估算
    const transport = itinerary.length * 100 * travelers;

    // 其他费用
    const others = Math.round((attractions + meals + hotelsCost + transport) * 0.1);

    const total = attractions + hotelsCost + meals + transport + others;

    return {
      attractions,
      hotels: hotelsCost,
      meals,
      transport,
      others,
      total,
    };
  }

  /**
   * 获取星期几
   */
  private getDayOfWeek(dateStr: string): string {
    const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const date = new Date(dateStr);
    return days[date.getDay()];
  }
}

// 导出单例实例
export const plannerAgent = new PlannerAgent();

