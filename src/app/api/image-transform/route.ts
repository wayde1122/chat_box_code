// 图片转换 API 路由

import { NextRequest, NextResponse } from "next/server";
import type { TransformRequest, TransformResponse, TransformErrorCode } from "@/types/imageTransform";
import { generateImage } from "@/services/imageTransform/generatorService";

export async function POST(request: NextRequest): Promise<NextResponse<TransformResponse>> {
  const startTime = Date.now();

  try {
    const body = await request.json() as TransformRequest;

    // 参数校验
    if (!body.imageBase64) {
      return NextResponse.json({
        success: false,
        error: { code: "UPLOAD_FAILED" as TransformErrorCode, message: "缺少图片数据" },
      }, { status: 400 });
    }

    if (!body.style) {
      return NextResponse.json({
        success: false,
        error: { code: "API_ERROR" as TransformErrorCode, message: "请选择转换风格" },
      }, { status: 400 });
    }

    // 调用生成服务
    const result = await generateImage({
      imageBase64: body.imageBase64,
      style: body.style,
      strength: body.strength,
    });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: result.imageUrl,
        duration,
      },
    });

  } catch (error) {
    console.error("[image-transform] Error:", error);

    const message = error instanceof Error ? error.message : "服务暂时不可用";

    return NextResponse.json({
      success: false,
      error: {
        code: "API_ERROR" as TransformErrorCode,
        message: `生成失败：${message}`,
      },
    }, { status: 500 });
  }
}
