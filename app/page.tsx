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
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store";

// 项目图标映射 - 黑白
const PROJECT_ICONS: Record<string, React.ReactNode> = {
  number: <Dice3 className="h-8 w-8" />,
  name: <Users className="h-8 w-8" />,
  poem: <Scroll className="h-8 w-8" />,
  custom: <Sparkles className="h-8 w-8" />,
};

// 项目类型标签 - 纯黑白
const PROJECT_LABELS: Record<string, { text: string }> = {
  number: { text: "数字抽签" },
  name: { text: "姓名抽签" },
  poem: { text: "诗词抽签" },
  custom: { text: "自定义" },
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
    <div className="min-h-screen bg-white">
      {/* 极简顶部导航 */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-black">抽签系统</h1>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-black">
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-1" />
              新建
            </Link>
          </Button>
        </div>
      </header>

      {/* 极简 Hero */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-6xl font-bold text-black mb-6">
          课堂抽签工具
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          简单易用，快速抽签
        </p>
        <Button
          size="lg"
          asChild
          className="bg-black text-white hover:bg-gray-800 text-lg h-14 px-8 rounded-none"
        >
          <Link href="/projects/new">
            <Plus className="h-5 w-5 mr-2" />
            开始使用
          </Link>
        </Button>
      </section>

      {/* 项目列表 - 极简设计 */}
      <section className="container mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold text-black mb-8">我的项目</h3>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : !projects || projects.length === 0 ? (
          <Card className="border border-gray-300 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-xl font-semibold text-black mb-2">
                还没有任何项目
              </h4>
              <p className="text-gray-600 mb-6">创建您的第一个抽签项目</p>
              <Button
                size="lg"
                asChild
                className="bg-black text-white hover:bg-gray-800 rounded-none"
              >
                <Link href="/projects/new">
                  <Plus className="h-5 w-5 mr-2" />
                  创建项目
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/draw/${project.id}`}>
                <Card className="border border-gray-300 bg-white hover:border-black transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center text-white">
                        {PROJECT_ICONS[project.type] || PROJECT_ICONS.custom}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-black">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="text-gray-600 line-clamp-2">
                        {project.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-black">
                      <span className="text-sm text-gray-600">点击开始抽签</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* 新建项目卡片 */}
            <Link href="/projects/new">
              <Card className="border border-dashed border-gray-400 hover:border-black bg-white cursor-pointer h-full flex items-center justify-center min-h-[240px] transition-colors">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-gray-600" />
                  </div>
                  <p className="text-lg font-semibold text-black">创建新项目</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </section>

      {/* 页脚 - 极简 */}
      <footer className="border-t border-gray-200 mt-20 py-8 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>抽签系统</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
