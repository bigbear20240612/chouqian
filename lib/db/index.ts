import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { drawProjects, drawRecords, activityLogs } from "./schema";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * 数据库连接实例
 * 使用 Vercel Postgres (Neon) 作为数据库
 */

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// 文件系统持久化存储路径
const DATA_DIR = join(process.cwd(), '.mock-data');
const PROJECTS_FILE = join(DATA_DIR, 'projects.json');
const RECORDS_FILE = join(DATA_DIR, 'records.json');
const LOGS_FILE = join(DATA_DIR, 'logs.json');

// 确保数据目录存在
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// 从文件加载数据
function loadFromFile(filename: string, defaultValue: any[] = []) {
  if (existsSync(filename)) {
    try {
      const data = readFileSync(filename, 'utf-8');
      const parsed = JSON.parse(data);
      // 将日期字符串转换回Date对象
      return parsed.map((item: any) => ({
        ...item,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        drawnAt: item.drawnAt ? new Date(item.drawnAt) : undefined,
      }));
    } catch (error) {
      console.error(`[Mock DB] 加载文件失败: ${filename}`, error);
      return defaultValue;
    }
  }
  return defaultValue;
}

// 保存数据到文件
function saveToFile(filename: string, data: any[]) {
  try {
    writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`[Mock DB] 保存文件失败: ${filename}`, error);
  }
}

// 获取共享的内存存储（单例模式）
export function getMemoryStore() {
  if (!global.__mockMemoryStore) {
    global.__mockMemoryStore = {
      projects: loadFromFile(PROJECTS_FILE),
      records: loadFromFile(RECORDS_FILE),
      logs: loadFromFile(LOGS_FILE),
    };
    console.log("[Mock DB] 初始化全局memoryStore，项目数:", global.__mockMemoryStore.projects.length);
  }
  return global.__mockMemoryStore;
}

