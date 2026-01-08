/**
 * Unsplash 图片搜索 API 代理
 * 避免在前端暴露 Access Key
 *
 * 参考文档:
 * - https://unsplash.com/documentation#search-photos
 * - https://unsplash.com/documentation#public-authentication
 */

import { NextRequest, NextResponse } from "next/server";

// Unsplash Access Key - 只在服务端使用（必需配置）
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

interface UnsplashSearchResult {
  id: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashSearchResult[];
}

/**
 * GET /api/unsplash/search
 * 搜索 Unsplash 图片
 *
 * 查询参数:
 * - query: 搜索关键词 (必需)
 * - per_page: 每页结果数 (可选, 默认 5)
 * - orientation: 图片方向 (可选, 默认 landscape)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const perPage = searchParams.get("per_page") ?? "5";
    const orientation = searchParams.get("orientation") ?? "landscape";

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter" },
        { status: 400 }
      );
    }

    // 构建 Unsplash API 请求 URL
    // 参考: https://unsplash.com/documentation#search-photos
    const apiUrl = new URL("https://api.unsplash.com/search/photos");
    apiUrl.searchParams.set("query", query);
    apiUrl.searchParams.set("per_page", perPage);
    apiUrl.searchParams.set("orientation", orientation);

    console.log(`[Unsplash API] Searching for: ${query}`);

    // 使用 Authorization header 进行公共认证
    // 参考: https://unsplash.com/documentation#public-authentication
    // 格式: Authorization: Client-ID YOUR_ACCESS_KEY
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Unsplash API] Error ${response.status}:`, errorText);

      // 如果是认证失败
      if (response.status === 401) {
        console.error(
          "[Unsplash API] Authentication failed - check Access Key"
        );
        return NextResponse.json({
          results: [],
          total: 0,
          error: "Authentication failed",
        });
      }

      // 如果是速率限制或禁止访问
      if (response.status === 403 || response.status === 429) {
        console.warn(
          "[Unsplash API] Rate limited or forbidden, returning empty results"
        );
        return NextResponse.json({ results: [], total: 0 });
      }

      return NextResponse.json(
        { error: `Unsplash API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: UnsplashSearchResponse = await response.json();

    console.log(`[Unsplash API] Found ${data.total} results for "${query}"`);

    // 转换为简化格式
    const photos = data.results.map((result) => ({
      id: result.id,
      url: result.urls.regular,
      thumbUrl: result.urls.small,
      description: result.description ?? result.alt_description ?? "",
      photographer: result.user.name,
      photographerUrl: result.user.links.html,
    }));

    return NextResponse.json({
      total: data.total,
      results: photos,
    });
  } catch (error) {
    console.error("[Unsplash API] Request failed:", error);
    return NextResponse.json(
      { error: "Failed to search photos", results: [] },
      { status: 500 }
    );
  }
}
