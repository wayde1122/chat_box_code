"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { StorageService } from "@/services/storageService";

export function Sidebar() {
  return (
    <aside className="h-full w-72 border-r border-slate-700 bg-slate-900 p-3">
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-slate-100">快速操作</h2>
        <div className="mt-3 flex gap-2">
          <Button
            variant="ghost"
            onClick={() => StorageService.clearChatHistory()}
            title="清空历史"
          >
            <Trash2 className="mr-2 h-4 w-4" /> 清空历史
          </Button>
        </div>
      </Card>
      <Card className="mt-4 p-4">
        <h2 className="text-sm font-semibold text-slate-100">FAQ 分类</h2>
        <ul className="mt-3 space-y-2 text-slate-300">
          <li>常见问题</li>
        </ul>
      </Card>
    </aside>
  );
}

