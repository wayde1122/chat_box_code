"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import type { TravelPlan } from "@/types/travel";

interface ExportPanelProps {
  plan: TravelPlan;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * 导出面板组件
 * 支持导出为 PDF 或图片
 */
export function ExportPanel({ plan, contentRef }: ExportPanelProps) {
  const [exporting, setExporting] = React.useState<"pdf" | "image" | null>(null);

  /**
   * 准备导出内容
   * 由于导出内容使用 hidden 类隐藏，需要临时显示并克隆
   */
  const prepareExportContent = () => {
    if (!contentRef.current) return null;

    // 克隆导出内容
    const clone = contentRef.current.cloneNode(true) as HTMLElement;
    
    // 移除 hidden 类，设置显示样式
    clone.classList.remove("hidden");
    clone.style.position = "fixed";
    clone.style.left = "-10000px";
    clone.style.top = "0";
    clone.style.width = "800px"; // 固定宽度确保一致的导出效果
    clone.style.display = "block";
    clone.style.visibility = "visible";
    clone.style.opacity = "1";
    
    document.body.appendChild(clone);
    return clone;
  };

  /**
   * 导出为图片
   */
  const exportAsImage = async () => {
    if (!contentRef.current) return;

    setExporting("image");

    try {
      const html2canvas = (await import("html2canvas")).default;
      
      // 准备导出内容
      const clone = prepareExportContent();
      if (!clone) {
        throw new Error("无法准备导出内容");
      }

      // 等待一帧让样式生效
      await new Promise(r => requestAnimationFrame(r));

      const canvas = await html2canvas(clone, {
        backgroundColor: "#0f172a",
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      document.body.removeChild(clone);

      const link = document.createElement("a");
      link.download = `${plan.destination}旅行计划_${plan.startDate}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("导出图片失败:", error);
      alert("导出失败: " + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setExporting(null);
    }
  };

  /**
   * 导出为 PDF
   */
  const exportAsPDF = async () => {
    if (!contentRef.current) return;

    setExporting("pdf");

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // 准备导出内容
      const clone = prepareExportContent();
      if (!clone) {
        throw new Error("无法准备导出内容");
      }

      // 等待一帧让样式生效
      await new Promise(r => requestAnimationFrame(r));

      const canvas = await html2canvas(clone, {
        backgroundColor: "#0f172a",
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdfWidth = 210;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${plan.destination}旅行计划_${plan.startDate}.pdf`);
    } catch (error) {
      console.error("导出 PDF 失败:", error);
      alert("导出失败: " + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card className="p-4 bg-slate-800/50 border-slate-700">
      <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
        <Download className="h-4 w-4 text-cyan-400" />
        导出行程
      </h3>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={exportAsImage}
          disabled={exporting !== null}
          className={`flex-1 border-slate-600 hover:bg-slate-700 ${
            exporting === "image" ? "cursor-wait" : "cursor-pointer"
          }`}
        >
          {exporting === "image" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileImage className="h-4 w-4 mr-2" />
          )}
          {exporting === "image" ? "导出中..." : "导出图片"}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={exportAsPDF}
          disabled={exporting !== null}
          className={`flex-1 border-slate-600 hover:bg-slate-700 ${
            exporting === "pdf" ? "cursor-wait" : "cursor-pointer"
          }`}
        >
          {exporting === "pdf" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          {exporting === "pdf" ? "导出中..." : "导出 PDF"}
        </Button>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        导出内容包含完整行程和预算明细
      </p>
    </Card>
  );
}
