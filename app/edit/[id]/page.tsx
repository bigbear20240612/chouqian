"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Download,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  config: {
    items?: string[];
    min?: number;
    max?: number;
    [key: string]: any;
  };
  uiStyle: string;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        const foundProject = data.data.find((p: Project) => p.id === projectId);
        if (foundProject) {
          setProject(foundProject);
          setName(foundProject.name);
          setDescription(foundProject.description || "");
          setItems(foundProject.config.items || []);
        }
      }
    } catch (error) {
      console.error("获取项目失败:", error);
      showMessage("error", "获取项目失败");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!project) return;

    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projectId,
          name,
          description,
          config: {
            ...project.config,
            items,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        showMessage("success", "保存成功！");
        setProject(data.data);
      } else {
        showMessage("error", data.error || "保存失败");
      }
    } catch (error) {
      console.error("保存失败:", error);
      showMessage("error", "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    // 确认删除
    const confirmed = window.confirm(
      `确定要删除项目"${project.name}"吗？\n\n此操作将：\n• 删除项目配置\n• 删除所有相关的抽签历史记录\n\n此操作不可撤销！`
    );

    if (!confirmed) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/projects?id=${projectId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        showMessage("success", "项目已删除！");
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        showMessage("error", data.error || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      showMessage("error", "删除失败");
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const newItems = [...items];
      newItems[editingIndex] = editingValue.trim();
      setItems(newItems);
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleExport = () => {
    const textContent = items.join("\n");
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name}_签列表.txt`;
    link.click();
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        setItems([...items, ...lines]);
        showMessage("success", `已导入 ${lines.length} 条签`);
      }
    };
    input.click();
  };

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

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">项目不存在</p>
          <Button onClick={() => router.push("/")} className="mt-4 bg-black text-white">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const hasItems = project.config.items !== undefined;

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-black"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                  <Edit3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black">编辑项目</h1>
                  <p className="text-sm text-gray-600">修改项目信息和签列表</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-gray-300 text-black"
              >
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImport}
                className="border-gray-300 text-black"
              >
                <Upload className="h-4 w-4 mr-2" />
                导入
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={saving}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除项目
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white hover:bg-gray-800"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* 消息提示 */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 基本信息 */}
        <Card className="border border-gray-300 bg-white mb-6">
          <CardHeader>
            <h3 className="text-lg font-bold text-black">基本信息</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-black">项目名称</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-300"
                placeholder="输入项目名称"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-black">项目描述</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-gray-300"
                placeholder="输入项目描述（可选）"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 签列表编辑 */}
        {hasItems ? (
          <Card className="border border-gray-300 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-black">签列表</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    共 {items.length} 条签
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItems([])}
                  className="border-gray-300 text-black"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  清空全部
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 添加新签 */}
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
                  className="border-gray-300"
                  placeholder="输入新的签，按回车添加"
                />
                <Button
                  onClick={handleAddItem}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加
                </Button>
              </div>

              {/* 签列表 */}
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>暂无签，请添加</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 group hover:border-gray-300"
                    >
                      <span className="text-sm font-medium text-gray-600 w-8 flex-shrink-0">
                        {index + 1}
                      </span>

                      {editingIndex === index ? (
                        <>
                          <Input
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                            className="flex-1 border-gray-300"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-black break-words">
                            {item}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleStartEdit(index)}
                            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-black"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteItem(index)}
                            className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-gray-300 bg-white">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">此项目类型不支持编辑签列表</p>
              <p className="text-sm text-gray-500 mt-2">
                {project.type === "number" && "数字抽签项目使用范围配置"}
                {project.type === "poem" && "诗词抽签使用预置诗词库"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 批量操作提示 */}
        {hasItems && (
          <Card className="border border-gray-300 bg-white mt-6">
            <CardHeader>
              <h4 className="text-sm font-bold text-black">💡 使用提示</h4>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>• 点击"添加"按钮或按回车键添加新签</p>
              <p>• 鼠标悬停在某条签上可以编辑或删除</p>
              <p>• 使用"导出"功能可以备份签列表到本地</p>
              <p>• 使用"导入"功能可以从文本文件批量导入签（每行一个）</p>
              <p>• 修改完成后记得点击"保存"按钮</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
