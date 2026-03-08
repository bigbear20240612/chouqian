import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { drawRecords } from "@/lib/db/schema";
import { logInfo, logError } from "@/lib/utils/logger";
import { eq } from "drizzle-orm";

/**
 * DELETE /api/draw/:id
 * 删除单条历史记录
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "记录 ID 不能为空" },
        { status: 400 }
      );
    }

    // 删除记录
    const deleted = await db
      .delete(drawRecords)
      .where(eq(drawRecords.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: "记录不存在" },
        { status: 404 }
      );
    }

    await logInfo("record_deleted", `删除历史记录: ${id}`, { recordId: id });

    return NextResponse.json({
      success: true,
      data: deleted[0],
    });
  } catch (error) {
    await logError("delete_record_failed", "删除记录失败", { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "删除记录失败",
      },
      { status: 500 }
    );
  }
}
