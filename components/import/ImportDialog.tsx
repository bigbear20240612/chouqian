"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onImportComplete?: () => void;
}

export function ImportDialog({ open, onOpenChange, projectId, onImportComplete }: ImportDialogProps) {
  const [activeTab, setActiveTab] = useState<"text" | "csv" | "excel">("text");
  const [textData, setTextData] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleTextImport = async () => {
    if (!textData.trim()) {
      alert("请输入数据");
      return;
    }

    const items = textData.split("\n").filter((item) => item.trim());
    await importData(items);
  };

  const handleFileUpload = async (file: File, format: "csv" | "excel") => {
    setIsImporting(true);

    try {
      let items: string[] = [];

      if (format === "csv") {
        Papa.parse(file, {
          complete: (results) => {
            const data = results.data as string[][];
            items = data.flat().filter((item) => item.trim());
            importData(items);
          },
          error: (error) => {
            console.error("CSV 解析错误:", error);
            alert("CSV 文件解析失败");
            setIsImporting(false);
          },
        });
      } else if (format === "excel") {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        items = data.flat().filter((item) => item && String(item).trim()).map(String);
        await importData(items);
      }
    } catch (error) {
      console.error("文件导入错误:", error);
      alert("文件导入失败");
      setIsImporting(false);
    }
  };

  const importData = async (items: string[]) => {
    setIsImporting(true);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          data: items,
          format: activeTab,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`成功导入 ${data.data.imported} 条数据！`);
        setTextData("");
        onOpenChange(false);
        onImportComplete?.();
      } else {
        alert(data.error || "导入失败");
      }
    } catch (error) {
      console.error("导入失败:", error);
      alert("导入失败");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>批量导入数据</DialogTitle>
          <DialogDescription>
            支持文本、CSV、Excel 三种方式导入数据
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 标签切换 */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={activeTab === "text" ? "default" : "outline"}
              onClick={() => setActiveTab("text")}
              className="flex-1"
            >
              📝 文本
            </Button>
            <Button
              type="button"
              variant={activeTab === "csv" ? "default" : "outline"}
              onClick={() => setActiveTab("csv")}
              className="flex-1"
            >
              📊 CSV
            </Button>
            <Button
              type="button"
              variant={activeTab === "excel" ? "default" : "outline"}
              onClick={() => setActiveTab("excel")}
              className="flex-1"
            >
              📈 Excel
            </Button>
          </div>

          {/* 文本导入 */}
          {activeTab === "text" && (
            <div className="space-y-2">
              <Label htmlFor="text-data">输入数据（每行一个）</Label>
              <textarea
                id="text-data"
                className="w-full h-48 px-4 py-3 rounded-xl border-2 border-input bg-background resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                placeholder="张三&#10;李四&#10;王五"
                value={textData}
                onChange={(e) => setTextData(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                共 {textData ? textData.split("\n").filter((i) => i.trim()).length : 0} 条数据
              </p>
            </div>
          )}

          {/* CSV 导入 */}
          {activeTab === "csv" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-input rounded-xl p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  点击上传或拖拽 CSV 文件到此处
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "csv");
                  }}
                  className="hidden"
                  id="csv-upload"
                />
                <Label htmlFor="csv-upload">
                  <Button type="button" variant="outline" asChild>
                    <span>选择文件</span>
                  </Button>
                </Label>
              </div>
            </div>
          )}

          {/* Excel 导入 */}
          {activeTab === "excel" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-input rounded-xl p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  点击上传或拖拽 Excel 文件到此处
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "excel");
                  }}
                  className="hidden"
                  id="excel-upload"
                />
                <Label htmlFor="excel-upload">
                  <Button type="button" variant="outline" asChild>
                    <span>选择文件</span>
                  </Button>
                </Label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          {activeTab === "text" && (
            <Button type="button" onClick={handleTextImport} disabled={isImporting}>
              {isImporting ? "导入中..." : "导入"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
