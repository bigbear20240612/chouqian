import type { DrawProject, DrawProjectType, UIStyle, DrawRecord } from "@/lib/db/schema";

/**
 * 抽签配置接口
 */
export interface DrawConfig {
  // 数字抽签配置
  min?: number;
  max?: number;
  allowRepeat?: boolean;
  // 列表抽签配置
  items?: string[];
  // 通用配置
  drawCount?: number;
}

/**
 * 抽签结果接口
 */
export interface DrawResult {
  value: string | number | string[] | number[];
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * 抽签项目详情（包含记录）
 */
export interface DrawProjectWithRecords extends DrawProject {
  records?: DrawRecord[];
  _count?: {
    records: number;
  };
}

/**
 * API 响应接口
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 创建项目请求
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  type: DrawProjectType;
  config: DrawConfig;
  uiStyle?: UIStyle;
}

/**
 * 更新项目请求
 */
export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

/**
 * 执行抽签请求
 */
export interface ExecuteDrawRequest {
  projectId: string;
  count?: number;
}

/**
 * 导入数据请求
 */
export interface ImportDataRequest {
  projectId: string;
  data: string[];
  format: "text" | "csv" | "excel";
}

/**
 * 日志查询参数
 */
export interface LogQueryParams {
  level?: "info" | "warning" | "error";
  action?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}
