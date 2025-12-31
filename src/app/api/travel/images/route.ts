/**
 * 景点图片获取 API
 * 在旅行计划生成后异步获取图片
 */

import { NextRequest, NextResponse } from "next/server";
import { unsplashService } from "@/services/unsplashService";

interface ImageRequest {
  attractions: Array<{ id: string; name: string }>;
  city: string;
}

/**
 * POST /api/travel/images
 * 批量获取景点图片
 */
export async function POST(request: NextRequest) {
  try {
    const body: ImageRequest = await request.json();
    const { attractions, city } = body;

    if (!attractions || !city) {
      return NextResponse.json(
        { error: "Missing attractions or city" },
        { status: 400 }
      );
    }

    console.log(`[Images API] Fetching images for ${attractions.length} attractions in ${city}`);

    // 批量获取图片
    const photoMap = await unsplashService.getAttractionPhotos(attractions, city);

    // 转换为对象格式
    const images: Record<string, string> = {};
    photoMap.forEach((url, id) => {
      images[id] = url;
    });

    console.log(`[Images API] Found images for ${Object.keys(images).length} attractions`);

    return NextResponse.json({ images });
  } catch (error) {
    console.error("[Images API] Failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch images", images: {} },
      { status: 500 }
    );
  }
}

