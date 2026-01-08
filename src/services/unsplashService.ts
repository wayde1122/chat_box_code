/**
 * Unsplash 图片服务
 * 用于获取景点相关的高质量图片
 *
 * 参考: https://unsplash.com/documentation
 *
 * 注意：此服务通过 /api/unsplash/search 代理请求，
 * 避免在客户端暴露 Access Key
 */

interface UnsplashPhoto {
  url: string;
  thumbUrl?: string;
  description: string;
  photographer: string;
  photographerUrl: string;
}

interface ApiSearchResponse {
  total: number;
  results: Array<{
    id: string;
    url: string;
    thumbUrl: string;
    description: string;
    photographer: string;
    photographerUrl: string;
  }>;
  error?: string;
}

/**
 * Unsplash 图片服务类
 */
class UnsplashService {
  private readonly cache = new Map<string, UnsplashPhoto[]>();
  private readonly useProxy: boolean;
  private readonly accessKey: string;

  constructor(accessKey?: string) {
    this.accessKey = accessKey ?? "";
    // 如果在浏览器环境或没有 accessKey，使用代理
    this.useProxy = typeof window !== "undefined" || !this.accessKey;
  }

  /**
   * 搜索图片
   * @param query 搜索关键词
   * @param perPage 每页结果数
   * @returns 图片列表
   */
  async searchPhotos(query: string, perPage = 5): Promise<UnsplashPhoto[]> {
    // 检查缓存
    const cacheKey = `${query}_${perPage}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      let photos: UnsplashPhoto[];

      if (this.useProxy) {
        // 使用 API 路由代理
        photos = await this.searchViaProxy(query, perPage);
      } else {
        // 直接调用 Unsplash API（仅服务端）
        photos = await this.searchDirect(query, perPage);
      }

      // 存入缓存
      if (photos.length > 0) {
        this.cache.set(cacheKey, photos);
      }

      return photos;
    } catch (error) {
      console.error("[UnsplashService] 搜索图片失败:", error);
      return [];
    }
  }

  /**
   * 通过 API 代理搜索
   */
  private async searchViaProxy(
    query: string,
    perPage: number
  ): Promise<UnsplashPhoto[]> {
    const url = new URL(
      "/api/unsplash/search",
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000"
    );
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", perPage.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Proxy API error: ${response.status}`);
    }

    const data: ApiSearchResponse = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.results.map((result) => ({
      url: result.url,
      thumbUrl: result.thumbUrl,
      description: result.description,
      photographer: result.photographer,
      photographerUrl: result.photographerUrl,
    }));
  }

  /**
   * 直接调用 Unsplash API（仅服务端使用）
   * 参考: https://unsplash.com/documentation#public-authentication
   */
  private async searchDirect(
    query: string,
    perPage: number
  ): Promise<UnsplashPhoto[]> {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", perPage.toString());
    url.searchParams.set("orientation", "landscape");

    console.log(`[UnsplashService] Direct API call for: ${query}`);

    // 使用 Authorization header 进行公共认证
    // 格式: Authorization: Client-ID YOUR_ACCESS_KEY
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Client-ID ${this.accessKey}`,
        "Accept-Version": "v1",
      },
    });

    if (!response.ok) {
      // 打印详细错误信息
      const errorText = await response.text().catch(() => "");
      console.error(
        `[UnsplashService] API error ${response.status}: ${errorText}`
      );

      // 403/429 可能是速率限制，返回空数组而不是抛出错误
      if (
        response.status === 403 ||
        response.status === 429 ||
        response.status === 401
      ) {
        console.warn(
          "[UnsplashService] Rate limited or auth failed, returning empty results"
        );
        return [];
      }

      throw new Error(`Unsplash API error: ${response.status}`);
    }

    interface UnsplashResult {
      urls: { regular: string; small: string };
      description: string | null;
      alt_description: string | null;
      user: { name: string; links: { html: string } };
    }

    const data: { results: UnsplashResult[] } = await response.json();
    console.log(
      `[UnsplashService] Found ${data.results.length} photos for "${query}"`
    );

    return data.results.map((result) => ({
      url: result.urls.regular,
      thumbUrl: result.urls.small,
      description: result.description ?? result.alt_description ?? "",
      photographer: result.user.name,
      photographerUrl: result.user.links.html,
    }));
  }

  /**
   * 获取单张图片URL
   * @param query 搜索关键词
   * @returns 图片URL，如果找不到返回 null
   */
  async getPhotoUrl(query: string): Promise<string | null> {
    const photos = await this.searchPhotos(query, 1);
    return photos[0]?.url ?? null;
  }

  /**
   * 为景点获取图片
   * 优化搜索关键词以获得更好的结果
   * @param attractionName 景点名称
   * @param city 城市名称
   * @returns 图片URL
   */
  async getAttractionPhoto(
    attractionName: string,
    city: string
  ): Promise<string | null> {
    // 尝试多种搜索策略
    const queries = [
      `${attractionName} ${city} China`,
      attractionName,
      `${city} landmark`,
    ];

    for (const query of queries) {
      const url = await this.getPhotoUrl(query);
      if (url) return url;
    }

    // 使用默认占位图
    return this.getPlaceholderImage(attractionName);
  }

  /**
   * 为景点获取完整的图片信息（包括归属信息）
   * @param attractionName 景点名称
   * @param city 城市名称
   * @returns 完整图片信息
   */
  async getAttractionPhotoWithAttribution(
    attractionName: string,
    city: string
  ): Promise<UnsplashPhoto | null> {
    // 尝试多种搜索策略
    const queries = [
      `${attractionName} ${city} China`,
      attractionName,
      `${city} landmark`,
    ];

    for (const query of queries) {
      const photos = await this.searchPhotos(query, 1);
      if (photos.length > 0) {
        return photos[0];
      }
    }

    return null;
  }

  /**
   * 批量获取景点图片
   * @param attractions 景点列表
   * @param city 城市名称
   * @returns 景点ID到图片URL的映射
   */
  async getAttractionPhotos(
    attractions: Array<{ id: string; name: string }>,
    city: string
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();

    // 使用 Promise.allSettled 并行获取图片，允许部分失败
    const promises = attractions.map(async (attraction) => {
      const url = await this.getAttractionPhoto(attraction.name, city);
      if (url) {
        result.set(attraction.id, url);
      }
    });

    await Promise.allSettled(promises);

    return result;
  }

  /**
   * 批量获取景点图片（包含归属信息）
   * @param attractions 景点列表
   * @param city 城市名称
   * @returns 景点ID到完整图片信息的映射
   */
  async getAttractionPhotosWithAttribution(
    attractions: Array<{ id: string; name: string }>,
    city: string
  ): Promise<Map<string, UnsplashPhoto>> {
    const result = new Map<string, UnsplashPhoto>();

    // 使用 Promise.allSettled 并行获取图片，允许部分失败
    const promises = attractions.map(async (attraction) => {
      const photo = await this.getAttractionPhotoWithAttribution(
        attraction.name,
        city
      );
      if (photo) {
        result.set(attraction.id, photo);
      }
    });

    await Promise.allSettled(promises);

    return result;
  }

  /**
   * 生成占位图URL
   * 使用 placehold.co 服务
   */
  private getPlaceholderImage(text: string): string {
    const encodedText = encodeURIComponent(text.slice(0, 20));
    return `https://placehold.co/800x600/1e293b/94a3b8?text=${encodedText}`;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// 创建单例实例（必需配置 UNSPLASH_ACCESS_KEY 环境变量）
const accessKey = process.env.UNSPLASH_ACCESS_KEY ?? "";
export const unsplashService = new UnsplashService(accessKey);
export { UnsplashService };
export type { UnsplashPhoto };
