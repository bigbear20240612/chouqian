"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, History as HistoryIcon } from "lucide-react";
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

  const { currentProject, setCurrentProject, selectedUIStyle, setSelectedUIStyle, drawHistory, addDrawResult, setIsLoading, setError } = useAppStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<string | number | string[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
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
      const res = await fetch(`/api/draw?projectId=${projectId}&limit=20`);
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

        // 刷新历史记录
        await fetchHistory();
      } else {
        setError(data.error || "抽签失败");
      }
    } catch (error) {
      console.error("抽签失败:", error);
      setError("抽签失败");
    } finally {
      // 延迟结束动画状态
      setTimeout(() => {
        setIsDrawing(false);
      }, 2000);
    }
  }, [isDrawing, currentProject, projectId, addDrawResult]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="border-b border-border/50 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{currentProject.name}</h1>
              {currentProject.description && (
                <p className="text-sm text-muted-foreground">{currentProject.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className={showHistory ? "bg-primary/10" : ""}
            >
              <HistoryIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧抽签区域 */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <CardContent className="pt-0">
                {/* 风格切换 */}
                <div className="flex justify-center gap-2 mb-8">
                  <Button
                    variant={selectedUIStyle === "card" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUIStyle("card")}
                  >
                    🎴 卡片
                  </Button>
                  <Button
                    variant={selectedUIStyle === "stick" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUIStyle("stick")}
                  >
                    🎋 竹签
                  </Button>
                  <Button
                    variant={selectedUIStyle === "wheel" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUIStyle("wheel")}
                  >
                    🎡 转盘
                  </Button>
                </div>

                {/* 抽签组件 */}
                <div className="min-h-[400px] flex items-center justify-center mb-8">
                  {renderDrawComponent()}
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={handleDraw}
                    disabled={isDrawing}
                    className="min-w-[200px] shadow-lg"
                  >
                    {isDrawing ? "抽签中..." : result ? "再次抽签" : "开始抽签"}
                  </Button>
                  {result && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isDrawing}
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
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="text-lg font-bold">历史记录</h3>
              </CardHeader>
              <CardContent>
                {historyRecords.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">暂无记录</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {historyRecords.map((record) => (
                      <div
                        key={record.id}
                        className="p-3 bg-muted/50 rounded-xl"
                      >
                        <p className="font-medium break-words">
                          {Array.isArray(record.result.value)
                            ? record.result.value.join(", ")
                            : String(record.result.value)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(record.drawnAt)}
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
