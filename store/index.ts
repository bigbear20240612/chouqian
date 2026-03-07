import { create } from "zustand";
import type { DrawProjectWithRecords } from "@/types";
import type { UIStyle } from "@/lib/db/schema";

/**
 * 应用状态管理 - Zustand Store
 */

interface AppState {
  // 当前选中的项目
  currentProject: DrawProjectWithRecords | null;
  setCurrentProject: (project: DrawProjectWithRecords | null) => void;

  // 项目列表
  projects: DrawProjectWithRecords[];
  setProjects: (projects: DrawProjectWithRecords[]) => void;
  addProject: (project: DrawProjectWithRecords) => void;
  updateProject: (id: string, project: Partial<DrawProjectWithRecords>) => void;
  removeProject: (id: string) => void;

  // UI 状态
  selectedUIStyle: UIStyle;
  setSelectedUIStyle: (style: UIStyle) => void;

  // 抽签历史（当前会话）
  drawHistory: Array<{
    id: string;
    result: string | number | string[];
    timestamp: string;
  }>;
  addDrawResult: (result: string | number | string[]) => void;
  clearDrawHistory: () => void;

  // 加载状态
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // 错误状态
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  currentProject: null,
  projects: [],
  selectedUIStyle: "card",
  drawHistory: [],
  isLoading: false,
  error: null,

  // 项目操作
  setCurrentProject: (project) => set({ currentProject: project }),

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updatedProject) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updatedProject } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updatedProject }
          : state.currentProject,
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),

  // UI 状态
  setSelectedUIStyle: (style) => set({ selectedUIStyle: style }),

  // 历史记录
  addDrawResult: (result) =>
    set((state) => ({
      drawHistory: [
        ...state.drawHistory,
        {
          id: crypto.randomUUID(),
          result,
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  clearDrawHistory: () => set({ drawHistory: [] }),

  // 加载和错误状态
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
