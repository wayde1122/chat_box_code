// 风格提示词配置

import type { StyleConfig, StyleType } from "@/types/imageTransform";

/** 所有风格配置 */
export const STYLE_CONFIGS: Record<StyleType, StyleConfig> = {
  kawaii: {
    id: "kawaii",
    name: "萌系画风",
    description: "可爱Q萌的日系动漫风格",
    icon: "Sparkles",
    gradient: "from-pink-400 to-rose-500",
    prompt: "anime style, cute kawaii, soft colors, big sparkling eyes, smooth skin, pastel tones, studio ghibli inspired, high quality illustration",
    negativePrompt: "realistic, photo, ugly, deformed, noisy, blurry, low contrast",
  },
  guofeng: {
    id: "guofeng",
    name: "古风仙侠",
    description: "水墨古韵的东方美学",
    icon: "Mountain",
    gradient: "from-emerald-400 to-teal-600",
    prompt: "chinese traditional painting style, ink wash painting, xianxia fantasy, flowing robes, elegant composition, misty mountains, delicate brushwork, oriental aesthetics",
    negativePrompt: "western style, modern, ugly, deformed, noisy, blurry",
  },
  pixel: {
    id: "pixel",
    name: "像素艺术",
    description: "复古游戏的像素风格",
    icon: "Grid3X3",
    gradient: "from-violet-500 to-purple-600",
    prompt: "pixel art style, 16-bit retro game, limited color palette, crisp pixels, nostalgic gaming aesthetic, sprite art, clean pixel edges",
    negativePrompt: "smooth, realistic, blurry, high resolution photo",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "赛博朋克",
    description: "霓虹闪烁的未来都市",
    icon: "Zap",
    gradient: "from-cyan-400 to-blue-600",
    prompt: "cyberpunk anime style, neon lights, futuristic, glowing elements, dark atmosphere, high tech, vibrant cyan and magenta colors, digital art",
    negativePrompt: "natural, daylight, traditional, ugly, deformed, noisy",
  },
};

/** 获取所有风格列表 */
export function getStyleList(): StyleConfig[] {
  return Object.values(STYLE_CONFIGS);
}

/** 获取指定风格配置 */
export function getStyleConfig(styleId: StyleType): StyleConfig | null {
  return STYLE_CONFIGS[styleId] ?? null;
}

/** 默认风格强度 */
export const DEFAULT_STRENGTH = 0.7;

/** 最小风格强度 */
export const MIN_STRENGTH = 0.3;

/** 最大风格强度 */
export const MAX_STRENGTH = 1.0;
