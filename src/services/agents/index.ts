/**
 * Agents 模块入口
 * 导出所有 Agent 及其相关类型
 */

export { BaseAgent, type AgentResult } from "./baseAgent";

export {
  AttractionSearchAgent,
  attractionAgent,
  type AttractionSearchInput,
  type AttractionSearchOutput,
} from "./attractionAgent";

export {
  WeatherQueryAgent,
  weatherAgent,
  type WeatherQueryInput,
  type WeatherQueryOutput,
} from "./weatherAgent";

export {
  HotelAgent,
  hotelAgent,
  type HotelSearchInput,
  type HotelSearchOutput,
} from "./hotelAgent";

export {
  PlannerAgent,
  plannerAgent,
  type PlannerInput,
  type PlannerOutput,
} from "./plannerAgent";

