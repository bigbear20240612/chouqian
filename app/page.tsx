"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Sparkles,
  Dice3,
  Users,
  Scroll,
  Settings,
  Zap,
  Shield,
  Palette,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store";

// 项目图标映射
const PROJECT_ICONS: Record<string, React.ReactNode> = {
  number: <Dice3 className="h-8 w-8" />,
  name: <Users className="h-8 w-8" />,
  poem: <Scroll className="h-8 w-8" />,
  custom: <Sparkles className="h-8 w-8" />,
};

// 项目颜色映射
const PROJECT_COLORS: Record<string, string> = {
  number: "from-blue-500 to-cyan-500",
  name: "from-pink-500 to-rose-500",
  poem: "from-amber-500 to-orange-500",
  custom: "from-emerald-500 to-teal-500",
};

// 项目类型标签
const PROJECT_LABELS: Record<string, { text: string; color: string }> = {
  number: { text: "数字抽签", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  name: { text: "姓名抽签", color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
  poem: { text: "诗词抽签", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  custom: { text: "自定义", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
};

export default function HomePage() {
  const { projects, setProjects, isLoading, setIsLoading } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProjects(data.data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("获取项目列表失败:", error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-teal-50">
      {/* 顶部导航 */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                多功能抽签系统
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects/new">
                <Plus className="h-4 w-4 mr-1" />
                新建
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 mb-6">
            <Sparkles className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              让课堂更有趣
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              专为课堂设计
            </span>
            <br />
            <span className="text-gray-900 dark:text-gray-100">的抽签系统</span>
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            简单易用，功能强大。支持多种抽签方式，让您的课堂互动更加生动有趣。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 shadow-xl hover:shadow-2xl text-base h-12 px-8" asChild>
              <Link href="/projects/new">
                <Plus className="h-5 w-5" />
                创建第一个项目
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base h-12 px-8" asChild>
              <Link href="#features">
                <BarChart3 className="h-5 w-5" />
                了解功能
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 特性展示 */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle>快速抽签</CardTitle>
              <CardDescription>
                一键启动，秒出结果。支持数字、姓名、诗词等多种抽签模式。
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <CardTitle>精美动画</CardTitle>
              <CardDescription>
                三种展示风格，流畅的动画效果，让抽签过程充满期待感。
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle>数据安全</CardTitle>
              <CardDescription>
                完整的历史记录，支持批量导入，数据持久化存储。
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 项目列表 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              我的项目
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              管理和运行您的抽签项目
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            共 <span className="font-semibold text-gray-900 dark:text-gray-100">{projects?.length || 0}</span> 个项目
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">加载中...</p>
          </div>
        ) : !projects || projects.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-orange-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                还没有任何项目
              </h4>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                创建您的第一个抽签项目，开始体验便捷的课堂互动工具
              </p>
              <Button size="lg" asChild>
                <Link href="/projects/new">
                  <Plus className="h-5 w-5 mr-2" />
                  创建第一个项目
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/draw/${project.id}`}>
                <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-2 hover:border-orange-200">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${PROJECT_COLORS[project.type] || PROJECT_COLORS.custom} flex items-center justify-center text-white shadow-lg`}>
                        {PROJECT_ICONS[project.type] || PROJECT_ICONS.custom}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${PROJECT_LABELS[project.type]?.color || PROJECT_LABELS.custom.color}`}>
                        {PROJECT_LABELS[project.type]?.text || "自定义"}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="text-sm mt-2 line-clamp-2">
                        {project.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        点击开始抽签
                      </span>
                      <div className="flex items-center gap-1 text-orange-600 font-medium">
                        开始
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* 新建项目卡片 */}
            <Link href="/projects/new">
              <Card className="border-2 border-dashed hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 cursor-pointer h-full flex items-center justify-center min-h-[280px] transition-colors group">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-8 w-8 text-orange-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    创建新项目
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    支持数字、姓名、诗词等多种模式
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </section>

      {/* 页脚 */}
      <footer className="border-t border-border/50 mt-16 py-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                多功能抽签系统 - 让课堂更有趣
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>© 2026</span>
              <span>•</span>
              <span>基于 Next.js 16 构建</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
