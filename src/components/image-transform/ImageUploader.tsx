"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, Camera, X, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  /** 上传回调 */
  onUpload: (file: File) => void;
  /** 移除图片回调 */
  onRemove: () => void;
  /** 预览图片 URL */
  previewUrl: string | null;
  /** 是否禁用 */
  disabled?: boolean;
  /** 图片信息 */
  imageInfo?: {
    width: number;
    height: number;
    size: number;
  } | null;
}

/**
 * 图片上传组件
 * 支持拖拽上传、点击上传、移动端相册/相机
 */
export function ImageUploader({
  onUpload,
  onRemove,
  previewUrl,
  disabled = false,
  imageInfo,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".heic")) {
        onUpload(file);
      }
    }
  }, [disabled, onUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
    // 重置 input 以允许选择相同文件
    e.target.value = "";
  }, [onUpload]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleCameraClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      cameraInputRef.current?.click();
    }
  }, [disabled]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  }, [onRemove]);

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 有预览图时显示预览
  if (previewUrl) {
    return (
      <div className="relative group">
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-600 bg-slate-900/50">
          {/* 预览图片 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="预览图片"
            className="w-full h-64 object-contain bg-slate-950"
          />

          {/* 图片信息 */}
          {imageInfo && (
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-slate-900/90 to-transparent">
              <p className="text-xs text-slate-400">
                {imageInfo.width} × {imageInfo.height} · {formatSize(imageInfo.size)}
              </p>
            </div>
          )}

          {/* 移除按钮 */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-red-500/80
                       rounded-full text-slate-300 hover:text-white transition-all
                       opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // 无预览时显示上传区域
  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center
        h-64 rounded-2xl border-2 border-dashed
        transition-all cursor-pointer
        ${isDragging
          ? "border-violet-500 bg-violet-500/10"
          : "border-slate-600 bg-slate-800/30 hover:border-violet-500/50 hover:bg-slate-800/50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,.heic"
        onChange={handleFileChange}
        className="hidden"
      />
      {/* 相机输入（移动端） */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 上传图标 */}
      <div className={`
        p-4 rounded-full mb-4 transition-colors
        ${isDragging ? "bg-violet-500/20" : "bg-slate-700/50"}
      `}>
        {isDragging ? (
          <ImageIcon className="h-8 w-8 text-violet-400" />
        ) : (
          <Upload className="h-8 w-8 text-slate-400" />
        )}
      </div>

      {/* 提示文字 */}
      <p className="text-slate-300 font-medium mb-1">
        {isDragging ? "松开以上传图片" : "拖拽图片到这里"}
      </p>
      <p className="text-sm text-slate-500 mb-4">
        或点击选择文件 · 支持 JPG/PNG/WebP/HEIC
      </p>

      {/* 移动端相机按钮 */}
      <button
        type="button"
        onClick={handleCameraClick}
        disabled={disabled}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-slate-700/50
                   hover:bg-slate-600/50 rounded-lg text-slate-300 text-sm transition-colors"
      >
        <Camera className="h-4 w-4" />
        拍照上传
      </button>

      {/* 大小限制提示 */}
      <p className="absolute bottom-4 text-xs text-slate-600">
        最大 10MB
      </p>
    </div>
  );
}
