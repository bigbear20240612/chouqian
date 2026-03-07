import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * 数据库连接实例
 * 使用 Vercel Postgres (Neon) 作为数据库
 */

// 创建 mock db 用于开发环境（无数据库时）
const createMockDb = () => {
  const mockObj = new Proxy({}, {
    get: () => {
      const fn = async () => {
        console.warn("Database not configured. Returning empty result.");
        return [];
      };
      return fn;
    }
  }) as any;
  return mockObj;
};

let dbInstance: any = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    // 开发环境无数据库时返回 mock
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
