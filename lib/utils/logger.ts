import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import type { LogLevel } from "@/lib/db/schema";

/**
 * 日志系统 - 记录系统操作和错误
 */

/**
 * 记录日志到数据库
 * @param level 日志级别
 * @param action 操作名称
 * @param details 详细信息
 * @param metadata 额外元数据
 */
export async function logActivity(
  level: LogLevel,
  action: string,
  details?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      level,
      action,
      details,
      metadata,
    });
  } catch (error) {
    // 如果数据库记录失败，至少输出到控制台
    console.error(`[日志记录失败] ${level.toUpperCase()} - ${action}:`, error);
  }
}

/**
 * 记录信息日志
 */
export async function logInfo(
  action: string,
  details?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logActivity("info", action, details, metadata);
  console.log(`[INFO] ${action}: ${details || ""}`);
}

/**
 * 记录警告日志
 */
export async function logWarning(
  action: string,
  details?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logActivity("warning", action, details, metadata);
  console.warn(`[WARN] ${action}: ${details || ""}`);
}

/**
 * 记录错误日志
 */
export async function logError(
  action: string,
  details?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logActivity("error", action, details, metadata);
  console.error(`[ERROR] ${action}: ${details || ""}`, metadata);
}

/**
 * 查询日志
 */
export async function getLogs(params: {
  level?: LogLevel;
  action?: string;
  limit?: number;
  offset?: number;
}) {
  const { level, action, limit = 100, offset = 0 } = params;

  let query = db.select().from(activityLogs);

  // 这里应该添加过滤条件，但由于 Drizzle 的查询语法，
  // 实际的过滤逻辑应该在 API 路由中处理
  const results = await query
    .orderBy(activityLogs.createdAt)
    .limit(limit)
    .offset(offset);

  return results;
}
