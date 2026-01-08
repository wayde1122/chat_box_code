// 游戏相关类型定义

/** 游戏状态 */
export type GameStatus = "available" | "coming-soon";

/** 游戏图标类型 */
export type GameIcon = "Snake" | "Grid2X2" | "Puzzle" | "Zap" | "Target" | "Dice6";

/** 游戏配置 */
export interface Game {
  /** 游戏唯一标识 */
  id: string;
  /** 游戏名称 */
  name: string;
  /** 游戏描述 */
  description: string;
  /** 图标名称 */
  icon: GameIcon;
  /** 渐变色 */
  gradient: string;
  /** 游戏状态 */
  status: GameStatus;
}
