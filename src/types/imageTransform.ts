// 图片转二次元相关类型定义

/** 风格类型 */
export type StyleType = "kawaii" | "guofeng" | "pixel" | "cyberpunk";

/** 转换状态 */
export type TransformStatus =
  | "idle"           // 初始状态
  | "uploaded"       // 已上传图片
  | "generating"     // 生成中
  | "completed"      // 生成完成
  | "error";         // 出错

/** 错误码 */
export type TransformErrorCode =
  | "UPLOAD_FAILED"      // 上传失败
  | "SIZE_EXCEEDED"      // 文件过大
  | "FORMAT_INVALID"     // 格式不支持
  | "COMPRESS_FAILED"    // 压缩失败
  | "API_ERROR"          // API 调用失败
  | "TIMEOUT"            // 超时
  | "RATE_LIMITED";      // 限流

/** 风格图标类型 */
export type StyleIconType = "Sparkles" | "Mountain" | "Grid3X3" | "Zap";

/** 风格配置 */
export interface StyleConfig {
  id: StyleType;
  name: string;
  description: string;
  icon: StyleIconType;
  gradient: string;
  prompt: string;           // 正向提示词
  negativePrompt: string;   // 负向提示词
}

/** 图片信息 */
export interface ImageInfo {
  /** Base64 编码（不含前缀） */
  base64: string;
  /** 图片宽度 */
  width: number;
  /** 图片高度 */
  height: number;
  /** 文件大小（字节） */
  size: number;
  /** MIME 类型 */
  type: string;
  /** 预览用的完整 data URL */
  previewUrl: string;
}

/** 转换状态（Hook 内部状态） */
export interface TransformState {
  status: TransformStatus;
  originalImage: ImageInfo | null;
  selectedStyle: StyleType | null;
  strength: number;                 // 风格强度 0.3-1.0
  generatedImageUrl: string | null;
  error: TransformError | null;
  startTime: number | null;         // 开始时间戳（用于计算耗时）
}

/** 错误信息 */
export interface TransformError {
  code: TransformErrorCode;
  message: string;
}

/** API 请求体 */
export interface TransformRequest {
  /** Base64 编码（不含 data:image/xxx;base64, 前缀） */
  imageBase64: string;
  /** 转换风格 */
  style: StyleType;
  /** 风格强度（默认 0.7） */
  strength?: number;
}

/** API 响应体 */
export interface TransformResponse {
  success: boolean;
  data?: {
    /** 生成图片的 URL 或 Base64 */
    imageUrl: string;
    /** 耗时（毫秒） */
    duration: number;
  };
  error?: TransformError;
}

