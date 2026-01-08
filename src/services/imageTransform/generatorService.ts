// Seedream 图生图服务
// 文档: https://www.volcengine.com/docs/82379/1541523

import type { TransformRequest } from "@/types/imageTransform";
import { STYLE_CONFIGS, DEFAULT_STRENGTH } from "./stylePrompts";

const VOLCENGINE_API_KEY = process.env.VOLCENGINE_API_KEY;
const VOLCENGINE_BASE_URL =
  process.env.VOLCENGINE_BASE_URL ?? "https://ark.cn-beijing.volces.com/api/v3";
// 注意：doubao-seedream-3.0-t2i 不支持图生图，需要使用 4.0 或 4.5 版本
const VOLCENGINE_MODEL_ID =
  process.env.VOLCENGINE_MODEL_ID ?? "doubao-seedream-4-5-251128";

/** 生成结果 */
interface GenerateResult {
  imageUrl: string;
}

/** Seedream API 请求体 */
interface SeedreamRequestBody {
  model: string;
  prompt: string;
  negative_prompt?: string;
  size?: string;
  seed?: number;
  guidance_scale?: number;
  response_format?: "url" | "b64_json";
  // 图生图参数
  image?: string; // 参考图片 URL（支持 http/https URL 或 Data URL）
  strength?: number; // 风格强度 0-1
}

/** Seedream API 响应体 */
interface SeedreamResponse {
  data: Array<{
    b64_json?: string;
    url?: string;
    index?: number;
  }>;
  created: number;
  model?: string;
}

/**
 * 调用火山引擎 Seedream API 生成二次元风格图片
 * @see https://www.volcengine.com/docs/82379/1541523
 */
export async function generateImage(
  request: TransformRequest
): Promise<GenerateResult> {
  if (!VOLCENGINE_API_KEY) {
    throw new Error("VOLCENGINE_API_KEY 未配置，请在 .env.local 中设置");
  }

  const styleConfig = STYLE_CONFIGS[request.style];
  if (!styleConfig) {
    throw new Error(`未知的风格类型: ${request.style}`);
  }

  const strength = request.strength ?? DEFAULT_STRENGTH;

  // 将 Base64 转换为 Data URL 格式
  // API 的 image 参数要求是 URL 格式，支持 Data URL
  const imageDataUrl = request.imageBase64.startsWith("data:")
    ? request.imageBase64
    : `data:image/jpeg;base64,${request.imageBase64}`;

  // 构建请求体
  const requestBody: SeedreamRequestBody = {
    model: VOLCENGINE_MODEL_ID,
    prompt: styleConfig.prompt,
    negative_prompt: styleConfig.negativePrompt,
    response_format: "b64_json",
    guidance_scale: 7.5,
    // 图生图参数 - 使用 Data URL 格式传递参考图片
    image: imageDataUrl,
    strength,
  };

  console.log("[Seedream] 调用 API:", {
    model: requestBody.model,
    prompt: requestBody.prompt.slice(0, 50) + "...",
    strength,
    imageSize: request.imageBase64.length,
  });

  const response = await fetch(`${VOLCENGINE_BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VOLCENGINE_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Seedream] API 错误:", response.status, errorText);

    // 解析错误信息
    let errorMessage = `API 错误 (${response.status})`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage =
        errorJson.error?.message ?? errorJson.message ?? errorMessage;
    } catch {
      // 保持默认错误信息
    }

    throw new Error(errorMessage);
  }

  const result = (await response.json()) as SeedreamResponse;

  console.log("[Seedream] API 响应:", {
    dataLength: result.data?.length,
    created: result.created,
  });

  if (!result.data?.[0]) {
    throw new Error("API 返回数据为空");
  }

  const imageData = result.data[0];

  // 优先使用 URL，否则使用 Base64
  const imageUrl =
    imageData.url ??
    (imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : null);

  if (!imageUrl) {
    throw new Error("API 返回的图片数据无效");
  }

  return { imageUrl };
}
