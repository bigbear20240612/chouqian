import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";

/**
 * 抽签项目表
 * 存储各种抽签项目的配置信息
 */
export const drawProjects = pgTable("draw_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'number', 'name', 'poem', 'custom'
  config: jsonb("config").notNull().$type<{
    // 数字抽签配置
    min?: number;
    max?: number;
    allowRepeat?: boolean;
    // 列表抽签配置
    items?: string[];
    // 其他配置
    drawCount?: number;
  }>(),
  uiStyle: varchar("ui_style", { length: 50 }).default("card"), // 'stick', 'card', 'wheel'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 抽签记录表
 * 记录每次抽签的结果
 */
export const drawRecords = pgTable("draw_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => drawProjects.id, { onDelete: "cascade" }),
  result: jsonb("result").notNull().$type<{
    // 抽签结果
    value: string | number | string[];
    timestamp: string;
    // 额外信息
    metadata?: Record<string, unknown>;
  }>(),
  drawnAt: timestamp("drawn_at").defaultNow(),
});

/**
 * 操作日志表
 * 记录系统操作日志
 */
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  level: varchar("level", { length: 20 }).notNull(), // 'info', 'warning', 'error'
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// TypeScript 类型导出
export type DrawProject = typeof drawProjects.$inferSelect;
export type NewDrawProject = typeof drawProjects.$inferInsert;
export type DrawRecord = typeof drawRecords.$inferSelect;
export type NewDrawRecord = typeof drawRecords.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

// 抽签项目类型
export type DrawProjectType = "number" | "name" | "poem" | "custom";

// UI 风格类型
export type UIStyle = "stick" | "card" | "wheel";

// 日志级别
export type LogLevel = "info" | "warning" | "error";
