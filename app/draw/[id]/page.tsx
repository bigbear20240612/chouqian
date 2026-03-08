"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  History as HistoryIcon,
  Sparkles,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DrawCard } from "@/components/draw/DrawCard";
import { DrawStick } from "@/components/draw/DrawStick";
import { DrawWheel } from "@/components/draw/DrawWheel";
import { useAppStore } from "@/store";
import { formatDateTime } from "@/lib/utils";

export default function DrawPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const {
    currentProject,
    setCurrentProject,
    selectedUIStyle,
    setSelectedUIStyle,
    drawHistory,
    addDrawResult,
    setIsLoading,
    setError,
  } = useAppStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<string | number | string[] | null>(null);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchHistoryCount();
    }
  }, [projectId]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects`);
      const data = await res.json();
      if (data.success) {
        const project = data.data.find((p: any) => p.id === projectId);
        if (project) {
          setCurrentProject(project);
          setSelectedUIStyle(project.uiStyle || "card");
        } else {
          setError("项目不存在");
          router.push("/");
        }
      }
    } catch (error) {
      console.error("获取项目失败:", error);
      setError("获取项目失败");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistoryCount = async () => {
    try {
      const res = await fetch(`/api/draw?projectId=${projectId}&limit=1000`);
      const data = await res.json();
      if (data.success) {
        setHistoryCount(data.data.length);
      }
    } catch (error) {
      console.error("获取历史记录数量失败:", error);
    }
  };

  const handleDraw = useCallback(async () => {
    if (isDrawing || !currentProject) return;

    setIsDrawing(true);
    setResult(null);

    try {
      const res = await fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          count: 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const drawResult = data.data.value;
        setResult(drawResult);
        addDrawResult(drawResult);
        await fetchHistoryCount();
      } else {
        setError(data.error || "抽签失败");
      }
    } catch (error) {
      console.error("抽签失败:", error);
      setError("抽签失败");
    } finally {
      setTimeout(() => {
        setIsDrawing(false);
      }, 2000);
    }
  }, [isDrawing, currentProject, projectId, addDrawResult, setIsLoading, setError]);

  const handleReset = () => {
    setResult(null);
  };

  const renderDrawComponent = () => {
    switch (selectedUIStyle) {
      case "stick":
        return <DrawStick isDrawing={isDrawing} result={result} />;
      case "wheel":
        return <DrawWheel isDrawing={isDrawing} result={result} />;
      case "card":
      default:
        return <DrawCard isDrawing={isDrawing} result={result} />;
    }
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 极简导航 */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="text-black">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black">{currentProject.name}</h1>
                  {currentProject.description && (
                    <p className="text-sm text-gray-600 line-clamp-1">{currentProject.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/history/${projectId}`)}
                className="border-gray-300 text-black"
              >
                <HistoryIcon className="h-4 w-4 mr-2" />
                历史记录
                {historyCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-black text-white text-xs rounded-full">
                    {historyCount}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/edit/${projectId}`)}
                className="border-gray-300 text-black"
              >
                <Settings className="h-4 w-4 mr-2" />
                编辑
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-6 py-8">
        {/* 抽签区域 */}
        <div className="max-w-3xl mx-auto">
            <Card className="border border-gray-300 bg-white">
              <CardContent className="pt-8">
                {/* 风格切换 */}
                <div className="flex justify-center gap-2 mb-8">
                  <Button
                    variant={selectedUIStyle === "card" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUIStyle("card")}
                    className={`flex-1 max-w-[100px] rounded-none ${
                      selectedUIStyle === "card" ? "bg-black text-white" : "border-gray-300 text-black"
                    }`}
                  >
                    卡片
                  </Button>
                  <Button
                    variant={selectedUIStyle === "stick" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUIStyle("stick")}
                    className={`flex-1 max-w-[100px] rounded-none ${
                      selectedUIStyle === "stick" ? "bg-black text-white" : "border-gray-300 text-black"
                    }`}
                  >
                    竹签
                  </Button>
                  <Button
                    variant={selectedUIStyle === "wheel" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUIStyle("wheel")}
                    className={`flex-1 max-w-[100px] rounded-none ${
                      selectedUIStyle === "wheel" ? "bg-black text-white" : "border-gray-300 text-black"
                    }`}
                  >
                    转盘
                  </Button>
                </div>

                {/* 抽签组件 */}
                <div className="min-h-[400px] flex items-center justify-center mb-8">
                  {renderDrawComponent()}
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={handleDraw}
                    disabled={isDrawing}
                    className="flex-1 max-w-[300px] bg-black text-white hover:bg-gray-800 text-base h-14 rounded-none"
                  >
                    {isDrawing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        抽签中...
                      </>
                    ) : result ? (
                      <>
                        <RotateCcw className="h-5 w-5 mr-2" />
                        再次抽签
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        开始抽签
                      </>
                    )}
                  </Button>
                  {result && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isDrawing}
                      className="h-14 rounded-none border-gray-300 text-black"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      重置
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
      </main>
    </div>
  );
}
