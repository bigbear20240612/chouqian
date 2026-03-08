"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Trash2,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

interface HistoryRecord {
  id: string;
  projectId: string;
  result: {
    value: string | number | string[];
    timestamp: string;
    metadata?: Record<string, unknown>;
  };
  drawnAt: string;
}

export default function HistoryPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHistory();
    fetchProject();
  }, [projectId]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/draw?projectId=${projectId}&limit=100`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.reverse());
      }
    } catch (error) {
      console.error("获取历史记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        const project = data.data.find((p: any) => p.id === projectId);
        if (project) {
          setProjectName(project.name);
        }
      }
    } catch (error) {
      console.error("获取项目失败:", error);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm("确定要删除这条记录吗？")) return;

    try {
      const res = await fetch(`/api/draw/${recordId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRecords(records.filter((r) => r.id !== recordId));
      }
    } catch (error) {
      console.error("删除记录失败:", error);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRecords.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedRecords.size} 条记录吗？`)) return;

    try {
      await Promise.all(
        Array.from(selectedRecords).map((id) =>
          fetch(`/api/draw/${id}`, { method: "DELETE" })
        )
      );
      setRecords(records.filter((r) => !selectedRecords.has(r.id)));
      setSelectedRecords(new Set());
    } catch (error) {
      console.error("批量删除失败:", error);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["序号", "时间", "结果"],
      ...records.map((r, i) => [
        i + 1,
        formatDateTime(r.drawnAt),
        Array.isArray(r.result.value)
          ? r.result.value.join(", ")
          : String(r.result.value),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName}_历史记录_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecords(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRecords.size === records.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(records.map((r) => r.id)));
    }
  };

  const filteredRecords = records.filter((record) => {
    const recordDate = new Date(record.drawnAt);
    const now = new Date();

    if (filter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return recordDate >= today;
    }
    if (filter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return recordDate >= weekAgo;
    }
    return true;
  });

  if (loading) {
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
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-black flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 sm:h-6 w-4 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-black truncate">
                    {projectName || "历史记录"}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    共 {filteredRecords.length} 条记录
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {selectedRecords.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchDelete}
                  className="border-gray-300 text-black text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">删除</span>
                  <span className="inline sm:hidden">({selectedRecords.size})</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-gray-300 text-black text-xs sm:text-sm px-2 sm:px-3"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                导出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-6 py-8">
        {/* 筛选栏 */}
        <Card className="border border-gray-300 bg-white mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-black" />
                <span className="text-sm font-medium text-black">筛选：</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className={
                    filter === "all"
                      ? "bg-black text-white"
                      : "border-gray-300 text-black"
                  }
                >
                  全部
                </Button>
                <Button
                  variant={filter === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("today")}
                  className={
                    filter === "today"
                      ? "bg-black text-white"
                      : "border-gray-300 text-black"
                  }
                >
                  今天
                </Button>
                <Button
                  variant={filter === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("week")}
                  className={
                    filter === "week"
                      ? "bg-black text-white"
                      : "border-gray-300 text-black"
                  }
                >
                  本周
                </Button>
              </div>

              {records.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="border-gray-300 text-black ml-auto"
                >
                  {selectedRecords.size === records.length ? "取消全选" : "全选"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 历史记录列表 */}
        {filteredRecords.length === 0 ? (
          <Card className="border border-gray-300 bg-white">
            <CardContent className="py-24 text-center">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-black mb-2">暂无历史记录</p>
              <p className="text-sm text-gray-600">
                {filter === "all"
                  ? "开始抽签后将显示历史记录"
                  : "该时间段内没有记录"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-gray-300 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-black">抽签记录</h3>
                <span className="text-sm text-gray-600">
                  显示 {filteredRecords.length} 条
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRecords.map((record, index) => (
                  <div
                    key={record.id}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedRecords.has(record.id)
                        ? "bg-black text-white border-black"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedRecords.has(record.id)}
                        onChange={() => toggleSelect(record.id)}
                        className="mt-1 w-4 h-4 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span
                              className={`text-xs font-medium ${
                                selectedRecords.has(record.id)
                                  ? "text-white"
                                  : "text-black"
                              }`}
                            >
                              #{filteredRecords.length - index}
                            </span>
                            <span
                              className={`text-xs ml-3 ${
                                selectedRecords.has(record.id)
                                  ? "text-gray-300"
                                  : "text-gray-600"
                              }`}
                            >
                              {formatDateTime(record.drawnAt)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(record.id)}
                            className={`h-8 w-8 ${
                              selectedRecords.has(record.id)
                                ? "text-white hover:text-gray-300"
                                : "text-gray-600 hover:text-black"
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p
                          className={`font-semibold break-words text-base ${
                            selectedRecords.has(record.id)
                              ? "text-white"
                              : "text-black"
                          }`}
                        >
                          {Array.isArray(record.result.value)
                            ? record.result.value.join(", ")
                            : String(record.result.value)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
