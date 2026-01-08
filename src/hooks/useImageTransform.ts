"use client";

import { useState, useCallback, useRef } from "react";
import type {
  TransformState,
  StyleType,
  ImageInfo,
  TransformErrorCode,
  TransformResponse,
} from "@/types/imageTransform";
import { DEFAULT_STRENGTH, MIN_STRENGTH, MAX_STRENGTH } from "@/services/imageTransform/stylePrompts";

// 图片压缩配置
const MAX_IMAGE_SIZE = 1920;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

const initialState: TransformState = {
  status: "idle",
  originalImage: null,
  selectedStyle: null,
  strength: DEFAULT_STRENGTH,
  generatedImageUrl: null,
  error: null,
  startTime: null,
};

export function useImageTransform() {
  const [state, setState] = useState<TransformState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 压缩图片
  const compressImage = useCallback(async (file: File): Promise<ImageInfo> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // 限制最大尺寸
        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          const ratio = Math.min(MAX_IMAGE_SIZE / width, MAX_IMAGE_SIZE / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context 创建失败"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 压缩质量
        const quality = file.size > MAX_FILE_SIZE ? 0.7 : 0.9;
        const base64WithPrefix = canvas.toDataURL("image/jpeg", quality);

        // 移除 data:image/xxx;base64, 前缀
        const base64Data = base64WithPrefix.split(",")[1];

        resolve({
          base64: base64Data,
          width,
          height,
          size: Math.round(base64Data.length * 0.75), // 估算字节数
          type: "image/jpeg",
          previewUrl: base64WithPrefix,
        });
      };

      img.onerror = () => reject(new Error("图片加载失败"));
      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.readAsDataURL(file);
    });
  }, []);

  // 上传图片
  const handleUpload = useCallback(async (file: File) => {
    // 格式校验
    const isHeic = file.name.toLowerCase().endsWith(".heic");
    if (!SUPPORTED_FORMATS.has(file.type) && !isHeic) {
      setState(prev => ({
        ...prev,
        status: "error",
        error: {
          code: "FORMAT_INVALID" as TransformErrorCode,
          message: "暂不支持该格式，请使用 JPG/PNG/WebP 格式",
        },
      }));
      return;
    }

    // 大小校验
    if (file.size > MAX_UPLOAD_SIZE) {
      setState(prev => ({
        ...prev,
        status: "error",
        error: {
          code: "SIZE_EXCEEDED" as TransformErrorCode,
          message: "图片过大，请选择小于 10MB 的图片",
        },
      }));
      return;
    }

    try {
      const imageInfo = await compressImage(file);
      setState(prev => ({
        ...prev,
        status: "uploaded",
        originalImage: imageInfo,
        generatedImageUrl: null,
        error: null,
      }));
    } catch {
      setState(prev => ({
        ...prev,
        status: "error",
        error: {
          code: "COMPRESS_FAILED" as TransformErrorCode,
          message: "图片处理失败，请尝试其他图片",
        },
      }));
    }
  }, [compressImage]);

  // 选择风格
  const setSelectedStyle = useCallback((style: StyleType) => {
    setState(prev => ({
      ...prev,
      selectedStyle: style,
      error: null,
    }));
  }, []);

  // 设置强度
  const setStrength = useCallback((strength: number) => {
    const clampedStrength = Math.max(MIN_STRENGTH, Math.min(MAX_STRENGTH, strength));
    setState(prev => ({
      ...prev,
      strength: clampedStrength,
    }));
  }, []);

  // 生成图片
  const handleGenerate = useCallback(async () => {
    const { originalImage, selectedStyle, strength, status } = state;

    // 防止重复调用
    if (status === "generating") return;

    if (!originalImage || !selectedStyle) {
      setState(prev => ({
        ...prev,
        error: {
          code: "API_ERROR" as TransformErrorCode,
          message: "请先上传图片并选择风格",
        },
      }));
      return;
    }

    // 取消之前的请求
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      status: "generating",
      error: null,
      startTime: Date.now(),
    }));

    try {
      const response = await fetch("/api/image-transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: originalImage.base64,
          style: selectedStyle,
          strength,
        }),
        signal: abortControllerRef.current.signal,
      });

      const result = await response.json() as TransformResponse;

      if (!result.success) {
        throw new Error(result.error?.message ?? "生成失败");
      }

      setState(prev => ({
        ...prev,
        status: "completed",
        generatedImageUrl: result.data?.imageUrl ?? null,
        error: null,
      }));

    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return; // 请求被取消，不处理
      }

      setState(prev => ({
        ...prev,
        status: "error",
        error: {
          code: "API_ERROR" as TransformErrorCode,
          message: error instanceof Error ? error.message : "生成失败，请重试",
        },
      }));
    }
  }, [state]);

  // 重置
  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(initialState);
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      status: prev.originalImage ? "uploaded" : "idle",
    }));
  }, []);

  // 移除原图
  const removeImage = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(prev => ({
      ...prev,
      status: "idle",
      originalImage: null,
      generatedImageUrl: null,
      error: null,
    }));
  }, []);

  // 计算生成耗时
  const duration = state.startTime && state.status === "completed"
    ? Date.now() - state.startTime
    : null;

  // 是否可以生成
  const canGenerate = state.originalImage !== null &&
                      state.selectedStyle !== null &&
                      state.status !== "generating";

  return {
    ...state,
    duration,
    canGenerate,
    handleUpload,
    setSelectedStyle,
    setStrength,
    handleGenerate,
    reset,
    clearError,
    removeImage,
  };
}
