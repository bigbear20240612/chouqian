import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { drawProjects } from "@/lib/db/schema";
import { logInfo, logError } from "@/lib/utils/logger";
import { eq } from "drizzle-orm";

/**
 * POST /api/import
 * 批量导入数据到项目
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, data, format } = body as {
      projectId: string;
      data: string[];
      format: "text" | "csv" | "excel";
    };

    if (!projectId || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: "无效的请求数据" },
        { status: 400 }
      );
    }

    // 获取项目
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
    const currentConfig = project.config as any;
    const currentItems = currentConfig.items || [];

    // 合并数据
    const newItems = [...new Set([...currentItems, ...data])];

    // 更新项目配置
    const updated = await db
      .update(drawProjects)
      .set({
        config: {
          ...currentConfig,
          items: newItems,
        },
        updatedAt: new Date(),
      })
      .where(eq(drawProjects.id, projectId))
      .returning();

    await logInfo("data_imported", `导入数据到项目: ${project.name}`, {
      projectId,
      count: data.length,
      format,
    });

    return NextResponse.json({
      success: true,
      data: {
        imported: data.length,
        total: newItems.length,
        project: updated[0],
      },
    });
  } catch (error) {
    await logError("import_failed", "导入数据失败", { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "导入数据失败",
      },
      { status: 500 }
    );
  }
}
