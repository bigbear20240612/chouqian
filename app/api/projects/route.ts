import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { drawProjects } from "@/lib/db/schema";
import { logInfo, logError } from "@/lib/utils/logger";
import { eq } from "drizzle-orm";

/**
 * GET /api/projects
 * 获取所有项目列表
 */
export async function GET() {
  try {
    const projects = await db.select().from(drawProjects).orderBy(drawProjects.createdAt);

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    await logError("get_projects_failed", "获取项目列表失败", { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取项目列表失败",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * 创建新项目
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, type, config, uiStyle = "card" } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: "项目名称和类型不能为空" },
        { status: 400 }
      );
    }

    // 验证项目类型
    const validTypes = ["number", "name", "poem", "custom"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: "无效的项目类型" },
        { status: 400 }
      );
    }

    // 创建项目
    const [newProject] = await db
      .insert(drawProjects)
      .values({
        name,
        description,
        type,
        config: config || {},
        uiStyle,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await logInfo("project_created", `创建项目: ${name}`, { projectId: newProject.id });

    return NextResponse.json({
      success: true,
      data: newProject,
    });
  } catch (error) {
    await logError("create_project_failed", "创建项目失败", { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "创建项目失败",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects
 * 更新项目
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description, config, uiStyle } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "项目 ID 不能为空" },
        { status: 400 }
      );
    }

    // 更新项目
    const updated = await db
      .update(drawProjects)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(config !== undefined && { config }),
        ...(uiStyle !== undefined && { uiStyle }),
        updatedAt: new Date(),
      })
      .where(eq(drawProjects.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "项目不存在" },
        { status: 404 }
      );
    }

    await logInfo("project_updated", `更新项目: ${updated[0].name}`, { projectId: id });

    return NextResponse.json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    await logError("update_project_failed", "更新项目失败", { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "更新项目失败",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects?id=xxx
 * 删除项目
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "项目 ID 不能为空" },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(drawProjects)
      .where(eq(drawProjects.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: "项目不存在" },
        { status: 404 }
      );
    }

    await logInfo("project_deleted", `删除项目: ${deleted[0].name}`, { projectId: id });

    return NextResponse.json({
      success: true,
      data: deleted[0],
    });
  } catch (error) {
    await logError("delete_project_failed", "删除项目失败", { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "删除项目失败",
      },
      { status: 500 }
    );
  }
}
