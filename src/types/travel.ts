// 旅行规划相关类型定义

/** 用户偏好类型 */
export type TravelPreference =
  | "history"      // 历史文化
  | "nature"       // 自然风光
  | "food"         // 美食体验
  | "shopping"     // 购物娱乐
  | "adventure"    // 户外探险
  | "relax"        // 休闲度假
  | "family"       // 亲子游玩
  | "romantic";    // 浪漫之旅

/** 预算级别 */
export type BudgetLevel = "budget" | "moderate" | "luxury";

/** 旅行请求参数 */
export interface TravelRequest {
  /** 目的地城市 */
  destination: string;
  /** 开始日期 YYYY-MM-DD */
  startDate: string;
  /** 结束日期 YYYY-MM-DD */
  endDate: string;
  /** 用户偏好 */
  preferences: TravelPreference[];
  /** 预算级别 */
  budgetLevel: BudgetLevel;
  /** 预算金额（可选） */
  budgetAmount?: number;
  /** 出行人数 */
  travelers: number;
}

/** 地理位置坐标 */
export interface GeoLocation {
  longitude: number;
  latitude: number;
}

/** 景点信息 */
export interface Attraction {
  /** 景点ID */
  id: string;
  /** 景点名称 */
  name: string;
  /** 景点类型 */
  type: string;
  /** 景点地址 */
  address: string;
  /** 地理位置 */
  location: GeoLocation;
  /** 门票价格（元） */
  ticketPrice: number;
  /** 建议游玩时长（小时） */
  duration: number;
  /** 景点描述 */
  description: string;
  /** 景点图片URL */
  imageUrl?: string;
  /** 评分 */
  rating?: number;
  /** 开放时间 */
  openingHours?: string;
}

/** 酒店信息 */
export interface Hotel {
  /** 酒店ID */
  id: string;
  /** 酒店名称 */
  name: string;
  /** 酒店地址 */
  address: string;
  /** 地理位置 */
  location: GeoLocation;
  /** 每晚价格（元） */
  pricePerNight: number;
  /** 酒店评分 */
  rating: number;
  /** 酒店星级 */
  stars: number;
  /** 酒店图片URL */
  imageUrl?: string;
  /** 酒店设施 */
  facilities?: string[];
  /** 联系电话 */
  phone?: string;
}

/** 餐厅信息 */
export interface Restaurant {
  /** 餐厅ID */
  id: string;
  /** 餐厅名称 */
  name: string;
  /** 餐厅地址 */
  address: string;
  /** 地理位置 */
  location: GeoLocation;
  /** 人均消费（元） */
  avgPrice: number;
  /** 菜系类型 */
  cuisine: string;
  /** 评分 */
  rating?: number;
  /** 餐厅图片URL */
  imageUrl?: string;
}

/** 天气信息 */
export interface WeatherInfo {
  /** 日期 */
  date: string;
  /** 天气描述 */
  description: string;
  /** 天气图标代码 */
  icon?: string;
  /** 最高温度 */
  maxTemp: number;
  /** 最低温度 */
  minTemp: number;
  /** 降水概率 */
  precipitation?: number;
  /** 穿衣建议 */
  suggestion?: string;
}

/** 行程项目类型 */
export type ItineraryItemType = "attraction" | "hotel" | "restaurant" | "transport";

/** 单个行程项目 */
export interface ItineraryItem {
  /** 项目ID */
  id: string;
  /** 项目类型 */
  type: ItineraryItemType;
  /** 开始时间 HH:mm */
  startTime: string;
  /** 结束时间 HH:mm */
  endTime: string;
  /** 关联的景点/酒店/餐厅 */
  attraction?: Attraction;
  hotel?: Hotel;
  restaurant?: Restaurant;
  /** 备注 */
  note?: string;
  /** 费用 */
  cost: number;
}

/** 单日行程 */
export interface ItineraryDay {
  /** 日期 */
  date: string;
  /** 星期几 */
  dayOfWeek: string;
  /** 天气信息 */
  weather?: WeatherInfo;
  /** 当日行程项目 */
  items: ItineraryItem[];
  /** 当日总费用 */
  dailyCost: number;
}

/** 预算明细 */
export interface BudgetBreakdown {
  /** 门票费用 */
  attractions: number;
  /** 住宿费用 */
  hotels: number;
  /** 餐饮费用 */
  meals: number;
  /** 交通费用 */
  transport: number;
  /** 其他费用 */
  others: number;
  /** 总费用 */
  total: number;
}

/** 路线信息 */
export interface RouteInfo {
  /** 起点 */
  origin: GeoLocation;
  /** 终点 */
  destination: GeoLocation;
  /** 途经点 */
  waypoints: GeoLocation[];
  /** 总距离（公里） */
  distance: number;
  /** 预计时长（分钟） */
  duration: number;
  /** 路线坐标点 */
  polyline?: GeoLocation[];
}

/** 完整旅行计划 */
export interface TravelPlan {
  /** 计划ID */
  id: string;
  /** 目的地 */
  destination: string;
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
  /** 出行人数 */
  travelers: number;
  /** 每日行程 */
  itinerary: ItineraryDay[];
  /** 推荐酒店 */
  hotels: Hotel[];
  /** 预算明细 */
  budget: BudgetBreakdown;
  /** 路线信息 */
  route?: RouteInfo;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

/** Agent 查询结果 - 景点 */
export interface AttractionSearchResult {
  attractions: Attraction[];
  success: boolean;
  error?: string;
}

/** Agent 查询结果 - 天气 */
export interface WeatherQueryResult {
  weather: WeatherInfo[];
  success: boolean;
  error?: string;
}

/** Agent 查询结果 - 酒店 */
export interface HotelSearchResult {
  hotels: Hotel[];
  success: boolean;
  error?: string;
}

/** 行程规划 API 响应 */
export interface TravelPlanResponse {
  success: boolean;
  plan?: TravelPlan;
  error?: string;
  /** 处理耗时（毫秒） */
  duration?: number;
}

