/**
 * 高德地图 MCP 客户端
 * 通过 MCP 协议调用高德地图服务
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type {
  GeoLocation,
  Attraction,
  Hotel,
  WeatherInfo,
} from "@/types/travel";

/** POI 搜索类型 */
export type PoiType = "scenic" | "hotel" | "restaurant" | "all";

/** MCP 工具调用结果 */
interface McpToolResult {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

/** POI 搜索响应 */
interface PoiSearchResult {
  pois?: Array<{
    id: string;
    name: string;
    type?: string;
    address?: string;
    location?: string;
    tel?: string;
    rating?: string;
    cost?: string;
    photos?: Array<{ url: string }>;
  }>;
  count?: string;
  status?: string;
}

/** 天气查询响应 */
interface WeatherResult {
  forecasts?: Array<{
    city: string;
    casts: Array<{
      date: string;
      week: string;
      dayweather: string;
      nightweather: string;
      daytemp: string;
      nighttemp: string;
    }>;
  }>;
  lives?: Array<{
    city: string;
    weather: string;
    temperature: string;
  }>;
}

/** 地理编码响应 */
interface GeoResult {
  geocodes?: Array<{
    location: string;
    formatted_address: string;
  }>;
}

/**
 * 高德地图 MCP 客户端类
 * 使用 MCP 协议与高德地图服务通信
 */
class AmapMCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private connecting: Promise<void> | null = null;
  private connected = false;

  /**
   * 连接到 MCP 服务
   */
  async connect(): Promise<void> {
    if (this.connected && this.client) {
      return;
    }

    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = this.doConnect();
    return this.connecting;
  }

