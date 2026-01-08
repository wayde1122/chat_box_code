import type { Game } from "@/types/games";

/**
 * 游戏列表数据
 * 初期为占位数据，后续添加具体游戏实现
 */
export const games: readonly Game[] = [
  {
    id: "snake",
    name: "贪吃蛇",
    description: "经典贪吃蛇游戏，控制蛇吃食物，不断变长",
    icon: "Snake",
    gradient: "from-green-500 to-emerald-500",
    status: "available",
  },
  {
    id: "2048",
    name: "2048",
    description: "数字合并游戏，滑动数字合成 2048",
    icon: "Grid2X2",
    gradient: "from-amber-500 to-yellow-500",
    status: "available",
  },
  {
    id: "breakout",
    name: "打砖块",
    description: "弹球打砖块，消除所有砖块获胜",
    icon: "Puzzle",
    gradient: "from-blue-500 to-cyan-500",
    status: "coming-soon",
  },
] as const;
