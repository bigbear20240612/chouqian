import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * 数据库连接实例
 * 使用 Vercel Postgres (Neon) 作为数据库
 */

// 创建 mock db 用于开发环境（无数据库时）
const createMockDb = () => {
  // 创建最终的查询结果
  const createQueryResult = () => {
    const result = async () => [];
    result.values = () => createQueryResult();
    result.execute = () => Promise.resolve([]);
    result.then = (onFulfilled: any) => Promise.resolve([]).then(onFulfilled);
    return result;
  };

  // 创建链式调用对象
  const createChainable = (initialValue: any = []) => {
    const result: any = async () => Array.isArray(initialValue) ? initialValue : [];

    // 链式调用方法 - 都返回同一个对象
    result.from = () => createChainable(initialValue);
    result.where = () => createChainable(initialValue);
    result.orderBy = () => createChainable(initialValue);
    result.limit = () => createChainable(initialValue);
    result.offset = () => createChainable(initialValue);
    result.values = () => createChainable(initialValue);
    result.set = () => createChainable(initialValue);
    result.returning = () => createChainable(initialValue);

    // 执行方法
    result.execute = () => Promise.resolve([]);
    result.then = (onFulfilled: any) =>
      Promise.resolve(Array.isArray(initialValue) ? initialValue : []).then(onFulfilled);

    return result;
  };

  return {
    select: () => createChainable([]),
    insert: () => createChainable([]),
    update: () => createChainable([]),
    delete: () => createChainable([]),
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
