import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { drawProjects, drawRecords } from "@/lib/db/schema";
import { executeDraw } from "@/lib/utils/draw";
import { logInfo, logError } from "@/lib/utils/logger";
import { eq } from "drizzle-orm";

/**
 * POST /api/draw
 * 执行抽签
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, count = 1 } = body as { projectId: string; count?: number };

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "项目 ID 不能为空" },
        { status: 400 }
      );
    }

    // 获取项目配置
    const projects = await db
      .select()
      .from(drawProjects)
      .where(eq(drawProjects.id, projectId));

    if (projects.length === 0) {
      return NextResponse.json(
        { success: false, error: "项目不存在" },
        { status: 404 }
      );
    }

    const project = projects[0];

    // 执行抽签
    const result = executeDraw(project.config as any, count);

    // 记录抽签结果
    await db.insert(drawRecords).values({
      projectId,
      result: result as any,
      drawnAt: new Date(),
    });

    // 记录日志
    await logInfo("draw_executed", `执行抽签: ${project.name}`, {
      projectId,
      result,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    await logError("draw_failed", "抽签失败", { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "抽签失败",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/draw?projectId=xxx
 * 获取项目的抽签历史记录
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "项目 ID 不能为空" },
        { status: 400 }
      );
    }

    // 获取历史记录
    const records = await db
      .select()
      .from(drawRecords)
      .where(eq(drawRecords.projectId, projectId))
      .orderBy(drawRecords.drawnAt)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error) {
    await logError("get_records_failed", "获取历史记录失败", { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取历史记录失败",
      },
      { status: 500 }
    );
  }
}