  private async doConnect(): Promise<void> {
    try {
      console.log("[AmapMCPClient] 正在连接 MCP 服务...");

      // 创建 stdio 传输
      this.transport = new StdioClientTransport({
        command: "npx",
        args: ["-y", "@amap/amap-maps-mcp-server"],
        env: {
          ...process.env,
          // 使用 Web服务 API Key（用于 MCP/REST API 调用）
          AMAP_MAPS_API_KEY: process.env.AMAP_API_KEY ?? "a3e5febb5919d7d7a3d486da186b0652",
        },
      });

      // 创建客户端
      this.client = new Client(
        { name: "travel-planner", version: "1.0.0" },
        { capabilities: {} }
      );

      // 连接
      await this.client.connect(this.transport);
      this.connected = true;
      console.log("[AmapMCPClient] MCP 服务连接成功");

      // 列出可用工具（调试用）
      try {
        const tools = await this.client.listTools();
        console.log("[AmapMCPClient] 可用工具:", tools.tools.map(t => t.name).join(", "));
      } catch (e) {
        console.log("[AmapMCPClient] 无法列出工具");
      }
    } catch (error) {
      this.connected = false;
      const message = error instanceof Error ? error.message : "未知错误";
      console.error("[AmapMCPClient] 连接失败:", message);
      throw new Error(`MCP 服务连接失败: ${message}`);
    } finally {
      this.connecting = null;
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
    this.connected = false;
  }

  /**
   * 调用 MCP 工具
   */
  private async callTool<T>(
    name: string,
    args: Record<string, unknown>
  ): Promise<T> {
    await this.connect();

    if (!this.client) {
      throw new Error("MCP 客户端未初始化");
    }

    try {
      console.log(`[AmapMCPClient] 调用工具 ${name}:`, args);
      
      const result = await this.client.callTool({
        name,
        arguments: args,
      }) as McpToolResult;

      // 解析返回内容
      if (result.content && Array.isArray(result.content)) {
        const textContent = result.content.find(
          (c): c is { type: "text"; text: string } => c.type === "text"
        );
        if (textContent?.text) {
          try {
            const parsed = JSON.parse(textContent.text) as T;
            console.log(`[AmapMCPClient] 工具 ${name} 返回成功`);
            return parsed;
          } catch (jsonError) {
            console.error(`[AmapMCPClient] JSON 解析失败:`, textContent.text.substring(0, 200));
            throw new Error(`返回数据格式错误`);
          }
        }
      }

      throw new Error("无效的响应格式");
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      console.error(`[AmapMCPClient] 调用工具 ${name} 失败: ${message}`);
      throw error;
    }
  }

  /**
   * 解析坐标字符串
   */
  private parseLocation(locationStr: string | undefined): GeoLocation {
    if (!locationStr) {
      return { longitude: 116.397, latitude: 39.909 };
    }
    const [lng, lat] = locationStr.split(",").map(Number);
    return { longitude: lng || 116.397, latitude: lat || 39.909 };
  }

  /**
   * POI 搜索 - 景点
   * 使用 maps_text_search 工具
   */
  async searchAttractions(
    city: string,
    keywords: string,
    limit = 10
  ): Promise<Attraction[]> {
    try {
      // 使用正确的工具名称 maps_text_search
      const result = await this.callTool<PoiSearchResult>("maps_text_search", {
        keywords: keywords || "景点 旅游",
        city,
        types: "110000", // 风景名胜类别代码
        offset: limit,
      });

      const pois = result.pois ?? [];
      console.log(`[AmapMCPClient] 找到 ${pois.length} 个景点`);

      return pois.map((poi, index) => ({
        id: poi.id || `attraction-${index}`,
        name: poi.name,
        type: poi.type || "景点",
        address: poi.address || city,
        location: this.parseLocation(poi.location),
        ticketPrice: poi.cost ? parseFloat(poi.cost) : Math.floor(Math.random() * 100) + 20,
        duration: 2,
        description: "",
        imageUrl: poi.photos?.[0]?.url,
        rating: poi.rating ? parseFloat(poi.rating) : 4.0 + Math.random(),
      }));
    } catch (error) {
      console.error("[AmapMCPClient] 景点搜索失败:", error);
      // 返回模拟数据作为降级方案，先获取城市坐标
      const cityCenter = await this.getCityCenterFromAPI(city);
      return this.getMockAttractionsWithCenter(city, limit, cityCenter);
    }
  }

  /**
   * POI 搜索 - 酒店
   * 使用 maps_text_search 工具
   */
  async searchHotels(
    city: string,
    keywords = "酒店",
    limit = 10
  ): Promise<Hotel[]> {
    try {
      const result = await this.callTool<PoiSearchResult>("maps_text_search", {
        keywords: keywords || "酒店",
        city,
        types: "100000", // 酒店住宿类别代码
        offset: limit,
      });

      const pois = result.pois ?? [];
      console.log(`[AmapMCPClient] 找到 ${pois.length} 个酒店`);

      return pois.map((poi, index) => ({
        id: poi.id || `hotel-${index}`,
        name: poi.name,
        address: poi.address || city,
        location: this.parseLocation(poi.location),
        pricePerNight: poi.cost ? parseFloat(poi.cost) : 300 + Math.floor(Math.random() * 500),
        rating: poi.rating ? parseFloat(poi.rating) : 4.0 + Math.random(),
        stars: 3 + Math.floor(Math.random() * 2),
        imageUrl: poi.photos?.[0]?.url,
        phone: poi.tel,
      }));
    } catch (error) {
      console.error("[AmapMCPClient] 酒店搜索失败:", error);
      // 返回模拟数据作为降级方案，先获取城市坐标
      const cityCenter = await this.getCityCenterFromAPI(city);
      return this.getMockHotelsWithCenter(city, limit, cityCenter);
    }
  }

  /**
   * 天气查询
   * 使用 maps_weather 工具
   */
  async queryWeather(city: string): Promise<WeatherInfo[]> {
    try {
      const result = await this.callTool<WeatherResult>("maps_weather", {
        city,
        extensions: "all",
      });

      const casts = result.forecasts?.[0]?.casts ?? [];
      console.log(`[AmapMCPClient] 获取到 ${casts.length} 天天气预报`);

      return casts.map((cast) => ({
        date: cast.date,
        description: cast.dayweather,
        maxTemp: parseInt(cast.daytemp, 10),
        minTemp: parseInt(cast.nighttemp, 10),
        suggestion: this.getWeatherSuggestion(cast.dayweather),
      }));
    } catch (error) {
      console.error("[AmapMCPClient] 天气查询失败:", error);
      return [];
    }
  }

  /**
   * 地理编码 - 地址转坐标
   * 使用 maps_geo 工具
   */
  async geocode(address: string, city?: string): Promise<GeoLocation | null> {
    try {
      const result = await this.callTool<GeoResult>("maps_geo", {
        address,
        city: city ?? "",
      });

      const location = result.geocodes?.[0]?.location;
      return location ? this.parseLocation(location) : null;
    } catch (error) {
      console.error("[AmapMCPClient] 地理编码失败:", error);
      return null;
    }
  }

  /**
   * 通过高德 API 获取城市中心坐标
   * 优先使用 API，失败时使用本地映射表
   */
  async getCityCenterFromAPI(city: string): Promise<GeoLocation> {
    try {
      // 尝试通过高德地理编码 API 获取城市坐标
      const location = await this.geocode(city);
      if (location) {
        console.log(`[AmapMCPClient] 从 API 获取 ${city} 坐标: [${location.longitude}, ${location.latitude}]`);
        return location;
      }
    } catch (error) {
      console.error(`[AmapMCPClient] 获取 ${city} 坐标失败:`, error);
    }
    
    // 失败时使用本地映射表
    return this.getCityCenter(city);
  }

  /**
   * 常用城市中心坐标映射
   */
  private getCityCenter(city: string): GeoLocation {
    const cityCoords: Record<string, GeoLocation> = {
      // 直辖市
      北京: { longitude: 116.407, latitude: 39.904 },
      上海: { longitude: 121.473, latitude: 31.230 },
      天津: { longitude: 117.190, latitude: 39.125 },
      重庆: { longitude: 106.551, latitude: 29.563 },
      // 省会城市
      广州: { longitude: 113.264, latitude: 23.129 },
      深圳: { longitude: 114.057, latitude: 22.543 },
      杭州: { longitude: 120.155, latitude: 30.274 },
      南京: { longitude: 118.796, latitude: 32.059 },
      苏州: { longitude: 120.585, latitude: 31.299 },
      成都: { longitude: 104.066, latitude: 30.572 },
      武汉: { longitude: 114.305, latitude: 30.593 },
      西安: { longitude: 108.940, latitude: 34.341 },
      长沙: { longitude: 112.938, latitude: 28.228 },
      青岛: { longitude: 120.382, latitude: 36.067 },
      大连: { longitude: 121.614, latitude: 38.914 },
      厦门: { longitude: 118.089, latitude: 24.479 },
      昆明: { longitude: 102.832, latitude: 24.880 },
      三亚: { longitude: 109.508, latitude: 18.247 },
      桂林: { longitude: 110.290, latitude: 25.274 },
      丽江: { longitude: 100.227, latitude: 26.855 },
      张家界: { longitude: 110.479, latitude: 29.117 },
      黄山: { longitude: 118.337, latitude: 29.714 },
      拉萨: { longitude: 91.132, latitude: 29.660 },
      哈尔滨: { longitude: 126.534, latitude: 45.803 },
      沈阳: { longitude: 123.432, latitude: 41.805 },
      济南: { longitude: 117.120, latitude: 36.651 },
      郑州: { longitude: 113.625, latitude: 34.746 },
      合肥: { longitude: 117.227, latitude: 31.820 },
      福州: { longitude: 119.296, latitude: 26.074 },
      南昌: { longitude: 115.858, latitude: 28.682 },
      南宁: { longitude: 108.366, latitude: 22.817 },
      贵阳: { longitude: 106.630, latitude: 26.647 },
      兰州: { longitude: 103.834, latitude: 36.061 },
      太原: { longitude: 112.548, latitude: 37.870 },
      石家庄: { longitude: 114.514, latitude: 38.042 },
      长春: { longitude: 125.323, latitude: 43.817 },
      呼和浩特: { longitude: 111.749, latitude: 40.842 },
      乌鲁木齐: { longitude: 87.616, latitude: 43.826 },
      银川: { longitude: 106.278, latitude: 38.466 },
      西宁: { longitude: 101.778, latitude: 36.617 },
      海口: { longitude: 110.199, latitude: 20.044 },
      香港: { longitude: 114.173, latitude: 22.320 },
      澳门: { longitude: 113.549, latitude: 22.198 },
      台北: { longitude: 121.565, latitude: 25.033 },
    };

    // 尝试匹配城市名称
    for (const [name, coords] of Object.entries(cityCoords)) {
      if (city.includes(name) || name.includes(city)) {
        return coords;
      }
    }

    // 默认返回北京坐标
    console.log(`[AmapMCPClient] 未找到城市 ${city} 的坐标，使用默认坐标`);
    return { longitude: 116.407, latitude: 39.904 };
  }

  /**
   * 模拟景点数据（使用传入的城市中心坐标）
   */
  private getMockAttractionsWithCenter(city: string, limit: number, center: GeoLocation): Attraction[] {
    const attractions: Array<{ name: string; type: string; ticketPrice: number }> = [
      { name: `${city}博物馆`, type: "博物馆", ticketPrice: 50 },
      { name: `${city}公园`, type: "公园", ticketPrice: 0 },
      { name: `${city}古城`, type: "古迹", ticketPrice: 80 },
      { name: `${city}塔`, type: "地标", ticketPrice: 60 },
      { name: `${city}寺庙`, type: "寺庙", ticketPrice: 30 },
      { name: `${city}湖`, type: "自然风光", ticketPrice: 20 },
      { name: `${city}山`, type: "自然风光", ticketPrice: 100 },
      { name: `${city}步行街`, type: "购物", ticketPrice: 0 },
      { name: `${city}夜市`, type: "美食", ticketPrice: 0 },
      { name: `${city}艺术馆`, type: "艺术", ticketPrice: 40 },
    ];

    console.log(`[AmapMCPClient] 使用城市中心 [${center.longitude}, ${center.latitude}] 生成模拟景点`);

    return attractions.slice(0, limit).map((a, i) => ({
      id: `mock-attraction-${i}`,
      name: a.name,
      type: a.type,
      address: `${city}市中心`,
      // 在城市中心坐标附近随机分布
      location: { 
        longitude: center.longitude + (Math.random() - 0.5) * 0.08, 
        latitude: center.latitude + (Math.random() - 0.5) * 0.08 
      },
      ticketPrice: a.ticketPrice,
      duration: 2,
      description: `${city}著名${a.type}景点`,
      rating: 4.0 + Math.random(),
    }));
  }

  /**
   * 模拟酒店数据（使用传入的城市中心坐标）
   */
  private getMockHotelsWithCenter(city: string, limit: number, center: GeoLocation): Hotel[] {
    const hotels: Array<{ name: string; pricePerNight: number; stars: number }> = [
      { name: `${city}大酒店`, pricePerNight: 500, stars: 5 },
      { name: `${city}商务酒店`, pricePerNight: 300, stars: 4 },
      { name: `${city}快捷酒店`, pricePerNight: 150, stars: 3 },
      { name: `${city}精品民宿`, pricePerNight: 250, stars: 4 },
      { name: `${city}度假酒店`, pricePerNight: 600, stars: 5 },
    ];

    return hotels.slice(0, limit).map((h, i) => ({
      id: `mock-hotel-${i}`,
      name: h.name,
      address: `${city}市中心`,
      // 在城市中心坐标附近随机分布
      location: { 
        longitude: center.longitude + (Math.random() - 0.5) * 0.04, 
        latitude: center.latitude + (Math.random() - 0.5) * 0.04 
      },
      pricePerNight: h.pricePerNight,
      rating: 4.0 + Math.random(),
      stars: h.stars,
    }));
  }

  /**
   * 根据天气生成穿衣建议
   */
  private getWeatherSuggestion(weather: string): string {
    const suggestions: Record<string, string> = {
      晴: "天气晴朗，适合户外活动，建议携带太阳镜和防晒霜",
      多云: "多云天气，温度适宜，适合出行",
      阴: "阴天，温度较为舒适，建议携带薄外套",
      小雨: "有小雨，请携带雨伞，穿着防水鞋",
      中雨: "中雨天气，建议减少户外活动，携带雨具",
      大雨: "大雨天气，建议室内活动为主",
      雷阵雨: "可能有雷阵雨，请注意天气变化，携带雨具",
      雪: "下雪天气，注意保暖和防滑",
    };

    for (const [key, suggestion] of Object.entries(suggestions)) {
      if (weather.includes(key)) {
        return suggestion;
      }
    }

    return "请根据实际天气情况做好准备";
  }
}

// 导出单例实例
export const amapClient = new AmapMCPClient();
export { AmapMCPClient };
