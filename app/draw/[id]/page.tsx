"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  History as HistoryIcon,
  Sparkles,
  Settings,
  BarChart3,
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
  const [showHistory, setShowHistory] = useState(true);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchHistory();
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

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/draw?projectId=${projectId}&limit=50`);
      const data = await res.json();
      if (data.success) {
        setHistoryRecords(data.data.reverse());
      }
    } catch (error) {
      console.error("获取历史记录失败:", error);
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
        await fetchHistory();
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-white to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-teal-50">
      {/* 顶部导航 */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {currentProject.name}
                  </h1>
                  {currentProject.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {currentProject.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showHistory ? "default" : "outline"}
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="hidden sm:flex"
              >
                <HistoryIcon className="h-4 w-4 mr-2" />
                历史
                {historyRecords.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    {historyRecords.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧抽签区域 */}
          <div className="lg:col-span-2">
            <Card className="border-2 shadow-lg">
              <CardContent className="pt-8">
                {/* 风格切换 */}
                <div className="flex justify-center gap-2 mb-8">
                  <Button
                    variant={selectedUIStyle === "card" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUIStyle("card")}
                    className="flex-1 max-w-[100px]"
                  >
                    🎴 卡片
                  </Button>
                  <Button
                    variant={selectedUIStyle === "stick" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUIStyle("stick")}
                    className="flex-1 max-w-[100px]"
                  >
                    🎋 竹签
                  </Button>
                  <Button
                    variant={selectedUIStyle === "wheel" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUIStyle("wheel")}
                    className="flex-1 max-w-[100px]"
                  >
                    🎡 转盘
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
                    className="flex-1 max-w-[300px] shadow-xl hover:shadow-2xl text-base h-14"
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
                      className="h-14"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      重置
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧历史记录 */}
          <div className={`lg:col-span-1 transition-all ${showHistory ? "block" : "hidden lg:block"}`}>
            <Card className="sticky top-24 shadow-lg border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HistoryIcon className="h-5 w-5 text-orange-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      历史记录
                    </h3>
                  </div>
                  {historyRecords.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {historyRecords.length} 次
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {historyRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">暂无记录</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      开始抽签后将显示历史记录
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {historyRecords.map((record, index) => (
                      <div
                        key={record.id}
                        className="p-3 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                            #{historyRecords.length - index}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(record.drawnAt)}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 break-words text-base">
                          {Array.isArray(record.result.value)
                            ? record.result.value.join(", ")
                            : String(record.result.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
