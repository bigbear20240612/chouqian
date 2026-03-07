import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * 数据库连接实例
 * 使用 Vercel Postgres (Neon) 作为数据库
 */

// 创建 mock db 用于开发环境（无数据库时）
const createMockDb = () => {
  const createChainable = () => {
    const result: any = async () => [];

    // 链式调用方法
    result.from = () => createChainable();
    result.where = () => createChainable();
    result.orderBy = () => createChainable();
    result.limit = () => createChainable();
    result.offset = () => createChainable();
    result.values = () => createChainable();
    result.set = () => createChainable();
    result.returning = () => createChainable();
    result.execute = () => Promise.resolve([]);

    return result;
  };

  return {
    select: () => createChainable(),
    insert: () => createChainable(),
    update: () => createChainable(),
    delete: () => createChainable(),
  } as any;
};

let dbInstance: any = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    // 开发环境无数据库时返回 mock
    console.warn("⚠️ DATABASE_URL not set. Using mock database (no data persistence).");
    return createMockDb();
  }
  if (!dbInstance) {
    const sql = neon(process.env.DATABASE_URL);
    dbInstance = drizzle(sql, { schema });
  }
  return dbInstance;
}

// 向后兼容的导出
export const db = getDb();

// 导出 schema 供查询使用
export * from "./schema";
