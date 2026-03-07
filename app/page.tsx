"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Sparkles, Dice3, Users, Scroll, Settings } from "lucide-react";
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
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="border-b border-border/50 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">多功能抽签系统</h1>
              <p className="text-sm text-muted-foreground">让课堂更有趣</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8">
        {/* 欢迎区域 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            欢迎使用 <span className="text-gradient">抽签系统</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            一个功能完善、界面活泼可爱的抽签系统，专为课堂教学活动设计。
            支持数字、姓名、诗词等多种抽签方式。
          </p>
        </div>

        {/* 快速操作 */}
        <div className="flex justify-center mb-12">
          <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl" asChild>
            <Link href="/projects/new">
              <Plus className="h-5 w-5" />
              创建新项目
            </Link>
          </Button>
        </div>

        {/* 项目列表 */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">我的项目</h3>
          <span className="text-sm text-muted-foreground">
            共 {projects?.length || 0} 个项目
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        ) : !projects || projects.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Sparkles className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground mb-4">还没有任何项目</p>
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  创建第一个项目
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <Link key={project.id} href={`/draw/${project.id}`}>
                <Card className="hover-lift cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${PROJECT_COLORS[project.type] || PROJECT_COLORS.custom} flex items-center justify-center text-white`}>
                        {PROJECT_ICONS[project.type] || PROJECT_ICONS.custom}
                      </div>
                    </div>
                    <CardTitle className="mt-4">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription>{project.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {project.type === "number" && "数字抽签"}
                        {project.type === "name" && "姓名抽签"}
                        {project.type === "poem" && "诗词抽签"}
                        {project.type === "custom" && "自定义抽签"}
                      </span>
                      <span className="text-primary font-medium">
                        开始抽签 →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* 新建项目卡片 */}
            <Link href="/projects/new">
              <Card className="border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 cursor-pointer h-full flex items-center justify-center min-h-[200px]">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">创建新项目</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-border/50 mt-16 py-8 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>多功能抽签系统 - 让课堂更有趣</p>
        </div>
      </footer>
    </div>
  );
}
