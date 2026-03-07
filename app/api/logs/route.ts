import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activityLogs, type ActivityLog } from "@/lib/db/schema";
import { logError } from "@/lib/utils/logger";

/**
 * GET /api/logs
 * 获取操作日志
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = db.select().from(activityLogs);

    // TODO: 添加过滤条件
    // 由于 Drizzle ORM 的查询语法，这里需要更多处理
    // 暂时返回所有日志，在内存中过滤

    const allLogs = await query
      .orderBy(activityLogs.createdAt)
      .limit(limit)
      .offset(offset);

    // 过滤
    let filteredLogs: ActivityLog[] = allLogs;
    if (level) {
      filteredLogs = allLogs.filter((log: ActivityLog) => log.level === level);
    }

    return NextResponse.json({
      success: true,
      data: filteredLogs,
      total: filteredLogs.length,
    });
  } catch (error) {
    await logError("get_logs_failed", "获取日志失败", { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取日志失败",
      },
      { status: 500 }
    );
  }
}
