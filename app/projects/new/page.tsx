"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
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
    icon: "🔢",
    description: "设置数字范围（如1-100），系统将随机抽取数字",
    example: "适用于：幸运号码、随机分组、点名等",
  },
  {
    value: "name",
    label: "姓名抽签",
    icon: "👥",
    description: "导入学生名单，随机抽取姓名",
    example: "适用于：课堂提问、小组分工、活动抽奖等",
  },
  {
    value: "poem",
    label: "诗词抽签",
    icon: "📜",
    description: "从古诗词库中随机抽取，支持预置诗词",
    example: "适用于：诗词学习、文学课堂等",
  },
  {
    value: "custom",
    label: "自定义抽签",
    icon: "✨",
    description: "完全自定义抽签内容，灵活自由",
    example: "适用于：自定义题目、奖品、任务等",
  },
];

const UI_STYLES = [
  { value: "card", label: "卡片风格", icon: "🎴", description: "现代设计，3D翻转动画" },
  { value: "stick", label: "竹签风格", icon: "🎋", description: "传统中式，摇晃动画" },
  { value: "wheel", label: "转盘风格", icon: "🎡", description: "经典转盘，旋转减速" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [uiStyle, setUiStyle] = useState("card");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* 顶部导航 */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                创建新项目
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                简单几步，创建您的抽签项目
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 步骤指示器 */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              <StepIndicator number={1} active={step === 1} completed={step > 1} label="基本信息" />
              <div className={`w-16 h-1 rounded-full ${step > 1 ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`} />
              <StepIndicator number={2} active={step === 2} completed={step > 2} label="选择类型" />
              <div className={`w-16 h-1 rounded-full ${step > 2 ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`} />
              <StepIndicator number={3} active={step === 3} completed={false} label="完成配置" />
            </div>
          </div>

          {/* 步骤 1: 基本信息 */}
          {step === 1 && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-blue-500" />
                  基本信息
                </CardTitle>
                <CardDescription>
                  先给您的项目起个名字，让它更容易识别
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-base font-medium">
                    项目名称 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="例如：学生姓名抽签"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="text-base h-12 mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">建议使用简洁明了的名称</p>
                </div>

                <div>
                  <Label htmlFor="description" className="text-base font-medium">
                    项目描述
                  </Label>
                  <Input
                    id="description"
                    placeholder="简单描述这个项目的用途"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-base h-12 mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">可选，帮助您更好地管理项目</p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => setStep(2)}
                    disabled={!name}
                    className="gap-2"
                  >
                    下一步
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 步骤 2: 选择类型 */}
          {step === 2 && (
            <>
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">选择抽签类型</CardTitle>
                  <CardDescription>选择最适合您需求的抽签方式</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROJECT_TYPES.map((pt) => (
                      <Card
                        key={pt.value}
                        className={`cursor-pointer transition-all ${
                          type === pt.value
                            ? "border-2 border-blue-500 shadow-lg"
                            : "border-2 hover:border-blue-200"
                        }`}
                        onClick={() => setType(pt.value)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-4xl">{pt.icon}</div>
                            {type === pt.value && (
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>
                          <CardTitle className="text-lg">{pt.label}</CardTitle>
                          <CardDescription>{pt.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{pt.example}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
                  上一步
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setStep(3)}
                  disabled={!type}
                  className="gap-2"
                >
                  下一步
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}

          {/* 步骤 3: 完成配置 */}
          {step === 3 && (
            <>
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">完成配置</CardTitle>
                  <CardDescription>设置抽签参数和展示风格</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 类型特定配置 */}
                  {type === "number" && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base">数字范围</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min">最小值</Label>
                          <Input
                            id="min"
                            type="number"
                            value={min}
                            onChange={(e) => setMin(e.target.value)}
                            className="text-base h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="max">最大值</Label>
                          <Input
                            id="max"
                            type="number"
                            value={max}
                            onChange={(e) => setMax(e.target.value)}
                            className="text-base h-12"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(type === "name" || type === "custom") && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base">
                        {type === "name" ? "学生名单" : "抽签内容"}
                      </h4>
                      <textarea
                        className="w-full h-40 px-4 py-3 rounded-xl border-2 border-input bg-background resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder={
                          type === "name"
                            ? "张三\n李四\n王五\n..."
                            : "选项一\n选项二\n选项三\n..."
                        }
                        value={items}
                        onChange={(e) => setItems(e.target.value)}
                      />
                      <p className="text-sm text-gray-500">
                        共 {items ? items.split("\n").filter((i) => i.trim()).length : 0} 项内容
                      </p>
                    </div>
                  )}

                  {type === "poem" && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        📚 诗词抽签将使用预置的古诗词库，包含唐诗宋词等经典作品。无需额外配置。
                      </p>
                    </div>
                  )}

                  {/* UI 风格选择 */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-base">展示风格</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {UI_STYLES.map((style) => (
                        <Card
                          key={style.value}
                          className={`cursor-pointer transition-all ${
                            uiStyle === style.value
                              ? "border-2 border-blue-500 shadow-md"
                              : "border-2 hover:border-blue-200"
                          }`}
                          onClick={() => setUiStyle(style.value)}
                        >
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-4xl mb-2">{style.icon}</div>
                              <p className="font-medium mb-1">{style.label}</p>
                              <p className="text-xs text-gray-500">{style.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(2)}
                >
                  上一步
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading || !type}
                  className="gap-2 shadow-xl"
                >
                  {isLoading ? (
                    "创建中..."
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      创建项目
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </main>
    </div>
  );
}

// 步骤指示器组件
function StepIndicator({
  number,
  active,
  completed,
  label,
}: {
  number: number;
  active: boolean;
  completed: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-base transition-all ${
          completed
            ? "bg-blue-500 text-white"
            : active
            ? "bg-blue-500 text-white ring-4 ring-blue-100"
            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
        }`}
      >
        {completed ? <CheckCircle2 className="h-6 w-6" /> : number}
      </div>
      <span className={`text-xs font-medium ${active ? "text-blue-600" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
  );
}
