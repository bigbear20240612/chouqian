"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROJECT_TYPES = [
  { value: "number", label: "数字抽签", icon: "🔢", description: "设置数字范围进行随机抽签" },
  { value: "name", label: "姓名抽签", icon: "👥", description: "从学生名单中随机抽取" },
  { value: "poem", label: "诗词抽签", icon: "📜", description: "随机抽取古诗词" },
  { value: "custom", label: "自定义抽签", icon: "✨", description: "自定义抽签内容" },
];

const UI_STYLES = [
  { value: "card", label: "卡片风格", icon: "🎴" },
  { value: "stick", label: "竹签风格", icon: "🎋" },
  { value: "wheel", label: "转盘风格", icon: "🎡" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("");
  const [uiStyle, setUiStyle] = useState<string>("card");
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [items, setItems] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !type) {
      alert("请填写项目名称和类型");
      return;
    }

    setIsLoading(true);

    try {
      const config: any = {};
      if (type === "number") {
        config.min = parseInt(min);
        config.max = parseInt(max);
        config.allowRepeat = true;
        config.drawCount = 1;
      } else {
        config.items = items ? items.split("\n").filter(i => i.trim()) : [];
        config.drawCount = 1;
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          type,
          config,
          uiStyle,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/draw/${data.data.id}`);
      } else {
        alert(data.error || "创建失败");
      }
    } catch (error) {
      console.error("创建项目失败:", error);
      alert("创建项目失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="border-b border-border/50 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">创建新项目</h1>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>设置项目的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">项目名称 *</Label>
                <Input
                  id="name"
                  placeholder="例如：学生姓名抽签"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">项目描述</Label>
                <Input
                  id="description"
                  placeholder="简单描述这个项目的用途"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 选择类型 */}
          <Card>
            <CardHeader>
              <CardTitle>抽签类型 *</CardTitle>
              <CardDescription>选择抽签的方式</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择抽签类型" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      <div className="flex items-center gap-2">
                        <span>{pt.icon}</span>
                        <div>
                          <div className="font-medium">{pt.label}</div>
                          <div className="text-xs text-muted-foreground">{pt.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* 类型配置 */}
          {type === "number" && (
            <Card>
              <CardHeader>
                <CardTitle>数字范围</CardTitle>
                <CardDescription>设置抽签的数字范围</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min">最小值</Label>
                    <Input
                      id="min"
                      type="number"
                      value={min}
                      onChange={(e) => setMin(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max">最大值</Label>
                    <Input
                      id="max"
                      type="number"
                      value={max}
                      onChange={(e) => setMax(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(type === "name" || type === "custom") && (
            <Card>
              <CardHeader>
                <CardTitle>抽签内容</CardTitle>
                <CardDescription>
                  {type === "name" ? "输入学生名单，每行一个" : "输入抽签内容，每行一个"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full h-40 px-4 py-3 rounded-xl border-2 border-input bg-background resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                  placeholder={type === "name" ? "张三\n李四\n王五" : "选项一\n选项二\n选项三"}
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  每行一个，共 {items ? items.split("\n").filter(i => i.trim()).length : 0} 项
                </p>
              </CardContent>
            </Card>
          )}

          {/* UI 风格 */}
          <Card>
            <CardHeader>
              <CardTitle>展示风格</CardTitle>
              <CardDescription>选择抽签结果的展示方式</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={uiStyle} onValueChange={setUiStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="选择展示风格" />
                </SelectTrigger>
                <SelectContent>
                  {UI_STYLES.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      <div className="flex items-center gap-2">
                        <span>{style.icon}</span>
                        <span>{style.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/")}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !type}
            >
              {isLoading ? (
                "创建中..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  创建项目
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
