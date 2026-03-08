"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, CheckCircle2, ArrowRight, Dice3, Users, Scroll, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROJECT_TYPES = [
  {
    value: "number",
    label: "数字抽签",
    icon: <Dice3 className="h-8 w-8" />,
    description: "设置数字范围进行随机抽取",
  },
  {
    value: "name",
    label: "姓名抽签",
    icon: <Users className="h-8 w-8" />,
    description: "导入名单，随机抽取姓名",
  },
  {
    value: "poem",
    label: "诗词抽签",
    icon: <Scroll className="h-8 w-8" />,
    description: "从古诗词库中随机抽取",
  },
  {
    value: "custom",
    label: "自定义抽签",
    icon: <Wand2 className="h-8 w-8" />,
    description: "自定义抽签内容",
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
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
      } else if (type === "poem") {
        // 诗词抽签使用预置数据，这里暂时不设置items
        // 实际抽签时应该使用预置的诗词库
        config.drawCount = 1;
        // 标记为poem类型，以便后端识别
        config.isPoem = true;
      } else {
        // name 和 custom 类型使用用户输入的items
        config.items = items ? items.split("\n").filter((i) => i.trim()) : [];
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
          uiStyle: "card",
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
    <div className="min-h-screen bg-white">
      {/* 极简导航 */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="text-black">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-black">创建项目</h1>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* 基本信息 */}
          <Card className="border border-gray-300 bg-white">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-black flex items-center gap-2">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm sm:text-base font-medium text-black">
                  项目名称 <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="例如：学生姓名抽签"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-base h-12 mt-2 border-gray-300 placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-medium text-black">
                  项目描述
                </Label>
                <Input
                  id="description"
                  placeholder="简单描述这个项目的用途"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-base h-12 mt-2 border-gray-300 placeholder:text-gray-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* 选择类型 */}
          <Card className="border border-gray-300 bg-white">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-black">选择抽签类型</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {PROJECT_TYPES.map((pt) => (
                  <Card
                    key={pt.value}
                    className={`cursor-pointer transition-all ${
                      type === pt.value
                        ? "border-2 border-black bg-gray-50"
                        : "border border-gray-300 bg-white hover:border-gray-400"
                    }`}
                    onClick={() => setType(pt.value)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center text-white">
                          {pt.icon}
                        </div>
                        {type === pt.value && (
                          <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg text-black">{pt.label}</CardTitle>
                      <CardDescription className="text-gray-600">{pt.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 详细配置 */}
          {type && (
            <Card className="border border-gray-300 bg-white">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-black">详细配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {type === "number" && (
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-sm sm:text-base text-black">数字范围</h4>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="min" className="text-black text-sm sm:text-base">最小值</Label>
                        <Input
                          id="min"
                          type="number"
                          placeholder="1"
                          value={min}
                          onChange={(e) => setMin(e.target.value)}
                          className="text-base h-10 sm:h-12 border-gray-300 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max" className="text-black text-sm sm:text-base">最大值</Label>
                        <Input
                          id="max"
                          type="number"
                          placeholder="100"
                          value={max}
                          onChange={(e) => setMax(e.target.value)}
                          className="text-base h-10 sm:h-12 border-gray-300 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(type === "name" || type === "custom") && (
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-sm sm:text-base text-black">
                      {type === "name" ? "学生名单" : "抽签内容"}
                    </h4>
                    <textarea
                      className="w-full h-32 sm:h-40 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 bg-white resize-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm sm:text-base placeholder:text-gray-400"
                      placeholder={
                        type === "name"
                          ? "张三\\n李四\\n王五\\n..."
                          : "选项一\\n选项二\\n选项三\\n..."
                      }
                      value={items}
                      onChange={(e) => setItems(e.target.value)}
                    />
                    <p className="text-xs sm:text-sm text-gray-600">
                      共 {items ? items.split("\\n").filter((i) => i.trim()).length : 0} 项内容
                    </p>
                  </div>
                )}

                {type === "poem" && (
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-700">
                      📚 诗词抽签将使用预置的古诗词库，包含唐诗宋词等经典作品。
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 提交按钮 */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/")}
              className="rounded-none border-gray-300 text-black w-full sm:w-auto"
            >
              取消
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !type}
              className="bg-black text-white hover:bg-gray-800 rounded-none w-full sm:w-auto"
            >
              {isLoading ? "创建中..." : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
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
