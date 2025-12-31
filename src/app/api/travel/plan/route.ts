/**
 * 旅行规划 API Route
 * POST /api/travel/plan
 */

import { NextResponse } from "next/server";
import { plannerAgent } from "@/services/agents";
import type { TravelRequest, TravelPlanResponse } from "@/types/travel";

/**
 * 验证请求参数
 */
function validateRequest(body: unknown): TravelRequest | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const data = body as Record<string, unknown>;

  // 必填字段检查
  if (
    typeof data.destination !== "string" ||
    typeof data.startDate !== "string" ||
    typeof data.endDate !== "string" ||
    !Array.isArray(data.preferences) ||
    typeof data.budgetLevel !== "string" ||
    typeof data.travelers !== "number"
  ) {
    return null;
  }

  // 日期格式检查
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.startDate) || !dateRegex.test(data.endDate)) {
    return null;
  }

  // 日期逻辑检查
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  if (start > end) {
    return null;
  }

  return {
    destination: data.destination,
    startDate: data.startDate,
    endDate: data.endDate,
    preferences: data.preferences as TravelRequest["preferences"],
    budgetLevel: data.budgetLevel as TravelRequest["budgetLevel"],
    budgetAmount: typeof data.budgetAmount === "number" ? data.budgetAmount : undefined,
    travelers: data.travelers,
  };
}

/**
 * POST 处理函数
 */
export async function POST(request: Request): Promise<NextResponse<TravelPlanResponse>> {
  const startTime = performance.now();

  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证参数
    const travelRequest = validateRequest(body);
    if (!travelRequest) {
      return NextResponse.json(
        {
          success: false,
          error: "请求参数无效，请检查必填字段和数据格式",
        },
        { status: 400 }
      );
    }

    console.log(`[API] 收到行程规划请求: ${travelRequest.destination}`);

    // 调用 PlannerAgent
    const result = await plannerAgent.execute({ request: travelRequest });

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: result.error ?? "行程规划失败，请稍后重试",
          duration: result.duration,
        },
        { status: 500 }
      );
    }

    const duration = Math.round(performance.now() - startTime);
    console.log(`[API] 行程规划完成，耗时 ${duration}ms`);

    return NextResponse.json({
      success: true,
      plan: result.data.plan,
      duration,
    });
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    const message = error instanceof Error ? error.message : "未知错误";
    
    console.error(`[API] 处理请求失败: ${message}`);

    return NextResponse.json(
      {
        success: false,
        error: `服务器错误: ${message}`,
        duration,
      },
      { status: 500 }
    );
  }
}