// 初始化预置数据
function initMockData() {
  const memoryStore = getMemoryStore();
  if (memoryStore.projects.length === 0) {
    console.log("[Mock DB] 初始化预置数据...");
    // 创建一些预置项目
    memoryStore.projects.push({
      id: generateId(),
      name: "数字抽签示例",
      description: "从1到100中随机抽取数字",
      type: "number",
      config: { min: 1, max: 100, allowRepeat: true, drawCount: 1 },
      uiStyle: "card",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    memoryStore.projects.push({
      id: generateId(),
      name: "学生姓名抽签",
      description: "从班级学生名单中随机抽取",
      type: "name",
      config: {
        items: ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"],
        drawCount: 1
      },
      uiStyle: "card",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 保存到文件
    saveToFile(PROJECTS_FILE, memoryStore.projects);
    console.log("[Mock DB] 预置数据已保存");
  }
}

// 初始化数据
initMockData();

// 创建 mock db 用于开发环境（无数据库时）
const createMockDb = () => {
  // 创建链式调用对象
  const createChainable = (operation: string, initialValue: any = []) => {
    // 状态保存
    let state = {
      operation,
      initialValue,
      table: null as any,
      tableName: 'unknown' as string,
      whereClause: null as any,
      limitValue: null as number | null,
      offsetValue: null as number | null,
    };

    const execute = async () => {
      // 获取共享的内存存储
      const store = getMemoryStore();

      // 执行实际的数据库操作
      if (state.operation === 'select') {
        // 根据表名选择数据源
        let dataSource: any[] = [];
        if (state.tableName === 'drawProjects') {
          dataSource = store.projects;
        } else if (state.tableName === 'drawRecords') {
          dataSource = store.records;
        } else if (state.tableName === 'activityLogs') {
          dataSource = store.logs;
        } else {
          // 默认从 projects 查询
          dataSource = store.projects;
        }
        let results = [...dataSource];

        // 应用 where 过滤
        if (state.whereClause) {
          const where = state.whereClause as any;
          if (where.queryChunks) {
            let fieldName: string | null = null;
            let value: any = null;

            if (where.Params && where.Params.length > 0) {
              value = where.Params[0];
            }

            for (const chunk of where.queryChunks) {
              if (chunk && typeof chunk === 'object') {
                if (chunk.columnNames && chunk.columnNames.length > 0) {
                  fieldName = chunk.columnNames[0];
                }
              }
            }

            if (fieldName && value !== undefined && value !== null) {
              results = results.filter((p: any) => p[fieldName] === value);
            }
          } else if (where.id) {
            results = results.filter((p: any) => p.id === where.id);
          } else if (where.projectId) {
            results = results.filter((p: any) => p.projectId === where.projectId);
          }
        }

        // 应用 limit
        if (state.limitValue !== null) {
          results = results.slice(0, state.limitValue);
        }

        return results;
      }
      if (state.operation === 'insert') {
        // insert操作不应该在这里创建数据
        // 只在returning()时创建并保存，避免重复
        return [];
      }
      if (state.operation === 'update') {
        return store.projects.map((item: any) => ({ ...item, ...state.initialValue }));
      }
      if (state.operation === 'delete') {
        return store.projects.filter((_: any, idx: number) => idx !== 0);
      }
      return state.initialValue;
    };

    const result: any = async () => {
      return await execute();
    };

    // 延迟创建Promise，只在需要时创建
    let _queryPromise: Promise<any> | null = null;
    const getQueryPromise = () => {
      if (!_queryPromise) {
        _queryPromise = execute();
      }
      return _queryPromise;
    };

    // 添加Promise支持，使await可以正常工作
    result.then = (onFulfilled: any, onRejected: any) => getQueryPromise().then(onFulfilled, onRejected);
    result.catch = (onRejected: any) => getQueryPromise().catch(onRejected);
    result.finally = (onFinally: any) => getQueryPromise().finally(onFinally);

    // 链式调用方法 - 保存状态
    result.from = (table: any) => {
      state.table = table;

      // 通过检查特定列来识别表
      const keys = Object.keys(table || {});
      if (keys.includes('name') && keys.includes('type') && keys.includes('config')) {
        state.tableName = 'drawProjects';
      } else if (keys.includes('projectId') && keys.includes('result')) {
        state.tableName = 'drawRecords';
      } else if (keys.includes('level') && keys.includes('action')) {
        state.tableName = 'activityLogs';
      } else {
        state.tableName = 'unknown';
      }

      return result;
    };

    result.where = (clause: any) => {
      state.whereClause = clause;
      return result;
    };

    result.orderBy = () => {
      // 忽略排序，mock 模式不需要排序
      return result;
    };

    result.limit = (value: number) => {
      state.limitValue = value;
      return result;
    };

    result.offset = (value: number) => {
      state.offsetValue = value;
      return result;
    };

    result.values = (data: any) => {
      state.initialValue = data;
      return result;
    };

    result.set = (data: any) => {
      state.initialValue = { ...state.initialValue, ...data };
      return result;
    };

    // returning 方法 - 特别处理
    result.returning = async () => {
      // 获取共享的内存存储
      const store = getMemoryStore();

      // 如果是 insert 操作，返回模拟的插入结果（带 ID）
      if (state.operation === 'insert' && state.initialValue) {
        const newItem = {
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...state.initialValue,
        };
        // 根据 tableName 决定插入到哪个存储
        if (state.tableName === 'drawProjects') {
          store.projects.push(newItem);
          saveToFile(PROJECTS_FILE, store.projects);
        } else if (state.tableName === 'drawRecords') {
          store.records.push(newItem);
          saveToFile(RECORDS_FILE, store.records);
        } else if (state.tableName === 'activityLogs') {
          store.logs.push(newItem);
          saveToFile(LOGS_FILE, store.logs);
        } else {
          // 默认插入到 projects
          store.projects.push(newItem);
          saveToFile(PROJECTS_FILE, store.projects);
        }
        return [newItem];
      }
      return await execute();
    };

    // 执行方法
    result.execute = () => Promise.resolve([]);

    return result;
  };

  return {
    select: () => createChainable('select'),
    insert: (table: any) => {
      const chainable = createChainable('insert');
      chainable.from(table);
      return chainable;
    },
    update: (table: any) => {
      const chainable = createChainable('update');
      chainable.from(table);
      return chainable;
    },
    delete: (table: any) => {
      const chainable = createChainable('delete');
      chainable.from(table);
      return chainable;
    },
  } as any;
};

let dbInstance: any = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    // 开发环境无数据库时返回 mock
    if (!dbInstance) {
      console.warn("⚠️ DATABASE_URL not set. Using mock database (no data persistence).");
      dbInstance = createMockDb();
    }
    return dbInstance;
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
