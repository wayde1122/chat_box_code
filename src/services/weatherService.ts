/**
 * 天气服务 - 通过 wttr.in API 查询真实天气信息
 */

interface WeatherCondition {
  weatherDesc: { value: string }[];
  temp_C: string;
}

interface HourlyForecast {
  time: string;
  weatherDesc: { value: string }[];
}

interface DailyForecast {
  date: string;
  avgtempC: string;
  maxtempC: string;
  mintempC: string;
  hourly: HourlyForecast[];
}

interface WttrResponse {
  current_condition: WeatherCondition[];
  weather?: DailyForecast[];
}

/**
 * 查询指定城市的天气信息
 * @param city - 城市名称
 * @param date - 可选，日期字符串，格式为 YYYY-MM-DD，支持查询未来3天内的天气
 * @returns 天气信息描述
 */
export async function getWeather(city: string, date?: string): Promise<string> {
  const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as WttrResponse;

    // 如果未指定日期，返回当前天气
    if (!date) {
      const currentCondition = data.current_condition[0];
      const weatherDesc = currentCondition.weatherDesc[0].value;
      const tempC = currentCondition.temp_C;
      return `${city}当前天气：${weatherDesc}，气温${tempC}摄氏度`;
    }

    // 查询指定日期的天气预报
    const forecast = data.weather?.find((w) => w.date === date);
    if (!forecast) {
      const availableDates = data.weather?.map((w) => w.date).join("、") ?? "无";
      return `错误：未找到 ${date} 的天气预报，可查询的日期有：${availableDates}`;
    }

    // 提取预报数据
    const { avgtempC, maxtempC, mintempC } = forecast;
    // 取中午时段的天气描述作为当天天气概况
    const hourlyNoon = forecast.hourly?.find((h) => h.time === "1200") ?? forecast.hourly?.[0];
    const weatherDesc = hourlyNoon?.weatherDesc?.[0]?.value ?? "未知";

    return `${city} ${date} 天气预报：${weatherDesc}，平均气温${avgtempC}°C，最高${maxtempC}°C，最低${mintempC}°C`;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return `错误：解析天气数据失败，可能是城市名称无效 - ${error.message}`;
    }
    const message = error instanceof Error ? error.message : "未知错误";
    return `错误：查询天气时遇到网络问题 - ${message}`;
  }
}

