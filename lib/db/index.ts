import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * 数据库连接实例
 * 使用 Vercel Postgres (Neon) 作为数据库
 */

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// 内存存储（用于 mock 模式）
const memoryStore = {
  projects: [] as any[],
};

// 创建 mock db 用于开发环境（无数据库时）
const createMockDb = () => {
  // 创建链式调用对象
  const createChainable = (operation: string, initialValue: any = []) => {
    const result: any = async () => {
      // 执行实际的数据库操作
      if (operation === 'select') {
        return [...memoryStore.projects];
      }
      if (operation === 'insert') {
        const newItem = {
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...initialValue,
        };
        memoryStore.projects.push(newItem);
        return [newItem]; // returning() 期望返回数组
      }
      if (operation === 'update') {
        return memoryStore.projects.map((item: any) => ({ ...item, ...initialValue }));
      }
      if (operation === 'delete') {
        return memoryStore.projects.filter((_: any, idx: number) => idx !== 0);
      }
      return initialValue;
    };

    // 链式调用方法
    result.from = () => createChainable(operation, initialValue);
    result.where = () => createChainable(operation, initialValue);
    result.orderBy = () => createChainable(operation, initialValue);
    result.limit = () => createChainable(operation, initialValue);
    result.offset = () => createChainable(operation, initialValue);
    result.values = () => createChainable(operation, initialValue);
    result.set = (data: any) => createChainable(operation, data);

    // returning 方法 - 特别处理
    result.returning = () => {
      // 如果是 insert 操作，返回模拟的插入结果（带 ID）
      if (operation === 'insert' && initialValue) {
        const newItem = {
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...initialValue,
        };
        memoryStore.projects.push(newItem);
        // 返回一个特殊的 Promise，模拟真实的 returning 行为
        const returnResult: any = async () => [newItem];
        returnResult.then = (onFulfilled: any) => Promise.resolve([newItem]).then(onFulfilled);
        return returnResult;
      }
      return createChainable(operation, initialValue);
    };

    // 执行方法
    result.execute = () => Promise.resolve([]);

    return result;
  };

  return {
    select: () => createChainable('select'),
    insert: () => createChainable('insert'),
    update: () => createChainable('update'),
    delete: () => createChainable('delete'),
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
